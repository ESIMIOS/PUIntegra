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
import AppLogo from "@/components/shared/AppLogo.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import ThemeToggle from "@/components/shared/ThemeToggle.vue";

const siteLinks = [
  {
    label: "Inicio",
    to: "/site/home",
  },
  {
    label: "Demo",
    to: "/site/demo",
  },
];
</script>

<template>
  <VaLayout class="layout">
    <template #top>
      <VaNavbar class="layout__navbar" color="backgroundSecondary" fixed>
        <template #left>
          <RouterLink class="" to="/site/home">
            <AppLogo />
          </RouterLink>
        </template>
        <template #center>
          <nav class="flex gap-2" aria-label="Navegación pública">
            <RouterLink v-for="link in siteLinks" :key="link.to" class="layout__link" :to="link.to">
              {{ link.label }}
            </RouterLink>
          </nav>
        </template>
        <template #right>
          <div class="flex gap-2">
            <VaButton color="primary" to="/auth/login">Ingresar</VaButton>
            <ThemeToggle />
          </div>
        </template>
      </VaNavbar>
    </template>
    <main class="layout__main">
      <router-view class="layout__router" />
    </main>
    <AppFooter />
  </VaLayout>
</template>
