<script setup lang="ts">
/**
 * @package web
 * @name AuthLayout.vue
 * @version 0.0.1
 * @description Layout del dominio de autenticación `/auth` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { DOMAIN, domainShell } from '@/bom';
import AppLogo from '@/components/shared/AppLogo.vue';
</script>

<template>
  <VaLayout class="layout-shell auth-layout">
    <main class="auth-layout__main" :style="{ '--domain-accent': domainShell[DOMAIN.AUTH].accentColor }">
      <AppLogo size="prominent" />
      <h1>{{ domainShell[DOMAIN.AUTH].title }}</h1>
      <router-view />
    </main>
  </VaLayout>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--domain-accent) 10%, transparent), transparent),
    var(--va-background-primary);
}

.auth-layout__main {
  display: grid;
  place-items: center;
  align-content: center;
  min-height: 100vh;
  padding: 1.5rem;
}

.auth-layout__main h1 {
  margin: 1rem 0 1.5rem;
  color: var(--va-text-primary);
  font-size: 1.25rem;
  letter-spacing: 0;
}
</style>
