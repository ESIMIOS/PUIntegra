/**
 * @package web
 * @name appAdminInstitutionGateway.ts
 * @version 0.0.1
 * @description Ejecuta mutaciones administrativas institucionales del dominio app por API HTTP autenticado.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-04)	Agrega upsert de contactos, actualización de secreto compartido y alta/edición de permisos.	@codex
 */

import {
  AppAdminContactUpsertPayloadSchema,
  AppAdminPermissionCreatePayloadSchema,
  AppAdminPermissionUpdatePayloadSchema,
  AppAdminSharedSecretUpdatePayloadSchema,
  ContactSchema,
  PermissionSchema,
  type AppAdminContactUpsertPayload,
  type AppAdminPermissionCreatePayload,
  type AppAdminPermissionUpdatePayload,
  type AppAdminSharedSecretUpdatePayload,
} from '@shared';
import { z } from 'zod';
import { executeHttpApi, resolveApiUrl } from '@/gateways/httpApiGateway';
import { getFirebaseRuntime } from '@/plugins/firebase';
import { systemMessageTree } from '@/shared/constants/systemMessages';

const SharedSecretUpdateResponseSchema = z.object({
  sharedSecretConfigured: z.boolean(),
  SHA256SharedSecret: z.string().nullable(),
  updatedAt: z.number().int().nonnegative(),
});

type SharedSecretUpdateResponse = z.infer<typeof SharedSecretUpdateResponseSchema>;

/**
 * @description Obtiene token Firebase de la sesion activa para invocar rutas API autenticadas.
 */
async function requireToken() {
  const token = await getFirebaseRuntime().auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Authenticated Firebase user token is required.');
  }
  return token;
}

/**
 * @description Normaliza RFC a formato uppercase para rutas y consultas.
 */
function normalizeRfc(rfc: string) {
  return rfc.trim().toUpperCase();
}

/**
 * @description Crea o actualiza un contacto canonico por tipo para la institucion activa.
 */
export async function upsertInstitutionContact(
  rfc: string,
  contactType: string,
  payload: AppAdminContactUpsertPayload,
) {
  const token = await requireToken();
  const parsed = AppAdminContactUpsertPayloadSchema.parse(payload);
  const normalizedType = contactType.trim().toUpperCase();
  return executeHttpApi({
    url: resolveApiUrl(`/api/app/institutions/${normalizeRfc(rfc)}/contacts/${normalizedType}`),
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(parsed),
    parseData: z.object({ contact: ContactSchema }),
    transportMessage: systemMessageTree.web.ui.data.appAdminContactUpsertFailed.message,
  });
}

/**
 * @description Actualiza secreto compartido institucional por API autenticado.
 */
export async function updateInstitutionSharedSecret(rfc: string, payload: AppAdminSharedSecretUpdatePayload) {
  const token = await requireToken();
  const parsed = AppAdminSharedSecretUpdatePayloadSchema.parse(payload);
  return executeHttpApi<SharedSecretUpdateResponse>({
    url: resolveApiUrl(`/api/app/institutions/${normalizeRfc(rfc)}/shared-secret`),
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(parsed),
    parseData: SharedSecretUpdateResponseSchema,
    transportMessage: systemMessageTree.web.ui.data.appAdminSharedSecretUpdateFailed.message,
  });
}

/**
 * @description Crea un permiso institucional por invitacion de correo.
 */
export async function createInstitutionPermission(rfc: string, payload: AppAdminPermissionCreatePayload) {
  const token = await requireToken();
  const parsed = AppAdminPermissionCreatePayloadSchema.parse(payload);
  return executeHttpApi({
    url: resolveApiUrl(`/api/app/institutions/${normalizeRfc(rfc)}/permissions`),
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(parsed),
    parseData: z.object({ permission: PermissionSchema }),
    transportMessage: systemMessageTree.web.ui.data.appAdminPermissionCreateFailed.message,
  });
}

/**
 * @description Actualiza rol y estado de un permiso institucional existente.
 */
export async function updateInstitutionPermission(
  rfc: string,
  permissionId: string,
  payload: AppAdminPermissionUpdatePayload,
) {
  const token = await requireToken();
  const parsed = AppAdminPermissionUpdatePayloadSchema.parse(payload);
  return executeHttpApi({
    url: resolveApiUrl(`/api/app/institutions/${normalizeRfc(rfc)}/permissions/${permissionId}`),
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(parsed),
    parseData: z.object({ permission: PermissionSchema }),
    transportMessage: systemMessageTree.web.ui.data.appAdminPermissionUpdateFailed.message,
  });
}
