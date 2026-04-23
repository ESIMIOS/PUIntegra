<script setup lang="ts">
/**
 * @package web
 * @name ErrorLayout.vue
 * @version 0.0.1
 * @description Layout del dominio `/error` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import AppLogo from "@/components/shared/AppLogo.vue";
</script>

<template>
  <VaLayout class="layout">
    <template #content>
      <div class="h-full w-full p-4">
        <main class="flex row h-full align-center justify-center">
          <div class="flex flex-col sm12 md12 lg10 align-center justify-center">
            <AppLogo size="prominent" />
            <VaDivider class="p-4" />
            <RouterView />
          </div>
        </main>
      </div>
    </template>
  </VaLayout>
</template>
