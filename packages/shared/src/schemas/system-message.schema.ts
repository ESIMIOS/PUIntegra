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
  package: PackageNameSchema,
  message: z.string().min(1),
  meta: z.record(z.unknown()).optional()
});

export type LogSeverity = z.infer<typeof LogSeveritySchema>;
export type SystemMessage = z.infer<typeof SystemMessageSchema>;
