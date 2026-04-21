import {
  ContactSchema,
  FindingSchema,
  InstitutionSchema,
  PermissionSchema,
  RequestSchema,
  SYSTEM_RFC
} from '@puintegra/shared';

process.env.PUINTEGRA_EMULATOR_INSTITUTION_SHARED_SECRET = 'test-only-shared-secret';

const { EMULATOR_AUTH_PASSWORD, emulatorSeedData } = await import('../src/emulator/seedData');

describe('emulator seed data', () => {
  it('validates all seeded records with shared schemas', () => {
    expect(() => emulatorSeedData.institutions.forEach((record) => InstitutionSchema.parse(record))).not.toThrow();
    expect(() => emulatorSeedData.permissions.forEach((record) => PermissionSchema.parse(record))).not.toThrow();
    expect(() => emulatorSeedData.contacts.forEach((record) => ContactSchema.parse(record))).not.toThrow();
    expect(() => emulatorSeedData.requests.forEach((record) => RequestSchema.parse(record))).not.toThrow();
    expect(() => emulatorSeedData.findings.forEach((record) => FindingSchema.parse(record))).not.toThrow();
  });

  it('keeps system RFC out of tenant institutions', () => {
    expect(emulatorSeedData.institutions.every((record) => record.RFC !== SYSTEM_RFC)).toBe(true);
  });

  it('uses a deterministic local-only Auth Emulator password', () => {
    expect(EMULATOR_AUTH_PASSWORD).toBe('local-password');
  });

  it('does not seed logs directly because Auth logs are function-owned', () => {
    expect('logs' in emulatorSeedData).toBe(false);
  });

  it('seeds permissions by email without userId linkage', () => {
    expect(emulatorSeedData.permissions.every((record) => !('userId' in record))).toBe(true);
  });
});
