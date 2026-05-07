/**
 * @package shared
 * @name app-admin.schema.ts
 * @version 0.0.1
 * @description Define contratos de mutaciones administrativas institucionales para el dominio app.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-04)	Agrega esquemas para contactos, secreto compartido y permisos en /app/:rfc/admin.	@codex
 */

import { z } from 'zod';
import { RoleSchema } from './access.schema';
import { InstitutionContactTypeSchema } from './contact.schema';
import { PermissionStatusSchema } from './permission.schema';

export const AppAdminContactUpsertPayloadSchema = z.object({
  type: InstitutionContactTypeSchema,
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  contactCURP: z.string().trim().min(1),
  contactRFC: z.string().trim().min(1).nullable().optional(),
  efirmaCertificate: z.string().trim().min(1).nullable().optional(),
});

export const AppAdminSharedSecretUpdatePayloadSchema = z.object({
  sharedSecret: z.string().trim().min(1),
});

export const AppAdminPermissionCreatePayloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: RoleSchema,
  status: PermissionStatusSchema,
});

export const AppAdminPermissionUpdatePayloadSchema = z.object({
  role: RoleSchema,
  status: PermissionStatusSchema,
});

export type AppAdminContactUpsertPayload = z.infer<typeof AppAdminContactUpsertPayloadSchema>;
export type AppAdminSharedSecretUpdatePayload = z.infer<typeof AppAdminSharedSecretUpdatePayloadSchema>;
export type AppAdminPermissionCreatePayload = z.infer<typeof AppAdminPermissionCreatePayloadSchema>;
export type AppAdminPermissionUpdatePayload = z.infer<typeof AppAdminPermissionUpdatePayloadSchema>;
