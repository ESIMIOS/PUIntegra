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
  type Institution,
  type Log,
  type Permission
} from '@puintegra/shared';
import { z } from 'zod';

export const CreateInstitutionOnboardingInputSchema = z.object({
  RFC: z.string().min(1),
  name: z.string().min(1),
  plan: CommercialPlanSchema,
  planStatus: CommercialPlanStatusSchema,
  planStartAt: z.number().int().nonnegative(),
  planFinishAt: z.number().int().nonnegative(),
  adminEmail: z.string().email()
});

const CreateInstitutionOnboardingActorSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: RoleSchema
});

export type CreateInstitutionOnboardingInput = z.infer<typeof CreateInstitutionOnboardingInputSchema>;
export type CreateInstitutionOnboardingActor = z.infer<typeof CreateInstitutionOnboardingActorSchema>;

export class InstitutionOnboardingServiceError extends Error {
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
    this.name = 'InstitutionOnboardingServiceError';
    this.status = status;
    this.code = code;
    this.uiMessageKey = uiMessageKey;
    this.displayMessage = options.displayMessage;
    this.details = options.details;
  }
}

type InstitutionOnboardingBuildInput = {
  rawInput: unknown;
  actor: CreateInstitutionOnboardingActor;
  now: number;
  originTraceId: string;
  permissionId: string;
  institutionLogId: string;
  permissionLogId: string;
};

type InstitutionOnboardingBuildResult = {
  institution: Institution;
  permission: Permission;
  logs: [Log, Log];
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
    throw new InstitutionOnboardingServiceError(
      403,
      'API-ADMIN-003',
      'Role is not allowed to create institutions.',
      'api.admin.institutions.forbidden_role',
      {
        displayMessage: 'Tu rol actual no tiene permisos para crear instituciones.'
      }
    );
  }

  if (normalizeRfc(input.RFC) === normalizeRfc(SYSTEM_RFC)) {
    throw new InstitutionOnboardingServiceError(
      400,
      'API-ADMIN-004',
      'SYSTEM_RFC cannot be used as a tenant institution RFC.',
      'api.admin.institutions.invalid_system_rfc',
      {
        displayMessage: 'SYSTEM_RFC es un RFC reservado y no puede usarse para una institución.'
      }
    );
  }

  if (normalizeRfc(input.RFC) === normalizeRfc(DEFAULT_RFC)) {
    throw new InstitutionOnboardingServiceError(
      400,
      'API-ADMIN-005',
      'DEFAULT_RFC cannot be reused for tenant institution onboarding.',
      'api.admin.institutions.invalid_default_rfc',
      {
        displayMessage: 'DEFAULT_RFC es un RFC reservado y no puede usarse para una institución.'
      }
    );
  }

  if (input.planStartAt > input.planFinishAt) {
    throw new InstitutionOnboardingServiceError(
      400,
      'API-ADMIN-006',
      'planStartAt must be less than or equal to planFinishAt.',
      'api.admin.institutions.invalid_plan_dates',
      {
        displayMessage: 'La fecha de inicio del plan debe ser menor o igual a la fecha de fin.'
      }
    );
  }
}

/**
 * @description Valida y normaliza input de alta institucional.
 */
export function parseInstitutionOnboardingInput(rawInput: unknown) {
  const parsed = CreateInstitutionOnboardingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new InstitutionOnboardingServiceError(
      400,
      'API-ADMIN-001',
      'Invalid institution onboarding payload.',
      'api.admin.institutions.invalid_payload',
      {
        displayMessage: 'La solicitud de alta institucional contiene campos inválidos.',
        details: { issues: parsed.error.issues }
      }
    );
  }

  return {
    ...parsed.data,
    RFC: normalizeRfc(parsed.data.RFC),
    name: parsed.data.name.trim(),
    adminEmail: normalizeEmail(parsed.data.adminEmail)
  };
}

/**
 * @description Construye documentos de institución, permiso y bitácoras de onboarding.
 */
export function buildInstitutionOnboardingRecords(input: InstitutionOnboardingBuildInput): InstitutionOnboardingBuildResult {
  const normalizedInput = parseInstitutionOnboardingInput(input.rawInput);
  const actor = CreateInstitutionOnboardingActorSchema.parse({
    ...input.actor,
    email: normalizeEmail(input.actor.email)
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
    updatedAt: input.now
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
    updatedAt: input.now
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
      executedByUserEmail: actor.email
    },
    impact: {
      impactedUserRole: ROLE.INSTITUTION_ADMIN,
      impactedUserEmail: normalizedInput.adminEmail,
      impactedPermissionStatus: PERMISSION_STATUS.GRANTED
    },
    searchRequest: {},
    createdAt: input.now
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
      executedByUserEmail: actor.email
    },
    impact: {
      impactedUserRole: ROLE.INSTITUTION_ADMIN,
      impactedUserEmail: normalizedInput.adminEmail,
      impactedPermissionStatus: PERMISSION_STATUS.GRANTED
    },
    searchRequest: {},
    createdAt: input.now
  });

  return {
    institution,
    permission,
    logs: [institutionLog, permissionLog],
    response: {
      institution: {
        RFC: institution.RFC,
        name: institution.name,
        plan: institution.plan,
        planStatus: institution.planStatus,
        planStartAt: institution.planStartAt,
        planFinishAt: institution.planFinishAt,
        createdAt: institution.createdAt,
        updatedAt: institution.updatedAt
      },
      permission: {
        permissionId: permission.permissionId,
        RFC: permission.RFC,
        email: permission.email,
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt
      }
    }
  };
}
