<script setup lang="ts">
/**
 * @package web
 * @name AdminLayout.vue
 * @version 0.0.1
 * @description Layout del dominio backoffice `/admin` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import {
  buildNavigationLinks,
  computed,
  DEFAULT_FUB,
  DEFAULT_RFC,
  DOMAIN,
  domainShell,
  ROLE,
  useAuthStore,
  useInstitutionStore
} from '@/bom';
import DashboardShell from '@/components/shared/DashboardShell.vue';

const authStore = useAuthStore();
const institutionStore = useInstitutionStore();

const menuItems = computed(() =>
  buildNavigationLinks(DOMAIN.ADMIN, {
    activeRfc: institutionStore.activeRfc || DEFAULT_RFC,
    adminInspectionRfc: institutionStore.activeRfc || DEFAULT_RFC,
    defaultFub: DEFAULT_FUB,
    isAuthenticated: authStore.isAuthenticated,
    isInstitutionRole:
      authStore.activeRole === ROLE.INSTITUTION_ADMIN ||
      authStore.activeRole === ROLE.INSTITUTION_OPERATOR,
    isInstitutionAdmin: authStore.activeRole === ROLE.INSTITUTION_ADMIN,
    isSystemRole: authStore.activeRole === ROLE.SYSTEM_ADMINISTRATOR
  })
);
</script>

<template>
  <DashboardShell
    :menu-items="menuItems"
    :domain-title="domainShell[DOMAIN.ADMIN].title"
  />
</template>
