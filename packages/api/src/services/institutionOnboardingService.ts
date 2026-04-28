/**
 * @package api
 * @name institutionOnboardingService.ts
 * @version 0.0.1
 * @description Construye y valida el flujo de alta institucional para backoffice.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-23)	Agrega validación, normalización y builders para alta de institución.	@codex
 */

import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  CommercialPlanSchema,
  CommercialPlanStatusSchema,
  DEFAULT_RFC,
  InstitutionSchema,
  LOG_CATEGORIES,
  LOG_ORIGIN,
  LogSchema,
  PERMISSION_STATUS,
  PermissionSchema,
  ROLE,
  RoleSchema,
  SYSTEM_RFC,
  SystemError,
  type Institution,
  type Log,
  type Permission,
} from '@puintegra/shared';
import { z } from 'zod';
import { apiSystemMessages } from '../constants/systemMessages.js';

export const CreateInstitutionOnboardingInputSchema = z.object({
  RFC: z.string().min(1),
  name: z.string().min(1),
  plan: CommercialPlanSchema,
  planStatus: CommercialPlanStatusSchema,
  planStartAt: z.number().int().nonnegative(),
  planFinishAt: z.number().int().nonnegative(),
  adminEmail: z.string().email(),
});

const CreateInstitutionOnboardingActorSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: RoleSchema,
});

export type CreateInstitutionOnboardingInput = z.infer<typeof CreateInstitutionOnboardingInputSchema>;
export type CreateInstitutionOnboardingActor = z.infer<typeof CreateInstitutionOnboardingActorSchema>;

type InstitutionOnboardingBuildInput = {
  rawInput: unknown;
  actor: CreateInstitutionOnboardingActor;
  now: number;
  originTraceId: string;
  permissionId: string;
  institutionLogId: string;
  permissionLogId: string;
  planLogId: string;
};

type InstitutionOnboardingBuildResult = {
  institution: Institution;
  permission: Permission;
  logs: [Log, Log, Log];
  response: {
    institution: {
      RFC: string;
      name: string;
      plan: keyof typeof COMMERCIAL_PLAN;
      planStatus: keyof typeof COMMERCIAL_PLAN_STATUS;
      planStartAt: number;
      planFinishAt: number;
      createdAt: number;
      updatedAt: number;
    };
    permission: {
      permissionId: string;
      RFC: string;
      email: string;
      role: typeof ROLE.INSTITUTION_ADMIN;
      status: keyof typeof PERMISSION_STATUS;
      createdAt: number;
      updatedAt: number;
    };
  };
};

/**
 * @description Normaliza RFC para comparaciones deterministas.
 */
function normalizeRfc(value: string) {
  return value.trim().toUpperCase();
}

/**
 * @description Normaliza email para validaciones y claves de deduplicación.
 */
function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/**
 * @description Valida rol de actor y RFC reservados para alta institucional.
 */
function assertActorAndReservedRfc(input: CreateInstitutionOnboardingInput, actor: CreateInstitutionOnboardingActor) {
  if (actor.role !== ROLE.SYSTEM_ADMINISTRATOR) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole);
  }

  if (normalizeRfc(input.RFC) === normalizeRfc(SYSTEM_RFC)) {
    throw new SystemError(apiSystemMessages.admin.institutions.invalidSystemRfc);
  }

  if (normalizeRfc(input.RFC) === normalizeRfc(DEFAULT_RFC)) {
    throw new SystemError(apiSystemMessages.admin.institutions.invalidDefaultRfc);
  }

  if (input.planStartAt > input.planFinishAt) {
    throw new SystemError(apiSystemMessages.admin.institutions.invalidPlanDates);
  }
}

/**
 * @description Valida y normaliza input de alta institucional.
 */
export function parseInstitutionOnboardingInput(rawInput: unknown) {
  const parsed = CreateInstitutionOnboardingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new SystemError(apiSystemMessages.admin.institutions.invalidPayload, {
      details: { issues: parsed.error.issues },
    });
  }

  return {
    ...parsed.data,
    RFC: normalizeRfc(parsed.data.RFC),
    name: parsed.data.name.trim(),
    adminEmail: normalizeEmail(parsed.data.adminEmail),
  };
}

/**
 * @description Construye documentos de institución, permiso y bitácoras de onboarding.
 */
export function buildInstitutionOnboardingRecords(
  input: InstitutionOnboardingBuildInput,
): InstitutionOnboardingBuildResult {
  const normalizedInput = parseInstitutionOnboardingInput(input.rawInput);
  const actor = CreateInstitutionOnboardingActorSchema.parse({
    ...input.actor,
    email: normalizeEmail(input.actor.email),
  });

  assertActorAndReservedRfc(normalizedInput, actor);

  const institution = InstitutionSchema.parse({
    RFC: normalizedInput.RFC,
    name: normalizedInput.name,
    plan: normalizedInput.plan,
    planStatus: normalizedInput.planStatus,
    sharedSecret: null,
    planStartAt: normalizedInput.planStartAt,
    planFinishAt: normalizedInput.planFinishAt,
    updates: [],
    createdAt: input.now,
    updatedAt: input.now,
  });

  const permission = PermissionSchema.parse({
    permissionId: input.permissionId,
    RFC: normalizedInput.RFC,
    email: normalizedInput.adminEmail,
    userId: null,
    role: ROLE.INSTITUTION_ADMIN,
    status: PERMISSION_STATUS.GRANTED,
    updates: [],
    createdAt: input.now,
    updatedAt: input.now,
  });

  const institutionLog = LogSchema.parse({
    id: input.institutionLogId,
    category: LOG_CATEGORIES.INSTITUTION_CREATION,
    RFC: normalizedInput.RFC,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: input.originTraceId,
    userId: actor.userId,
    execution: {
      executedByUserId: actor.userId,
      executedByRole: actor.role,
      executedByUserEmail: actor.email,
    },
    impact: {
      impactedUserRole: ROLE.INSTITUTION_ADMIN,
      impactedUserEmail: normalizedInput.adminEmail,
      impactedPermissionStatus: PERMISSION_STATUS.GRANTED,
    },
    searchRequest: {},
    createdAt: input.now,
  });

  const permissionLog = LogSchema.parse({
    id: input.permissionLogId,
    category: LOG_CATEGORIES.INSTITUTION_PERMISSION_CREATION,
    RFC: normalizedInput.RFC,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: input.originTraceId,
    userId: actor.userId,
    execution: {
      executedByUserId: actor.userId,
      executedByRole: actor.role,
      executedByUserEmail: actor.email,
    },
    impact: {
      impactedUserRole: ROLE.INSTITUTION_ADMIN,
      impactedUserEmail: normalizedInput.adminEmail,
      impactedPermissionStatus: PERMISSION_STATUS.GRANTED,
    },
    searchRequest: {},
    createdAt: input.now,
  });

  const planLog = LogSchema.parse({
    id: input.planLogId,
    category: LOG_CATEGORIES.INSTITUTION_PLAN_CREATION,
    RFC: normalizedInput.RFC,
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
    permission,
    logs: [institutionLog, permissionLog, planLog],
    response: {
      institution: {
        RFC: institution.RFC,
        name: institution.name,
        plan: institution.plan,
        planStatus: institution.planStatus,
        planStartAt: institution.planStartAt,
        planFinishAt: institution.planFinishAt,
        createdAt: institution.createdAt,
        updatedAt: institution.updatedAt,
      },
      permission: {
        permissionId: permission.permissionId,
        RFC: permission.RFC,
        email: permission.email,
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      },
    },
  };
}
