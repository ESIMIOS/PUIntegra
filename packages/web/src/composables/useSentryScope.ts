/**
 * @package web
 * @name useSentryScope.ts
 * @version 0.0.1
 * @description Composable singleton que sincroniza el estado de autenticación con el
 * scope de Sentry. Debe montarse una sola vez en AppRoot. No-op si Sentry no está inicializado.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-13)  Versión inicial.  @antigravity
 */

import * as Sentry from '@sentry/vue';
import { watchEffect } from 'vue';
import { useAuthStore } from '@/stores/authStore';

/**
 * Watches auth state and keeps the Sentry scope in sync.
 * Call once from AppRoot — subsequent calls are safe but redundant.
 *
 * Sentry user context set on login:
 *   - id        → authStore.uid
 *   - email     → authStore.email
 *   - role      → tag
 *   - tenantRfc → tag (first RFC in allowedInstitutionRfcs)
 *
 * All context is cleared on logout via Sentry.setUser(null).
 */
export function useSentryScope() {
  const authStore = useAuthStore();

  watchEffect(() => {
    if (!import.meta.env.VITE_SENTRY_DSN) return;

    if (authStore.isAuthenticated) {
      Sentry.setUser({
        id: authStore.uid ?? undefined,
        email: authStore.email ?? undefined,
      });
      Sentry.setTag('role', authStore.activeRole);
      Sentry.setTag('tenantRfc', authStore.allowedInstitutionRfcs[0] ?? 'unknown');
    } else {
      Sentry.setUser(null);
    }
  });
}
