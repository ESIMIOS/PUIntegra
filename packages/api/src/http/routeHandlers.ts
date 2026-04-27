/**
 * @package api
 * @name routeHandlers.ts
 * @version 0.0.1
 * @description Define handlers HTTP de Hono para mantener createApiApp enfocado en wiring de rutas.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-23)	Extrae handlers de rutas y tipos de dependencias del API.	@codex
 */

import type { Context } from 'hono';
import { DEFAULT_RFC, ROLE, SYSTEM_RFC, SystemError, HTTP_STATUS } from '@puintegra/shared';
import { type AuthEventName } from '../services/authAuditService.js';
import { apiSystemMessages } from '../constants/systemMessages.js';
import { parseInstitutionOnboardingInput } from '../services/institutionOnboardingService.js';
import { apiOk } from './apiResponse.js';

export type VerifiedBearerToken = {
  userId: string;
  email?: string | null;
  role?: string | null;
};

export type RecordAuthEventInput = VerifiedBearerToken & {
  event: AuthEventName;
  originTraceId: string;
};

export type CreateApiAppDependencies = {
  verifyBearerToken: (token: string) => Promise<VerifiedBearerToken>;
  recordAuthEvent: (input: RecordAuthEventInput) => Promise<unknown>;
  createInstitutionOnboarding: (input: {
    payload: unknown;
    actor: VerifiedBearerToken;
    originTraceId: string;
  }) => Promise<unknown>;
  createOriginTraceId: () => string;
};

/**
 * @description Extrae token Bearer del encabezado Authorization.
 */
function readBearerToken(authorization: string | undefined) {
  const [scheme, token] = authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

/**
 * @description Usa identificadores de ejecución/traza disponibles para correlación con logs de Cloud Functions.
 */
export function readOriginTraceId(context: Context, createOriginTraceId: () => string) {
  return (
    context.req.header('function-execution-id') ??
    context.req.header('x-cloud-trace-context') ??
    context.req.header('x-request-id') ??
    createOriginTraceId()
  );
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
 * @description Crea handler de onboarding institucional de backoffice.
 */
export function createInstitutionOnboardingHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    if (verified.role !== ROLE.SYSTEM_ADMINISTRATOR) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole);
    }

    let payload: unknown;
    try {
      payload = await context.req.json();
    } catch {
      throw new SystemError(apiSystemMessages.admin.institutions.invalidPayload, {
        displayMessage: 'No se pudo leer el payload del alta institucional.',
      });
    }

    const normalizedPayload = parseInstitutionOnboardingInput(payload);
    if (normalizedPayload.RFC === SYSTEM_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.invalidSystemRfc);
    }
    if (normalizedPayload.RFC === DEFAULT_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.invalidDefaultRfc);
    }

    const created = await dependencies.createInstitutionOnboarding({
      payload: normalizedPayload,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(created, { originTraceId }), HTTP_STATUS.CREATED);
  };
}
