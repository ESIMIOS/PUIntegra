/**
 * @package web
 * @name updateHistoryFieldDefinitions.ts
 * @version 0.0.1
 * @description Define etiquetas y formato de campos para historiales de actualizacion por entidad.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Version inicial del archivo.	@codex
 */

import {
  type ContactUpdate,
  type InstitutionUpdate,
  type PermissionUpdate,
  type RequestUpdate,
  type UserUpdate,
} from '@shared';
import type { UpdateHistoryFieldDefinition } from './updateHistoryUtils';

export const institutionUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'name', dataKey: 'Name', label: 'Nombre' },
  { key: 'plan', dataKey: 'Plan', label: 'Plan' },
  { key: 'planStatus', dataKey: 'PlanStatus', label: 'Estado del plan' },
  { key: 'planStartAt', dataKey: 'PlanStartAt', label: 'Inicio del plan' },
  { key: 'planFinishAt', dataKey: 'PlanFinishAt', label: 'Fin del plan' },
  { key: 'SHA256SharedSecret', dataKey: 'SHA256SharedSecret', label: 'SHA256 del secreto compartido' },
];

export const permissionUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'userId', dataKey: 'UserId', label: 'Usuario' },
  { key: 'role', dataKey: 'Role', label: 'Rol' },
  { key: 'status', dataKey: 'Status', label: 'Estado' },
];

export const contactUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'RFC', dataKey: 'RFC', label: 'RFC' },
  { key: 'type', dataKey: 'Type', label: 'Tipo' },
  { key: 'name', dataKey: 'Name', label: 'Nombre' },
  { key: 'phone', dataKey: 'Phone', label: 'Teléfono' },
  { key: 'contactCURP', dataKey: 'ContactCURP', label: 'CURP del contacto' },
  { key: 'efirmaCertificate', dataKey: 'EfirmaCertificate', label: 'Certificado e.firma' },
  { key: 'contactRFC', dataKey: 'ContactRFC', label: 'RFC del contacto' },
];

export const requestUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'searchRequestStatus', dataKey: 'SearchRequestStatus', label: 'Estatus de solicitud' },
  { key: 'searchRequestBasicDataPhaseStatus', dataKey: 'SearchRequestBasicDataPhaseStatus', label: 'Estatus fase datos básicos' },
  { key: 'searchRequestHistoricalPhaseStatus', dataKey: 'SearchRequestHistoricalPhaseStatus', label: 'Estatus fase histórica' },
  { key: 'searchRequestContinuousPhaseStatus', dataKey: 'SearchRequestContinuousPhaseStatus', label: 'Estatus fase contínua' },
];

export const userUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'name', dataKey: 'Name', label: 'Nombre' },
  { key: 'emojiIcon', dataKey: 'EmojiIcon', label: 'Emoji' },
  { key: 'phone', dataKey: 'Phone', label: 'Teléfono' },
];

/**
 * @description Adapta arreglos tipados de updates a un arreglo generico para el componente de historial.
 */
export function asHistoryRecord(
  updates: UserUpdate[] | InstitutionUpdate[] | PermissionUpdate[] | ContactUpdate[] | RequestUpdate[],
) {
  return updates as Record<string, unknown>[];
}
