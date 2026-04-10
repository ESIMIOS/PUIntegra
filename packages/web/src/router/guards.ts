/**
 * @package web
 * @name guards.ts
 * @version 0.0.1
 * @description Implementa guards de sesión, rol, contexto institucional y bootstrap de seguridad.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  z,
  ROLE,
  SYSTEM_RFC,
  type Pinia,
  type Router
} from '@/bom';
import { mergeRouteMeta } from './metaSchema';
import { routePaths } from '@/shared/constants/routePaths';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionStore } from '@/stores/institutionStore';

type AuthStore = ReturnType<typeof useAuthStore>;
type InstitutionStore = ReturnType<typeof useInstitutionStore>;
type MergedMeta = ReturnType<typeof mergeRouteMeta>;

/**
 * @description Normaliza y valida el RFC recibido desde parámetros de ruta.
 */
function parseRfc(value: unknown) {
  const rfcCandidate = Array.isArray(value) ? value[0] : value;
  const parsed = z.string().trim().min(1).safeParse(rfcCandidate);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

function resolveCurrentRole(authStore: AuthStore) {
  return authStore.isAuthenticated ? authStore.activeRole : ROLE.ANONYMOUS;
}

function hasReservedSystemContext(institutionStore: InstitutionStore) {
  return institutionStore.activeRfc === SYSTEM_RFC;
}

function hasValidInstitutionContext(
  authStore: AuthStore,
  institutionStore: InstitutionStore,
  requestedRfc: string
) {
  const hasAccess = authStore.allowedInstitutionRfcs.includes(requestedRfc);
  const hasActiveContext = institutionStore.activeRfc === requestedRfc;
  return hasAccess && hasActiveContext;
}

function resolveGuardRedirect(
  to: { path: string; params: { rfc?: unknown } },
  meta: MergedMeta,
  authStore: AuthStore,
  institutionStore: InstitutionStore
) {
  const currentRole = resolveCurrentRole(authStore);
  const hasSystemContext = hasReservedSystemContext(institutionStore);

  if (meta.requiresAuth && !authStore.isAuthenticated) {
    return routePaths.authLogin;
  }

  if (currentRole === ROLE.SYSTEM_ADMINISTRATOR && !hasSystemContext) {
    return routePaths.error403;
  }

  if (authStore.isAuthenticated && currentRole !== ROLE.SYSTEM_ADMINISTRATOR && hasSystemContext) {
    return routePaths.error403;
  }

  if (
    meta.requiresSecuritySetup &&
    authStore.isAuthenticated &&
    authStore.requiresSecuritySetup &&
    to.path !== routePaths.authSecuritySetup
  ) {
    return routePaths.authSecuritySetup;
  }

  if (meta.allowedRoles && !meta.allowedRoles.includes(currentRole)) {
    return routePaths.error403;
  }

  if (!meta.requiresInstitutionContext) {
    return null;
  }

  const requestedRfc = parseRfc(to.params.rfc);
  if (!requestedRfc) {
    return routePaths.error403;
  }

  if (!hasValidInstitutionContext(authStore, institutionStore, requestedRfc)) {
    return routePaths.error403;
  }

  return null;
}

/**
 * @description Registra el pipeline de guards para autenticación, rol, contexto y setup de seguridad.
 */
export function registerRouteGuards(router: Router, pinia: Pinia) {
  router.beforeEach((to) => {
    try {
      const authStore = useAuthStore(pinia);
      const institutionStore = useInstitutionStore(pinia);
      const meta = mergeRouteMeta(to.matched as Array<{ meta: unknown }>);

      if (to.matched.length === 0) {
        return routePaths.error404;
      }

      if (to.path.startsWith('/error/')) {
        return true;
      }

      const redirect = resolveGuardRedirect(to, meta, authStore, institutionStore);
      if (redirect) {
        return redirect;
      }

      return true;
    } catch (error) {
      console.error(error);
      return routePaths.error500;
    }
  });
}
