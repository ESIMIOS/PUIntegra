/**
 * @package api
 * @name institutionPlanService.ts
 * @version 0.0.1
 * @description Construye actualizaciones auditadas del plan institucional.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Agrega builder puro para edición auditada de plan institucional.	@codex
 */

import {
  InstitutionSchema,
  LOG_CATEGORIES,
  LOG_ORIGIN,
  LogSchema,
  ROLE,
  RoleSchema,
  SystemError,
  UPDATE_ORIGIN,
  UpdateInstitutionPlanSchema,
  type Institution,
  type Log,
} from '@puintegra/shared';
import { z } from 'zod';
import { apiSystemMessages } from '../constants/systemMessages.js';

const InstitutionPlanActorSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: RoleSchema,
});

export type InstitutionPlanActor = z.infer<typeof InstitutionPlanActorSchema>;

type InstitutionPlanUpdateBuildInput = {
  rawInput: unknown;
  institution: Institution;
  actor: InstitutionPlanActor;
  now: number;
  originTraceId: string;
  logId: string;
};

type InstitutionPlanUpdateBuildResult = {
  institution: Institution;
  log: Log;
  response: {
    institution: Institution;
  };
};

/**
 * @description Valida payload de edición de plan y normaliza errores al catálogo API.
 */
export function parseInstitutionPlanUpdateInput(rawInput: unknown) {
  const parsed = UpdateInstitutionPlanSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new SystemError(apiSystemMessages.admin.institutions.invalidPayload, {
      details: { issues: parsed.error.issues },
    });
  }

  return parsed.data;
}

/**
 * @description Construye institución actualizada, historial y bitácora de edición de plan.
 */
export function buildInstitutionPlanUpdateRecords(
  input: InstitutionPlanUpdateBuildInput,
): InstitutionPlanUpdateBuildResult {
  const payload = parseInstitutionPlanUpdateInput(input.rawInput);
  const actor = InstitutionPlanActorSchema.parse({
    ...input.actor,
    email: input.actor.email.trim().toLowerCase(),
  });

  if (actor.role !== ROLE.SYSTEM_ADMINISTRATOR) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole);
  }

  const update = {
    updateOrigin: UPDATE_ORIGIN.USER,
    updatedByUserId: actor.userId,
    updatedByUserRole: actor.role,
    updatedByUserEmail: actor.email,
    updatedAt: input.now,
    previousPlan: input.institution.plan,
    updatedPlan: payload.plan,
    previousPlanStatus: input.institution.planStatus,
    updatedPlanStatus: payload.planStatus,
    previousPlanStartAt: input.institution.planStartAt,
    updatedPlanStartAt: payload.planStartAt,
    previousPlanFinishAt: input.institution.planFinishAt,
    updatedPlanFinishAt: payload.planFinishAt,
  };

  const institution = InstitutionSchema.parse({
    ...input.institution,
    plan: payload.plan,
    planStatus: payload.planStatus,
    planStartAt: payload.planStartAt,
    planFinishAt: payload.planFinishAt,
    updates: [...input.institution.updates, update],
    updatedAt: input.now,
  });

  const log = LogSchema.parse({
    id: input.logId,
    category: LOG_CATEGORIES.INSTITUTION_PLAN_UPDATE,
    RFC: institution.RFC,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: input.originTraceId,
    userId: actor.userId,
    execution: {
      executedByUserId: actor.userId,
      executedByRole: actor.role,
      executedByUserEmail: actor.email,
    },
    impact: {},
    searchRequest: {},
    createdAt: input.now,
  });

  return {
    institution,
    log,
    response: {
      institution,
    },
  };
}
