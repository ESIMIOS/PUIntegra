/**
 * @package web
 * @name useAuthSession.ts
 * @version 0.0.1
 * @description Exposes authenticated-session helpers for login, logout, and context switching.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { computed } from "vue";
import { ROLE, RoleSchema } from "@shared";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { useInstitutionStore } from "@/stores/institutionStore";
import { routePaths } from "@/shared/constants/routePaths";

/**
 * @description Coordinates authenticated-session usage for views and components.
 */
export function useAuthSession() {
  const authStore = useAuthStore();
  const institutionStore = useInstitutionStore();

  /**
   * @description Hydrates session from storage and syncs active RFC when present.
   */
  async function ensureHydratedSession() {
    const hydrated = await authStore.hydrateSession();
    if (hydrated?.activeRfc) {
      institutionStore.setActiveRfc(hydrated.activeRfc);
    }
    return hydrated;
  }

  /**
   * @description Switches active context in persisted session and returns target route.
   */
  async function applyContext(context: { role: z.infer<typeof RoleSchema>; rfc: string }) {
    const session = await authStore.switchContext(context);
    institutionStore.setActiveRfc(session.activeRfc);
    return safePathForContext(context);
  }

  /**
   * @description Establishes post-login session with selected context and returns target route.
   */
  async function establishLoginContext(context: { role: z.infer<typeof RoleSchema>; rfc: string }) {
    const session = await authStore.establishSession(context);
    institutionStore.setActiveRfc(session.activeRfc);
    return safePathForContext(context);
  }

  /**
   * @description Clears authenticated session and active institution context.
   */
  function clearSession() {
    authStore.logout();
    institutionStore.clearActiveRfc();
  }

  const activeRole = computed(() => authStore.activeRole);
  const activeRfc = computed(() => institutionStore.activeRfc);

  return {
    authStore,
    activeRole,
    activeRfc,
    ensureHydratedSession,
    establishLoginContext,
    applyContext,
    clearSession,
    safePathForContext,
  };
}

/**
 * @description Resolves initial safe route for an authenticated context.
 */
function safePathForContext(context: { role: z.infer<typeof RoleSchema>; rfc: string }) {
  if (context.role === ROLE.SYSTEM_ADMINISTRATOR) {
    return routePaths.adminInstitutions;
  }
  return routePaths.appDashboard(context.rfc);
}
