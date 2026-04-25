/**
 * @package shared
 * @name api-response.schema.ts
 * @version 0.0.1
 * @description Define el envelope estándar para respuestas HTTP API entre backend y frontend.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-19)	Agrega contratos de éxito/error con códigos, trazas y mensajes UI opcionales.	@codex
 */

import { z } from 'zod';
import { MessageCodeSchema, MessageKeySchema, SystemMessageErrorKindSchema } from './system-message.schema';

export const ApiResponseMetaSchema = z.object({
  requestId: z.string().min(1).optional(),
  originTraceId: z.string().min(1).optional()
});

export const ApiErrorSchema = z.object({
  code: MessageCodeSchema,
  message: z.string().min(1),
  uiMessageKey: MessageKeySchema.optional(),
  uiMessageParams: z.record(z.unknown()).optional(),
  displayMessage: z.string().min(1).optional(),
  errorKind: SystemMessageErrorKindSchema.optional(),
  details: z.record(z.unknown()).optional()
});

export const ApiSuccessResponseSchema = z.object({
  ok: z.literal(true),
  data: z.unknown(),
  meta: ApiResponseMetaSchema.optional()
});

export const ApiErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: ApiErrorSchema,
  meta: ApiResponseMetaSchema.optional()
});

export const ApiResponseSchema = z.discriminatedUnion('ok', [
  ApiSuccessResponseSchema,
  ApiErrorResponseSchema
]);

export type ApiResponseMeta = z.infer<typeof ApiResponseMetaSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiSuccessResponse = z.infer<typeof ApiSuccessResponseSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
