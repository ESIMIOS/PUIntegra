<script setup lang="ts">
/**
 * @package web
 * @name AppRoot.vue
 * @version 0.0.1
 * @description Componente raíz que gestiona el layout global, inactividad y router.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2  (2026-04-12)  Integración de InactivityWarningModal.  @antigravity
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { MockSessionSwitcher, InactivityWarningModal } from '@/bom';

const showMockPanel = import.meta.env.DEV;
</script>

<template>
  <v-app>
    <router-view />
    <InactivityWarningModal />
    <MockSessionSwitcher v-if="showMockPanel" />
  </v-app>
</template>
