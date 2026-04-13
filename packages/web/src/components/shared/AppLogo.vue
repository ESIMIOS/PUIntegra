<script setup lang="ts">
/**
 * @package web
 * @name AppLogo.vue
 * @version 0.0.1
 * @description Renderiza el logotipo de PUIntegra según tema y modo visual.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Componente inicial del logotipo de aplicación.  @antigravity
 */
import { computed, useThemePreference } from '@/bom';

const props = defineProps({
  mode: {
    type: String,
    default: 'full',
    validator: (value: unknown) => value === 'full' || value === 'icon'
  },
  size: {
    type: String,
    default: 'compact',
    validator: (value: unknown) => value === 'compact' || value === 'prominent'
  }
});

const { isDark } = useThemePreference();

const imageSource = computed(() => {
  const themeSuffix = isDark.value ? 'dark' : 'light';
  const assetName = props.mode === 'icon' ? 'puintegra-icon' : 'puintegra-logo';

  return `/img/${assetName}-${themeSuffix}.svg`;
});
</script>

<template>
  <span class="app-logo" :class="[`app-logo--${mode}`, `app-logo--${size}`]">
    <img class="app-logo__image" :src="imageSource" alt="PUIntegra">
  </span>
</template>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.app-logo__image {
  display: block;
  max-width: 100%;
}

.app-logo--full.app-logo--compact .app-logo__image {
  width: 10rem;
  height: auto;
}

.app-logo--full.app-logo--prominent .app-logo__image {
  width: min(18rem, 70vw);
  height: auto;
}

.app-logo--icon.app-logo--compact .app-logo__image {
  width: 2.25rem;
  height: 2.25rem;
}

.app-logo--icon.app-logo--prominent .app-logo__image {
  width: 5rem;
  height: 5rem;
}
</style>
