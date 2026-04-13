<script setup lang="ts">
/**
 * @package web
 * @name HeaderSessionContext.vue
 * @version 0.0.1
 * @description Muestra identidad de cuenta y contexto activo dentro de encabezados autenticados.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Contexto visual de sesión para headers autenticados.  @antigravity
 */
defineProps({
  accountLabel: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  }
});
</script>

<template>
  <aside class="header-session-context" aria-label="Contexto de sesión">
    <VaAvatar class="header-session-context__avatar" color="primary" size="small">
      <VaIcon name="person" />
    </VaAvatar>
    <div class="header-session-context__account">
      <strong class="header-session-context__name">{{ accountName }}</strong>
      <span class="header-session-context__label">{{ accountLabel }}</span>
    </div>
    <div class="header-session-context__details">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.header-session-context {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--va-background-border);
  border-radius: 6px;
  background: var(--va-background-primary);
}

.header-session-context__avatar {
  flex: 0 0 auto;
}

.header-session-context__account {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.header-session-context__name {
  color: var(--va-text-primary);
  font-size: 0.92rem;
  line-height: 1.1;
  white-space: nowrap;
}

.header-session-context__label {
  color: var(--va-text-secondary);
  font-size: 0.78rem;
  line-height: 1.1;
}

.header-session-context__details {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--va-background-border);
}

@media (max-width: 768px) {
  .header-session-context {
    align-items: flex-end;
    flex-direction: column;
  }

  .header-session-context__details {
    align-items: flex-end;
    flex-direction: column;
    padding-left: 0;
    border-left: 0;
  }
}
</style>
