<script setup lang="ts">
/**
 * @package web
 * @name AccountLogsPage.vue
 * @version 0.0.2
 * @description Vista readonly de logs de actividad de cuenta personal.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-27)	Reemplaza placeholder por explorador de logs de cuenta.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed } from 'vue';
import { useAuthStore } from '@/bom';
import LogsExplorer from '@/components/logInspection/LogsExplorer.vue';

const authStore = useAuthStore();
const userId = computed(() => authStore.uid);
</script>

<template>
  <LogsExplorer
    scope="account"
    title="Logs"
    description="Registros de actividad asociada a la cuenta de usuario."
    :fixed-rfc="null"
    :user-id="userId"
  />
</template>
