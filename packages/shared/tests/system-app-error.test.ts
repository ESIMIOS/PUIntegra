import { describe, expect, it } from 'vitest';
import { sharedSystemMessages } from '../src/constants/system-messages';
import { isSystemError, SystemError } from '../src/errors/system-app-error';

describe('SystemError', () => {
  it('stores canonical error contract fields', () => {
    const error = new SystemError(sharedSystemMessages.data.operation.validationFailed.code, {
      displayMessage: 'No se pudo procesar la solicitud.',
      httpStatus: 400,
      details: { reason: 'invalid_payload' }
    });

    expect(error.message).toBe(sharedSystemMessages.data.operation.validationFailed.message);
    expect(error.code).toBe(sharedSystemMessages.data.operation.validationFailed.code);
    expect(error.uiMessageKey).toBe(sharedSystemMessages.data.operation.validationFailed.key);
    expect(error.displayMessage).toBe('No se pudo procesar la solicitud.');
    expect(error.httpStatus).toBe(400);
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
      errorKind: sharedSystemMessages.data.operation.conflictDetected.errorKind
    };

    expect(isSystemError(foreignLikeError)).toBe(true);
  });
});
