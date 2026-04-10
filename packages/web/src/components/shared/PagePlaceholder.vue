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
  <v-container class="py-8">
    <v-card variant="outlined" class="pa-6">
      <v-card-title class="text-h5">
        {{ typeof route.meta.title === 'string' ? route.meta.title : fallbackContent.title }}
      </v-card-title>
      <v-card-subtitle class="mt-1">{{ route.path }}</v-card-subtitle>
      <v-card-text class="mt-4">
        {{
          typeof route.meta.description === 'string'
            ? route.meta.description
            : fallbackContent.description
        }}
      </v-card-text>
      <v-divider class="my-4" />
      <v-alert type="info" variant="tonal">
        Vista placeholder. No hay funcionalidad de negocio implementada en esta fase.
      </v-alert>
    </v-card>
  </v-container>
</template>
