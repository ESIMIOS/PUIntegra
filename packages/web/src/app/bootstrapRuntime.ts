/**
 * @package web
 * @name bootstrapRuntime.ts
 * @version 0.0.2
 * @description Centralizes session initialization and post-hydration initial redirect handling.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-19)	Removes duplicate startup hydration after route guards own initial auth checks.	@codex
 * - 0.0.1	(2026-04-17)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
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
  await router.isReady();

  const authStore = useAuthStore(pinia);
  const institutionStore = useInstitutionStore(pinia);
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
