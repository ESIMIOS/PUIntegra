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
import { computed } from '@/bom';
import AppFooter from '@/components/shared/AppFooter.vue';
import AppLogo from '@/components/shared/AppLogo.vue';
import HeaderSessionContext from '@/components/shared/HeaderSessionContext.vue';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';
import type { NavigationLink } from '@/shared/constants/navigationCatalog';

const props = defineProps<{
  menuItems: NavigationLink[];
  accentColor: string;
  domainTitle: string;
  chipLabel: string;
  chipValue: string;
  accountName: string;
  accountLabel: string;
  sessionLabel?: string;
  sessionValue?: string;
}>();

const shellStyle = computed(() => ({
  '--domain-accent': props.accentColor
}));
</script>

<template>
  <VaLayout class="dashboard-shell" :style="shellStyle">
    <template #left>
      <VaSidebar
        class="dashboard-shell__sidebar"
        color="backgroundSecondary"
        width="18rem"
      >
        <nav class="dashboard-shell__nav" aria-label="Navegación del dominio">
          <RouterLink
            v-for="item in menuItems"
            :key="item.id"
            class="dashboard-shell__link"
            :class="{ 'dashboard-shell__link--disabled': item.disabled }"
            :to="item.to"
            :aria-disabled="item.disabled"
          >
            <VaSidebarItem :disabled="item.disabled">
              <VaSidebarItemContent>
                <VaIcon class="dashboard-shell__link-icon" :name="item.icon" />
                <VaSidebarItemTitle class="dashboard-shell__link-title">
                  {{ item.label }}
                </VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
          </RouterLink>
        </nav>
      </VaSidebar>
    </template>

    <template #top>
      <VaNavbar class="dashboard-shell__topbar" color="backgroundSecondary" fixed>
        <template #left>
          <RouterLink class="dashboard-shell__identity" to="/site/home" :aria-label="domainTitle">
            <AppLogo />
          </RouterLink>
        </template>
        <template #right>
          <div class="dashboard-shell__right">
            <HeaderSessionContext :account-name="accountName" :account-label="accountLabel">
              <div v-if="sessionLabel && sessionValue" class="dashboard-shell__session-item">
                <span class="dashboard-shell__session-label">{{ sessionLabel }}</span>
                <strong class="dashboard-shell__session-value">{{ sessionValue }}</strong>
              </div>
              <div class="dashboard-shell__session-item">
                <span class="dashboard-shell__session-label">{{ chipLabel }}</span>
                <strong class="dashboard-shell__session-value">{{ chipValue }}</strong>
              </div>
            </HeaderSessionContext>
            <div class="dashboard-shell__actions" aria-label="Acciones">
              <ThemeToggle />
            </div>
          </div>
        </template>
      </VaNavbar>
    </template>

    <main class="dashboard-shell__content">
      <router-view />
    </main>
    <AppFooter />
  </VaLayout>
</template>

<style scoped>
.dashboard-shell {
  --dashboard-shell-footer-height: 3.5rem;
  --dashboard-shell-header-height: 4.25rem;
  min-height: 100vh;
  background: var(--va-background-primary);
}

.dashboard-shell__sidebar {
  box-sizing: border-box;
  padding-top: var(--dashboard-shell-header-height);
  border-right: 1px solid var(--va-background-border);
}

.dashboard-shell__nav {
  display: grid;
  gap: 0.25rem;
  padding: 0.5rem;
}

.dashboard-shell__link {
  color: var(--va-text-primary);
  text-decoration: none;
  border-left: 4px solid transparent;
  border-radius: 6px;
}

.dashboard-shell__link:hover {
  border-left-color: var(--domain-accent);
  background: color-mix(in srgb, var(--domain-accent) 12%, transparent);
}

.dashboard-shell__link--disabled {
  pointer-events: none;
  opacity: 0.45;
}

.dashboard-shell__topbar {
  z-index: 900;
  min-height: var(--dashboard-shell-header-height);
  border-bottom: 1px solid var(--va-background-border);
  box-shadow: 0 4px 18px rgba(11, 31, 76, 0.08);
}

.dashboard-shell__identity {
  display: flex;
  align-items: center;
  min-height: 2.5rem;
  color: var(--va-text-primary);
  text-decoration: none;
}

.dashboard-shell__right,
.dashboard-shell__actions {
  display: flex;
  align-items: center;
}

.dashboard-shell__right {
  gap: 0.85rem;
}

.dashboard-shell__session-item {
  display: grid;
  gap: 0.1rem;
}

.dashboard-shell__session-label {
  color: var(--va-text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  text-transform: uppercase;
}

.dashboard-shell__session-value {
  color: var(--va-text-primary);
  font-size: 0.82rem;
  line-height: 1.15;
}

.dashboard-shell__link-icon {
  margin-right: 0.75rem;
  color: var(--va-primary);
}

.dashboard-shell__link-title {
  min-width: 0;
}

.dashboard-shell__content {
  box-sizing: border-box;
  min-height: calc(100vh - var(--dashboard-shell-footer-height));
  padding: calc(var(--dashboard-shell-header-height) + clamp(1rem, 2vw, 2rem)) clamp(1rem, 2vw, 2rem) clamp(1rem, 2vw, 2rem);
}

@media (max-width: 768px) {
  .dashboard-shell__sidebar {
    width: min(18rem, 86vw) !important;
  }

  .dashboard-shell__right {
    align-items: flex-end;
    flex-direction: column;
  }
}
</style>
