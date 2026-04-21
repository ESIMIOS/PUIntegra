/**
 * @package api
 * @name apiResponse.ts
 * @version 0.0.1
 * @description Helpers para construir respuestas HTTP API con envelope compartido.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-19)	Agrega builders de respuestas API estándar.	@codex
 */

import {
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  type ApiError,
  type ApiResponseMeta
} from '@puintegra/shared';

/**
 * @description Construye una respuesta exitosa con validación del envelope API.
 */
export function apiOk(data: unknown, meta?: ApiResponseMeta) {
  return ApiSuccessResponseSchema.parse({
    ok: true,
    data,
    meta
  });
}

/**
 * @description Construye una respuesta de error segura con validación del envelope API.
 */
export function apiError(error: ApiError, meta?: ApiResponseMeta) {
  return ApiErrorResponseSchema.parse({
    ok: false,
    error,
    meta
  });
}
