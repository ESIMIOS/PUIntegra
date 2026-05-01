/**
 * @package web
 * @name updateHistoryUtils.ts
 * @version 0.0.1
 * @description Transforma y formatea historiales de actualizacion basados en pares previousX y updatedX.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Versión inicial del archivo.	@codex
 */

import type { UpdateActor, UpdateOrigin } from '@shared';

export type UpdateHistoryFieldDefinition = {
  key: string;
  dataKey: string;
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

/**
 * @description Resuelve cambios usando solo DATA_KEYS permitidos por fieldDefinitions.
 */
function resolveAllowedChanges(
  update: Record<string, unknown>,
  fieldDefinitions: UpdateHistoryFieldDefinition[],
) {
  const changes: UpdateHistoryChange[] = [];
  for (const fieldDefinition of fieldDefinitions) {
    const previousKey = `previous${fieldDefinition.dataKey}`;
    const updatedKey = `updated${fieldDefinition.dataKey}`;
    if (!(previousKey in update) && !(updatedKey in update)) {
      continue;
    }
    changes.push({
      key: fieldDefinition.key,
      label: fieldDefinition.label,
      previousValue: update[previousKey],
      updatedValue: update[updatedKey],
    });
  }
  return changes;
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
  const events: UpdateHistoryEvent[] = updates.map((update) => {
    const changes = resolveAllowedChanges(update, fieldDefinitions);

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
