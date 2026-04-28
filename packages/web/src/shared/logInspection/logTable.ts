/**
 * @package web
 * @name logTable.ts
 * @version 0.0.1
 * @description Define columnas, preferencias y exportación CSV para bitácoras.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Agrega utilidades de tabla de logs por dominio.	@codex
 */

import {
  LOG_CATEGORIES,
  LogCategoryValues,
  LogOriginValues,
  type Log,
  type LogCategory,
  type LogOrigin,
} from '@shared';

export type LogScope = 'admin' | 'app' | 'account';
export type LogColumnKey =
  | 'id'
  | 'date'
  | 'RFC'
  | 'userId'
  | 'category'
  | 'origin'
  | 'originTraceId'
  | 'execution.userId'
  | 'execution.email'
  | 'execution.role'
  | 'impact.userId'
  | 'impact.email'
  | 'impact.role'
  | 'impact.impactedPermissionStatus'
  | 'searchRequest.FUB'
  | 'searchRequest.CURP'
  | 'searchRequest.status'
  | 'searchRequest.phase'
  | 'searchRequest.phaseStatus';

export type LogColumnDefinition = {
  key: LogColumnKey;
  label: string;
  monospace?: boolean;
  // eslint-disable-next-line no-unused-vars -- Function type parameter documents the column reader contract.
  read: (log: Log) => string | number | null | undefined;
};

export const DEFAULT_VISIBLE_LOG_COLUMNS: LogColumnKey[] = [
  'date',
  'RFC',
  'category',
  'origin',
  'execution.email',
  'execution.role',
];
export const requiredLogColumnKeys: LogColumnKey[] = ['date', 'category'];
const accountHiddenColumnKeys = new Set<LogColumnKey>([
  'execution.role',
  'impact.role',
  'impact.impactedPermissionStatus',
  'searchRequest.FUB',
  'searchRequest.CURP',
  'searchRequest.status',
  'searchRequest.phase',
  'searchRequest.phaseStatus',
]);

export const LOG_PAGE_SIZE_OPTIONS = [20, 50, 100, 'All'] as const;
export type LogPageSize = (typeof LOG_PAGE_SIZE_OPTIONS)[number];

export const LOG_COLUMN_PREFERENCE_KEYS: Record<LogScope, string> = {
  admin: 'puintegra-logs-columns-admin',
  app: 'puintegra-logs-columns-app',
  account: 'puintegra-logs-columns-account',
};

export const LOG_COLUMN_DEFINITIONS: LogColumnDefinition[] = [
  { key: 'id', label: 'ID', monospace: true, read: (log) => log.id },
  { key: 'date', label: 'Fecha', read: (log) => new Date(log.createdAt).toLocaleString() },
  { key: 'RFC', label: 'RFC', monospace: true, read: (log) => log.RFC ?? 'GLOBAL' },
  { key: 'userId', label: 'Usuario', monospace: true, read: (log) => log.userId },
  { key: 'category', label: 'Categoría', read: (log) => log.category },
  { key: 'origin', label: 'Origen', read: (log) => log.origin },
  { key: 'originTraceId', label: 'Trace ID', monospace: true, read: (log) => log.originTraceId },
  { key: 'execution.userId', label: 'Ejecución usuario', monospace: true, read: (log) => log.execution.executedByUserId },
  { key: 'execution.email', label: 'Ejecución email', read: (log) => log.execution.executedByUserEmail },
  { key: 'execution.role', label: 'Ejecución rol', read: (log) => log.execution.executedByRole },
  { key: 'impact.userId', label: 'Impacto usuario', monospace: true, read: (log) => log.impact.impactedUserId },
  { key: 'impact.email', label: 'Impacto email', read: (log) => log.impact.impactedUserEmail },
  { key: 'impact.role', label: 'Impacto rol', read: (log) => log.impact.impactedUserRole },
  {
    key: 'impact.impactedPermissionStatus',
    label: 'Impacto permiso',
    read: (log) => log.impact.impactedPermissionStatus,
  },
  { key: 'searchRequest.FUB', label: 'FUB', monospace: true, read: (log) => log.searchRequest.FUB },
  { key: 'searchRequest.CURP', label: 'CURP', monospace: true, read: (log) => log.searchRequest.CURP },
  {
    key: 'searchRequest.status',
    label: 'Solicitud estatus',
    read: (log) => log.searchRequest.searchRequestStatus,
  },
  { key: 'searchRequest.phase', label: 'Solicitud fase', read: (log) => log.searchRequest.searchRequestPhase },
  {
    key: 'searchRequest.phaseStatus',
    label: 'Solicitud fase estado',
    read: (log) => log.searchRequest.searchRequestPhaseStatus,
  },
];

/**
 * @description Devuelve las llaves de columnas permitidas para un alcance.
 */
function availableColumnKeys(scope: LogScope) {
  const keys = LOG_COLUMN_DEFINITIONS.map((column) => column.key);
  if (scope === 'app') {
    return keys.filter((key) => key !== 'userId');
  }
  if (scope === 'account') {
    return keys.filter((key) => !accountHiddenColumnKeys.has(key));
  }
  return keys;
}

/**
 * @description Obtiene localStorage si existe en el runtime actual.
 */
function safeLocalStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

/**
 * @description Escapa una celda para CSV conservando campos vacíos.
 */
function toCsvCell(value: string | number | null | undefined) {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * @description Obtiene definiciones de columnas personalizables por alcance.
 */
export function getAvailableLogColumns(scope: LogScope) {
  const keys = new Set(availableColumnKeys(scope));
  return LOG_COLUMN_DEFINITIONS.filter((column) => keys.has(column.key));
}

/**
 * @description Lee columnas visibles persistidas o devuelve el conjunto por defecto.
 */
export function readVisibleLogColumns(scope: LogScope): LogColumnKey[] {
  const storage = safeLocalStorage();
  const available = new Set<string>(availableColumnKeys(scope));
  if (!storage) {
    return DEFAULT_VISIBLE_LOG_COLUMNS.filter((key) => available.has(key));
  }

  try {
    const parsed = JSON.parse(storage.getItem(LOG_COLUMN_PREFERENCE_KEYS[scope]) ?? 'null') as unknown;
    if (Array.isArray(parsed)) {
      const selected = parsed.filter((key): key is LogColumnKey => typeof key === 'string' && available.has(key));
      if (selected.length > 0) {
        return mergeRequiredColumns(selected, available);
      }
    }
  } catch {
    storage.removeItem(LOG_COLUMN_PREFERENCE_KEYS[scope]);
  }

  return mergeRequiredColumns(DEFAULT_VISIBLE_LOG_COLUMNS.filter((key) => available.has(key)), available);
}

/**
 * @description Persiste las columnas visibles válidas para el alcance indicado.
 */
export function writeVisibleLogColumns(scope: LogScope, columns: LogColumnKey[]) {
  const storage = safeLocalStorage();
  if (!storage) {
    return;
  }
  const available = new Set<string>(availableColumnKeys(scope));
  storage.setItem(LOG_COLUMN_PREFERENCE_KEYS[scope], JSON.stringify(mergeRequiredColumns(columns, available)));
}

/**
 * @description Mezcla columnas requeridas con preferencias válidas preservando orden.
 */
function mergeRequiredColumns(columns: LogColumnKey[], available: Set<string>) {
  const selected = new Set<LogColumnKey>();
  [...requiredLogColumnKeys, ...columns].forEach((key) => {
    if (available.has(key)) {
      selected.add(key);
    }
  });
  return [...selected];
}

/**
 * @description Filtra categorías de logs según el alcance de página.
 */
export function getLogCategoryOptions(scope: LogScope): LogCategory[] {
  if (scope === 'account') {
    return LogCategoryValues.filter((category) => category.startsWith('USER_ACCOUNT_'));
  }
  if (scope === 'app') {
    return LogCategoryValues.filter((category) => (
      category.startsWith('INSTITUTION_') || category.startsWith('PUI_')
    ));
  }
  return [...LogCategoryValues];
}

/**
 * @description Devuelve los orígenes disponibles para el filtro de logs.
 */
export function getLogOriginOptions(): LogOrigin[] {
  return [...LogOriginValues];
}

/**
 * @description Clasifica una categoría para acentos visuales de fila.
 */
export function getLogCategoryFamily(category: LogCategory) {
  if (category.startsWith('USER_ACCOUNT_')) {
    return 'account';
  }
  if (category.startsWith('PUI_')) {
    return 'pui';
  }
  if (category === LOG_CATEGORIES.INSTITUTION_PLAN_UPDATE || category === LOG_CATEGORIES.INSTITUTION_PLAN_CREATION) {
    return 'plan';
  }
  return 'institution';
}

/**
 * @description Construye un CSV con todas las columnas y máximo mil registros.
 */
export function buildLogCsv(logs: Log[]) {
  const selectedLogs = logs.slice(0, 1000);
  const header = LOG_COLUMN_DEFINITIONS.map((column) => column.key).join(',');
  const rows = selectedLogs.map((log) => LOG_COLUMN_DEFINITIONS.map((column) => toCsvCell(column.read(log))).join(','));
  return {
    csv: [header, ...rows].join('\n'),
    exportedCount: selectedLogs.length,
    truncated: logs.length > selectedLogs.length,
  };
}
