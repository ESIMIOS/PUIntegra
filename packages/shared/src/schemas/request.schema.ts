/**
 * @package shared
 * @name request.schema.ts
 * @version 0.0.1
 * @description Define el contrato de solicitudes de búsqueda y estados por fase.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import { TimestampMillisecondsUtcSchema, UpdateActorSchema } from './domain-common.schema';

export const SEARCH_REQUEST_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED'
} as const;

export const SearchRequestStatusValues = [
  SEARCH_REQUEST_STATUS.ACTIVE,
  SEARCH_REQUEST_STATUS.REVOKED
] as const;
export const SearchRequestStatusSchema = z.enum(SearchRequestStatusValues);

export const SEARCH_REQUEST_PHASE = {
  SEARCH_REQUEST_BASIC_DATA: 'SEARCH_REQUEST_BASIC_DATA',
  SEARCH_REQUEST_HISTORICAL: 'SEARCH_REQUEST_HISTORICAL',
  SEARCH_REQUEST_CONTINUOUS: 'SEARCH_REQUEST_CONTINUOUS'
} as const;

export const SearchRequestPhaseValues = [
  SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA,
  SEARCH_REQUEST_PHASE.SEARCH_REQUEST_HISTORICAL,
  SEARCH_REQUEST_PHASE.SEARCH_REQUEST_CONTINUOUS
] as const;
export const SearchRequestPhaseSchema = z.enum(SearchRequestPhaseValues);

export const SEARCH_REQUEST_PHASE_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  REVOKED: 'REVOKED'
} as const;

export const SearchRequestPhaseStatusValues = [
  SEARCH_REQUEST_PHASE_STATUS.PENDING,
  SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
  SEARCH_REQUEST_PHASE_STATUS.DONE,
  SEARCH_REQUEST_PHASE_STATUS.REVOKED
] as const;
export const SearchRequestPhaseStatusSchema = z.enum(SearchRequestPhaseStatusValues);

export const RequestUpdateSchema = UpdateActorSchema.extend({
  previousSearchRequestStatus: SearchRequestStatusSchema.nullable().optional(),
  updatedSearchRequestStatus: SearchRequestStatusSchema.nullable().optional(),
  previousSearchRequestBasicDataPhaseStatus: SearchRequestPhaseStatusSchema.nullable().optional(),
  updatedSearchRequestBasicDataPhaseStatus: SearchRequestPhaseStatusSchema.nullable().optional(),
  previousSearchRequestHistoricalPhaseStatus: SearchRequestPhaseStatusSchema.nullable().optional(),
  updatedSearchRequestHistoricalPhaseStatus: SearchRequestPhaseStatusSchema.nullable().optional(),
  previousSearchRequestContinuousPhaseStatus: SearchRequestPhaseStatusSchema.nullable().optional(),
  updatedSearchRequestContinuousPhaseStatus: SearchRequestPhaseStatusSchema.nullable().optional()
});

export const RequestSchema = z.object({
  requestId: z.string().min(1),
  RFC: z.string().min(1),
  FUB: z.string().min(1),
  CURP: z.string().min(1),
  missingDate: TimestampMillisecondsUtcSchema.nullable(),
  searchRequestStatus: SearchRequestStatusSchema,
  searchRequestBasicDataPhaseStatus: SearchRequestPhaseStatusSchema,
  searchRequestHistoricalPhaseStatus: SearchRequestPhaseStatusSchema,
  searchRequestContinuousPhaseStatus: SearchRequestPhaseStatusSchema,
  updates: z.array(RequestUpdateSchema).default([]),
  createdAt: TimestampMillisecondsUtcSchema,
  updatedAt: TimestampMillisecondsUtcSchema
});

export type SearchRequestStatus = z.infer<typeof SearchRequestStatusSchema>;
export type SearchRequestPhase = z.infer<typeof SearchRequestPhaseSchema>;
export type SearchRequestPhaseStatus = z.infer<typeof SearchRequestPhaseStatusSchema>;
export type RequestUpdate = z.infer<typeof RequestUpdateSchema>;
export type Request = z.infer<typeof RequestSchema>;
