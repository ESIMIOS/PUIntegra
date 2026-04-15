/**
 * @package shared
 * @name institution.schema.ts
 * @version 0.0.1
 * @description Define el contrato de institución, plan comercial y estado operativo.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import { TimestampMillisecondsUtcSchema, UpdateActorSchema } from './domain-common.schema';

export const COMMERCIAL_PLAN = {
  PORTAL: 'PORTAL',
  CLOUD: 'CLOUD',
  ENTERPRISE: 'ENTERPRISE'
} as const;

export const CommercialPlanValues = [
  COMMERCIAL_PLAN.PORTAL,
  COMMERCIAL_PLAN.CLOUD,
  COMMERCIAL_PLAN.ENTERPRISE
] as const;

export const CommercialPlanSchema = z.enum(CommercialPlanValues);

export const COMMERCIAL_PLAN_STATUS = {
  ACTIVE: 'ACTIVE',
  WARNING: 'WARNING',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED'
} as const;

export const CommercialPlanStatusValues = [
  COMMERCIAL_PLAN_STATUS.ACTIVE,
  COMMERCIAL_PLAN_STATUS.WARNING,
  COMMERCIAL_PLAN_STATUS.PAUSED,
  COMMERCIAL_PLAN_STATUS.STOPPED
] as const;

export const CommercialPlanStatusSchema = z.enum(CommercialPlanStatusValues);

export const InstitutionUpdateSchema = UpdateActorSchema.extend({
  previousName: z.string().min(1).nullable().optional(),
  updatedName: z.string().min(1).nullable().optional(),
  previousPlan: CommercialPlanSchema.nullable().optional(),
  updatedPlan: CommercialPlanSchema.nullable().optional(),
  previousPlanStatus: CommercialPlanStatusSchema.nullable().optional(),
  updatedPlanStatus: CommercialPlanStatusSchema.nullable().optional(),
  previousPlanStartAt: TimestampMillisecondsUtcSchema.nullable().optional(),
  updatedPlanStartAt: TimestampMillisecondsUtcSchema.nullable().optional(),
  previousPlanFinishAt: TimestampMillisecondsUtcSchema.nullable().optional(),
  updatedPlanFinishAt: TimestampMillisecondsUtcSchema.nullable().optional(),
  previousSHA256SharedSecret: z.string().min(1).nullable().optional(),
  updatedSHA256SharedSecret: z.string().min(1).nullable().optional()
});

export const InstitutionSchema = z.object({
  RFC: z.string().min(1),
  name: z.string().min(1),
  plan: CommercialPlanSchema,
  planStatus: CommercialPlanStatusSchema,
  sharedSecret: z.string().min(1),
  planStartAt: TimestampMillisecondsUtcSchema,
  planFinishAt: TimestampMillisecondsUtcSchema,
  updates: z.array(InstitutionUpdateSchema).default([]),
  createdAt: TimestampMillisecondsUtcSchema,
  updatedAt: TimestampMillisecondsUtcSchema
});

export type CommercialPlanStatus = z.infer<typeof CommercialPlanStatusSchema>;
export type CommercialPlan = z.infer<typeof CommercialPlanSchema>;
export type InstitutionUpdate = z.infer<typeof InstitutionUpdateSchema>;
export type Institution = z.infer<typeof InstitutionSchema>;
