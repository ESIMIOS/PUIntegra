<script setup lang="ts">
/**
 * @package web
 * @name SiteLayout.vue
 * @version 0.0.1
 * @description Layout del dominio público `/site` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import AppLogo from '@/components/shared/AppLogo.vue';
import AppFooter from '@/components/shared/AppFooter.vue';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';

const siteLinks = [
  {
    label: 'Inicio',
    to: '/site/home'
  },
  {
    label: 'Demo',
    to: '/site/demo'
  }
];
</script>

<template>
  <VaLayout class="layout-shell site-layout">
    <template #top>
      <VaNavbar class="site-layout__navbar" color="backgroundSecondary" fixed>
        <template #left>
          <RouterLink class="site-layout__identity" to="/site/home">
            <AppLogo />
          </RouterLink>
        </template>
        <template #center>
          <nav class="site-layout__navigation" aria-label="Navegación pública">
            <RouterLink
              v-for="link in siteLinks"
              :key="link.to"
              class="site-layout__link"
              :to="link.to"
            >
              {{ link.label }}
            </RouterLink>
          </nav>
        </template>
        <template #right>
          <div class="site-layout__actions">
            <VaButton color="primary" to="/auth/login">Ingresar</VaButton>
            <ThemeToggle />
          </div>
        </template>
      </VaNavbar>
    </template>
    <main class="site-layout__main">
      <router-view />
    </main>
    <AppFooter />
  </VaLayout>
</template>

<style scoped>
.site-layout {
  --site-layout-footer-height: 3.5rem;
  --site-layout-header-height: 4.0625rem;
  min-height: 100vh;
  background: var(--va-background-primary);
}

.site-layout__navbar {
  z-index: 900;
  border-bottom: 1px solid var(--va-background-border);
  box-shadow: 0 4px 18px rgba(11, 31, 76, 0.08);
}

.site-layout__identity,
.site-layout__link {
  color: var(--va-text-primary);
  text-decoration: none;
}

.site-layout__navigation {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.site-layout__actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.site-layout__link {
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  border-bottom: 3px solid transparent;
  font-weight: 600;
}

.site-layout__link.router-link-active,
.site-layout__link.router-link-exact-active {
  border-bottom-color: var(--va-primary);
}

.site-layout__main {
  box-sizing: border-box;
  min-height: calc(100vh - var(--site-layout-footer-height));
  padding: calc(var(--site-layout-header-height) + clamp(1rem, 2vw, 2rem)) clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem);
}
</style>
