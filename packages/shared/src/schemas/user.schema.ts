/**
 * @package shared
 * @name user.schema.ts
 * @version 0.0.1
 * @description Define el contrato base de usuario y su historial de actualización.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import { TimestampMillisecondsUtcSchema, UpdateActorSchema } from './domain-common.schema';

export const UserUpdateSchema = UpdateActorSchema.extend({
  previousName: z.string().min(1).nullable().optional(),
  updatedName: z.string().min(1).nullable().optional(),
  previousEmojiIcon: z.string().min(1).nullable().optional(),
  updatedEmojiIcon: z.string().min(1).nullable().optional()
});

export const UserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1).optional(),
  emojiIcon: z.string().min(1).optional(),
  updates: z.array(UserUpdateSchema).default([]),
  createdAt: TimestampMillisecondsUtcSchema,
  updatedAt: TimestampMillisecondsUtcSchema
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type User = z.infer<typeof UserSchema>;
