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
import { SystemError } from '@puintegra/shared';
import { type AuthEventName, type AuthLifecycleEventName } from '../../services/authAuditService.js';
import { apiOk } from '../apiResponse.js';
import type { CreateApiAppDependencies } from './types.js';
import {
  MfaResetPayloadSchema,
  parseEmailPayload,
  parseLifecycleCompletionPayload,
  readBearerToken,
  readJsonPayload,
  readOriginTraceId,
  readRequestKey,
} from './shared.js';
import { apiSystemMessages } from '../../constants/systemMessages.js';

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
    await dependencies.recordAuthEvent({
      event,
      originTraceId,
      userId: verified.userId,
      email: verified.email ?? null,
      role: verified.role ?? null,
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
    const result = await checkAccountCreationPolicy({
      email: payload.email,
      originTraceId,
      requestKey: readRequestKey(context, payload.email),
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
    await requestPasswordRecovery({
      email: payload.email,
      originTraceId,
      requestKey: readRequestKey(context, payload.email),
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
    const result = await resetUserMfa({
      userId,
      verificationNote: parsedPayload.data.verificationNote,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(result, { originTraceId }));
  };
}
