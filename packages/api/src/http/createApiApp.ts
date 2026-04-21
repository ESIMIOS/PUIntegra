/**
 * @package api
 * @name createApiApp.ts
 * @version 0.0.5
 * @description Construye la aplicación Hono de API con dependencias inyectables para pruebas.
 * @author @codex
 * @changelog
 * - 0.0.5	(2026-04-19)	Usa envelope estándar para respuestas API.	@codex
 * - 0.0.4	(2026-04-19)	Elimina payload de contexto para eventos Auth de cuenta.	@codex
 * - 0.0.3	(2026-04-19)	Propaga originTraceId desde headers de ejecución HTTP.	@codex
 * - 0.0.2	(2026-04-19)	Agrega manejador seguro de errores HTTP.	@codex
 * - 0.0.1	(2026-04-19)	Agrega rutas de health y bitácoras Auth autenticadas.	@codex
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { logger } from 'firebase-functions/v2';
import { AuthEventNameSchema, type AuthEventName } from '../services/authAuditService.js';
import { apiError, apiOk } from './apiResponse.js';

type VerifiedBearerToken = {
  userId: string;
  email?: string | null;
};

type RecordAuthEventInput = VerifiedBearerToken & {
  event: AuthEventName;
  originTraceId: string;
};

type CreateApiAppDependencies = {
  verifyBearerToken: (token: string) => Promise<VerifiedBearerToken>;
  recordAuthEvent: (input: RecordAuthEventInput) => Promise<unknown>;
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
function readOriginTraceId(context: Context, createOriginTraceId: () => string) {
  return context.req.header('function-execution-id')
    ?? context.req.header('x-cloud-trace-context')
    ?? context.req.header('x-request-id')
    ?? createOriginTraceId();
}

/**
 * @description Construye la app Hono principal.
 */
export function createApiApp(dependencies: CreateApiAppDependencies) {
  const app = new Hono();

  app.onError((error, context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    logger.error('api_request_failed', {
      path: context.req.path,
      method: context.req.method,
      originTraceId,
      errorName: error.name,
      errorMessage: error.message
    });

    return context.json(apiError({
      code: 'API-SYS-001',
      message: 'Unexpected API failure.',
      uiMessageKey: 'api.system.unexpected_failure'
    }, { originTraceId }), 500);
  });

  app.get('/health', (context) => {
    return context.json(apiOk({
      service: 'puintegra-api'
    }));
  });

  async function recordAuthEvent(context: Context, event: AuthEventName) {
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
  }

  app.post('/api/auth/events/login', (context) => recordAuthEvent(context, AuthEventNameSchema.enum.login));
  app.post('/api/auth/events/logout', (context) => recordAuthEvent(context, AuthEventNameSchema.enum.logout));

  return app;
}
