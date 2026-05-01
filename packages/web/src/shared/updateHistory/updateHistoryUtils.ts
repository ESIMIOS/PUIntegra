/**
 * @package web
 * @name updateHistoryUtils.ts
 * @version 0.0.1
 * @description Transforma y formatea historiales de actualizacion basados en pares previousX y updatedX.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Version inicial del archivo.	@codex
 */

import type { UpdateActor, UpdateOrigin } from '@shared';

export type UpdateHistoryFieldDefinition = {
  key: string;
  label: string;
};

export type UpdateHistoryChange = {
  key: string;
  label: string;
  previousValue: unknown;
  updatedValue: unknown;
};

export type UpdateHistoryEvent = {
  metadata: UpdateActor;
  changes: UpdateHistoryChange[];
};

const METADATA_KEYS = new Set([
  'updatedAt',
  'updateOrigin',
  'updatedByUserId',
  'updatedByUserRole',
  'updatedByUserEmail',
]);

/**
 * @description Convierte el primer caracter a minuscula para derivar nombres de campo.
 */
function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

/**
 * @description Crea un mapa por key de definiciones de campos para busquedas O(1).
 */
function buildFieldDefinitionMap(fieldDefinitions: UpdateHistoryFieldDefinition[]) {
  return new Map(fieldDefinitions.map((item) => [item.key, item]));
}

/**
 * @description Descubre los sufijos de campo presentes en claves previousX y updatedX.
 */
function discoverFieldKeys(update: Record<string, unknown>) {
  const keys = new Set<string>();
  for (const key of Object.keys(update)) {
    if (METADATA_KEYS.has(key)) {
      continue;
    }
    if (key.startsWith('previous') && key.length > 'previous'.length) {
      keys.add(lowerFirst(key.slice('previous'.length)));
      continue;
    }
    if (key.startsWith('updated') && key.length > 'updated'.length) {
      keys.add(lowerFirst(key.slice('updated'.length)));
    }
  }
  return [...keys];
}

/**
 * @description Devuelve texto relativo en espanol para timestamps de historial.
 */
export function formatRelativeTimeEsMx(value: number, now = Date.now()) {
  const diff = Math.max(0, now - value);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) {
    return `hace ${seconds} s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `hace ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `hace ${days} d`;
  }
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

/**
 * @description Formatea timestamp absoluto para tablas de trazabilidad.
 */
export function formatAbsoluteTimeEsMx(value: number) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

/**
 * @description Normaliza valores sin tipado fuerte para su lectura consistente en UI.
 */
export function formatHistoryValue(value: unknown) {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'sin valor';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

/**
 * @description Transforma updates crudos en eventos ordenados y listos para timeline/tabla.
 */
export function buildUpdateHistoryEvents(
  updates: Record<string, unknown>[],
  fieldDefinitions: UpdateHistoryFieldDefinition[],
) {
  const definitionMap = buildFieldDefinitionMap(fieldDefinitions);
  const events: UpdateHistoryEvent[] = updates.map((update) => {
    const discoveredKeys = discoverFieldKeys(update);
    const changes: UpdateHistoryChange[] = discoveredKeys.map((fieldKey) => {
      const definition = definitionMap.get(fieldKey);
      const fieldSuffix = fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1);
      const previousKey = `previous${fieldSuffix}`;
      const updatedKey = `updated${fieldSuffix}`;
      return {
        key: fieldKey,
        label: definition?.label ?? fieldKey,
        previousValue: update[previousKey],
        updatedValue: update[updatedKey],
      };
    });

    const metadata = {
      updatedAt: Number(update.updatedAt ?? 0),
      updateOrigin: (update.updateOrigin ?? 'SYSTEM') as UpdateOrigin,
      updatedByUserId: (update.updatedByUserId as string | null | undefined) ?? null,
      updatedByUserRole: (update.updatedByUserRole as UpdateActor['updatedByUserRole']) ?? null,
      updatedByUserEmail: (update.updatedByUserEmail as string | null | undefined) ?? null,
    } satisfies UpdateActor;

    return { metadata, changes };
  });

  return events.sort((left, right) => right.metadata.updatedAt - left.metadata.updatedAt);
}
