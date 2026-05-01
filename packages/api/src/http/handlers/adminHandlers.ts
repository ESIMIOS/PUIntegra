/**
 * @package api
 * @name adminHandlers.ts
 * @version 0.0.1
 * @description Handlers HTTP para operaciones administrativas de instituciones.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae handlers admin desde routeHandlers para reducir complejidad por archivo.	@codex
 */

import type { Context } from 'hono';
import { DEFAULT_RFC, ROLE, SYSTEM_RFC, SystemError, HTTP_STATUS } from '@puintegra/shared';
import { parseInstitutionOnboardingInput } from '../../services/institutionOnboardingService.js';
import { parseInstitutionPlanUpdateInput } from '../../services/institutionPlanService.js';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import { apiOk } from '../apiResponse.js';
import type { CreateApiAppDependencies } from './types.js';
import { readBearerToken, readOriginTraceId } from './shared.js';

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
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnSystemRfc);
    }
    if (normalizedPayload.RFC === DEFAULT_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnDefaultRfc);
    }

    const created = await dependencies.createInstitutionOnboarding({
      payload: normalizedPayload,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(created, { originTraceId }), HTTP_STATUS.CREATED);
  };
}

/**
 * @description Crea handler de edición auditada de plan institucional de backoffice.
 */
export function createInstitutionPlanUpdateHandler(dependencies: CreateApiAppDependencies) {
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

    const rfc = (context.req.param('rfc') ?? '').trim().toUpperCase();
    if (rfc === SYSTEM_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnSystemRfc);
    }
    if (rfc === DEFAULT_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnDefaultRfc);
    }

    let payload: unknown;
    try {
      payload = await context.req.json();
    } catch {
      throw new SystemError(apiSystemMessages.admin.institutions.invalidPayload, {
        displayMessage: 'No se pudo leer el payload de edición del plan institucional.',
      });
    }

    const normalizedPayload = parseInstitutionPlanUpdateInput(payload);
    if (!dependencies.updateInstitutionPlan) {
      throw new Error('updateInstitutionPlan dependency is not configured.');
    }

    const updated = await dependencies.updateInstitutionPlan({
      rfc,
      payload: normalizedPayload,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(updated, { originTraceId }));
  };
}
