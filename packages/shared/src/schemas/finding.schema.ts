/**
 * @package shared
 * @name finding.schema.ts
 * @version 0.0.1
 * @description Define el contrato de hallazgos y su sincronización con PUI.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import {
  TimestampMillisecondsUtcSchema,
  UpdateActorSchema
} from './domain-common.schema';
import { PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema } from './pui-transport.schema';
import { SearchRequestPhaseSchema } from './request.schema';

export const FINDING_PUI_SYNC_STATUS = {
  PENDING: 'PENDING',
  PROGRESS: 'PROGRESS',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
} as const;

export const FindingPuiSyncStatusValues = [
  FINDING_PUI_SYNC_STATUS.PENDING,
  FINDING_PUI_SYNC_STATUS.PROGRESS,
  FINDING_PUI_SYNC_STATUS.SUCCESS,
  FINDING_PUI_SYNC_STATUS.ERROR
] as const;
export const FindingPuiSyncStatusSchema = z.enum(FindingPuiSyncStatusValues);

export const FindingResponseSchema = z.object({
  date: TimestampMillisecondsUtcSchema,
  HTTPResponseCode: z.number().int(),
  response: z.record(z.unknown())
});

export const FindingDataSchema = PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema;

export const FindingUpdateSchema = UpdateActorSchema.extend({
  previousPUISyncStatus: FindingPuiSyncStatusSchema.nullable().optional(),
  updatedPUISyncStatus: FindingPuiSyncStatusSchema.nullable().optional(),
  previousPUISyncScheduleDate: TimestampMillisecondsUtcSchema.nullable().optional(),
  updatedPUISyncScheduleDate: TimestampMillisecondsUtcSchema.nullable().optional()
});

export const FindingSchema = z.object({
  findingId: z.string().min(1),
  RFC: z.string().min(1),
  FUB: z.string().min(1),
  CURP: z.string().min(1),
  searchRequestPhase: SearchRequestPhaseSchema,
  PUISyncStatus: FindingPuiSyncStatusSchema,
  PUISyncScheduleDate: TimestampMillisecondsUtcSchema.nullable(),
  data: FindingDataSchema,
  responses: z.array(FindingResponseSchema).default([]),
  updates: z.array(FindingUpdateSchema).default([]),
  createdAt: TimestampMillisecondsUtcSchema,
  updatedAt: TimestampMillisecondsUtcSchema
});

export type FindingPuiSyncStatus = z.infer<typeof FindingPuiSyncStatusSchema>;
export type FindingResponse = z.infer<typeof FindingResponseSchema>;
export type FindingUpdate = z.infer<typeof FindingUpdateSchema>;
export type Finding = z.infer<typeof FindingSchema>;
