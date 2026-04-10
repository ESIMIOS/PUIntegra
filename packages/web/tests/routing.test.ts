/**
 * @package web
 * @name routing.test.ts
 * @version 0.0.1
 * @description Verifica cobertura de rutas documentadas, layouts y redirecciones por defecto.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  createPinia,
  createAppRouter,
  mergeRouteMeta,
  DOMAIN,
  ROLE,
  allDocumentedPaths,
  DEFAULT_RFC,
  useAuthStore,
  useInstitutionStore
} from '@/bom';

function createRouterWithInstitutionAdminContext() {
  const pinia = createPinia();
  const router = createAppRouter(pinia);
  const authStore = useAuthStore(pinia);
  const institutionStore = useInstitutionStore(pinia);

  authStore.setRole(ROLE.INSTITUTION_ADMIN);
  authStore.setRequiresSecuritySetup(false);
  authStore.setAllowedInstitutionRfcs([DEFAULT_RFC]);
  institutionStore.setActiveRfc(DEFAULT_RFC);

  return { router, authStore, institutionStore };
}

describe('routing contract', () => {
  it('registers all documented paths', () => {
    const { router } = createRouterWithInstitutionAdminContext();

    for (const path of allDocumentedPaths) {
      const resolved = router.resolve(path);
      expect(resolved.matched.length).toBeGreaterThan(0);
    }
  });

  it('applies documented default redirects', async () => {
    const { router } = createRouterWithInstitutionAdminContext();

    await router.push('/site');
    expect(router.currentRoute.value.path).toBe('/site/home');

    await router.push('/auth');
    expect(router.currentRoute.value.path).toBe('/auth/login');

    await router.push(`/app/${DEFAULT_RFC}`);
    expect(router.currentRoute.value.path).toBe(`/app/${DEFAULT_RFC}/dashboard`);

    await router.push(`/app/${DEFAULT_RFC}/admin`);
    expect(router.currentRoute.value.path).toBe(`/app/${DEFAULT_RFC}/admin/plan`);

    await router.push('/account');
    expect(router.currentRoute.value.path).toBe('/account/settings');
  });

  it('sends unknown routes to /error/404', async () => {
    const { router } = createRouterWithInstitutionAdminContext();

    await router.push('/not-found-anywhere');

    expect(router.currentRoute.value.path).toBe('/error/404');
  });

  it('maps representative routes to their layout domains', () => {
    const { router } = createRouterWithInstitutionAdminContext();

    const expectations = [
      ['/site/home', DOMAIN.SITE],
      ['/auth/login', DOMAIN.AUTH],
      [`/app/${DEFAULT_RFC}/dashboard`, DOMAIN.APP],
      ['/admin/institutions', DOMAIN.ADMIN],
      ['/account/settings', DOMAIN.ACCOUNT],
      ['/error/500', DOMAIN.ERROR]
    ] as const;

    for (const [path, expectedLayout] of expectations) {
      const resolved = router.resolve(path);
      const merged = mergeRouteMeta(resolved.matched as Array<{ meta: unknown }>);
      expect(merged.layout).toBe(expectedLayout);
    }
  });
});
