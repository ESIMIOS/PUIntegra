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
  { key: 'name', label: 'Nombre' },
  { key: 'plan', label: 'Plan' },
  { key: 'planStatus', label: 'Estado del plan' },
  { key: 'planStartAt', label: 'Inicio del plan' },
  { key: 'planFinishAt', label: 'Fin del plan' },
  { key: 'sHA256SharedSecret', label: 'SHA256 del secreto compartido' },
];

export const permissionUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'userId', label: 'Usuario' },
  { key: 'role', label: 'Rol' },
  { key: 'status', label: 'Estado' },
];

export const contactUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'rFC', label: 'RFC' },
  { key: 'type', label: 'Tipo' },
  { key: 'name', label: 'Nombre' },
  { key: 'phone', label: 'Telefono' },
  { key: 'contactCURP', label: 'CURP del contacto' },
  { key: 'efirmaCertificate', label: 'Certificado e.firma' },
  { key: 'contactRFC', label: 'RFC del contacto' },
];

export const requestUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'searchRequestStatus', label: 'Estatus de solicitud' },
  { key: 'searchRequestBasicDataPhaseStatus', label: 'Estatus fase datos basicos' },
  { key: 'searchRequestHistoricalPhaseStatus', label: 'Estatus fase historica' },
  { key: 'searchRequestContinuousPhaseStatus', label: 'Estatus fase continua' },
];

export const userUpdateFieldDefinitions: UpdateHistoryFieldDefinition[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'emojiIcon', label: 'Emoji' },
  { key: 'phone', label: 'Telefono' },
];

/**
 * @description Adapta arreglos tipados de updates a un arreglo generico para el componente de historial.
 */
export function asHistoryRecord(
  updates: UserUpdate[] | InstitutionUpdate[] | PermissionUpdate[] | ContactUpdate[] | RequestUpdate[],
) {
  return updates as Record<string, unknown>[];
}
