<script setup lang="ts">
/**
 * @package web
 * @name AccountLayout.vue
 * @version 0.0.1
 * @description Layout del dominio de cuenta `/account` sin navegación interna en el shell.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { buildNavigationLinks, defaultNavigationContext, DOMAIN, domainShell, routePaths, useAuthStore } from '@/bom';
import AppFooter from '@/components/shared/AppFooter.vue';
import AppLogo from '@/components/shared/AppLogo.vue';
import HeaderSessionContext from '@/components/shared/HeaderSessionContext.vue';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';

const authStore = useAuthStore();
const accountLinks = buildNavigationLinks(DOMAIN.ACCOUNT, defaultNavigationContext);
const returnLinks = [
  {
    id: 'return-app',
    icon: 'dashboard',
    label: 'Volver a app',
    to: routePaths.appInstitutions
  },
  {
    id: 'return-admin',
    icon: 'admin_panel_settings',
    label: 'Volver a admin',
    to: routePaths.adminInstitutions
  }
];
</script>

<template>
  <VaLayout class="layout-shell account-layout" :style="{ '--domain-accent': domainShell[DOMAIN.ACCOUNT].accentColor }">
    <template #top>
      <VaNavbar class="account-layout__navbar" color="backgroundSecondary" fixed>
        <template #left>
          <RouterLink class="account-layout__identity" to="/site/home">
            <AppLogo />
          </RouterLink>
        </template>
        <template #right>
          <div class="account-layout__right">
            <HeaderSessionContext account-name="Pepe Pecas" account-label="user">
              <div class="account-layout__session-item">
                <span class="account-layout__session-label">Rol</span>
                <strong class="account-layout__session-value">{{ authStore.activeRole }}</strong>
              </div>
            </HeaderSessionContext>
            <div class="account-layout__actions">
              <ThemeToggle />
            </div>
          </div>
        </template>
      </VaNavbar>
    </template>
    <template #left>
      <VaSidebar class="account-layout__sidebar" color="backgroundSecondary" width="18rem">
        <nav class="account-layout__sidebar-nav" aria-label="Cuenta">
          <RouterLink
            v-for="link in accountLinks"
            :key="link.id"
            class="account-layout__sidebar-link"
            :class="{ 'account-layout__sidebar-link--disabled': link.disabled }"
            :to="link.to"
            :aria-disabled="link.disabled"
          >
            <VaSidebarItem :disabled="link.disabled">
              <VaSidebarItemContent>
                <VaIcon class="account-layout__sidebar-icon" :name="link.icon" />
                <VaSidebarItemTitle>{{ link.label }}</VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
          </RouterLink>
          <VaDivider />
          <RouterLink
            v-for="link in returnLinks"
            :key="link.id"
            class="account-layout__sidebar-link"
            :to="link.to"
          >
            <VaSidebarItem>
              <VaSidebarItemContent>
                <VaIcon class="account-layout__sidebar-icon" :name="link.icon" />
                <VaSidebarItemTitle>{{ link.label }}</VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
          </RouterLink>
        </nav>
      </VaSidebar>
    </template>
    <main class="account-layout__main">
      <router-view />
    </main>
    <AppFooter />
  </VaLayout>
</template>

<style scoped>
.account-layout {
  --account-layout-footer-height: 3.5rem;
  --account-layout-header-height: 4.0625rem;
  min-height: 100vh;
  background: var(--va-background-primary);
}

.account-layout__navbar {
  z-index: 900;
  min-height: var(--account-layout-header-height);
  border-bottom: 1px solid var(--va-background-border);
  box-shadow: 0 4px 18px rgba(11, 31, 76, 0.08);
}

.account-layout__identity,
.account-layout__right,
.account-layout__actions {
  display: flex;
  align-items: center;
}

.account-layout__right,
.account-layout__actions {
  gap: 0.85rem;
}

.account-layout__identity {
  color: var(--va-text-primary);
  text-decoration: none;
}

.account-layout__sidebar {
  box-sizing: border-box;
  padding-top: var(--account-layout-header-height);
  border-right: 1px solid var(--va-background-border);
}

.account-layout__sidebar-nav {
  display: grid;
  gap: 0.25rem;
  padding: 0.5rem;
}

.account-layout__sidebar-link {
  color: var(--va-text-primary);
  text-decoration: none;
  border-left: 4px solid transparent;
  border-radius: 6px;
}

.account-layout__sidebar-link:hover {
  border-left-color: var(--va-primary);
  background: color-mix(in srgb, var(--va-primary) 10%, transparent);
}

.account-layout__sidebar-link--disabled {
  pointer-events: none;
  opacity: 0.45;
}

.account-layout__sidebar-icon {
  margin-right: 0.75rem;
  color: var(--va-primary);
}

.account-layout__session-item {
  display: grid;
  gap: 0.1rem;
}

.account-layout__session-label {
  color: var(--va-text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
}

.account-layout__session-value {
  color: var(--va-text-primary);
  font-size: 0.82rem;
  line-height: 1.15;
}

.account-layout__main {
  box-sizing: border-box;
  width: min(72rem, 100%);
  min-height: calc(100vh - var(--account-layout-footer-height));
  margin: 0 auto;
  padding: calc(var(--account-layout-header-height) + clamp(1rem, 2vw, 2rem)) clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem);
}

@media (max-width: 768px) {
  .account-layout__right {
    align-items: flex-end;
    flex-direction: column;
  }
}

</style>
