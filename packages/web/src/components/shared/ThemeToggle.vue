<script setup lang="ts">
/**
 * @package web
 * @name ThemeToggle.vue
 * @version 0.0.1
 * @description Botón reutilizable para alternar entre tema claro y oscuro.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Componente inicial de alternancia de tema.  @antigravity
 */
import { computed, useThemePreference } from '@/bom';

const { isDark, toggleTheme } = useThemePreference();

const iconName = computed(() => (isDark.value ? 'light_mode' : 'dark_mode'));
const label = computed(() => (isDark.value ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'));
</script>

<template>
  <VaButton
    preset="primary"
    color="primary"
    round
    :aria-label="label"
    :title="label"
    class="theme-toggle"
    data-testid="theme-toggle"
    hover-behavior="opacity"
    hover-opacity="0.2"
    @click="toggleTheme"
  >
    <VaIcon :name="iconName" data-testid="theme-icon" />
  </VaButton>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
</style>
