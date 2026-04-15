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
import { DOMAIN, domainShell } from '@/bom'
import AppLogo from '@/components/shared/AppLogo.vue'
</script>

<template>
  <VaLayout class="layout-shell error-layout" :style="{ '--domain-accent': domainShell[DOMAIN.ERROR].accentColor }">
    <main class="error-layout__main">
      <AppLogo size="prominent" />
      <VaDivider class="error-layout__divider" />
      <router-view />
    </main>
  </VaLayout>
</template>

<style scoped>
.error-layout {
	min-height: 100vh;
	background: var(--va-background-primary);
}

.error-layout__main {
  display: grid;
  place-items: center;
  align-content: center;
  min-height: 100vh;
  padding: 3rem 1.5rem;
  gap: 2rem;
  text-align: center;
}

.error-layout__divider {
  width: min(90vw, 52rem);
  margin: 0;
}

.error-layout__main h1 {
	color: var(--domain-accent);
	font-size: 1.5rem;
	letter-spacing: 0;
}
</style>
