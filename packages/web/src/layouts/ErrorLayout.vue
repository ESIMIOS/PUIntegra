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
  <VaLayout class="error-layout">
    <main class="error-layout__container">
      <AppLogo size="prominent" />
      <VaDivider />
      <router-view />
    </main>
  </VaLayout>
</template>

<style scoped>
.error-layout {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 1.5rem;
  background: var(--va-background-primary);
}

.error-layout__container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: min(100%, 52rem);
  text-align: center;
}

.error-layout__container > :first-child {
  align-self: center;
}

:deep(.va-divider) {
  margin: 0;
}

.error-layout__container :deep(h1) {
  color: var(--va-danger);
  font-size: 1.5rem;
  letter-spacing: 0;
}
</style>
