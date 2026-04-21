/**
 * @package web
 * @name appErrors.ts
 * @version 0.0.1
 * @description Define errores neutrales de aplicación para auth y datos.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-18)	Agrega errores neutrales para auth y datos de aplicación.	@codex
 */

export const APP_AUTH_ERROR_KIND = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NO_PERMISSIONS: 'NO_PERMISSIONS',
  CONTEXT_REQUIRED: 'CONTEXT_REQUIRED',
  INVALID_CONTEXT: 'INVALID_CONTEXT',
  AUTH_UNAVAILABLE: 'AUTH_UNAVAILABLE',
  UNKNOWN: 'UNKNOWN'
} as const;

export type AppAuthErrorKind = (typeof APP_AUTH_ERROR_KIND)[keyof typeof APP_AUTH_ERROR_KIND];

export const APP_DATA_ERROR_KIND = {
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  FORBIDDEN: 'FORBIDDEN',
  STORAGE: 'STORAGE',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN'
} as const;

export type AppDataErrorKind = (typeof APP_DATA_ERROR_KIND)[keyof typeof APP_DATA_ERROR_KIND];

export class AppAuthError extends Error {
  readonly kind: AppAuthErrorKind;
  readonly code: string;
  readonly uiMessage?: string;

  constructor(kind: AppAuthErrorKind, message: string, options: { code?: string; uiMessage?: string } = {}) {
    super(message);
    this.name = 'AppAuthError';
    this.kind = kind;
    this.code = options.code ?? 'AUTH-APP-000';
    this.uiMessage = options.uiMessage;
  }
}

export class AppDataError extends Error {
  readonly kind: AppDataErrorKind;
  readonly details: Record<string, unknown>;

  constructor(kind: AppDataErrorKind, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'AppDataError';
    this.kind = kind;
    this.details = details;
  }
}

/**
 * @description Determina si un valor es un error de autenticación de aplicación.
 */
export function isAppAuthError(value: unknown): value is AppAuthError {
  return value instanceof AppAuthError;
}

/**
 * @description Determina si un valor es un error de datos de aplicación.
 */
export function isAppDataError(value: unknown): value is AppDataError {
  return value instanceof AppDataError;
}
