import { describe, expect, it } from 'vitest';
import { getLogDatePresetOptions, resolveLogDateRange } from '@/shared/logInspection/logDateRanges';

const NOW = new Date('2026-04-29T15:45:30.250');

describe('log date ranges', () => {
  it('resolves relative presets from current time', () => {
    expect(resolveLogDateRange('5m', NOW)?.startAt).toBe(new Date('2026-04-29T15:40:30.250').getTime());
    expect(resolveLogDateRange('10m', NOW)?.startAt).toBe(new Date('2026-04-29T15:35:30.250').getTime());
    expect(resolveLogDateRange('1h', NOW)?.startAt).toBe(new Date('2026-04-29T14:45:30.250').getTime());
  });

  it('exposes Spanish date preset labels for the UI', () => {
    expect(getLogDatePresetOptions().map((option) => option.text)).toEqual([
      'TODO',
      '5 minutos',
      '10 minutos',
      '1 hora',
      'Hoy',
      'Ayer',
      'Semana',
      'Mes',
      'Rango',
    ]);
  });

  it('does not resolve date boundaries for all activity preset', () => {
    expect(resolveLogDateRange('all', NOW)).toBeNull();
  });

  it('resolves local calendar presets', () => {
    expect(resolveLogDateRange('today', NOW)).toEqual({
      startAt: new Date(2026, 3, 29, 0, 0, 0, 0).getTime(),
      endAt: NOW.getTime(),
    });
    expect(resolveLogDateRange('yesterday', NOW)).toEqual({
      startAt: new Date(2026, 3, 28, 0, 0, 0, 0).getTime(),
      endAt: new Date(2026, 3, 28, 23, 59, 59, 999).getTime(),
    });
    expect(resolveLogDateRange('week', NOW)).toEqual({
      startAt: new Date(2026, 3, 27, 0, 0, 0, 0).getTime(),
      endAt: new Date(2026, 4, 3, 23, 59, 59, 999).getTime(),
    });
    expect(resolveLogDateRange('month', NOW)).toEqual({
      startAt: new Date(2026, 3, 1, 0, 0, 0, 0).getTime(),
      endAt: NOW.getTime(),
    });
  });

  it('resolves custom dates with inclusive local-day boundaries', () => {
    expect(resolveLogDateRange('custom', NOW, {
      startDate: '2026-04-10',
      endDate: '2026-04-12',
    })).toEqual({
      startAt: new Date(2026, 3, 10, 0, 0, 0, 0).getTime(),
      endAt: new Date(2026, 3, 12, 23, 59, 59, 999).getTime(),
    });
  });
});
