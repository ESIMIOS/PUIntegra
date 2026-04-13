<script setup lang="ts">
/**
 * @package web
 * @name PagePlaceholder.vue
 * @version 0.0.1
 * @description Componente reutilizable para mostrar vistas placeholder con contexto de ruta.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { useRoute } from '@/bom';

const route = useRoute();

const fallbackContent = {
  title: 'Vista sin catálogo',
  description: 'Esta ruta no tiene contenido definido en el catálogo de navegación.'
};
</script>

<template>
  <section class="page-placeholder">
    <VaCard class="page-placeholder__card">
      <VaCardTitle>
        {{ typeof route.meta.title === 'string' ? route.meta.title : fallbackContent.title }}
      </VaCardTitle>
      <VaCardContent>
        <p class="page-placeholder__path">{{ route.path }}</p>
        <p>
          {{
            typeof route.meta.description === 'string'
              ? route.meta.description
              : fallbackContent.description
          }}
        </p>
        <VaDivider />
        <VaAlert class="page-placeholder__alert" color="info" outline>
          Vista placeholder. No hay funcionalidad de negocio implementada en esta fase.
        </VaAlert>
      </VaCardContent>
    </VaCard>
  </section>
</template>

<style scoped>
.page-placeholder {
  width: min(64rem, 100%);
}

.page-placeholder__card {
  border: 1px solid var(--va-background-border);
  border-radius: 8px;
  color: var(--va-text-primary);
}

.page-placeholder__path {
  margin-top: 0;
  color: var(--va-secondary);
  font-size: 0.9rem;
}

.page-placeholder__alert {
  color: var(--va-text-primary);
}

.page-placeholder__alert :deep(.va-alert__content) {
  color: var(--va-text-primary) !important;
}
</style>
