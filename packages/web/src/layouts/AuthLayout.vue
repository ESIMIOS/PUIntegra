<script setup lang="ts">
/**
 * @package web
 * @name AuthLayout.vue
 * @version 0.0.2
 * @description Layout del dominio de autenticación siguiendo el estándar de Vuestic Admin.
 * @author @tirsomartinezreyes
 * @changelog 0.0.2 (2026-04-17) simplificación de clases, integrando las clases de tailwind y vuestic evitando clases específicas @tirsomartinezreyes
 * @changelog 0.0.1 (2026-04-11) creación del layout del dominio de autenticación @tirsomartinezreyes
 */
import AppLogo from "@/components/shared/AppLogo.vue";
</script>

<template>
  <VaLayout class="h-full w-full fixed">
    <template #content>
      <div class="p-4 h-full w-full">
        <main class="flex row h-full align-center justify-center">
          <div class="flex flex-col sm12 md8 lg6 align-center justify-center">
            <AppLogo size="prominent" />
            <VaDivider />
            <RouterView />
          </div>
        </main>
      </div>
    </template>
  </VaLayout>
</template>
