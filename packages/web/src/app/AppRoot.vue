<script setup lang="ts">
/**
 * @package web
 * @name AppRoot.vue
 * @version 0.0.1
 * @description Componente raíz que renderiza el router y el switcher mock en desarrollo.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { MockSessionSwitcher } from '@/bom';

const showMockPanel = import.meta.env.DEV;
</script>

<template>
  <v-app>
    <router-view />
    <MockSessionSwitcher v-if="showMockPanel" />
  </v-app>
</template>
