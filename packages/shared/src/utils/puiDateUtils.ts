/**
 * @package shared
 * @name puiDateUtils.ts
 * @version 0.0.1
 * @description Convierte fechas de transporte PUI a timestamps UTC internos y viceversa.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial de utilidades de fecha PUI.	@tirsomartinezreyes
 */

import { PUI_DATE_REGEX } from '../schemas/pui-transport.schema';

const PUI_DATE_SEGMENTS = 3;

function assertSafeTimestamp(timestamp: number): void {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new Error('Internal timestamp must be a safe non-negative integer.');
  }
}

/**
 * @description Converts a PUI YYYY-MM-DD date to UTC midnight milliseconds.
 */
export function puiDateToUtcMilliseconds(value: string): number {
  if (!PUI_DATE_REGEX.test(value)) {
    throw new Error('PUI date must use YYYY-MM-DD format.');
  }

  const parts = value.split('-').map(Number);
  if (parts.length !== PUI_DATE_SEGMENTS) {
    throw new Error('PUI date must contain year, month, and day.');
  }

  const [year, month, day] = parts as [number, number, number];
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error('PUI date must be a valid calendar date.');
  }

  return timestamp;
}

/**
 * @description Converts an optional PUI date to UTC midnight milliseconds.
 */
export function optionalPuiDateToUtcMilliseconds(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return puiDateToUtcMilliseconds(value);
}

/**
 * @description Converts an internal UTC timestamp to a PUI YYYY-MM-DD date.
 */
export function utcMillisecondsToPuiDate(timestamp: number): string {
  assertSafeTimestamp(timestamp);

  return new Date(timestamp).toISOString().slice(0, 10);
}
