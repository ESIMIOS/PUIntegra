/**
 * @package web
 * @name guards.test.ts
 * @version 0.0.1
 * @description Verifica el comportamiento de guards mock para rol, contexto y seguridad.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  createPinia,
  createAppRouter,
  ROLE,
  DEFAULT_RFC,
  SYSTEM_RFC,
  useAuthStore,
  useInstitutionStore
} from '@/bom';

function createRouterWithStores() {
  const pinia = createPinia();
  const router = createAppRouter(pinia);
  const authStore = useAuthStore(pinia);
  const institutionStore = useInstitutionStore(pinia);

  return { router, authStore, institutionStore };
}

describe('route guards in mock mode', () => {
  it('redirects to /error/403 on role mismatch', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.INSTITUTION_OPERATOR);
    authStore.setRequiresSecuritySetup(false);
    authStore.setAllowedInstitutionRfcs([DEFAULT_RFC]);
    institutionStore.setActiveRfc(DEFAULT_RFC);

    await router.push(`/app/${DEFAULT_RFC}/admin/plan`);

    expect(router.currentRoute.value.path).toBe('/error/403');
  });

  it('redirects to /error/403 when institution context does not match route', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setRequiresSecuritySetup(false);
    authStore.setAllowedInstitutionRfcs(['BBB010101BBB']);
    institutionStore.setActiveRfc('BBB010101BBB');

    await router.push(`/app/${DEFAULT_RFC}/dashboard`);

    expect(router.currentRoute.value.path).toBe('/error/403');
  });

  it('redirects to /auth/security-setup when bootstrap is pending', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
    authStore.setRequiresSecuritySetup(true);
    institutionStore.setActiveRfc(SYSTEM_RFC);

    await router.push('/admin/institutions');

    expect(router.currentRoute.value.path).toBe('/auth/security-setup');
  });

  it('redirects to /error/403 when system administrator does not use SYSTEM_RFC', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
    authStore.setRequiresSecuritySetup(false);
    institutionStore.setActiveRfc(DEFAULT_RFC);

    await router.push('/admin/institutions');

    expect(router.currentRoute.value.path).toBe('/error/403');
  });

  it('allows system administrator when SYSTEM_RFC is active', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
    authStore.setRequiresSecuritySetup(false);
    institutionStore.setActiveRfc(SYSTEM_RFC);

    await router.push('/admin/institutions');

    expect(router.currentRoute.value.path).toBe('/admin/institutions');
  });
});
