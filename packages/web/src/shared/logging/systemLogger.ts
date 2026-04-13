/**
 * @package web
 * @name systemLogger.ts
 * @version 0.0.1
 * @description Centraliza la emisión de mensajes técnicos estructurados para diagnóstico y troubleshooting.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import type { SystemMessage } from '@shared'

type ConsoleMethodName = 'debug' | 'info' | 'warn' | 'error'
type LogPayload = Record<string, unknown>

const consoleMethodBySeverityVerbose = {
	DEBUG: 'debug',
	INFO: 'info',
	SUCCESS: 'info',
	WARNING: 'warn',
	ERROR: 'error'
} as const satisfies Record<SystemMessage['severity'], ConsoleMethodName>

const consoleMethodBySeverityDefault = {
	DEBUG: 'warn',
	INFO: 'warn',
	SUCCESS: 'warn',
	WARNING: 'warn',
	ERROR: 'error'
} as const satisfies Record<SystemMessage['severity'], ConsoleMethodName>

const emitByMethod = {
	debug: (payload: LogPayload) => console.debug(payload),
	info: (payload: LogPayload) => console.info(payload),
	warn: (payload: LogPayload) => console.warn(payload),
	error: (payload: LogPayload) => console.error(payload)
} as const

/**
 * @description Construye la carga estructurada de un mensaje de sistema para salida en consola.
 */
function buildPayload(message: SystemMessage, meta: Record<string, unknown>) {
	return {
		code: message.code,
		key: message.key,
		severity: message.severity,
		package: message.package,
		message: message.message,
		meta
	}
}

/**
 * @description Resuelve el método de consola para logging estándar.
 * Mantiene `warn` como salida por defecto salvo severidad `ERROR`.
 */
function resolveConsoleMethodDefault(message: SystemMessage): ConsoleMethodName {
	return consoleMethodBySeverityDefault[message.severity]
}

/**
 * @description Resuelve el método de consola para logging verbose.
 * Respeta la severidad completa del mensaje.
 */
function resolveConsoleMethodVerbose(message: SystemMessage): ConsoleMethodName {
	return consoleMethodBySeverityVerbose[message.severity]
}

/**
 * @description Emite un mensaje técnico estructurado.
 * Usa el método `console.*` mapeado por severidad.
 */
export function logSystemMessage(message: SystemMessage, meta: Record<string, unknown> = {}) {
	const method = resolveConsoleMethodDefault(message)
	emitByMethod[method](buildPayload(message, meta))
}

/**
 * @description Emite un mensaje técnico como advertencia.
 * Selecciona el método `console.*` según severidad del mensaje.
 */
export function logSystemMessageVerbose(message: SystemMessage, meta: Record<string, unknown> = {}) {
	const method = resolveConsoleMethodVerbose(message)
	emitByMethod[method](buildPayload(message, meta))
}

/**
 * @description Emite una advertencia capturada con patrón fijo:
 * `<code>:<message>/<error>`.
 */
export function logSystemMessageWarning(message: SystemMessage, error: unknown, meta: Record<string, unknown> = {}) {
	console.warn({
		code: message.code,
		key: message.key,
		severity: message.severity,
		package: message.package,
		message: `${message.code}:${message.message}/${String(error)}`,
		meta: {
			...meta,
			error
		}
	})
}

/**
 * @description Emite un error capturado con patrón fijo:
 * `<code>:<message>/<error>`.
 */
export function logSystemMessageError(message: SystemMessage, error: unknown, meta: Record<string, unknown> = {}) {
	console.error({
		code: message.code,
		key: message.key,
		severity: message.severity,
		package: message.package,
		message: `${message.code}:${message.message}/${String(error)}`,
		meta: {
			...meta,
			error
		}
	})
}
