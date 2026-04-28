/**
 * @package web
 * @name logDateRanges.ts
 * @version 0.0.1
 * @description Resuelve presets de fechas locales para consultas de bitácora.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Agrega rangos locales para páginas de logs por dominio.	@codex
 */

export type LogDatePreset = 'all' | '5m' | '10m' | '1h' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export type LogDateRange = {
  startAt: number;
  endAt: number;
};

type CustomDateRangeInput = {
  startDate?: string;
  endDate?: string;
};

export type LogDatePresetOption = {
  value: LogDatePreset;
  text: string;
};

export const logDatePresetOptions: LogDatePresetOption[] = [
  { value: 'all', text: 'Todo' },
  { value: '5m', text: '5 minutos' },
  { value: '10m', text: '10 minutos' },
  { value: '1h', text: '1 hora' },
  { value: 'today', text: 'Hoy' },
  { value: 'yesterday', text: 'Ayer' },
  { value: 'week', text: 'Semana' },
  { value: 'month', text: 'Mes' },
  { value: 'custom', text: 'Rango' },
];

/**
 * @description Clona una fecha para evitar mutar referencias recibidas.
 */
function cloneDate(value: Date) {
  return new Date(value);
}

/**
 * @description Devuelve el inicio del día en zona local del navegador.
 */
function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

/**
 * @description Devuelve el final inclusivo del día en zona local del navegador.
 */
function endOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
}

/**
 * @description Interpreta una fecha `YYYY-MM-DD` como calendario local, no UTC.
 */
function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new TypeError(`Invalid local date: ${value}`);
  }
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * @description Crea un rango relativo terminado en la fecha actual indicada.
 */
function relativeRange(now: Date, milliseconds: number): LogDateRange {
  return {
    startAt: now.getTime() - milliseconds,
    endAt: now.getTime(),
  };
}

/**
 * @description Resuelve un preset de filtros de bitácora a timestamps inclusivos.
 */
export function resolveLogDateRange(
  preset: LogDatePreset,
  currentDate = new Date(),
  customRange: CustomDateRangeInput = {},
): LogDateRange | null {
  const now = cloneDate(currentDate);

  if (preset === 'all') {
    return null;
  }
  if (preset === '5m') {
    return relativeRange(now, 5 * 60 * 1000);
  }
  if (preset === '10m') {
    return relativeRange(now, 10 * 60 * 1000);
  }
  if (preset === '1h') {
    return relativeRange(now, 60 * 60 * 1000);
  }
  if (preset === 'today') {
    return { startAt: startOfLocalDay(now).getTime(), endAt: now.getTime() };
  }
  if (preset === 'yesterday') {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return { startAt: startOfLocalDay(yesterday).getTime(), endAt: endOfLocalDay(yesterday).getTime() };
  }
  if (preset === 'week') {
    const dayOfWeek = now.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { startAt: startOfLocalDay(monday).getTime(), endAt: endOfLocalDay(sunday).getTime() };
  }
  if (preset === 'month') {
    return {
      startAt: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime(),
      endAt: now.getTime(),
    };
  }

  if (!customRange.startDate || !customRange.endDate) {
    return { startAt: startOfLocalDay(now).getTime(), endAt: now.getTime() };
  }

  return {
    startAt: parseLocalDate(customRange.startDate).getTime(),
    endAt: endOfLocalDay(parseLocalDate(customRange.endDate)).getTime(),
  };
}

/**
 * @description Devuelve opciones localizadas para el selector de rango.
 */
export function getLogDatePresetOptions() {
  return logDatePresetOptions;
}
