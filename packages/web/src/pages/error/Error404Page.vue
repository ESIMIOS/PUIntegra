<script setup lang="ts">
/**
 * @package web
 * @name Error404Page.vue
 * @version 0.0.2
 * @description Vista de ruta no encontrada (404) con recuperación contextual.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-15)	Reemplaza placeholder por página de error contextual.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import ErrorStatePage from '@/components/shared/ErrorStatePage.vue';
</script>

<template>
  <ErrorStatePage
    status="404"
    title="Esta página se fue a buscar el café"
    message="No encontramos la página que pediste. Puede que la ruta haya cambiado o que ese recurso todavía no esté disponible."
    icon="cloud_off"
    graphic-label="Icono absurdo buscando una página perdida con lupa"
  />
</template>
