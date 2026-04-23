<script setup lang="ts">
/**
 * @package web
 * @name DashboardShell.vue
 * @version 0.0.1
 * @description Shell dashboard compartido con sidebar persistente, barra superior y contenido de router.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Shell inicial para dominios app y admin.  @antigravity
 */
import AppFooter from "@/components/shared/AppFooter.vue";
import AppLogo from "@/components/shared/AppLogo.vue";
import HeaderSessionContext from "@/components/shared/HeaderSessionContext.vue";
import ThemeToggle from "@/components/shared/ThemeToggle.vue";
import type { NavigationLink } from "@/shared/constants/navigationCatalog";

defineProps<{
  menuItems: NavigationLink[];
  domainTitle: string;
  returnItems?: NavigationLink[];
}>();
</script>

<template>
  <VaLayout class="layout">
    <template #left>
      <VaSidebar class="layout__sidebar">
        <nav class="grid gap-1" aria-label="Navegación del dominio">
          <RouterLink
            v-for="item in menuItems"
            :key="item.id"
            class="dashboard-layout__sidebar__link"
            :class="{ 'layout__sidebar__link--disabled': item.disabled }"
            :to="item.to"
            :aria-disabled="item.disabled"
          >
            <VaSidebarItem :disabled="item.disabled">
              <VaSidebarItemContent>
                <VaIcon :name="item.icon" />
                <VaSidebarItemTitle>
                  {{ item.label }}
                </VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
          </RouterLink>
          <template v-if="returnItems && returnItems.length">
            <VaDivider class="my-2" />
            <RouterLink
              v-for="item in returnItems"
              :key="item.id"
              class="dashboard-layout__sidebar__link"
              :to="item.to"
            >
              <VaSidebarItem>
                <VaSidebarItemContent>
                  <VaIcon :name="item.icon" />
                  <VaSidebarItemTitle>
                    {{ item.label }}
                  </VaSidebarItemTitle>
                </VaSidebarItemContent>
              </VaSidebarItem>
            </RouterLink>
          </template>
        </nav>
      </VaSidebar>
    </template>
    <template #top>
      <VaNavbar class="layout__navbar" color="backgroundSecondary" fixed>
        <template #left>
          <RouterLink class="" to="/site/home">
            <AppLogo />
          </RouterLink>
        </template>
        <template #right>
          <div class="flex align-center gap-2" aria-label="Navegación de usuario">
            <HeaderSessionContext />
            <div class="flex" aria-label="Acciones">
              <ThemeToggle />
            </div>
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
