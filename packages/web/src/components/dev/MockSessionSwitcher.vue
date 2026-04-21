<script setup lang="ts">
/**
 * @package web
 * @name MockSessionSwitcher.vue
 * @version 0.0.1
 * @description Panel de desarrollo para alternar sesión, rol, seguridad y contexto institucional.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, ref } from "vue";
import { ROLE } from "@shared";
import { domainOptions } from "@/shared/constants/domains";
import { DEFAULT_RFC, DEFAULT_FUB } from "@/shared/constants/routePaths";
import { buildNavigationLinks } from "@/shared/constants/navigationCatalog";
import { useAuthStore } from "@/stores/authStore";
import { useInstitutionStore } from "@/stores/institutionStore";
import { useSessionInactivity } from "@/composables/useSessionInactivity";
import { useRoute } from "vue-router";
import { useBreakpoint } from "vuestic-ui";

const route = useRoute();
const authStore = useAuthStore();
const institutionStore = useInstitutionStore();
const { secondsRemaining, isAlerting } = useSessionInactivity();

const breakpoints = useBreakpoint();
const currentBreakpoint = computed(() => breakpoints.current);

const selectedDomain = ref<(typeof domainOptions)[number]["key"]>("site");

const activeRole = computed(() => authStore.activeRole);
const activeRfc = computed(() => institutionStore.activeRfc);
const requiresSecuritySetup = computed(() => authStore.requiresSecuritySetup);
const isAuthenticated = computed(() => activeRole.value !== ROLE.ANONYMOUS);
const isSystemRole = computed(
  () => activeRole.value === ROLE.SYSTEM_ADMINISTRATOR,
);
const isInstitutionRole = computed(
  () =>
    activeRole.value === ROLE.INSTITUTION_ADMIN ||
    activeRole.value === ROLE.INSTITUTION_OPERATOR,
);
const isInstitutionAdmin = computed(
  () => activeRole.value === ROLE.INSTITUTION_ADMIN,
);

const contextualLinks = computed(() => {
  return buildNavigationLinks(selectedDomain.value, {
    activeRfc: activeRfc.value || DEFAULT_RFC,
    adminInspectionRfc: DEFAULT_RFC,
    defaultFub: DEFAULT_FUB,
    isAuthenticated: isAuthenticated.value,
    isInstitutionRole: isInstitutionRole.value,
    isInstitutionAdmin: isInstitutionAdmin.value,
    isSystemRole: isSystemRole.value,
  });
});
</script>

<template>
  <VaCard class="mock-switcher">
    <VaCardTitle>Mock Session Switcher ({{ currentBreakpoint }})</VaCardTitle>
    <VaCardContent>
      <VaAlert color="info" dense>
        Rol activo: <strong>{{ activeRole }}</strong>
        <span class="mx-1">·</span>
        RFC activo: <strong>{{ activeRfc || "N/A" }}</strong>
        <span class="mx-1">·</span>
        Security setup: <strong>{{ requiresSecuritySetup ? "required" : "ok" }}</strong>
      </VaAlert>
      <div v-if="isAuthenticated" class="mt-2">
        <VaChip :color="isAlerting ? 'danger' : 'info'" size="small">
          Session ends in: {{ secondsRemaining }}s
        </VaChip>
      </div>
      <VaDivider />
      <section class="mock-switcher__section" aria-label="Layout">
        <span class="mock-switcher__section-label">Layout</span>
        <div class="d-flex flex-wrap ga-2">
          <VaButton
            v-for="domain in domainOptions"
            :key="domain.key"
            size="small"
            :preset="selectedDomain === domain.key ? 'primary' : 'secondary'"
            color="primary"
            @click="selectedDomain = domain.key"
          >
            {{ domain.label }}
          </VaButton>
        </div>
      </section>
      <VaDivider />
      <section class="mock-switcher__section" aria-label="Page">
        <span class="mock-switcher__section-label">Page</span>
        <div class="d-flex flex-wrap ga-2">
          <VaButton
            v-for="link in contextualLinks"
            :key="link.id"
            size="small"
            :preset="link.to === route.path ? 'primary' : 'secondary'"
            :to="link.to"
          >
            {{ link.label }}
          </VaButton>
        </div>
      </section>
    </VaCardContent>
  </VaCard>
</template>

<style scoped>
.mock-switcher {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  width: min(28rem, calc(100vw - 2rem));
  border: 1px solid var(--va-background-border);
  box-shadow: 0 12px 36px var(--va-shadow);
  z-index: 1000;
}

.mock-switcher__section {
  display: grid;
  gap: 0.45rem;
}

.mock-switcher__section-label {
  color: var(--va-text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
}
</style>
