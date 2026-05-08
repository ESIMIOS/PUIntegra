/**
 * @package api
 * @name authHandlers.ts
 * @version 0.0.1
 * @description Handlers HTTP para eventos y lifecycle de autenticación.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae handlers auth desde routeHandlers para reducir complejidad por archivo.	@codex
 */

import type { Context } from 'hono';
import { API_THROTTLE_DIMENSION, API_THROTTLE_ENDPOINT, SystemError } from '@puintegra/shared';
import { type AuthEventName, type AuthLifecycleEventName } from '../../services/authAuditService.js';
import { apiOk } from '../apiResponse.js';
import type { CreateApiAppDependencies } from './types.js';
import {
  MfaResetPayloadSchema,
  parseEmailPayload,
  parseLifecycleCompletionPayload,
  readBearerToken,
  readClientIp,
  readJsonPayload,
  readOriginTraceId,
} from './shared.js';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import { buildThrottleSubject, enforceThrottle } from './throttle.js';

function requireDependency<T>(dependency: T | undefined, dependencyName: string): T {
  if (!dependency) {
    throw new Error(`${dependencyName} dependency is not configured.`);
  }
  return dependency;
}

/**
 * @description Crea handler de login/logout auditado.
 */
export function createAuthEventHandler(dependencies: CreateApiAppDependencies, event: AuthEventName) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    const clientIp = readClientIp(context);
    await enforceThrottle(dependencies, {
      endpointKey: event === 'login'
        ? API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGIN
        : API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGOUT,
      originTraceId,
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: buildThrottleSubject([['ip', clientIp]]),
        [API_THROTTLE_DIMENSION.USER]: buildThrottleSubject([['user', verified.userId]]),
      },
    });
    await dependencies.recordAuthEvent({
      event,
      originTraceId,
      userId: verified.userId,
      email: verified.email ?? null,
    });

    return context.json(
      apiOk(
        {
          recorded: true,
        },
        { originTraceId },
      ),
    );
  };
}

/**
 * @description Crea handler público de prevalidación de creación de cuenta.
 */
export function createAccountCreationPolicyHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const payload = parseEmailPayload(await readJsonPayload(context));
    const checkAccountCreationPolicy = requireDependency(
      dependencies.checkAccountCreationPolicy,
      'checkAccountCreationPolicy',
    );
    const clientIp = readClientIp(context);
    await enforceThrottle(dependencies, {
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_ACCOUNT_CREATION_POLICY,
      originTraceId,
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: buildThrottleSubject([['ip', clientIp]]),
        [API_THROTTLE_DIMENSION.EMAIL]: buildThrottleSubject([['email', payload.email]]),
      },
    });
    const result = await checkAccountCreationPolicy({
      email: payload.email,
      originTraceId,
    });

    return context.json(apiOk(result, { originTraceId }));
  };
}

/**
 * @description Crea handler público de recuperación neutral de contraseña.
 */
export function createPasswordRecoveryHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const payload = parseEmailPayload(await readJsonPayload(context));
    const requestPasswordRecovery = requireDependency(dependencies.requestPasswordRecovery, 'requestPasswordRecovery');
    const clientIp = readClientIp(context);
    await enforceThrottle(dependencies, {
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
      originTraceId,
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: buildThrottleSubject([['ip', clientIp]]),
        [API_THROTTLE_DIMENSION.EMAIL]: buildThrottleSubject([['email', payload.email]]),
      },
    });
    await requestPasswordRecovery({
      email: payload.email,
      originTraceId,
    });

    return context.json(
      apiOk(
        {
          accepted: true,
          message: 'Si la cuenta existe, enviaremos instrucciones al correo indicado.',
        },
        { originTraceId },
      ),
    );
  };
}

/**
 * @description Crea handler de eventos sanitizados del ciclo de vida Auth.
 */
export function createAuthLifecycleEventHandler(dependencies: CreateApiAppDependencies, event: AuthLifecycleEventName) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const payload = parseLifecycleCompletionPayload(await readJsonPayload(context));
    const clientIp = readClientIp(context);
    const endpointKey =
      event === 'password-update'
        ? API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RESET_COMPLETED
        : event === 'email-verification'
          ? API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_EMAIL_VERIFICATION_COMPLETED
          : API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_MFA_ENROLLMENT_COMPLETED;
    await enforceThrottle(dependencies, {
      endpointKey,
      originTraceId,
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: buildThrottleSubject([['ip', clientIp]]),
        [API_THROTTLE_DIMENSION.USER]: payload.userId
          ? buildThrottleSubject([['user', payload.userId]])
          : undefined,
        [API_THROTTLE_DIMENSION.EMAIL]: payload.email
          ? buildThrottleSubject([['email', payload.email]])
          : undefined,
      },
    });
    await dependencies.recordAuthLifecycleEvent?.({
      event,
      originTraceId,
      userId: payload.userId ?? null,
      email: payload.email ?? null,
    });

    return context.json(apiOk({ recorded: true }, { originTraceId }));
  };
}

/**
 * @description Crea handler autenticado de restablecimiento administrativo MFA.
 */
export function createMfaResetHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    const clientIp = readClientIp(context);
    const parsedPayload = MfaResetPayloadSchema.safeParse(await readJsonPayload(context));
    if (!parsedPayload.success) {
      throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
        details: {
          issues: parsedPayload.error.issues,
        },
      });
    }

    const userId = context.req.param('userId');
    if (!userId) {
      throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload);
    }

    const resetUserMfa = requireDependency(dependencies.resetUserMfa, 'resetUserMfa');
    await enforceThrottle(dependencies, {
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_ADMIN_MFA_RESET,
      originTraceId,
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: buildThrottleSubject([['ip', clientIp]]),
        [API_THROTTLE_DIMENSION.USER]: buildThrottleSubject([['user', verified.userId]]),
        [API_THROTTLE_DIMENSION.TARGET_USER]: buildThrottleSubject([['targetUser', userId]]),
      },
    });
    const result = await resetUserMfa({
      userId,
      verificationNote: parsedPayload.data.verificationNote,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(result, { originTraceId }));
  };
}
