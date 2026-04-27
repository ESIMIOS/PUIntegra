import { describe, expect, it } from 'vitest';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  ROLE,
  SystemError,
  SYSTEM_RFC,
  roleValues
} from '@puintegra/shared';
import {
  buildInstitutionOnboardingRecords
} from '../src/services/institutionOnboardingService.js';

describe('institution onboarding service', () => {
  const baseInput = {
    rawInput: {
      RFC: 'AAA010101AAA',
      name: 'Institucion Uno',
      plan: COMMERCIAL_PLAN.PORTAL,
      planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
      planStartAt: 1710000000000,
      planFinishAt: 1710000000100,
      adminEmail: 'owner@example.test'
    },
    now: 1710000000000,
    originTraceId: 'trace-001',
    permissionId: 'owner@example.test__aaa010101aaa',
    institutionLogId: 'log-001',
    permissionLogId: 'log-002'
  };

  it('rejects every role except SYSTEM_ADMINISTRATOR', () => {
    for (const role of roleValues) {
      const operation = () =>
        buildInstitutionOnboardingRecords({
          ...baseInput,
          actor: {
            userId: 'dev-user-001',
            email: 'admin@example.test',
            role
          }
        });

      if (role === ROLE.SYSTEM_ADMINISTRATOR) {
        expect(operation).not.toThrow();
      } else {
        expect(operation).toThrowError(SystemError);
      }
    }
  });

  it('rejects SYSTEM_RFC', () => {
    expect(() =>
      buildInstitutionOnboardingRecords({
        ...baseInput,
        rawInput: {
          ...baseInput.rawInput,
          RFC: SYSTEM_RFC
        },
        actor: {
          userId: 'dev-user-001',
          email: 'admin@example.test',
          role: ROLE.SYSTEM_ADMINISTRATOR
        }
      })
    ).toThrowError(SystemError);
  });

  it('rejects DEFAULT_RFC', () => {
    expect(() =>
      buildInstitutionOnboardingRecords({
        ...baseInput,
        rawInput: {
          ...baseInput.rawInput,
          RFC: DEFAULT_RFC
        },
        actor: {
          userId: 'dev-user-001',
          email: 'admin@example.test',
          role: ROLE.SYSTEM_ADMINISTRATOR
        }
      })
    ).toThrowError(SystemError);
  });

  it('builds onboarding institution with deferred sharedSecret', () => {
    const result = buildInstitutionOnboardingRecords({
      ...baseInput,
      actor: {
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR
      }
    });

    expect(result.institution.sharedSecret).toBeNull();
  });
});
