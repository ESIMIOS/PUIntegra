import { describe, expect, it } from 'vitest';
import { sharedSystemMessages, HTTP_STATUS } from '../src/constants/system-messages';
import { isSystemError, SystemError } from '../src/errors/system-app-error';

describe('SystemError', () => {
  it('stores canonical error contract fields', () => {
    const error = new SystemError(sharedSystemMessages.data.operation.validationFailed.code, {
      displayMessage: 'No se pudo procesar la solicitud.',
      httpStatus: HTTP_STATUS.BAD_REQUEST,
      details: { reason: 'invalid_payload' }
    });

    expect(error.message).toBe(sharedSystemMessages.data.operation.validationFailed.message);
    expect(error.code).toBe(sharedSystemMessages.data.operation.validationFailed.code);
    expect(error.uiMessageKey).toBe(sharedSystemMessages.data.operation.validationFailed.key);
    expect(error.displayMessage).toBe('No se pudo procesar la solicitud.');
    expect(error.httpStatus).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(error.packageName).toBe(sharedSystemMessages.data.operation.validationFailed.packageName);
    expect(error.details).toEqual({ reason: 'invalid_payload' });
  });

  it('keeps optional fields undefined when not provided', () => {
    const error = new SystemError(sharedSystemMessages.data.operation.unknownFailure.code);
    expect(error.details).toBeUndefined();
    expect(error.uiMessageKey).toBe(sharedSystemMessages.data.operation.unknownFailure.key);
    expect(error.displayMessage).toBe(sharedSystemMessages.data.operation.unknownFailure.message);
    expect(error.httpStatus).toBeUndefined();
    expect(error.packageName).toBe(sharedSystemMessages.data.operation.unknownFailure.packageName);
  });

  it('detects SystemError by shape when runtime class identity differs', () => {
    const foreignLikeError = {
      name: 'SystemError',
      code: sharedSystemMessages.data.operation.conflictDetected.code,
      message: sharedSystemMessages.data.operation.conflictDetected.message,
      severity: sharedSystemMessages.data.operation.conflictDetected.severity,
    };

    expect(isSystemError(foreignLikeError)).toBe(true);
  });
});
