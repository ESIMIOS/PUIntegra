<script setup lang="ts">
/**
 * @package web
 * @name AdminLogsPage.vue
 * @version 0.0.2
 * @description Vista de inspección global de logs del sistema.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-27)	Reemplaza placeholder por explorador global de logs.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import LogsExplorer from '@/components/logInspection/LogsExplorer.vue';
</script>

<template>
  <LogsExplorer
    scope="admin"
    title="Logs globales"
    description="Inspección readonly de eventos del sistema, tenants y cuentas."
  />
</template>
