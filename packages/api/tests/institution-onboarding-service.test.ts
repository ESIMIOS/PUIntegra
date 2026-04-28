import { describe, expect, it } from 'vitest';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  LOG_CATEGORIES,
  ROLE,
  SystemError,
  SYSTEM_RFC,
  UPDATE_ORIGIN,
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
    permissionLogId: 'log-002',
    planLogId: 'log-003'
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

  it('builds institution plan creation audit log during onboarding', () => {
    const result = buildInstitutionOnboardingRecords({
      ...baseInput,
      actor: {
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR
      }
    });

    expect(result.logs).toHaveLength(3);
    expect(result.logs[2]).toMatchObject({
      id: 'log-003',
      category: LOG_CATEGORIES.INSTITUTION_PLAN_CREATION,
      RFC: 'AAA010101AAA',
      originTraceId: 'trace-001',
      userId: 'dev-user-001',
      execution: {
        executedByUserId: 'dev-user-001',
        executedByRole: ROLE.SYSTEM_ADMINISTRATOR,
        executedByUserEmail: 'admin@example.test'
      },
      impact: {},
      searchRequest: {}
    });
  });

  it('builds institution plan update, history, and audit log', async () => {
    const { buildInstitutionPlanUpdateRecords } = await import('../src/services/institutionPlanService.js');
    const result = buildInstitutionPlanUpdateRecords({
      rawInput: {
        plan: COMMERCIAL_PLAN.ENTERPRISE,
        planStatus: COMMERCIAL_PLAN_STATUS.PAUSED,
        planStartAt: 1710000000200,
        planFinishAt: 1710000000300
      },
      institution: {
        RFC: 'AAA010101AAA',
        name: 'Institucion Uno',
        plan: COMMERCIAL_PLAN.PORTAL,
        planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
        sharedSecret: null,
        planStartAt: 1710000000000,
        planFinishAt: 1710000000100,
        updates: [],
        createdAt: 1710000000000,
        updatedAt: 1710000000000
      },
      actor: {
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR
      },
      now: 1710000000400,
      originTraceId: 'trace-plan-update',
      logId: 'log-plan-update'
    });

    expect(result.institution).toMatchObject({
      plan: COMMERCIAL_PLAN.ENTERPRISE,
      planStatus: COMMERCIAL_PLAN_STATUS.PAUSED,
      planStartAt: 1710000000200,
      planFinishAt: 1710000000300,
      updatedAt: 1710000000400
    });
    expect(result.institution.updates).toEqual([
      expect.objectContaining({
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedByUserId: 'dev-user-001',
        updatedByUserRole: ROLE.SYSTEM_ADMINISTRATOR,
        updatedByUserEmail: 'admin@example.test',
        previousPlan: COMMERCIAL_PLAN.PORTAL,
        updatedPlan: COMMERCIAL_PLAN.ENTERPRISE,
        previousPlanStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
        updatedPlanStatus: COMMERCIAL_PLAN_STATUS.PAUSED
      })
    ]);
    expect(result.log).toMatchObject({
      id: 'log-plan-update',
      category: LOG_CATEGORIES.INSTITUTION_PLAN_UPDATE,
      RFC: 'AAA010101AAA',
      originTraceId: 'trace-plan-update',
      userId: 'dev-user-001'
    });
  });
});
