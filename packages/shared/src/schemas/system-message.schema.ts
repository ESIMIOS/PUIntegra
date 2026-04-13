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

export const logSeverityValues = [
  'DEBUG',
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR'
] as const;

export const LogSeveritySchema = z.enum(logSeverityValues);

export const MessageCodeSchema = z
  .string()
  .regex(/^[A-Z]+(?:-[A-Z0-9]+){2,}$/, 'Invalid message code format');

export const MessageKeySchema = z
  .string()
  .regex(/^[a-z]+(?:\.[a-z0-9_]+){2,}$/, 'Invalid message key format');

export const PackageNameSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, 'Invalid package name format');

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
