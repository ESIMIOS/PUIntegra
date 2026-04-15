/**
 * @package shared
 * @name permission.schema.ts
 * @version 0.0.1
 * @description Define el contrato de permisos institucionales y su historial de estado/rol.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import { RoleSchema } from './access.schema';
import { TimestampMillisecondsUtcSchema, UpdateActorSchema } from './domain-common.schema';

export const PERMISSION_STATUS = {
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  REVOKED: 'REVOKED'
} as const;

export const PermissionStatusValues = [
  PERMISSION_STATUS.GRANTED,
  PERMISSION_STATUS.DENIED,
  PERMISSION_STATUS.REVOKED
] as const;

export const PermissionStatusSchema = z.enum(PermissionStatusValues);

export const PermissionUpdateSchema = UpdateActorSchema.extend({
  previousUserId: z.string().min(1).nullable().optional(),
  updatedUserId: z.string().min(1).nullable().optional(),
  previousRole: RoleSchema.nullable().optional(),
  updatedRole: RoleSchema.nullable().optional(),
  previousStatus: PermissionStatusSchema.nullable().optional(),
  updatedStatus: PermissionStatusSchema.nullable().optional()
});

export const PermissionSchema = z.object({
  permissionId: z.string().min(1),
  RFC: z.string().min(1),
  email: z.string().email(),
  userId: z.string().min(1).nullable().optional(),
  role: RoleSchema,
  status: PermissionStatusSchema,
  updates: z.array(PermissionUpdateSchema).default([]),
  createdAt: TimestampMillisecondsUtcSchema,
  updatedAt: TimestampMillisecondsUtcSchema
});

export type PermissionStatus = z.infer<typeof PermissionStatusSchema>;
export type PermissionUpdate = z.infer<typeof PermissionUpdateSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
