/**
 * @package web
 * @name mockDatasetSchema.ts
 * @version 0.0.1
 * @description Valida el contrato agregado del dataset mock antes de hidratar/persistir.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import {
  ContactSchema,
  FindingSchema,
  InstitutionSchema,
  LogSchema,
  PermissionSchema,
  RequestSchema,
  SYSTEM_RFC,
  UserSchema
} from '@shared';

export const ProviderContextSchema = z.object({
  RFC: z.literal(SYSTEM_RFC),
  label: z.string().min(1)
});

export const MockDatasetSchema = z.object({
  users: z.array(UserSchema),
  institutions: z.array(InstitutionSchema),
  providerContexts: z.array(ProviderContextSchema),
  permissions: z.array(PermissionSchema),
  contacts: z.array(ContactSchema),
  requests: z.array(RequestSchema),
  findings: z.array(FindingSchema),
  logs: z.array(LogSchema)
});
