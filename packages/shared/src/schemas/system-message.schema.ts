/**
 * @package shared
 * @name system-message.schema.ts
 * @version 0.0.1
 * @description Define el contrato de mensajes técnicos para observabilidad y troubleshooting entre paquetes.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';

export const LOG_SEVERITY = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
} as const;

export const LOG_SEVERITY_VALUES = [
  LOG_SEVERITY.DEBUG,
  LOG_SEVERITY.INFO,
  LOG_SEVERITY.SUCCESS,
  LOG_SEVERITY.WARNING,
  LOG_SEVERITY.ERROR
] as const;
export const logSeverityValues = LOG_SEVERITY_VALUES;

export const LogSeveritySchema = z.enum(LOG_SEVERITY_VALUES);

export const SYSTEM_MESSAGE_ERROR_KIND = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_NO_PERMISSIONS: 'AUTH_NO_PERMISSIONS',
  AUTH_CONTEXT_REQUIRED: 'AUTH_CONTEXT_REQUIRED',
  AUTH_INVALID_CONTEXT: 'AUTH_INVALID_CONTEXT',
  AUTH_UNAVAILABLE: 'AUTH_UNAVAILABLE',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  DATA_VALIDATION: 'DATA_VALIDATION',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  DATA_CONFLICT: 'DATA_CONFLICT',
  DATA_FORBIDDEN: 'DATA_FORBIDDEN',
  DATA_STORAGE: 'DATA_STORAGE',
  DATA_SERVER_ERROR: 'DATA_SERVER_ERROR',
  DATA_UNKNOWN: 'DATA_UNKNOWN',
  SYSTEM_UNEXPECTED: 'SYSTEM_UNEXPECTED'
} as const;

export const SYSTEM_MESSAGE_ERROR_KIND_VALUES = [
  SYSTEM_MESSAGE_ERROR_KIND.AUTH_INVALID_CREDENTIALS,
  SYSTEM_MESSAGE_ERROR_KIND.AUTH_NO_PERMISSIONS,
  SYSTEM_MESSAGE_ERROR_KIND.AUTH_CONTEXT_REQUIRED,
  SYSTEM_MESSAGE_ERROR_KIND.AUTH_INVALID_CONTEXT,
  SYSTEM_MESSAGE_ERROR_KIND.AUTH_UNAVAILABLE,
  SYSTEM_MESSAGE_ERROR_KIND.AUTH_REQUIRED,
  SYSTEM_MESSAGE_ERROR_KIND.DATA_VALIDATION,
  SYSTEM_MESSAGE_ERROR_KIND.DATA_NOT_FOUND,
  SYSTEM_MESSAGE_ERROR_KIND.DATA_CONFLICT,
  SYSTEM_MESSAGE_ERROR_KIND.DATA_FORBIDDEN,
  SYSTEM_MESSAGE_ERROR_KIND.DATA_STORAGE,
  SYSTEM_MESSAGE_ERROR_KIND.DATA_SERVER_ERROR,
  SYSTEM_MESSAGE_ERROR_KIND.DATA_UNKNOWN,
  SYSTEM_MESSAGE_ERROR_KIND.SYSTEM_UNEXPECTED
] as const;

export const SystemMessageErrorKindSchema = z.enum(SYSTEM_MESSAGE_ERROR_KIND_VALUES);

export const MESSAGE_CODE_PATTERN = /^[A-Z]+-[A-Z0-9]+-\d{3}$/;
export const MESSAGE_KEY_PATTERN = /^[a-z]+(?:\.[a-z0-9_]+){2,}$/;
export const PACKAGE_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
export const INVALID_MESSAGE_CODE_FORMAT = 'Invalid message code format';
export const INVALID_MESSAGE_KEY_FORMAT = 'Invalid message key format';
export const INVALID_PACKAGE_NAME_FORMAT = 'Invalid package name format';

export const MessageCodeSchema = z
  .string()
  .regex(MESSAGE_CODE_PATTERN, INVALID_MESSAGE_CODE_FORMAT);

export const MessageKeySchema = z
  .string()
  .regex(MESSAGE_KEY_PATTERN, INVALID_MESSAGE_KEY_FORMAT);

export const PackageNameSchema = z
  .string()
  .regex(PACKAGE_NAME_PATTERN, INVALID_PACKAGE_NAME_FORMAT);

export const SystemMessageSchema = z.object({
  code: MessageCodeSchema,
  key: MessageKeySchema,
  severity: LogSeveritySchema,
  packageName: PackageNameSchema,
  message: z.string().min(1),
  displayMessage: z.string().min(1).optional(),
  httpStatus: z.number().int().min(100).max(599).optional(),
  errorKind: SystemMessageErrorKindSchema.optional(),
  meta: z.record(z.unknown()).optional()
});

export type LogSeverity = z.infer<typeof LogSeveritySchema>;
export type SystemMessageErrorKind = z.infer<typeof SystemMessageErrorKindSchema>;
export type SystemMessage = z.infer<typeof SystemMessageSchema>;
