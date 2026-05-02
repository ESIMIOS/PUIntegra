/**
 * @package api
 * @name systemAdminBootstrap.ts
 * @version 0.0.1
 * @description Construye y persiste el permiso bootstrap de administrador del sistema.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-02)	Agrega bootstrap idempotente de permiso SYSTEM_ADMINISTRATOR.	@codex
 */

import { z } from 'zod';
import {
  PERMISSION_STATUS,
  PermissionSchema,
  ROLE,
  SYSTEM_RFC,
  UPDATE_ORIGIN,
} from '@puintegra/shared';

export const SystemAdminBootstrapInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  now: z.number().int().nonnegative().safe(),
  existingPermission: PermissionSchema.nullable().optional(),
});

export type SystemAdminBootstrapInput = z.infer<typeof SystemAdminBootstrapInputSchema>;
export type SystemAdminBootstrapPermission = z.infer<typeof PermissionSchema>;

/**
 * @description Construye ID determinístico de permiso para una combinación email/RFC.
 */
export function buildSystemAdminPermissionId(email: string) {
  return `${email.trim().toLowerCase()}__${SYSTEM_RFC.toLowerCase()}`;
}

/**
 * @description Construye el permiso SYSTEM_ADMINISTRATOR preservando trazabilidad existente.
 */
export function buildSystemAdminPermission(input: SystemAdminBootstrapInput): SystemAdminBootstrapPermission {
  const parsed = SystemAdminBootstrapInputSchema.parse(input);
  const existing = parsed.existingPermission ?? null;
  const permissionId = buildSystemAdminPermissionId(parsed.email);
  const existingUpdates = existing?.updates ?? [];
  const updates = existing
    ? [
        ...existingUpdates,
        {
          updateOrigin: UPDATE_ORIGIN.SYSTEM,
          updatedByUserId: null,
          updatedByUserRole: ROLE.SYSTEM_ADMINISTRATOR,
          updatedByUserEmail: parsed.email,
          previousUserId: existing.userId ?? null,
          updatedUserId: existing.userId ?? null,
          previousRole: existing.role,
          updatedRole: ROLE.SYSTEM_ADMINISTRATOR,
          previousStatus: existing.status,
          updatedStatus: PERMISSION_STATUS.GRANTED,
          updatedAt: parsed.now,
        },
      ]
    : [];

  return PermissionSchema.parse({
    permissionId,
    RFC: SYSTEM_RFC,
    email: parsed.email,
    userId: existing?.userId ?? null,
    role: ROLE.SYSTEM_ADMINISTRATOR,
    status: PERMISSION_STATUS.GRANTED,
    updates,
    createdAt: existing?.createdAt ?? parsed.now,
    updatedAt: parsed.now,
  });
}

/**
 * @description Determina si el permiso existente ya cumple el contrato bootstrap.
 */
export function isSystemAdminPermissionCurrent(permission: SystemAdminBootstrapPermission | null | undefined) {
  return (
    !!permission &&
    permission.RFC === SYSTEM_RFC &&
    permission.role === ROLE.SYSTEM_ADMINISTRATOR &&
    permission.status === PERMISSION_STATUS.GRANTED
  );
}
