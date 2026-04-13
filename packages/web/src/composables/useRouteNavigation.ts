/**
 * @package web
 * @name useRouteNavigation.ts
 * @version 0.0.1
 * @description Genera enlaces de navegación dependientes del RFC activo para app y backoffice.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  computed,
  useInstitutionStore,
  DEFAULT_RFC,
  defaultNavigationContext,
  buildNavigationLinks,
  DOMAIN
} from '@/bom';

/**
 * @description Expone menús de navegación para dominios `/app` y `/admin` usando el RFC activo.
 */
export function useRouteNavigation() {
  const institutionStore = useInstitutionStore();

  const activeRfc = computed(() => institutionStore.activeRfc);

  const appLinks = computed(() =>
    buildNavigationLinks(DOMAIN.APP, {
      ...defaultNavigationContext,
      activeRfc: activeRfc.value,
      isSystemRole: false
    }).map(({ label, to }) => ({ label, to }))
  );

  const adminInspectionRfc = computed(() => DEFAULT_RFC);

  const adminLinks = computed(() =>
    buildNavigationLinks(DOMAIN.ADMIN, {
      ...defaultNavigationContext,
      adminInspectionRfc: adminInspectionRfc.value
    }).map(({ label, to }) => ({ label, to }))
  );

  return {
    activeRfc,
    appLinks,
    adminLinks
  };
}
