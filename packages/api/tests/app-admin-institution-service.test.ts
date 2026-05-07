import { afterEach, describe, expect, it } from 'vitest';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  HTTP_STATUS,
  INSTITUTION_CONTACT_TYPE,
  PERMISSION_STATUS,
  ROLE,
  SystemError,
  type Contact,
  type Institution,
  type Permission,
} from '@puintegra/shared';
import {
  AppAdminInstitutionService,
  buildContactUpsertResult,
  buildPermissionCreateResult,
  buildPermissionUpdateResult,
  buildSharedSecretUpdateResult,
} from '../src/services/appAdminInstitutionService';

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

function createContactFixture(type: Contact['type']): Contact {
  return {
    contactId: 'contact-001',
    type,
    RFC: 'AAA010101AAA',
    name: 'Contacto Inicial',
    phone: '+525500000000',
    contactCURP: 'MART810609HDFRYR03',
    contactRFC: 'AAA010101AAA',
    efirmaCertificate: 'CERT-OLD',
    updates: [],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  };
}

function createPermissionFixture(): Permission {
  return {
    permissionId: 'owner@example.test__aaa010101aaa',
    RFC: 'AAA010101AAA',
    email: 'owner@example.test',
    role: ROLE.INSTITUTION_OPERATOR,
    status: PERMISSION_STATUS.GRANTED,
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
    expect(result.log.execution.executedByRole).toBe(ROLE.INSTITUTION_ADMIN);
    expect(result.institution.updates.at(-1)?.updatedByUserRole).toBe(ROLE.INSTITUTION_ADMIN);
  });
});

describe('app-admin audit log execution role', () => {
  it('sets executedByRole for contact creation', () => {
    const result = buildContactUpsertResult({
      existingContact: null,
      contactType: INSTITUTION_CONTACT_TYPE.LEGAL,
      rfc: 'AAA010101AAA',
      payload: {
        type: INSTITUTION_CONTACT_TYPE.LEGAL,
        name: 'Contacto Legal',
        phone: '+525533748806',
        contactCURP: 'MART810609HDFRYR03',
        contactRFC: 'AAA010101AAA',
        efirmaCertificate: 'CERT',
      },
      actor: {
        userId: 'user-001',
        email: 'admin@example.com',
        role: ROLE.INSTITUTION_ADMIN,
      },
      originTraceId: 'trace-contact-create',
      now: 1710000000100,
      contactId: 'contact-new',
      logId: 'log-contact-create',
    });

    expect(result.log.execution.executedByRole).toBe(ROLE.INSTITUTION_ADMIN);
    expect(result.contact.updates).toHaveLength(0);
  });

  it('sets executedByRole for contact update', () => {
    const result = buildContactUpsertResult({
      existingContact: createContactFixture(INSTITUTION_CONTACT_TYPE.TECHNICAL),
      contactType: INSTITUTION_CONTACT_TYPE.TECHNICAL,
      rfc: 'AAA010101AAA',
      payload: {
        type: INSTITUTION_CONTACT_TYPE.TECHNICAL,
        name: 'Contacto Técnico',
        phone: '+525533748807',
        contactCURP: 'MART810609HDFRYR03',
      },
      actor: {
        userId: 'user-001',
        email: 'admin@example.com',
        role: ROLE.INSTITUTION_ADMIN,
      },
      originTraceId: 'trace-contact-update',
      now: 1710000000101,
      contactId: 'contact-tech',
      logId: 'log-contact-update',
    });

    expect(result.log.execution.executedByRole).toBe(ROLE.INSTITUTION_ADMIN);
    expect(result.contact.updates).toHaveLength(1);
    expect(result.contact.updates[0]?.updatedByUserRole).toBe(ROLE.INSTITUTION_ADMIN);
  });

  it('sets executedByRole for permission creation', () => {
    const result = buildPermissionCreateResult({
      rfc: 'AAA010101AAA',
      payload: {
        email: 'new.user@example.com',
        role: ROLE.INSTITUTION_OPERATOR,
        status: PERMISSION_STATUS.GRANTED,
      },
      actor: {
        userId: 'user-001',
        email: 'admin@example.com',
        role: ROLE.INSTITUTION_ADMIN,
      },
      originTraceId: 'trace-permission-create',
      now: 1710000000102,
      permissionId: 'new.user@example.com__aaa010101aaa',
      logId: 'log-permission-create',
    });

    expect(result.log.execution.executedByRole).toBe(ROLE.INSTITUTION_ADMIN);
  });

  it('sets executedByRole for permission update', () => {
    const result = buildPermissionUpdateResult({
      permission: createPermissionFixture(),
      payload: {
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.DENIED,
      },
      actor: {
        userId: 'user-001',
        email: 'admin@example.com',
        role: ROLE.INSTITUTION_ADMIN,
      },
      originTraceId: 'trace-permission-update',
      now: 1710000000103,
      logId: 'log-permission-update',
    });

    expect(result.log.execution.executedByRole).toBe(ROLE.INSTITUTION_ADMIN);
    expect(result.permission.updates.at(-1)?.updatedByUserRole).toBe(ROLE.INSTITUTION_ADMIN);
  });
});

describe('assertInstitutionAdminAccess', () => {
  it('allows access when actor has RFC-scoped granted admin permission', () => {
    expect(() =>
      AppAdminInstitutionService.assertInstitutionAdminAccess({
        actor: {
          userId: 'user-001',
          email: 'admin@example.com',
          role: ROLE.INSTITUTION_ADMIN,
        },
        rfc: 'MART810609GPA',
        hasGrantedPermissionForRfc: true,
      }),
    ).not.toThrow();
  });

  it('allows access when actor role is SYSTEM_ADMINISTRATOR but RFC-scoped institution admin permission is granted', () => {
    expect(() =>
      AppAdminInstitutionService.assertInstitutionAdminAccess({
        actor: {
          userId: 'user-001',
          email: 'admin@example.com',
          role: ROLE.SYSTEM_ADMINISTRATOR,
        },
        rfc: 'MART810609GPA',
        hasGrantedPermissionForRfc: true,
      }),
    ).not.toThrow();
  });

  it('rejects access when RFC-scoped granted institution admin permission is missing', () => {
    try {
      AppAdminInstitutionService.assertInstitutionAdminAccess({
        actor: {
          userId: 'user-001',
          email: 'admin@example.com',
          role: ROLE.INSTITUTION_ADMIN,
        },
        rfc: 'MART810609GPA',
        hasGrantedPermissionForRfc: false,
      });
      expect.fail('Expected assertInstitutionAdminAccess to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError);
      expect((error as SystemError).code).toBe('API-APP-002');
      expect((error as SystemError).httpStatus).toBe(HTTP_STATUS.FORBIDDEN);
    }
  });
});
