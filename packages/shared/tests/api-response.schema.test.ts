/**
 * @package shared
 * @name api-response.schema.test.ts
 * @version 0.0.1
 * @description Valida contratos compartidos de respuesta HTTP API.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-19)	Agrega pruebas del envelope estándar API.	@codex
 */

import { describe, expect, it } from 'vitest';
import {
  ApiErrorResponseSchema,
  ApiResponseSchema,
  ApiSuccessResponseSchema
} from '../src/schemas/api-response.schema';

describe('api response schema', () => {
  it('accepts a standard success response with data and trace metadata', () => {
    const parsed = ApiSuccessResponseSchema.safeParse({
      ok: true,
      data: { recorded: true },
      meta: {
        originTraceId: 'execution-id-login'
      }
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts a standard error response with UI message hints and safe display copy', () => {
    const parsed = ApiErrorResponseSchema.safeParse({
      ok: false,
      error: {
        code: 'API-AUTH-001',
        message: 'Authentication is temporarily locked.',
        uiMessageKey: 'api.auth.temporarily_locked',
        uiMessageParams: {
          retryAfterSeconds: 43
        },
        displayMessage: 'No pudimos completar el inicio de sesión. Intenta de nuevo en 43 segundos.'
      },
      meta: {
        originTraceId: 'execution-id-login'
      }
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects API errors without stable machine code', () => {
    const parsed = ApiErrorResponseSchema.safeParse({
      ok: false,
      error: {
        message: 'Missing bearer token.'
      }
    });

    expect(parsed.success).toBe(false);
  });

  it('accepts success or error through the response union', () => {
    expect(ApiResponseSchema.safeParse({ ok: true, data: {} }).success).toBe(true);
    expect(ApiResponseSchema.safeParse({
      ok: false,
      error: {
        code: 'API-AUTH-002',
        message: 'Missing bearer token.'
      }
    }).success).toBe(true);
  });
});
