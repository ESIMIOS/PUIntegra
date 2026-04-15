/**
 * @package web
 * @name mockDataError.ts
 * @version 0.0.1
 * @description Define errores tipados para operaciones de datos mock.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

export const MOCK_DATA_ERROR_KIND = {
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  FORBIDDEN: 'FORBIDDEN',
  STORAGE: 'STORAGE',
  UNKNOWN: 'UNKNOWN'
} as const;

export const MockDataErrorKindValues = [
  MOCK_DATA_ERROR_KIND.VALIDATION,
  MOCK_DATA_ERROR_KIND.NOT_FOUND,
  MOCK_DATA_ERROR_KIND.CONFLICT,
  MOCK_DATA_ERROR_KIND.FORBIDDEN,
  MOCK_DATA_ERROR_KIND.STORAGE,
  MOCK_DATA_ERROR_KIND.UNKNOWN
] as const;

export type MockDataErrorKind = (typeof MockDataErrorKindValues)[number];

export class MockDataError extends Error {
  readonly kind: MockDataErrorKind;
  readonly details: Record<string, unknown>;

  constructor(
    kind: MockDataErrorKind,
    message: string,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'MockDataError';
    this.kind = kind;
    this.details = details;
  }
}

/**
 * @description Type guard for the mock data error envelope.
 */
export function isMockDataError(value: unknown): value is MockDataError {
  return value instanceof MockDataError;
}
