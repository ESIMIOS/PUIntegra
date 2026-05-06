import { afterEach, describe, expect, it } from 'vitest';
import { COMMERCIAL_PLAN, COMMERCIAL_PLAN_STATUS, HTTP_STATUS, ROLE, SystemError, type Institution } from '@puintegra/shared';
import { buildSharedSecretUpdateResult } from '../src/services/appAdminInstitutionService';

const ORIGINAL_MASTER_KEY = process.env.PUINTEGRA_SHARED_SECRET_MASTER_KEY;

function createInstitutionFixture(): Institution {
  return {
    RFC: 'AAA010101AAA',
    name: 'Institución Demo',
    plan: COMMERCIAL_PLAN.PORTAL,
    planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
    sharedSecret: null,
    SHA256SharedSecret: null,
    planStartAt: 1710000000000,
    planFinishAt: 1720000000000,
    updates: [],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  };
}

afterEach(() => {
  if (ORIGINAL_MASTER_KEY === undefined) {
    delete process.env.PUINTEGRA_SHARED_SECRET_MASTER_KEY;
    return;
  }
  process.env.PUINTEGRA_SHARED_SECRET_MASTER_KEY = ORIGINAL_MASTER_KEY;
});

describe('buildSharedSecretUpdateResult', () => {
  it('fails when PUINTEGRA_SHARED_SECRET_MASTER_KEY is missing', () => {
    delete process.env.PUINTEGRA_SHARED_SECRET_MASTER_KEY;

    try {
      buildSharedSecretUpdateResult({
        institution: createInstitutionFixture(),
        rfc: 'AAA010101AAA',
        payload: { sharedSecret: 'top-secret-value' },
        actor: {
          userId: 'user-001',
          email: 'admin@example.com',
          role: ROLE.INSTITUTION_ADMIN,
        },
        originTraceId: 'trace-001',
        now: 1710000000100,
        logId: 'log-001',
      });
      expect.fail('Expected buildSharedSecretUpdateResult to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError);
      expect((error as SystemError).code).toBe('API-SYS-001');
      expect((error as SystemError).httpStatus).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect((error as SystemError).displayMessage).toBe(
        'Missing PUINTEGRA_SHARED_SECRET_MASTER_KEY environment variable.',
      );
    }
  });

  it('fails when PUINTEGRA_SHARED_SECRET_MASTER_KEY is too short', () => {
    process.env.PUINTEGRA_SHARED_SECRET_MASTER_KEY = 'short-key';

    try {
      buildSharedSecretUpdateResult({
        institution: createInstitutionFixture(),
        rfc: 'AAA010101AAA',
        payload: { sharedSecret: 'top-secret-value' },
        actor: {
          userId: 'user-001',
          email: 'admin@example.com',
          role: ROLE.INSTITUTION_ADMIN,
        },
        originTraceId: 'trace-001',
        now: 1710000000100,
        logId: 'log-001',
      });
      expect.fail('Expected buildSharedSecretUpdateResult to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError);
      expect((error as SystemError).code).toBe('API-SYS-001');
      expect((error as SystemError).httpStatus).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect((error as SystemError).displayMessage).toBe(
        'PUINTEGRA_SHARED_SECRET_MASTER_KEY must be at least 32 bytes (raw or base64-decoded).',
      );
    }
  });

  it('encrypts and stores SHA256 when master key is valid', () => {
    process.env.PUINTEGRA_SHARED_SECRET_MASTER_KEY = '0123456789abcdef0123456789abcdef';

    const result = buildSharedSecretUpdateResult({
      institution: createInstitutionFixture(),
      rfc: 'AAA010101AAA',
      payload: { sharedSecret: 'top-secret-value' },
      actor: {
        userId: 'user-001',
        email: 'admin@example.com',
        role: ROLE.INSTITUTION_ADMIN,
      },
      originTraceId: 'trace-001',
      now: 1710000000100,
      logId: 'log-001',
    });

    expect(result.institution.SHA256SharedSecret).toBeTruthy();
    expect(result.institution.sharedSecret).toContain('"alg":"aes-256-gcm"');
    expect(result.response.sharedSecretConfigured).toBe(true);
  });
});
