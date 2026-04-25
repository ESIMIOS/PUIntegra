/**
 * @package api
 * @name createApiApp.ts
 * @version 0.0.6
 * @description Construye la aplicación Hono de API con dependencias inyectables para pruebas.
 * @author @codex
 * @changelog
 * - 0.0.6	(2026-04-23)	Extrae handlers HTTP a módulos dedicados para evitar crecimiento por archivo.	@codex
 * - 0.0.5	(2026-04-19)	Usa envelope estándar para respuestas API.	@codex
 * - 0.0.4	(2026-04-19)	Elimina payload de contexto para eventos Auth de cuenta.	@codex
 * - 0.0.3	(2026-04-19)	Propaga originTraceId desde headers de ejecución HTTP.	@codex
 * - 0.0.2	(2026-04-19)	Agrega manejador seguro de errores HTTP.	@codex
 * - 0.0.1	(2026-04-19)	Agrega rutas de health y bitácoras Auth autenticadas.	@codex
 */

import { Hono } from 'hono';
import { logger } from 'firebase-functions/v2';
import { isSystemError } from '@puintegra/shared';
import { AuthEventNameSchema } from '../services/authAuditService.js';
import { apiSystemMessages } from '../constants/systemMessages.js';
import { apiError, apiOk } from './apiResponse.js';
import {
  type CreateApiAppDependencies,
  createAuthEventHandler,
  createInstitutionOnboardingHandler,
  readOriginTraceId
} from './routeHandlers.js';

/**
 * @description Construye la app Hono principal.
 */
export function createApiApp(dependencies: CreateApiAppDependencies) {
  const app = new Hono();
  const loginHandler = createAuthEventHandler(dependencies, AuthEventNameSchema.enum.login);
  const logoutHandler = createAuthEventHandler(dependencies, AuthEventNameSchema.enum.logout);
  const institutionOnboardingHandler = createInstitutionOnboardingHandler(dependencies);

  app.onError((error, context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (isSystemError(error) && typeof error.httpStatus === 'number') {
      return context.json(apiError({
        code: error.code,
        message: error.message,
        uiMessageKey: error.uiMessageKey,
        displayMessage: error.displayMessage,
        errorKind: error.errorKind,
        details: error.details
      }, { originTraceId }), error.httpStatus as 400 | 401 | 403 | 409 | 500);
    }

    logger.error('api_request_failed', {
      path: context.req.path,
      method: context.req.method,
      originTraceId,
      errorName: error.name,
      errorMessage: error.message
    });

    return context.json(apiError({
      code: apiSystemMessages.sys.unexpectedFailure.code,
      message: apiSystemMessages.sys.unexpectedFailure.message,
      uiMessageKey: apiSystemMessages.sys.unexpectedFailure.key,
      displayMessage: apiSystemMessages.sys.unexpectedFailure.displayMessage,
      errorKind: apiSystemMessages.sys.unexpectedFailure.errorKind
    }, { originTraceId }), (apiSystemMessages.sys.unexpectedFailure.httpStatus ?? 500) as 400 | 401 | 403 | 409 | 500);
  });

  app.get('/health', (context) => context.json(apiOk({ service: 'puintegra-api' })));
  app.post('/api/auth/events/login', loginHandler);
  app.post('/api/auth/events/logout', logoutHandler);
  app.post('/api/admin/institutions', institutionOnboardingHandler);
  app.post('/auth/events/login', loginHandler);
  app.post('/auth/events/logout', logoutHandler);
  app.post('/admin/institutions', institutionOnboardingHandler);

  return app;
}
