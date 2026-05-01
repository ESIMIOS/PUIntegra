/**
 * @package api
 * @name apiDependencies.ts
 * @version 0.0.2
 * @description Encapsula dependencias del runtime API para reducir complejidad en apiFunction.ts.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-05-01)	Agrega actualización autenticada de perfil de cuenta con bitácora y rollback de displayName.	@codex
 * - 0.0.1	(2026-04-23)	Extrae verificación de token, persistencia de logs y onboarding institucional.	@codex
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  InstitutionSchema,
  LOG_CATEGORIES,
  LOG_ORIGIN,
  LogSchema,
  PERMISSION_STATUS,
  ROLE,
  RoleSchema,
  SYSTEM_RFC,
  SystemError,
  UPDATE_ORIGIN,
  UserSchema,
} from '@puintegra/shared';
import { apiSystemMessages } from '../constants/systemMessages.js';
import {
  AUTH_LIFECYCLE_EVENT_CATEGORY,
  buildAuthEventLog,
  buildUserAccountLifecycleLog,
  type AuthEventName,
  type AuthLifecycleEventName,
} from '../services/authAuditService.js';
import {
  buildInstitutionOnboardingRecords,
  parseInstitutionOnboardingInput,
} from '../services/institutionOnboardingService.js';
import {
  buildInstitutionPlanUpdateRecords,
  parseInstitutionPlanUpdateInput,
} from '../services/institutionPlanService.js';

type AuthEventWriteInput = {
  event: AuthEventName;
  originTraceId: string;
  userId: string;
  email?: string | null;
};

type CreateInstitutionOnboardingInput = {
  payload: unknown;
  actor: {
    userId: string;
    email?: string | null;
    role?: string | null;
  };
  originTraceId: string;
};

type UpdateInstitutionPlanInput = {
  rfc: string;
  payload: unknown;
  actor: {
    userId: string;
    email?: string | null;
    role?: string | null;
  };
  originTraceId: string;
};

type AuthLifecyclePolicyInput = {
  email: string;
  originTraceId: string;
  requestKey: string;
};

type AuthLifecycleEventWriteInput = {
  event: AuthLifecycleEventName;
  originTraceId: string;
  userId?: string | null;
  email?: string | null;
};

type ResetUserMfaInput = {
  userId: string;
  verificationNote: string;
  actor: {
    userId: string;
    email?: string | null;
    role?: string | null;
  };
  originTraceId: string;
};

type AccountProfileUpdateInput = {
  payload: unknown;
  actor: {
    userId: string;
    email?: string | null;
    role?: string | null;
  };
  originTraceId: string;
};

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * @description Inicializa Firebase Admin SDK una sola vez.
 */
function initializeAdmin() {
  return getApps()[0] ?? initializeApp();
}

/**
 * @description Devuelve Firestore usando Admin SDK inicializado.
 */
function getAdminFirestore() {
  initializeAdmin();
  return getFirestore();
}

/**
 * @description Aplica una cuota simple en memoria para proteger flujos públicos en runtime API.
 */
function assertRateLimit(scope: string, requestKey: string) {
  const now = Date.now();
  const key = `${scope}:${requestKey}`;
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (bucket.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.rateLimited);
  }
  bucket.count += 1;
}

/**
 * @description Obtiene el rol más alto concedido para un usuario según permisos actuales.
 */
async function resolveHighestGrantedRole(email: string) {
  const snapshot = await getAdminFirestore()
    .collection('permissions')
    .where('email', '==', email)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .get();
  const grantedRoles = new Set(
    snapshot.docs.map((item) => item.data().role).filter((role): role is string => typeof role === 'string'),
  );

  if (grantedRoles.has(ROLE.SYSTEM_ADMINISTRATOR)) {
    return ROLE.SYSTEM_ADMINISTRATOR;
  }
  if (grantedRoles.has(ROLE.INSTITUTION_ADMIN)) {
    return ROLE.INSTITUTION_ADMIN;
  }
  if (grantedRoles.has(ROLE.INSTITUTION_OPERATOR)) {
    return ROLE.INSTITUTION_OPERATOR;
  }
  return null;
}

/**
 * @description Verifica el token Firebase enviado por el cliente web.
 */
async function verifyBearerToken(token: string) {
  initializeAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  const email = typeof decoded.email === 'string' ? decoded.email.toLowerCase() : null;
  const userRole = email ? await resolveHighestGrantedRole(email) : null;
  return {
    userId: decoded.uid,
    email,
    role: userRole,
  };
}

/**
 * @description Persiste una bitácora de login/logout autenticada.
 */
async function recordAuthEvent(input: AuthEventWriteInput) {
  const logRef = getAdminFirestore().collection('logs').doc();
  const log = buildAuthEventLog(
    {
      ...input,
      id: logRef.id,
    },
    Date.now(),
  );
  await logRef.set(log);
  return log;
}

/**
 * @description Verifica elegibilidad de creación de cuenta sin modificar Firebase Auth.
 */
async function checkAccountCreationPolicy(input: AuthLifecyclePolicyInput) {
  assertRateLimit('account-create', input.requestKey);
  const firestore = getAdminFirestore();
  const permissions = await firestore
    .collection('permissions')
    .where('email', '==', input.email)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .limit(1)
    .get();
  if (permissions.empty) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.accountCreationUnavailable);
  }

  try {
    await getAuth().getUserByEmail(input.email);
    throw new SystemError(apiSystemMessages.auth.lifecycle.accountCreationUnavailable);
  } catch (error) {
    if (error instanceof SystemError) {
      throw error;
    }
    const firebaseError = error as { code?: string };
    if (firebaseError.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  return { eligible: true };
}

/**
 * @description Registra solicitud neutral de recuperación y aplica cuota por correo/IP.
 */
async function requestPasswordRecovery(input: AuthLifecyclePolicyInput) {
  assertRateLimit('password-recovery', input.requestKey);
  await recordAuthLifecycleEvent({
    event: 'password-recovery-request',
    originTraceId: input.originTraceId,
    email: input.email,
  });
  return { accepted: true };
}

/**
 * @description Persiste una bitácora sanitizada del ciclo de vida Auth.
 */
async function recordAuthLifecycleEvent(input: AuthLifecycleEventWriteInput) {
  const logRef = getAdminFirestore().collection('logs').doc();
  const log = buildUserAccountLifecycleLog(
    {
      id: logRef.id,
      category: AUTH_LIFECYCLE_EVENT_CATEGORY[input.event],
      originTraceId: input.originTraceId,
      userId: input.userId ?? null,
      email: input.email ?? null,
    },
    Date.now(),
  );
  await logRef.set(log);
  return log;
}

/**
 * @description Restablece MFA por asistencia administrativa y audita el evento.
 */
async function resetUserMfa(input: ResetUserMfaInput) {
  const actorRole = typeof input.actor.role === 'string' ? input.actor.role : null;
  if (actorRole !== ROLE.SYSTEM_ADMINISTRATOR) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.forbiddenMfaReset);
  }

  const auth = getAuth();
  await auth.updateUser(input.userId, {
    multiFactor: {
      enrolledFactors: [],
    },
  });
  const user = await auth.getUser(input.userId);
  await recordAuthLifecycleEvent({
    event: 'mfa-unenroll',
    originTraceId: input.originTraceId,
    userId: input.userId,
    email: user.email ?? null,
  });

  return { reset: true };
}

/**
 * @description Crea institución y permiso bootstrap de forma auditada para backoffice.
 */
async function createInstitutionOnboarding(input: CreateInstitutionOnboardingInput) {
  const actorRole = typeof input.actor.role === 'string' ? input.actor.role : null;
  const actorEmail = typeof input.actor.email === 'string' ? input.actor.email.toLowerCase() : null;
  const parsedRole = actorRole ? RoleSchema.safeParse(actorRole) : null;
  if (!actorEmail || !parsedRole?.success) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole.code);
  }

  const firestore = getAdminFirestore();
  const normalizedPayload = parseInstitutionOnboardingInput(input.payload);
  const parsed = buildInstitutionOnboardingRecords({
    rawInput: normalizedPayload,
    actor: {
      userId: input.actor.userId,
      email: actorEmail,
      role: parsedRole.data,
    },
    now: Date.now(),
    originTraceId: input.originTraceId,
    permissionId: `${normalizedPayload.adminEmail.toLowerCase()}__${normalizedPayload.RFC.toLowerCase()}`,
    institutionLogId: firestore.collection('logs').doc().id,
    permissionLogId: firestore.collection('logs').doc().id,
    planLogId: firestore.collection('logs').doc().id,
  });

  const existingInstitution = await firestore.collection('institutions').doc(parsed.institution.RFC).get();
  if (existingInstitution.exists) {
    throw new SystemError(apiSystemMessages.admin.institutions.duplicateRfc, {
      displayMessage: `Ya existe una institución registrada con RFC ${parsed.institution.RFC}.`,
    });
  }

  const duplicateBootstrapPermission = await firestore
    .collection('permissions')
    .where('RFC', '==', parsed.permission.RFC)
    .where('email', '==', parsed.permission.email)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .limit(1)
    .get();
  if (!duplicateBootstrapPermission.empty) {
    throw new SystemError(apiSystemMessages.admin.institutions.duplicateBootstrapPermission, {
      displayMessage: `Ya existe un permiso administrador GRANTED para ${parsed.permission.email} en ${parsed.permission.RFC}.`,
    });
  }

  const roleValidationSnapshot = await firestore
    .collection('permissions')
    .where('email', '==', actorEmail)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .where('role', '==', ROLE.SYSTEM_ADMINISTRATOR)
    .where('RFC', '==', SYSTEM_RFC)
    .limit(1)
    .get();
  if (roleValidationSnapshot.empty) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole, {
      displayMessage: `El usuario ${actorEmail} no tiene permisos para crear instituciones.`,
    });
  }

  const batch = firestore.batch();
  batch.set(firestore.collection('institutions').doc(parsed.institution.RFC), parsed.institution);
  batch.set(firestore.collection('permissions').doc(parsed.permission.permissionId), parsed.permission);
  batch.set(firestore.collection('logs').doc(parsed.logs[0].id), parsed.logs[0]);
  batch.set(firestore.collection('logs').doc(parsed.logs[1].id), parsed.logs[1]);
  batch.set(firestore.collection('logs').doc(parsed.logs[2].id), parsed.logs[2]);
  await batch.commit();

  return parsed.response;
}

/**
 * @description Actualiza el plan institucional con historial y bitácora en una escritura atómica.
 */
async function updateInstitutionPlan(input: UpdateInstitutionPlanInput) {
  const actorRole = typeof input.actor.role === 'string' ? input.actor.role : null;
  const actorEmail = typeof input.actor.email === 'string' ? input.actor.email.toLowerCase() : null;
  const parsedRole = actorRole ? RoleSchema.safeParse(actorRole) : null;
  if (!actorEmail || !parsedRole?.success) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole.code);
  }

  const firestore = getAdminFirestore();
  const normalizedRfc = input.rfc.trim().toUpperCase();
  const normalizedPayload = parseInstitutionPlanUpdateInput(input.payload);
  const institutionRef = firestore.collection('institutions').doc(normalizedRfc);
  const institutionSnapshot = await institutionRef.get();
  if (!institutionSnapshot.exists) {
    throw new SystemError(apiSystemMessages.admin.institutions.institutionNotFound, {
      displayMessage: `No existe una institución registrada con RFC ${normalizedRfc}.`,
    });
  }

  const parsed = buildInstitutionPlanUpdateRecords({
    rawInput: normalizedPayload,
    institution: InstitutionSchema.parse(institutionSnapshot.data()),
    actor: {
      userId: input.actor.userId,
      email: actorEmail,
      role: parsedRole.data,
    },
    now: Date.now(),
    originTraceId: input.originTraceId,
    logId: firestore.collection('logs').doc().id,
  });

  const batch = firestore.batch();
  batch.set(institutionRef, parsed.institution);
  batch.set(firestore.collection('logs').doc(parsed.log.id), parsed.log);
  await batch.commit();

  return parsed.response;
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const sanitized = trimmed.replaceAll(/\s+/g, '').replaceAll('-', '').replaceAll('(', '').replaceAll(')', '');
  if (!sanitized.startsWith('+') || sanitized === '+52' || !/^\+\d{8,15}$/.test(sanitized)) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: {
        field: 'phone',
        reason: 'invalid_phone_format',
      },
    });
  }
  return sanitized;
}

/**
 * @description Actualiza perfil de cuenta propia y persiste trazabilidad de cambios de perfil.
 */
async function updateAccountProfile(input: AccountProfileUpdateInput) {
  const actorRole = typeof input.actor.role === 'string' ? input.actor.role : null;
  const actorEmail = typeof input.actor.email === 'string' ? input.actor.email.toLowerCase() : null;
  const parsedRole = actorRole ? RoleSchema.safeParse(actorRole) : null;
  if (!actorEmail || !parsedRole?.success) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: {
        reason: 'actor_identity_missing',
      },
    });
  }

  const payload = input.payload as {
    name: string;
    emojiIcon: string;
    phone?: string | null;
  };
  const normalizedName = payload.name.trim();
  const normalizedEmojiIcon = payload.emojiIcon.trim();
  if (!normalizedName || !normalizedEmojiIcon) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload);
  }
  const normalizedPhone = normalizePhone(payload.phone);
  const now = Date.now();
  const firestore = getAdminFirestore();
  const userRef = firestore.collection('users').doc(input.actor.userId);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.exists) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: { userId: input.actor.userId, reason: 'user_profile_not_found' },
    });
  }
  const currentUser = UserSchema.parse(userSnapshot.data());
  const previousDisplayName = currentUser.name;
  const nextPhone = normalizedPhone;
  const hasNameChange = currentUser.name !== normalizedName;
  const hasEmojiChange = (currentUser.emojiIcon ?? null) !== normalizedEmojiIcon;
  const hasPhoneInput = typeof payload.phone === 'string' || payload.phone === null;
  const hasPhoneChange = hasPhoneInput && (currentUser.phone ?? null) !== nextPhone;

  if (!hasNameChange && !hasEmojiChange && !hasPhoneChange) {
    return {
      userId: currentUser.userId,
      name: currentUser.name,
      email: currentUser.email,
      emojiIcon: currentUser.emojiIcon ?? null,
      phone: currentUser.phone ?? null,
      updatedAt: currentUser.updatedAt,
    };
  }

  const auth = getAuth();
  if (hasNameChange) {
    await auth.updateUser(input.actor.userId, { displayName: normalizedName });
  }

  const updateEntry = {
    updateOrigin: UPDATE_ORIGIN.USER,
    updatedByUserId: input.actor.userId,
    updatedByUserRole: parsedRole.data,
    updatedByUserEmail: actorEmail,
    updatedAt: now,
    ...(hasNameChange ? { previousName: currentUser.name, updatedName: normalizedName } : {}),
    ...(hasEmojiChange ? { previousEmojiIcon: currentUser.emojiIcon ?? null, updatedEmojiIcon: normalizedEmojiIcon } : {}),
    ...(hasPhoneChange ? { previousPhone: currentUser.phone ?? null, updatedPhone: nextPhone } : {}),
  };

  const nextUser = UserSchema.parse({
    ...currentUser,
    name: normalizedName,
    emojiIcon: normalizedEmojiIcon,
    ...(nextPhone ? { phone: nextPhone } : {}),
    updates: [...currentUser.updates, updateEntry],
    updatedAt: now,
  });

  if (!nextPhone) {
    delete (nextUser as { phone?: string }).phone;
  }

  const logRef = firestore.collection('logs').doc();
  const log = LogSchema.parse({
    id: logRef.id,
    category: LOG_CATEGORIES.USER_ACCOUNT_SETTINGS_UPDATE,
    RFC: null,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: input.originTraceId,
    userId: input.actor.userId,
    execution: {
      executedByUserId: input.actor.userId,
      executedByUserRole: parsedRole.data,
      executedByUserEmail: actorEmail,
    },
    impact: {
      impactedUserId: input.actor.userId,
      impactedUserEmail: actorEmail,
    },
    searchRequest: {},
    createdAt: now,
  });

  try {
    const batch = firestore.batch();
    batch.set(userRef, nextUser);
    batch.set(logRef, log);
    await batch.commit();
  } catch (error) {
    if (hasNameChange) {
      try {
        await auth.updateUser(input.actor.userId, { displayName: previousDisplayName });
      } catch {
        // Keep the original persistence failure as the response error.
      }
    }
    throw error;
  }

  return {
    userId: nextUser.userId,
    name: nextUser.name,
    email: nextUser.email,
    emojiIcon: nextUser.emojiIcon ?? null,
    phone: nextUser.phone ?? null,
    updatedAt: nextUser.updatedAt,
  };
}

export function createApiDependencies() {
  return {
    verifyBearerToken,
    recordAuthEvent,
    checkAccountCreationPolicy,
    createInstitutionOnboarding,
    requestPasswordRecovery,
    recordAuthLifecycleEvent,
    resetUserMfa,
    updateInstitutionPlan,
    updateAccountProfile,
  };
}
