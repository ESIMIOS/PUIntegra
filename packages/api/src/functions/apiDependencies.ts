/**
 * @package api
 * @name apiDependencies.ts
 * @version 0.0.1
 * @description Encapsula dependencias del runtime API para reducir complejidad en apiFunction.ts.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-23)	Extrae verificación de token, persistencia de logs y onboarding institucional.	@codex
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { PERMISSION_STATUS, ROLE, RoleSchema, SYSTEM_RFC } from '@puintegra/shared';
import { buildAuthEventLog, type AuthEventName } from '../services/authAuditService.js';
import {
  InstitutionOnboardingServiceError,
  buildInstitutionOnboardingRecords,
  parseInstitutionOnboardingInput
} from '../services/institutionOnboardingService.js';

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
 * @description Obtiene el rol más alto concedido para un usuario según permisos actuales.
 */
async function resolveHighestGrantedRole(email: string) {
  const snapshot = await getAdminFirestore()
    .collection('permissions')
    .where('email', '==', email)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .get();
  const grantedRoles = new Set(snapshot.docs
    .map((item) => item.data().role)
    .filter((role): role is string => typeof role === 'string'));

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
    role: userRole
  };
}

/**
 * @description Persiste una bitácora de login/logout autenticada.
 */
async function recordAuthEvent(input: AuthEventWriteInput) {
  const logRef = getAdminFirestore().collection('logs').doc();
  const log = buildAuthEventLog({
    ...input,
    id: logRef.id
  }, Date.now());
  await logRef.set(log);
  return log;
}

/**
 * @description Crea institución y permiso bootstrap de forma auditada para backoffice.
 */
async function createInstitutionOnboarding(input: CreateInstitutionOnboardingInput) {
  const actorRole = typeof input.actor.role === 'string' ? input.actor.role : null;
  const actorEmail = typeof input.actor.email === 'string' ? input.actor.email.toLowerCase() : null;
  const parsedRole = actorRole ? RoleSchema.safeParse(actorRole) : null;
  if (!actorEmail || !parsedRole?.success) {
    throw new InstitutionOnboardingServiceError(
      403,
      'API-ADMIN-003',
      'Role is not allowed to create institutions.',
      'api.admin.institutions.forbidden_role',
      {
        displayMessage: 'Tu rol actual no tiene permisos para crear instituciones.'
      }
    );
  }

  const firestore = getAdminFirestore();
  const normalizedPayload = parseInstitutionOnboardingInput(input.payload);
  const parsed = buildInstitutionOnboardingRecords({
    rawInput: normalizedPayload,
    actor: {
      userId: input.actor.userId,
      email: actorEmail,
      role: parsedRole.data
    },
    now: Date.now(),
    originTraceId: input.originTraceId,
    permissionId: `${normalizedPayload.adminEmail.toLowerCase()}__${normalizedPayload.RFC.toLowerCase()}`,
    institutionLogId: firestore.collection('logs').doc().id,
    permissionLogId: firestore.collection('logs').doc().id
  });

  const existingInstitution = await firestore.collection('institutions').doc(parsed.institution.RFC).get();
  if (existingInstitution.exists) {
    throw new InstitutionOnboardingServiceError(
      409,
      'API-ADMIN-007',
      'Institution already exists.',
      'api.admin.institutions.duplicate_rfc',
      {
        displayMessage: `Ya existe una institución registrada con RFC ${parsed.institution.RFC}.`
      }
    );
  }

  const duplicateBootstrapPermission = await firestore
    .collection('permissions')
    .where('RFC', '==', parsed.permission.RFC)
    .where('email', '==', parsed.permission.email)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .limit(1)
    .get();
  if (!duplicateBootstrapPermission.empty) {
    throw new InstitutionOnboardingServiceError(
      409,
      'API-ADMIN-008',
      'Bootstrap permission already exists.',
      'api.admin.institutions.duplicate_bootstrap_permission',
      {
        displayMessage: `Ya existe un permiso administrador GRANTED para ${parsed.permission.email} en ${parsed.permission.RFC}.`
      }
    );
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
    throw new InstitutionOnboardingServiceError(
      403,
      'API-ADMIN-003',
      'Role is not allowed to create institutions.',
      'api.admin.institutions.forbidden_role',
      {
        displayMessage: 'Tu rol actual no tiene permisos para crear instituciones.'
      }
    );
  }

  const batch = firestore.batch();
  batch.set(firestore.collection('institutions').doc(parsed.institution.RFC), parsed.institution);
  batch.set(firestore.collection('permissions').doc(parsed.permission.permissionId), parsed.permission);
  batch.set(firestore.collection('logs').doc(parsed.logs[0].id), parsed.logs[0]);
  batch.set(firestore.collection('logs').doc(parsed.logs[1].id), parsed.logs[1]);
  await batch.commit();

  return parsed.response;
}

export function createApiDependencies() {
  return {
    verifyBearerToken,
    recordAuthEvent,
    createInstitutionOnboarding
  };
}
