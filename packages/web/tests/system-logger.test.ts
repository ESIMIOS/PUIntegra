/**
 * @package web
 * @name system-logger.test.ts
 * @version 0.0.1
 * @description Verifica emisión de logs técnicos estructurados y formato de errores capturados.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SystemMessage } from '@shared';
import { webSystemMessages } from '@/shared/constants/systemMessages';
import {
  logSystemMessage,
  logSystemMessageVerbose,
  logSystemMessageWarning,
  logSystemMessageError
} from '@/shared/logging/systemLogger';

describe('system logger', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

  afterEach(() => {
    warnSpy.mockClear();
    errorSpy.mockClear();
    infoSpy.mockClear();
    debugSpy.mockClear();
  });

  it('logs non-error system messages through console.warn', () => {
    logSystemMessage(webSystemMessages.guardAuthRequired, { path: '/auth/login' });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(0);
  });

  it('logs verbose helper as info for INFO severity', () => {
    logSystemMessageVerbose(webSystemMessages.guardAuthRequired, { path: '/auth/login' });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(0);
    expect(errorSpy).toHaveBeenCalledTimes(0);
  });

  it('logs verbose helper as warn for WARNING severity', () => {
    logSystemMessageVerbose(webSystemMessages.guardRoleMismatch, { path: '/app/x/admin/plan' });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledTimes(0);
    expect(errorSpy).toHaveBeenCalledTimes(0);
  });

  it('logs verbose helper as error for ERROR severity', () => {
    logSystemMessageVerbose(webSystemMessages.guardUnexpectedError, { path: '/app/x' });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledTimes(0);
    expect(warnSpy).toHaveBeenCalledTimes(0);
  });

  it('logs verbose helper as debug for DEBUG severity', () => {
    const debugMessage: SystemMessage = {
      code: 'WEB-DEBUG-001',
      key: 'web.logger.debug_event',
      severity: 'DEBUG',
      package: 'web',
      message: 'Evento de depuración.'
    };
    logSystemMessageVerbose(debugMessage, { path: '/debug' });

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledTimes(0);
    expect(warnSpy).toHaveBeenCalledTimes(0);
    expect(errorSpy).toHaveBeenCalledTimes(0);
  });

  it('logs warning helper with code:message/error pattern through console.warn', () => {
    const error = new Error('warning de prueba');
    logSystemMessageWarning(webSystemMessages.guardSecuritySetupRequired, error, {
      path: '/admin/institutions'
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const [payload] = warnSpy.mock.calls[0] as [Record<string, unknown>];
    expect(payload.message).toBe(
      `${webSystemMessages.guardSecuritySetupRequired.code}:${webSystemMessages.guardSecuritySetupRequired.message}/${String(error)}`
    );
    expect(errorSpy).toHaveBeenCalledTimes(0);
    expect(infoSpy).toHaveBeenCalledTimes(0);
    expect(debugSpy).toHaveBeenCalledTimes(0);
  });

  it('logs caught errors with code:message/error pattern', () => {
    const error = new Error('fallo de prueba');
    logSystemMessageError(webSystemMessages.guardUnexpectedError, error, { path: '/app/x' });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [payload] = errorSpy.mock.calls[0] as [Record<string, unknown>];
    expect(payload.message).toBe(
      `${webSystemMessages.guardUnexpectedError.code}:${webSystemMessages.guardUnexpectedError.message}/${String(error)}`
    );
    expect(warnSpy).toHaveBeenCalledTimes(0);
    expect(infoSpy).toHaveBeenCalledTimes(0);
    expect(debugSpy).toHaveBeenCalledTimes(0);
  });
});
