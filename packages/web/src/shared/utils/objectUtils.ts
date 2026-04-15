/**
 * @package web
 * @name objectUtils.ts
 * @version 0.0.1
 * @description Utilidades de objetos para operaciones transversales de clonación.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

/**
 * @description Deep clone helper with `structuredClone` first and JSON fallback.
 */
export function deepClone<T>(input: T): T {
  if (typeof globalThis.structuredClone === 'function') {
    try {
      return globalThis.structuredClone(input);
    } catch {
      // Fall through to JSON fallback for non-cloneable values.
    }
  }
  return JSON.parse(JSON.stringify(input)) as T; //NOSONAR - fallback only
}
