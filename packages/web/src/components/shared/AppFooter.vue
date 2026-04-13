<template>
  <footer class="app-footer">
    <slot>PUIntegra © 2026</slot>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--va-primary);
  min-height: var(--app-footer-height, 3.5rem);
  padding: 1rem clamp(1rem, 2vw, 2rem);
  background: var(--va-primary);
  color: var(--va-text-inverted);
}
</style>
