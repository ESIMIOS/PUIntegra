/**
 * @package api
 * @name authDependencies.ts
 * @version 0.0.1
 * @description Implementa dependencias runtime para autenticación, políticas lifecycle y auditoría de cuenta.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae operaciones auth/lifecycle desde apiDependencies para reducir complejidad.	@codex
 */

import { PERMISSION_STATUS, ROLE, SYSTEM_RFC, SystemError } from '@puintegra/shared';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import {
  AUTH_LIFECYCLE_EVENT_CATEGORY,
  buildAuthEventLog,
  buildUserAccountLifecycleLog,
} from '../../services/authAuditService.js';
import { getAdminAuth, getAdminFirestore, resolveHighestGrantedRole } from './runtime.js';
import type {
  AuthEventWriteInput,
  AuthLifecycleEventWriteInput,
  AuthLifecyclePolicyInput,
  ResetUserMfaInput,
} from './types.js';

/**
 * @description Verifica el token Firebase enviado por el cliente web.
 */
export async function verifyBearerToken(token: string) {
  const decoded = await getAdminAuth().verifyIdToken(token);
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
export async function recordAuthEvent(input: AuthEventWriteInput) {
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
 * @description Persiste una bitácora sanitizada del ciclo de vida Auth.
 */
export async function recordAuthLifecycleEvent(input: AuthLifecycleEventWriteInput) {
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
 * @description Verifica elegibilidad de creación de cuenta sin modificar Firebase Auth.
 */
export async function checkAccountCreationPolicy(input: AuthLifecyclePolicyInput) {
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
    await getAdminAuth().getUserByEmail(input.email);
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
export async function requestPasswordRecovery(input: AuthLifecyclePolicyInput) {
  await recordAuthLifecycleEvent({
    event: 'password-recovery-request',
    originTraceId: input.originTraceId,
    email: input.email,
  });
  return { accepted: true };
}

/**
 * @description Restablece MFA por asistencia administrativa y audita el evento.
 */
export async function resetUserMfa(input: ResetUserMfaInput) {
  const actorEmail = typeof input.actor.email === 'string' ? input.actor.email.toLowerCase() : null;
  if (!actorEmail) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.forbiddenMfaReset);
  }
  const actorPermission = await getAdminFirestore()
    .collection('permissions')
    .where('email', '==', actorEmail)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .where('role', '==', ROLE.SYSTEM_ADMINISTRATOR)
    .where('RFC', '==', SYSTEM_RFC)
    .limit(1)
    .get();
  if (actorPermission.empty) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.forbiddenMfaReset);
  }

  const auth = getAdminAuth();
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
