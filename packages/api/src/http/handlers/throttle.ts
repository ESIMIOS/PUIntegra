/**
 * @package api
 * @name throttle.ts
 * @version 0.0.1
 * @description Construye sujetos normalizados y ejecuta throttling inyectado para handlers HTTP.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-07)	Agrega helpers compartidos de sujetos y ejecución de throttling distribuido.	@codex
 */

import type { CreateApiAppDependencies } from './types.js';
import type { ApiThrottleSubject, EnforceApiThrottleInput } from '../../functions/dependencies/types.js';

function serializeSubjectValue(value: string) {
  let serialized = '';
  let previousWasWhitespace = false;

  for (const character of value.trim()) {
    if (/\s/.test(character)) {
      if (!previousWasWhitespace) {
        serialized += '-';
        previousWasWhitespace = true;
      }
      continue;
    }

    previousWasWhitespace = false;
    switch (character) {
      case '_':
        serialized += '__';
        break;
      case '@':
        serialized += '_at_';
        break;
      case '|':
        serialized += '_pipe_';
        break;
      case '=':
        serialized += '_eq_';
        break;
      case '/':
        serialized += '_slash_';
        break;
      case '%':
        serialized += '_pct_';
        break;
      default:
        serialized += character;
        break;
    }
  }

  return serialized;
}

/**
 * @description Construye un sujeto legible y seguro para IDs de documentos de throttling.
 */
export function buildThrottleSubject(parts: Array<[string, string | null | undefined]>): ApiThrottleSubject {
  const normalizedParts = parts
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([key, value]) => {
      const normalizedValue = value!.trim();
      return [key, normalizedValue] as const;
    });
  if (normalizedParts.length === 0) {
    throw new Error('Throttle subject requires at least one normalized part.');
  }

  return {
    subjectKey: normalizedParts.map(([key, value]) => `${key}=${serializeSubjectValue(value)}`).join('|'),
    subject: Object.fromEntries(normalizedParts),
  };
}

/**
 * @description Ejecuta la dependencia de throttling configurada.
 */
export async function enforceThrottle(
  dependencies: CreateApiAppDependencies,
  input: EnforceApiThrottleInput,
) {
  if (!dependencies.enforceThrottle) {
    return;
  }
  await dependencies.enforceThrottle(input);
}
