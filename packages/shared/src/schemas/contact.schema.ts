/**
 * @package shared
 * @name contact.schema.ts
 * @version 0.0.1
 * @description Define el contrato de contactos institucionales informativos.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import { TimestampMillisecondsUtcSchema, UpdateActorSchema } from './domain-common.schema';

export const INSTITUTION_CONTACT_TYPE = {
  LEGAL: 'LEGAL',
  TECHNICAL: 'TECHNICAL',
  IMMEDIATE_SEARCH: 'IMMEDIATE_SEARCH'
} as const;

export const InstitutionContactTypeValues = [
  INSTITUTION_CONTACT_TYPE.LEGAL,
  INSTITUTION_CONTACT_TYPE.TECHNICAL,
  INSTITUTION_CONTACT_TYPE.IMMEDIATE_SEARCH
] as const;

export const InstitutionContactTypeSchema = z.enum(InstitutionContactTypeValues);

export const ContactUpdateSchema = UpdateActorSchema.extend({
  previousRFC: z.string().min(1).nullable().optional(),
  updatedRFC: z.string().min(1).nullable().optional(),
  previousType: InstitutionContactTypeSchema.nullable().optional(),
  updatedType: InstitutionContactTypeSchema.nullable().optional(),
  previousName: z.string().min(1).nullable().optional(),
  updatedName: z.string().min(1).nullable().optional(),
  previousPhone: z.string().min(1).nullable().optional(),
  updatedPhone: z.string().min(1).nullable().optional(),
  previousContactCURP: z.string().min(1).nullable().optional(),
  updatedContactCURP: z.string().min(1).nullable().optional(),
  previousEfirmaCertificate: z.string().min(1).nullable().optional(),
  updatedEfirmaCertificate: z.string().min(1).nullable().optional(),
  previousContactRFC: z.string().min(1).nullable().optional(),
  updatedContactRFC: z.string().min(1).nullable().optional()
});

export const ContactSchema = z.object({
  contactId: z.string().min(1),
  type: InstitutionContactTypeSchema,
  RFC: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  contactCURP: z.string().min(1),
  contactRFC: z.string().min(1).nullable().optional(),
  efirmaCertificate: z.string().min(1).nullable().optional(),
  updates: z.array(ContactUpdateSchema).default([]),
  createdAt: TimestampMillisecondsUtcSchema,
  updatedAt: TimestampMillisecondsUtcSchema
});

export type InstitutionContactType = z.infer<typeof InstitutionContactTypeSchema>;
export type ContactUpdate = z.infer<typeof ContactUpdateSchema>;
export type Contact = z.infer<typeof ContactSchema>;
