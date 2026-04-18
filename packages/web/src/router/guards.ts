/**
 * @package web
 * @name guards.ts
 * @version 0.0.1
 * @description Implements guards for session, role, institution context, and security bootstrap.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z, ROLE, SYSTEM_RFC, type Pinia, type Router } from "@/bom";
import { mergeRouteMeta } from "./metaSchema";
import { isPublicAuthEntryPath, resolvePreferredAuthenticatedPath } from "./authLanding";
import { routePaths } from "@/shared/constants/routePaths";
import { systemMessageTree } from "@/shared/constants/systemMessages";
import { logSystemMessage, logSystemMessageError, logSystemMessageWarning } from "@/shared/logging/systemLogger";
import { useAuthStore } from "@/stores/authStore";
import { useInstitutionStore } from "@/stores/institutionStore";

type AuthStore = ReturnType<typeof useAuthStore>;
type InstitutionStore = ReturnType<typeof useInstitutionStore>;
type MergedMeta = ReturnType<typeof mergeRouteMeta>;
type RoleValue = (typeof ROLE)[keyof typeof ROLE];
type GuardRoute = { path: string; fullPath: string; query: { redirect?: unknown }; params: { rfc?: unknown } };
let guardHydrationPromise: Promise<void> | null = null;

/**
 * @description Normalizes and validates the RFC received from route params.
 */
function parseRfc(value: unknown) {
  const rfcCandidate = Array.isArray(value) ? value[0] : value;
  const parsed = z.string().trim().min(1).safeParse(rfcCandidate);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

/**
 * @description Resolves effective role, falling back to anonymous when there is no authenticated session.
 */
function resolveCurrentRole(authStore: AuthStore): RoleValue {
  return authStore.isAuthenticated ? authStore.activeRole : ROLE.ANONYMOUS;
}

/**
 * @description Checks whether active context matches the reserved system RFC.
 */
function hasReservedSystemContext(institutionStore: InstitutionStore) {
  return institutionStore.activeRfc === SYSTEM_RFC;
}

/**
 * @description Verifies requested RFC is accessible and matches active institution context.
 */
function hasValidInstitutionContext(authStore: AuthStore, institutionStore: InstitutionStore, requestedRfc: string) {
  const hasAccess = authStore.allowedInstitutionRfcs.includes(requestedRfc);
  const hasActiveContext = institutionStore.activeRfc === requestedRfc;
  return hasAccess && hasActiveContext;
}

/**
 * @description Resolves redirect from public auth routes for already authenticated users.
 */
function resolveAuthEntryRedirect(to: GuardRoute, authStore: AuthStore, institutionStore: InstitutionStore) {
  if (!authStore.isAuthenticated || !isPublicAuthEntryPath(to.path)) {
    return null;
  }

  const preferredPath = resolvePreferredAuthenticatedPath({
    activeRole: authStore.activeRole,
    requiresSecuritySetup: authStore.requiresSecuritySetup,
    activeRfc: institutionStore.activeRfc,
    redirectTarget: to.query.redirect,
  });

  return preferredPath === to.path ? null : preferredPath;
}

/**
 * @description Resolves redirect to login when route requires authentication.
 */
function resolveAuthRequiredRedirect(to: GuardRoute, meta: MergedMeta, authStore: AuthStore) {
  if (!meta.requiresAuth || authStore.isAuthenticated) {
    return null;
  }

  logSystemMessage(systemMessageTree.web.guard.authRequired, { path: to.path });
  return {
    path: routePaths.authLogin,
    query: {
      redirect: to.fullPath,
    },
  };
}

/**
 * @description Resolves conflicts between active role and SYSTEM_RFC context.
 */
function resolveSystemContextRedirect(
  to: GuardRoute,
  authStore: AuthStore,
  hasSystemContext: boolean,
  currentRole: RoleValue,
) {
  if (currentRole === ROLE.SYSTEM_ADMINISTRATOR && !hasSystemContext) {
    logSystemMessage(systemMessageTree.web.guard.systemRoleRequiresSystemRfc, { path: to.path });
    return routePaths.error403;
  }

  if (authStore.isAuthenticated && currentRole !== ROLE.SYSTEM_ADMINISTRATOR && hasSystemContext) {
    logSystemMessage(systemMessageTree.web.guard.nonSystemRoleUsingSystemRfc, { path: to.path });
    return routePaths.error403;
  }

  return null;
}

/**
 * @description Resolves redirect to security bootstrap when setup is still required.
 */
function resolveSecuritySetupRedirect(to: GuardRoute, meta: MergedMeta, authStore: AuthStore) {
  if (
    !meta.requiresSecuritySetup ||
    !authStore.isAuthenticated ||
    !authStore.requiresSecuritySetup ||
    to.path === routePaths.authSecuritySetup
  ) {
    return null;
  }

  logSystemMessage(systemMessageTree.web.guard.securitySetupRequired, { path: to.path });
  return routePaths.authSecuritySetup;
}

/**
 * @description Resolves mismatches between effective role and route-allowed roles.
 */
function resolveRoleMismatchRedirect(to: GuardRoute, meta: MergedMeta, currentRole: RoleValue) {
  if (!meta.allowedRoles || meta.allowedRoles.includes(currentRole)) {
    return null;
  }

  logSystemMessage(systemMessageTree.web.guard.roleMismatch, {
    path: to.path,
    role: currentRole,
  });
  return routePaths.error403;
}

/**
 * @description Resolves errors for institution context required by the route.
 */
function resolveInstitutionContextRedirect(
  to: GuardRoute,
  meta: MergedMeta,
  authStore: AuthStore,
  institutionStore: InstitutionStore,
) {
  if (!meta.requiresInstitutionContext) {
    return null;
  }

  const requestedRfc = parseRfc(to.params.rfc);
  if (!requestedRfc) {
    logSystemMessage(systemMessageTree.web.guard.invalidInstitutionRfcParam, { path: to.path });
    return routePaths.error403;
  }

  if (!hasValidInstitutionContext(authStore, institutionStore, requestedRfc)) {
    logSystemMessage(systemMessageTree.web.guard.institutionContextMismatch, {
      path: to.path,
      requestedRfc,
      activeRfc: institutionStore.activeRfc,
    });
    return routePaths.error403;
  }

  return null;
}

/**
 * @description Evaluates guard pipeline and returns redirect target when applicable.
 */
function resolveGuardRedirect(to: GuardRoute, meta: MergedMeta, authStore: AuthStore, institutionStore: InstitutionStore) {
  const currentRole = resolveCurrentRole(authStore);
  const hasSystemContext = hasReservedSystemContext(institutionStore);

  const authEntryRedirect = resolveAuthEntryRedirect(to, authStore, institutionStore);
  if (authEntryRedirect) {
    return authEntryRedirect;
  }

  const authRequiredRedirect = resolveAuthRequiredRedirect(to, meta, authStore);
  if (authRequiredRedirect) {
    return authRequiredRedirect;
  }

  const systemContextRedirect = resolveSystemContextRedirect(to, authStore, hasSystemContext, currentRole);
  if (systemContextRedirect) {
    return systemContextRedirect;
  }

  const securitySetupRedirect = resolveSecuritySetupRedirect(to, meta, authStore);
  if (securitySetupRedirect) {
    return securitySetupRedirect;
  }

  const roleMismatchRedirect = resolveRoleMismatchRedirect(to, meta, currentRole);
  if (roleMismatchRedirect) {
    return roleMismatchRedirect;
  }

  return resolveInstitutionContextRedirect(to, meta, authStore, institutionStore);
}

/**
 * @description Ensures route guards evaluate against hydrated auth state on first navigation.
 */
async function ensureGuardHydration(authStore: AuthStore, institutionStore: InstitutionStore) {
  if (authStore.hasHydratedSession || authStore.isAuthenticated) {
    return;
  }

  if (!guardHydrationPromise) {
    guardHydrationPromise = (async () => {
      try {
        const session = await authStore.hydrateSession();
        if (session?.activeRfc) {
          institutionStore.setActiveRfc(session.activeRfc);
        } else {
          authStore.resetToAnonymous();
          institutionStore.clearActiveRfc();
        }
      } catch (hydrationError) {
        logSystemMessageWarning(systemMessageTree.web.mock.hydrationFailed, hydrationError);
        authStore.resetToAnonymous();
        institutionStore.clearActiveRfc();
      }
    })().finally(() => {
      guardHydrationPromise = null;
    });
  }

  await guardHydrationPromise;
}

/**
 * @description Registers guard pipeline for authentication, role, context, and security setup.
 */
export function registerRouteGuards(router: Router, pinia: Pinia) {
  router.beforeEach(async (to) => {
    try {
      const authStore = useAuthStore(pinia);
      const institutionStore = useInstitutionStore(pinia);
      const meta = mergeRouteMeta(to.matched as Array<{ meta: unknown }>);

      if (to.matched.length === 0) {
        logSystemMessage(systemMessageTree.web.guard.routeNotFound, { path: to.path });
        return routePaths.error404;
      }

      if (to.path.startsWith("/error/")) {
        return true;
      }

      await ensureGuardHydration(authStore, institutionStore);

      const redirect = resolveGuardRedirect(to, meta, authStore, institutionStore);
      if (redirect) {
        return redirect;
      }

      return true;
    } catch (error) {
      logSystemMessageError(systemMessageTree.web.guard.unexpectedError, error, { path: to.path });
      return routePaths.error500;
    }
  });
}
