/**
 * @package web
 * @name metaSchema.ts
 * @version 0.0.1
 * @description Valida y compone metadatos de ruta para decisiones de navegación.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from '@/bom';
import { DOMAIN, DomainSchema } from '@/shared/constants/domains';
import { RoleSchema } from '@shared';

const RouteMetaSchema = z
  .object({
    layout: DomainSchema.optional(),
    pageId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    allowedRoles: z.array(RoleSchema).optional(),
    requiresAuth: z.boolean().optional(),
    requiresInstitutionContext: z.boolean().optional(),
    requiresSecuritySetup: z.boolean().optional(),
    defaultChildRedirect: z.string().optional()
  })
  .passthrough();

/**
 * @description Valida metadatos de ruta individuales usando el esquema base del pipeline de guards.
 */
export function createRouteMeta(meta: unknown) {
  return RouteMetaSchema.parse(meta);
}

/**
 * @description Combina metadatos heredados de rutas anidadas para evaluar una navegación completa.
 */
export function mergeRouteMeta(matched: Array<{ meta: unknown }>) {
  const merged = {
    layout: DOMAIN.ERROR,
    allowedRoles: undefined,
    requiresAuth: false,
    requiresInstitutionContext: false,
    requiresSecuritySetup: false,
    defaultChildRedirect: undefined
  } as {
    layout: z.infer<typeof DomainSchema>;
    allowedRoles: Array<z.infer<typeof RoleSchema>> | undefined;
    requiresAuth: boolean;
    requiresInstitutionContext: boolean;
    requiresSecuritySetup: boolean;
    defaultChildRedirect: string | undefined;
  };

  for (const record of matched) {
    const parsed = RouteMetaSchema.safeParse(record.meta);
    if (!parsed.success) {
      continue;
    }

    const data = parsed.data;
    if (data.layout) {
      merged.layout = data.layout;
    }
    if (data.allowedRoles) {
      merged.allowedRoles = data.allowedRoles;
    }
    if (data.requiresAuth) {
      merged.requiresAuth = true;
    }
    if (data.requiresInstitutionContext) {
      merged.requiresInstitutionContext = true;
    }
    if (data.requiresSecuritySetup) {
      merged.requiresSecuritySetup = true;
    }
    if (data.defaultChildRedirect) {
      merged.defaultChildRedirect = data.defaultChildRedirect;
    }
  }

  return merged;
}
