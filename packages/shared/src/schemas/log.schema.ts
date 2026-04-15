/**
 * @package shared
 * @name log.schema.ts
 * @version 0.0.1
 * @description Define el contrato de trazabilidad operativa transversal.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import { RoleSchema } from './access.schema';
import {
  TimestampMillisecondsUtcSchema,
  LogCategorySchema,
  LogOriginSchema
} from './domain-common.schema';
import {
  SearchRequestPhaseSchema,
  SearchRequestPhaseStatusSchema,
  SearchRequestStatusSchema
} from './request.schema';
import { PermissionStatusSchema } from './permission.schema';

export const LogExecutionSchema = z.object({
  executedByUserId: z.string().min(1).nullable().optional(),
  executedByRole: RoleSchema.nullable().optional(),
  executedByUserEmail: z.string().email().nullable().optional()
});

export const LogImpactSchema = z.object({
  impactedUserId: z.string().min(1).nullable().optional(),
  impactedUserRole: RoleSchema.nullable().optional(),
  impactedUserEmail: z.string().email().nullable().optional(),
  impactedPermissionStatus: PermissionStatusSchema.nullable().optional()
});

export const LogSearchRequestSchema = z.object({
  FUB: z.string().min(1).nullable().optional(),
  CURP: z.string().min(1).nullable().optional(),
  searchRequestStatus: SearchRequestStatusSchema.nullable().optional(),
  searchRequestPhase: SearchRequestPhaseSchema.nullable().optional(),
  searchRequestPhaseStatus: SearchRequestPhaseStatusSchema.nullable().optional()
});

export const LogSchema = z.object({
  id: z.string().min(1),
  category: LogCategorySchema,
  RFC: z.string().min(1).nullable().optional(),
  origin: LogOriginSchema,
  originTraceId: z.string().min(1).nullable().optional(),
  userId: z.string().min(1).nullable().optional(),
  execution: LogExecutionSchema,
  impact: LogImpactSchema,
  searchRequest: LogSearchRequestSchema,
  createdAt: TimestampMillisecondsUtcSchema
});

export type LogExecution = z.infer<typeof LogExecutionSchema>;
export type LogImpact = z.infer<typeof LogImpactSchema>;
export type LogSearchRequest = z.infer<typeof LogSearchRequestSchema>;
export type Log = z.infer<typeof LogSchema>;
