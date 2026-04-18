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
  clearMockAuthState,
  ROLE,
  DEFAULT_RFC,
  saveMockAuthState,
  SYSTEM_RFC,
  useAuthStore,
  useInstitutionStore
} from '@/bom';
import { beforeEach } from 'vitest';

function createRouterWithStores() {
  const pinia = createPinia();
  const router = createAppRouter(pinia);
  const authStore = useAuthStore(pinia);
  const institutionStore = useInstitutionStore(pinia);

  return { router, authStore, institutionStore };
}

describe('route guards in mock mode', () => {
  beforeEach(() => {
    clearMockAuthState();
  });

  it('allows protected route on first navigation when a persisted valid session exists', async () => {
    saveMockAuthState({
      session: {
        userId: 'mock-user-001',
        name: 'Usuario Mock',
        email: 'admin@example.test',
        emojiIcon: '🧩',
        activeRole: ROLE.INSTITUTION_ADMIN,
        activeRfc: DEFAULT_RFC,
        allowedInstitutionRfcs: [DEFAULT_RFC],
        availableContexts: [
          {
            role: ROLE.INSTITUTION_ADMIN,
            rfc: DEFAULT_RFC
          }
        ]
      },
      failedAttemptsByEmail: {}
    });

    const { router } = createRouterWithStores();

    await router.push(`/app/${DEFAULT_RFC}/dashboard`);

    expect(router.currentRoute.value.path).toBe(`/app/${DEFAULT_RFC}/dashboard`);
    expect(router.currentRoute.value.query.redirect).toBeUndefined();
  });

  it('redirects unauthenticated users to /auth/login with redirect query', async () => {
    const { router } = createRouterWithStores();

    await router.push(`/app/${DEFAULT_RFC}/requests/FUB-0001`);

    expect(router.currentRoute.value.path).toBe('/auth/login');
    expect(router.currentRoute.value.query.redirect).toBe(`/app/${DEFAULT_RFC}/requests/FUB-0001`);
  });

  it('redirects authenticated institution role from /auth/login to institution dashboard', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setRequiresSecuritySetup(false);
    authStore.setAllowedInstitutionRfcs([DEFAULT_RFC]);
    institutionStore.setActiveRfc(DEFAULT_RFC);

    await router.push('/auth/login');

    expect(router.currentRoute.value.path).toBe(`/app/${DEFAULT_RFC}/dashboard`);
  });

  it('redirects authenticated system role from /auth/login to /admin/institutions', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
    authStore.setRequiresSecuritySetup(false);
    institutionStore.setActiveRfc(SYSTEM_RFC);

    await router.push('/auth/login');

    expect(router.currentRoute.value.path).toBe('/admin/institutions');
  });

  it('redirects authenticated users requiring security setup to /auth/security-setup from /auth/login', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.INSTITUTION_OPERATOR);
    authStore.setRequiresSecuritySetup(true);
    authStore.setAllowedInstitutionRfcs([DEFAULT_RFC]);
    institutionStore.setActiveRfc(DEFAULT_RFC);

    await router.push('/auth/login');

    expect(router.currentRoute.value.path).toBe('/auth/security-setup');
  });

  it('redirects authenticated users from /auth/login to requested redirect target when valid', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setRequiresSecuritySetup(false);
    authStore.setAllowedInstitutionRfcs([DEFAULT_RFC]);
    institutionStore.setActiveRfc(DEFAULT_RFC);

    await router.push(`/auth/login?redirect=${encodeURIComponent(`/app/${DEFAULT_RFC}/requests`)}`);

    expect(router.currentRoute.value.path).toBe(`/app/${DEFAULT_RFC}/requests`);
  });

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

  it('allows admin inspection route for DEFAULT_RFC while keeping SYSTEM_RFC context', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
    authStore.setRequiresSecuritySetup(false);
    institutionStore.setActiveRfc(SYSTEM_RFC);

    await router.push(`/admin/institutions/${DEFAULT_RFC}`);

    expect(router.currentRoute.value.path).toBe(`/admin/institutions/${DEFAULT_RFC}`);
    expect(institutionStore.activeRfc).toBe(SYSTEM_RFC);
  });

  it('rejects institution administrator when SYSTEM_RFC is active', async () => {
    const { router, authStore, institutionStore } = createRouterWithStores();

    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setRequiresSecuritySetup(false);
    authStore.setAllowedInstitutionRfcs([DEFAULT_RFC]);
    institutionStore.setActiveRfc(SYSTEM_RFC);

    await router.push(`/app/${DEFAULT_RFC}/dashboard`);

    expect(router.currentRoute.value.path).toBe('/error/403');
  });
});
