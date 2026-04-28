<script setup lang="ts">
/**
 * @package web
 * @name AppLogsPage.vue
 * @version 0.0.2
 * @description Vista readonly de bitácora institucional por RFC.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-27)	Reemplaza placeholder por explorador tenant de logs.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import LogsExplorer from '@/components/logInspection/LogsExplorer.vue';

const route = useRoute();
const routeRfc = computed(() => String(route.params.rfc ?? '').toUpperCase());
</script>

<template>
  <LogsExplorer
    scope="app"
    title="Logs institucionales"
    :description="`Eventos readonly para el RFC ${routeRfc}.`"
    :fixed-rfc="routeRfc"
  />
</template>
