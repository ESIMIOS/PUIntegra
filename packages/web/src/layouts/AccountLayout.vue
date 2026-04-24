<script setup lang="ts">
/**
 * @package web
 * @name AccountLayout.vue
 * @version 0.0.1
 * @description Layout del dominio de cuenta `/account` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import {
  computed,
  DEFAULT_FUB,
  DEFAULT_RFC,
  buildNavigationLinks,
  buildNavigationBackLinks,
  useAuthStore,
  useInstitutionStore,
  DOMAIN,
  ROLE,
  domainShell,
} from "@/bom";
import DashboardShell from "@/components/shared/DashboardShell.vue";

const authStore = useAuthStore();

const institutionStore = useInstitutionStore();

const navigationContext = {
  activeRfc: institutionStore.activeRfc || DEFAULT_RFC,
  adminInspectionRfc: DEFAULT_RFC,
  defaultFub: DEFAULT_FUB,
  isAuthenticated: authStore.isAuthenticated,
  isInstitutionRole:
    authStore.activeRole === ROLE.INSTITUTION_ADMIN || authStore.activeRole === ROLE.INSTITUTION_OPERATOR,
  isInstitutionAdmin: authStore.activeRole === ROLE.INSTITUTION_ADMIN,
  isSystemRole: authStore.activeRole === ROLE.SYSTEM_ADMINISTRATOR,
};

const accountLinks = computed(() => buildNavigationLinks(DOMAIN.ACCOUNT, navigationContext));

const backLinks = computed(() => buildNavigationBackLinks(DOMAIN.ACCOUNT, navigationContext));
</script>

<template>
  <DashboardShell
    :menu-items="accountLinks"
    :domain-title="domainShell[DOMAIN.ACCOUNT].title"
    :return-items="backLinks"
  />
</template>
