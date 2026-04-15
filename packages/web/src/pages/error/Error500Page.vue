<script setup lang="ts">
/**
 * @package web
 * @name Error500Page.vue
 * @version 0.0.2
 * @description Vista de error interno del sistema (500) con recuperación contextual.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-15)	Reemplaza placeholder por página de error contextual.	@codex
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import ErrorStatePage from '@/components/shared/ErrorStatePage.vue';
</script>

<template>
  <ErrorStatePage
    status="500"
    title="El sistema tropezó con sus propios cables"
    message="No pudimos completar la operación. Vuelve a una sección segura e intenta de nuevo en unos momentos."
    icon="local_fire_department"
    graphic-label="Icono absurdo de una máquina confundida por sus cables"
  />
</template>
