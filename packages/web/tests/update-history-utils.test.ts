import { describe, expect, it } from 'vitest';
import { ROLE, UPDATE_ORIGIN } from '@shared';
import {
  buildUpdateHistoryEvents,
  formatRelativeTimeEsMx,
  type UpdateHistoryFieldDefinition,
} from '@/shared/updateHistory/updateHistoryUtils';

const fieldDefinitions: UpdateHistoryFieldDefinition[] = [
  {
    key: 'planStatus',
    dataKey: 'PlanStatus',
    label: 'Estado del plan',
  },
  {
    key: 'phone',
    dataKey: 'Phone',
    label: 'Telefono',
  },
];

describe('update history utils', () => {
  it('derives changed fields from previous and updated pairs and excludes metadata keys', () => {
    const events = buildUpdateHistoryEvents([
      {
        previousPlanStatus: 'ACTIVE',
        updatedPlanStatus: 'WARNING',
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedAt: 1000,
        updatedByUserRole: ROLE.SYSTEM_ADMINISTRATOR,
        updatedByUserEmail: 'ops@example.test',
      },
    ], fieldDefinitions);

    expect(events).toHaveLength(1);
    expect(events[0]?.changes).toEqual([
      {
        key: 'planStatus',
        label: 'Estado del plan',
        previousValue: 'ACTIVE',
        updatedValue: 'WARNING',
      },
    ]);
    expect(events[0]?.metadata.updatedByUserEmail).toBe('ops@example.test');
  });

  it('sorts events by updatedAt in descending order', () => {
    const events = buildUpdateHistoryEvents([
      {
        previousPhone: '+525500000000',
        updatedPhone: '+525500000001',
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedAt: 1000,
      },
      {
        previousPhone: '+525500000001',
        updatedPhone: '+525500000002',
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedAt: 2000,
      },
    ], fieldDefinitions);

    expect(events[0]?.metadata.updatedAt).toBe(2000);
    expect(events[1]?.metadata.updatedAt).toBe(1000);
  });

  it('keeps raw values and supports null-like values', () => {
    const events = buildUpdateHistoryEvents([
      {
        previousPhone: null,
        updatedPhone: '+525500000001',
        updateOrigin: UPDATE_ORIGIN.SYSTEM,
        updatedAt: 1000,
      },
    ], fieldDefinitions);

    expect(events[0]?.changes[0]?.previousValue).toBe(null);
    expect(events[0]?.changes[0]?.updatedValue).toBe('+525500000001');
  });

  it('formats relative time in Spanish with controlled now timestamp', () => {
    const now = Date.parse('2026-05-01T12:00:00.000Z');
    const twentyFiveMinutesAgo = now - 25 * 60 * 1000;

    expect(formatRelativeTimeEsMx(twentyFiveMinutesAgo, now)).toBe('hace 25 min');
  });

  it('ignores fields that are not part of DATA_KEYS', () => {
    const events = buildUpdateHistoryEvents([
      {
        previousUnknownField: 'A',
        updatedUnknownField: 'B',
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedAt: 1000,
      },
    ], fieldDefinitions);

    expect(events).toHaveLength(1);
    expect(events[0]?.changes).toHaveLength(0);
  });
});
