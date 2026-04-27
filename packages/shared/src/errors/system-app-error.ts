/**
 * @package shared
 * @name system-app-error.ts
 * @version 0.0.3
 * @description Error base transversal para unificar contrato de errores entre paquetes.
 * @author @codex
 * @changelog
 * - 0.0.3	(2026-04-24)	Recibe SystemMessage como fuente de verdad y elimina helpers redundantes.	@codex
 * - 0.0.2	(2026-04-24)	Renombrado a SystemError y agrega helpers de creación/guardado de kind.	@codex
 * - 0.0.1	(2026-04-24)	Agrega clase base con código, clave UI, estado y metadatos opcionales.	@codex
 */

import {
  resolveSystemMessage,
  isSystemMessageTemplate,
  type HttpStatus,
  type SystemPackageName,
  SystemMessageTemplate,
  defaultUnknownSystemMessage,
} from '../constants/system-messages';
import type { SystemMessage } from '../schemas/system-message.schema';

export type SystemErrorOptions = {
  displayMessage?: string;
  details?: Record<string, unknown>;
  httpStatus?: HttpStatus;
  cause?: unknown;
};

export class SystemError extends Error {
  readonly name: string;
  readonly code: SystemMessage['code'];
  readonly uiMessageKey?: string;
  readonly displayMessage?: string;
  readonly details?: Record<string, unknown>;
  readonly httpStatus?: HttpStatus;
  readonly packageName?: SystemPackageName;

  constructor(code: SystemMessage['code'] | SystemMessage, options: SystemErrorOptions = {}) {
    const message = typeof code === 'string' ? resolveSystemMessage(code) : code;
    const resolvedHttpStatus = options.httpStatus ?? message.httpStatus;
    super(message.message);
    this.name = 'SystemError';
    this.code = message.code;
    this.uiMessageKey = message.key;
    this.displayMessage = options.displayMessage ?? message.displayMessage ?? message.message;
    this.details = options.details;
    this.httpStatus = typeof resolvedHttpStatus === 'number' ? (resolvedHttpStatus as HttpStatus) : undefined;
    this.packageName = message.packageName as SystemPackageName;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

/**
 * @description Determina si un valor es un SystemError.
 */
export function isSystemError(value: unknown): value is SystemError {
  if (value instanceof SystemError) {
    return true;
  }

  const candidate = value as Record<string, unknown>;
  const hasRequiredShape = typeof candidate.name === 'string' && candidate.name === 'SystemError';

  if (isSystemMessageTemplate(value as SystemMessageTemplate) && hasRequiredShape) {
    return true;
  }

  return false;
}

export const getSystemError = (
  code: SystemMessage['code'] | SystemMessage,
  options: SystemErrorOptions = {},
): SystemError => {
  return new SystemError(code, options);
};

export function formatUiErrorString(input: unknown): string {
  let output: SystemMessageTemplate | SystemMessage | SystemError = defaultUnknownSystemMessage;

  if (isSystemMessageTemplate(input as SystemMessageTemplate) || isSystemError(input as SystemError)) {
    output = input as SystemMessageTemplate | SystemError;
  }
  return `${output.code}: ${output.displayMessage ?? output.message}`;
}
