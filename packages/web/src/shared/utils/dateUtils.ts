/**
 * @package web
 * @name dateUtils.ts
 * @version 0.0.1
 * @description Utilidades de fecha y tiempo para cálculos de timestamp UTC en milisegundos.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
export const DAYS_PER_YEAR = 365;

/**
 * @description Returns the current UTC timestamp in milliseconds.
 */
export function nowUtcMilliseconds() {
  return Date.now();
}

/**
 * @description Returns a UTC timestamp in milliseconds for a date N years ago.
 */
export function yearsAgoUtcMilliseconds(years: number, from = nowUtcMilliseconds()): number {
  const date = new Date(from);
  date.setUTCFullYear(date.getUTCFullYear() - years);
  return date.getTime();
}
