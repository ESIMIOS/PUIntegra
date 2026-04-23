<script setup lang="ts">
/**
 * @package web
 * @name AppFooter.vue
 * @version 0.0.1
 * @description Componente de pie de página global para la aplicación.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

const props = withDefaults(
  defineProps<{
    class?: string;
  }>(),
  {
    class: "layout__footer",
  },
);
</script>

<template>
  <footer :class="props.class">
    <slot>PUIntegra © 2026</slot>
  </footer>
</template>
