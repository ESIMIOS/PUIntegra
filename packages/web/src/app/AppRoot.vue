<script setup lang="ts">
/**
 * @package web
 * @name AppRoot.vue
 * @version 0.0.3
 * @description Componente raíz que gestiona el layout global, inactividad y router.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.3	(2026-04-23)	Limita el cableado de stores del panel mock al entorno de desarrollo.	@codex
 * - 0.0.2  (2026-04-12)  Integración de InactivityWarningModal.  @antigravity
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, MockSessionSwitcher, InactivityWarningModal, ROLE } from "@/bom";
import { useSentryScope } from "@/composables/useSentryScope";
import { useAuthStore } from "@/stores/authStore";
import { useInstitutionStore } from "@/stores/institutionStore";

const showMockPanel = import.meta.env.DEV;
const authStore = showMockPanel ? useAuthStore() : null;
const institutionStore = showMockPanel ? useInstitutionStore() : null;

const activeRole = computed(() => authStore?.activeRole ?? ROLE.ANONYMOUS);
const activeRfc = computed(() => institutionStore?.activeRfc ?? null);
const requiresSecuritySetup = computed(() => authStore?.requiresSecuritySetup ?? false);

useSentryScope();
</script>

<template>
  <div class="app-root">
    <router-view />
    <InactivityWarningModal />
    <MockSessionSwitcher
      v-if="showMockPanel"
      :active-role="activeRole"
      :active-rfc="activeRfc"
      :requires-security-setup="requiresSecuritySetup"
    />
  </div>
</template>
