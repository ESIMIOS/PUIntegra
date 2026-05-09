import {
  ApiThrottleConfigSchema,
  ContactSchema,
  FindingSchema,
  InstitutionSchema,
  LogSchema,
  LOG_CATEGORIES,
  PermissionSchema,
  RequestSchema,
  SYSTEM_RFC,
  DEFAULT_RFC
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
    expect(() => emulatorSeedData.logs.forEach((record) => LogSchema.parse(record))).not.toThrow();
    expect(() => emulatorSeedData.apiThrottleConfigs.forEach((record) => ApiThrottleConfigSchema.parse(record))).not.toThrow();
  });

  it('keeps system RFC out of tenant institutions', () => {
    expect(emulatorSeedData.institutions.every((record) => record.RFC !== SYSTEM_RFC)).toBe(true);
  });

  it('uses a deterministic local-only Auth Emulator password', () => {
    expect(EMULATOR_AUTH_PASSWORD).toBe('local-password');
  });

  it('seeds enough default tenant logs to validate filters and pagination', () => {
    expect(emulatorSeedData.logs).toHaveLength(125);
    expect(emulatorSeedData.logs.every((record) => record.RFC === DEFAULT_RFC)).toBe(true);
    expect(emulatorSeedData.logs.some((record) => record.category === LOG_CATEGORIES.PUI_SEARCH_REQUEST_CREATION)).toBe(true);
    expect(emulatorSeedData.logs.some((record) => record.category === LOG_CATEGORIES.INSTITUTION_PLAN_UPDATE)).toBe(true);
  });

  it('seeds permissions by email without userId linkage', () => {
    expect(emulatorSeedData.permissions.every((record) => !('userId' in record))).toBe(true);
  });

  it('seeds distributed API throttle configs for all rollout endpoints', () => {
    expect(emulatorSeedData.apiThrottleConfigs.length).toBeGreaterThan(0);
    expect(emulatorSeedData.apiThrottleConfigs.every((record) => record.dimensions.length > 0)).toBe(true);
  });
});
