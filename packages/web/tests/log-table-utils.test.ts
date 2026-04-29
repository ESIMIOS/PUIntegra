import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_RFC, LOG_CATEGORIES, LOG_ORIGIN, ROLE, type Log } from '@shared';
import {
  buildLogCsv,
  getAvailableLogColumns,
  getLogCategoryOptions,
  readVisibleLogColumns,
  requiredLogColumnKeys,
  writeVisibleLogColumns,
} from '@/shared/logInspection/logTable';

function logFixture(index: number): Log {
  return {
    id: `log-${index}`,
    category: LOG_CATEGORIES.INSTITUTION_PLAN_UPDATE,
    RFC: DEFAULT_RFC,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: `trace-${index}`,
    userId: `user-${index}`,
    execution: {
      executedByUserId: `executor-${index}`,
      executedByUserEmail: `executor-${index}@example.test`,
      executedByRole: ROLE.SYSTEM_ADMINISTRATOR,
    },
    impact: {},
    searchRequest: {},
    createdAt: 1710000000000 + index,
  };
}

describe('log table utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists visible column preferences by scope', () => {
    writeVisibleLogColumns('admin', ['date', 'category']);

    expect(readVisibleLogColumns('admin')).toEqual(['date', 'category']);
    expect(readVisibleLogColumns('account')).toContain('origin');
  });

  it('always keeps date and category visible even when preferences omit them', () => {
    writeVisibleLogColumns('account', ['origin']);

    expect(requiredLogColumnKeys).toEqual(['date', 'category']);
    expect(readVisibleLogColumns('account')).toEqual(['date', 'category', 'origin']);
  });

  it('does not expose userId column personalization for app logs', () => {
    expect(getAvailableLogColumns('app').map((column) => column.key)).not.toContain('userId');
    expect(getAvailableLogColumns('admin').map((column) => column.key)).toContain('userId');
  });

  it('hides non-required account-domain columns from personalization', () => {
    const accountColumnKeys = getAvailableLogColumns('account').map((column) => column.key);

    expect(accountColumnKeys).not.toContain('execution.role');
    expect(accountColumnKeys).not.toContain('impact.role');
    expect(accountColumnKeys).not.toContain('impact.impactedPermissionStatus');
    expect(accountColumnKeys).not.toContain('searchRequest.FUB');
    expect(accountColumnKeys).not.toContain('searchRequest.CURP');
    expect(accountColumnKeys).not.toContain('searchRequest.status');
    expect(accountColumnKeys).not.toContain('searchRequest.phase');
    expect(accountColumnKeys).not.toContain('searchRequest.phaseStatus');
  });

  it('exposes auth account lifecycle categories in account and admin log filters', () => {
    const expectedCategories = [
      LOG_CATEGORIES.USER_ACCOUNT_PASSWORD_RECOVERY_REQUEST,
      LOG_CATEGORIES.USER_ACCOUNT_PASSWORD_UPDATE,
      LOG_CATEGORIES.USER_ACCOUNT_EMAIL_VERIFICATION,
      LOG_CATEGORIES.USER_ACCOUNT_MFA_ENROLL,
      LOG_CATEGORIES.USER_ACCOUNT_MFA_UNENROLL,
    ];

    expect(getLogCategoryOptions('account')).toEqual(expect.arrayContaining(expectedCategories));
    expect(getLogCategoryOptions('admin')).toEqual(expect.arrayContaining(expectedCategories));
  });

  it('exports all fields and caps CSV records at 1000', () => {
    const logs = Array.from({ length: 1005 }, (_, index) => logFixture(index));
    const result = buildLogCsv(logs);

    expect(result.truncated).toBe(true);
    expect(result.exportedCount).toBe(1000);
    expect(result.csv.split('\n')).toHaveLength(1001);
    expect(result.csv).toContain('execution.email');
    expect(result.csv).toContain('executor-0@example.test');
  });
});
