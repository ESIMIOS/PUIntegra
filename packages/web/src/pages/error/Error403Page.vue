<script setup lang="ts">
/**
 * @package web
 * @name Error403Page.vue
 * @version 0.0.2
 * @description Vista de acceso prohibido (403) con recuperación contextual.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-15)	Reemplaza placeholder por página de error contextual.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import ErrorStatePage from '@/components/shared/ErrorStatePage.vue';
</script>

<template>
  <ErrorStatePage
    status="403"
    title="El guardia se puso intenso"
    message="Tu cuenta o el rol activo no tienen acceso a esta zona. Cambia de rol o vuelve a una sección disponible para continuar."
    icon="security"
    graphic-label="Icono absurdo de un guardia digital bloqueando el paso"
    :allow-login-recovery="true"
  />
</template>
