<script setup lang="ts">
/**
 * @package web
 * @name SiteDemoPage.vue
 * @version 0.0.1
 * @description Muestra tokens, componentes y estructuras de layout del sistema visual PUIntegra.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Página showcase inicial del sistema visual.  @antigravity
 */
import {
  computed,
  darkThemeColors,
  domainLabels,
  domainShell,
  domainValues,
  lightThemeColors,
  useThemePreference
} from '@/bom';

const { isDark } = useThemePreference();

const palette = computed(() => (isDark.value ? darkThemeColors : lightThemeColors));

const paletteTokenNames = [
  'primary',
  'secondary',
  'success',
  'accent',
  'info',
  'warning',
  'danger',
  'backgroundPrimary',
  'backgroundSecondary',
  'backgroundCardPrimary',
  'textPrimary',
  'textInverted'
] as const;

const colorTokens = computed(() =>
  paletteTokenNames.map((token) => {
    const kebabToken = token.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    return {
      token,
      cssVariable: `--va-${kebabToken}`,
      value: palette.value[token]
    };
  })
);

const layoutRows = domainValues.map((domain) => ({
  domain,
  label: domainLabels[domain],
  accentColor: domainShell[domain].accentColor,
  structure: domainShell[domain].structure
}));
</script>

<template>
  <section class="design-demo">
    <header class="design-demo__header">
      <p class="design-demo__eyebrow">Sistema visual</p>
      <h1>PUIntegra</h1>
      <p>Tokens de marca, componentes base y estructuras por dominio.</p>
    </header>

    <section class="design-demo__section">
      <h2>Paleta activa</h2>
      <div class="design-demo__swatches">
        <article v-for="color in colorTokens" :key="color.token" class="design-demo__swatch">
          <span class="design-demo__color" :style="{ background: color.value }" />
          <strong>{{ color.token }}</strong>
          <code>{{ color.value }}</code>
          <small>{{ color.cssVariable }}</small>
        </article>
      </div>
    </section>

    <section class="design-demo__section">
      <h2>Tipografía</h2>
      <div class="design-demo__type">
        <h1>Heading 1 operativo</h1>
        <h2>Heading 2 institucional</h2>
        <h3>Heading 3 de sección</h3>
        <p>Texto base para contenido de producto, tablas de operación y formularios.</p>
        <small>Texto auxiliar para estados, hints y metadatos.</small>
      </div>
    </section>

    <section class="design-demo__section">
      <h2>Componentes</h2>
      <div class="design-demo__components">
        <VaButton color="primary">Acción primaria</VaButton>
        <VaButton preset="secondary" color="secondary">Acción secundaria</VaButton>
        <VaChip color="success">Integración lista</VaChip>
        <VaAlert color="info" outline>Estado informativo de operación.</VaAlert>
        <VaInput label="RFC" placeholder="XAXX010101000" />
        <div class="design-demo__progress">
          <span>Progreso de sincronización</span>
          <VaProgressBar :model-value="72" color="success" rounded />
        </div>
      </div>
    </section>

    <section class="design-demo__section">
      <h2>Layouts</h2>
      <div class="design-demo__layouts">
        <article v-for="layout in layoutRows" :key="layout.domain" class="design-demo__layout">
          <span :style="{ background: layout.accentColor }" />
          <strong>{{ layout.label }}</strong>
          <code>{{ layout.accentColor }}</code>
          <p>{{ layout.structure }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.design-demo {
  display: grid;
  gap: 2rem;
  width: min(76rem, 100%);
  margin: 0 auto;
}

.design-demo__header {
  display: grid;
  gap: 0.5rem;
  padding: 2rem 0 1rem;
}

.design-demo__eyebrow {
  margin: 0;
  color: var(--va-success);
  font-weight: 800;
}

.design-demo h1,
.design-demo h2,
.design-demo h3,
.design-demo p {
  letter-spacing: 0;
}

.design-demo__header h1 {
  margin: 0;
  color: var(--va-primary);
  font-size: clamp(2rem, 7vw, 4rem);
  line-height: 1;
}

.design-demo__section {
  display: grid;
  gap: 1rem;
}

.design-demo__swatches,
.design-demo__layouts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
}

.design-demo__swatch,
.design-demo__layout {
  display: grid;
  gap: 0.35rem;
  min-height: 9rem;
  border: 1px solid var(--va-background-border);
  border-radius: 8px;
  padding: 1rem;
  background: var(--va-background-secondary);
}

.design-demo__color,
.design-demo__layout span {
  width: 100%;
  height: 2.25rem;
  border: 1px solid var(--va-background-border);
  border-radius: 6px;
}

.design-demo__type,
.design-demo__components {
  display: grid;
  gap: 0.75rem;
  border: 1px solid var(--va-background-border);
  border-radius: 8px;
  padding: 1rem;
  background: var(--va-background-secondary);
}

.design-demo__progress {
  display: grid;
  gap: 0.35rem;
}
</style>
