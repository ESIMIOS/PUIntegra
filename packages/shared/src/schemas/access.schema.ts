/**
 * @package shared
 * @name access.schema.ts
 * @version 0.0.1
 * @description Define los esquemas de acceso y rol derivados de constantes del dominio compartido.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import { authenticatedRoleValues, roleValues } from '../constants/access';

export const RoleSchema = z.enum(roleValues);
export const AuthenticatedRoleSchema = z.enum(authenticatedRoleValues);
