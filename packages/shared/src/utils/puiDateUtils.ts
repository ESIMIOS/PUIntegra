/**
 * @package shared
 * @name puiDateUtils.ts
 * @version 0.0.1
 * @description Convierte fechas de transporte PUI a timestamps UTC internos y viceversa.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial de utilidades de fecha PUI.	@tirsomartinezreyes
 */

import { sharedSystemMessages } from '../constants/system-messages';
import { SystemError } from '../errors/system-app-error';
import { PUI_DATE_REGEX } from '../schemas/pui-transport.schema';

const PUI_DATE_SEGMENTS = 3;

function assertSafeTimestamp(timestamp: number): void {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new SystemError(sharedSystemMessages.data.operation.validationFailed, {
      displayMessage: 'Internal timestamp must be a safe non-negative integer.',
      details: { timestamp },
    });
  }
}

/**
 * @description Converts a PUI YYYY-MM-DD date to UTC midnight milliseconds.
 */
export function puiDateToUtcMilliseconds(value: string): number {
  if (!PUI_DATE_REGEX.test(value)) {
    throw new SystemError(sharedSystemMessages.data.operation.validationFailed, {
      displayMessage: 'PUI date must use YYYY-MM-DD format.',
      details: { value },
    });
  }

  const parts = value.split('-').map(Number);
  if (parts.length !== PUI_DATE_SEGMENTS) {
    throw new SystemError(sharedSystemMessages.data.operation.validationFailed, {
      displayMessage: 'PUI date must contain year, month, and day.',
      details: { value, partsLength: parts.length },
    });
  }

  const [year, month, day] = parts as [number, number, number];
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new SystemError(sharedSystemMessages.data.operation.validationFailed, {
      displayMessage: 'PUI date must be a valid calendar date.',
      details: { value, year, month, day },
    });
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

function pluralize(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural;
}

function monthPhrase(months: number, hasHalf: boolean) {
  if (months === 0 && hasHalf) {
    return 'medio mes';
  }
  if (months === 1 && hasHalf) {
    return 'un mes y medio';
  }
  if (months === 1) {
    return 'un mes';
  }
  if (hasHalf) {
    return `${months} meses y medio`;
  }
  return `${months} meses`;
}

function yearPhrase(years: number, hasHalf: boolean) {
  if (years === 1 && hasHalf) {
    return 'un año y medio';
  }
  if (years === 1) {
    return 'un año';
  }
  if (hasHalf) {
    return `${years} años y medio`;
  }
  return `${years} años`;
}

/**
 * @description Devuelve tiempo relativo amigable en español para conversaciones de interfaz.
 */
export function friendlyRelativeTimeEs(timestamp: number, now = Date.now()): string {
  assertSafeTimestamp(timestamp);
  assertSafeTimestamp(now);

  const diff = timestamp - now;
  const isFuture = diff > 0;
  const absDays = Math.round(Math.abs(diff) / 86_400_000);

  if (absDays === 0) {
    return 'hoy';
  }

  let phrase = '';
  if (absDays < 30) {
    phrase = `${absDays} ${pluralize(absDays, 'día', 'días')}`;
  } else if (absDays < 365) {
    const months = Math.floor(absDays / 30);
    const remainingDays = absDays - months * 30;
    phrase = monthPhrase(months, remainingDays >= 15);
  } else {
    const years = Math.floor(absDays / 365);
    const remainingDays = absDays - years * 365;
    phrase = yearPhrase(years, remainingDays >= 182);
  }

  return isFuture ? `En ${phrase}` : `Hace ${phrase}`;
}
