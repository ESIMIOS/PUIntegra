/**
 * @package web
 * @name bootstrapRuntime.ts
 * @version 0.0.1
 * @description Centralizes session initialization and post-hydration initial redirect handling.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-17)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  logSystemMessageWarning,
  systemMessageTree,
  useAuthStore,
  useInstitutionStore,
  type Pinia,
  type Router
} from '@/bom';
import { isPublicAuthEntryPath, resolvePreferredAuthenticatedPath } from '@/router/authLanding';

/**
 * @description Hydrates session, syncs institution context, and corrects initial redirect when needed.
 */
export async function bootstrapRuntime(router: Router, pinia: Pinia) {
  const authStore = useAuthStore(pinia);
  const institutionStore = useInstitutionStore(pinia);

  if (!authStore.hasHydratedSession) {
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
  }

  await router.isReady();

  const currentPath = router.currentRoute.value.path;
  if (!authStore.isAuthenticated || !isPublicAuthEntryPath(currentPath)) {
    return;
  }

  const preferredPath = resolvePreferredAuthenticatedPath({
    activeRole: authStore.activeRole,
    requiresSecuritySetup: authStore.requiresSecuritySetup,
    activeRfc: institutionStore.activeRfc,
    redirectTarget: router.currentRoute.value.query.redirect
  });

  if (preferredPath !== currentPath) {
    await router.replace(preferredPath);
  }
}
