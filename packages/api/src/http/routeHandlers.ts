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
import { DEFAULT_RFC, ROLE, SYSTEM_RFC } from '@puintegra/shared';
import { type AuthEventName } from '../services/authAuditService.js';
import {
  parseInstitutionOnboardingInput
} from '../services/institutionOnboardingService.js';
import { apiError, apiOk } from './apiResponse.js';

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

export class ApiRouteError extends Error {
  readonly status: number;
  readonly code: string;
  readonly uiMessageKey: string;
  readonly displayMessage?: string;
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    uiMessageKey: string,
    options: {
      displayMessage?: string;
      details?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = 'ApiRouteError';
    this.status = status;
    this.code = code;
    this.uiMessageKey = uiMessageKey;
    this.displayMessage = options.displayMessage;
    this.details = options.details;
  }
}

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
  return context.req.header('function-execution-id')
    ?? context.req.header('x-cloud-trace-context')
    ?? context.req.header('x-request-id')
    ?? createOriginTraceId();
}

/**
 * @description Crea handler de login/logout auditado.
 */
export function createAuthEventHandler(dependencies: CreateApiAppDependencies, event: AuthEventName) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      return context.json(apiError({
        code: 'API-AUTH-001',
        message: 'Missing bearer token.',
        uiMessageKey: 'api.auth.missing_bearer_token'
      }, { originTraceId }), 401);
    }

    const verified = await dependencies.verifyBearerToken(token);
    await dependencies.recordAuthEvent({
      event,
      originTraceId,
      userId: verified.userId,
      email: verified.email ?? null
    });

    return context.json(apiOk({
      recorded: true
    }, { originTraceId }));
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
      throw new ApiRouteError(
        401,
        'API-AUTH-001',
        'Missing bearer token.',
        'api.auth.missing_bearer_token',
        {
          displayMessage: 'Tu sesión no está autenticada. Inicia sesión y vuelve a intentarlo.'
        }
      );
    }

    const verified = await dependencies.verifyBearerToken(token);
    if (verified.role !== ROLE.SYSTEM_ADMINISTRATOR) {
      throw new ApiRouteError(
        403,
        'API-ADMIN-003',
        'Role is not allowed to create institutions.',
        'api.admin.institutions.forbidden_role'
      );
    }

    let payload: unknown;
    try {
      payload = await context.req.json();
    } catch {
      throw new ApiRouteError(
        400,
        'API-ADMIN-001',
        'Invalid institution onboarding payload.',
        'api.admin.institutions.invalid_payload',
        {
          displayMessage: 'No se pudo leer el payload del alta institucional.'
        }
      );
    }

    const normalizedPayload = parseInstitutionOnboardingInput(payload);
    if (normalizedPayload.RFC === SYSTEM_RFC) {
      throw new ApiRouteError(
        400,
        'API-ADMIN-004',
        'SYSTEM_RFC cannot be used as a tenant institution RFC.',
        'api.admin.institutions.invalid_system_rfc',
        {
          displayMessage: 'SYSTEM_RFC es un RFC reservado y no puede usarse para una institución.'
        }
      );
    }
    if (normalizedPayload.RFC === DEFAULT_RFC) {
      throw new ApiRouteError(
        400,
        'API-ADMIN-005',
        'DEFAULT_RFC cannot be reused for tenant institution onboarding.',
        'api.admin.institutions.invalid_default_rfc',
        {
          displayMessage: 'DEFAULT_RFC es un RFC reservado y no puede usarse para una institución.'
        }
      );
    }

    const created = await dependencies.createInstitutionOnboarding({
      payload: normalizedPayload,
      actor: verified,
      originTraceId
    });

    return context.json(apiOk(created, { originTraceId }), 201);
  };
}
