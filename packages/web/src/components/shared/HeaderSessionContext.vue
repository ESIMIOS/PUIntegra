<script setup lang="ts">
/**
 * @package web
 * @name HeaderSessionContext.vue
 * @version 0.0.2
 * @description Muestra identidad y contexto de sesión real con menú de cuenta y selector de contextos disponibles.
 * @author @antigravity
 * @changelog
 * - 0.0.2	(2026-04-15)	Se vuelve componente standalone con menú, logout confirmado y cambio de contexto.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-12)	Contexto visual de sesión para headers autenticados.	@antigravity
 */

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RoleSchema } from '@shared';
import { routePaths } from '@/shared/constants/routePaths';
import { useAuthSession } from '@/composables/useAuthSession';

const router = useRouter();
const { authStore, applyContext } = useAuthSession();

const showAccountMenu = ref(false);
const showLogoutModal = ref(false);
const showContextModal = ref(false);
const switchingContext = ref(false);
const selectedContextValue = ref<string | null>(null);

const displayName = computed(() => authStore.name ?? 'Sin nombre');
const displayEmail = computed(() => authStore.email ?? 'Sin correo');
const displayRole = computed(() => authStore.activeRole);
const displayRfc = computed(() => authStore.activeContext?.rfc ?? '');
const displayIcon = computed(() => authStore.emojiIcon || 'person');
const contextOptions = computed(() =>
  authStore.availableContexts.map((context) => ({
    text: `${context.role} · ${context.rfc}`,
    value: `${context.role}::${context.rfc}`
  }))
);

async function goToAccountSettings() {
  showAccountMenu.value = false;
  await router.push(routePaths.accountSettings);
}

async function goToAccountLogs() {
  showAccountMenu.value = false;
  await router.push(routePaths.accountLogs);
}

async function confirmLogout() {
  showLogoutModal.value = false;
  showAccountMenu.value = false;
  await router.push(routePaths.authLogout);
}

function parseSelectedContext(value: string | null) {
  if (!value) {
    return null;
  }
  const [role, rfc] = value.split('::');
  if (!role || !rfc) {
    return null;
  }
  const parsedRole = RoleSchema.safeParse(role);
  if (!parsedRole.success) {
    return null;
  }
  return { role: parsedRole.data, rfc };
}

async function applySelectedContext() {
  const parsed = parseSelectedContext(selectedContextValue.value);
  if (!parsed) {
    return;
  }
  switchingContext.value = true;
  try {
    const path = await applyContext(parsed);
    showContextModal.value = false;
    await router.push(path);
  } finally {
    switchingContext.value = false;
  }
}
</script>

<template>
  <aside class="header-session-context" aria-label="Contexto de sesión">
    <VaMenu v-model="showAccountMenu">
      <template #anchor>
        <button
          class="header-session-context__identity-trigger"
          type="button"
          aria-label="Abrir menú de cuenta"
        >
          <VaAvatar class="header-session-context__avatar" color="primary" size="small">
            <span v-if="authStore.emojiIcon">{{ authStore.emojiIcon }}</span>
            <VaIcon v-else :name="displayIcon" />
          </VaAvatar>
          <div class="header-session-context__account">
            <strong class="header-session-context__name">{{ displayName }}</strong>
            <span class="header-session-context__label">{{ displayEmail }}</span>
          </div>
        </button>
      </template>
      <VaList>
        <VaListItem @click="goToAccountSettings">Cuenta: ajustes</VaListItem>
        <VaListItem @click="goToAccountLogs">Cuenta: logs</VaListItem>
        <VaListItem @click="showLogoutModal = true">Cerrar sesión</VaListItem>
      </VaList>
    </VaMenu>

    <button
      class="header-session-context__context-trigger"
      type="button"
      aria-label="Cambiar contexto de rol y RFC"
      @click="showContextModal = true"
    >
      <span class="header-session-context__context-label">Rol</span>
      <strong class="header-session-context__context-value">{{ displayRole }}</strong>
      <span class="header-session-context__context-label">RFC</span>
      <strong class="header-session-context__context-value">{{ displayRfc }}</strong>
    </button>
  </aside>

  <VaModal
    v-model="showLogoutModal"
    title="Confirmar cierre de sesión"
    hide-default-actions
    max-width="28rem"
  >
    <p>¿Deseas cerrar la sesión actual?</p>
    <template #footer>
      <div class="header-session-context__modal-actions">
        <VaButton preset="secondary" @click="showLogoutModal = false">
          Cancelar
        </VaButton>
        <VaButton color="danger" @click="confirmLogout">
          Cerrar sesión
        </VaButton>
      </div>
    </template>
  </VaModal>

  <VaModal
    v-model="showContextModal"
    title="Seleccionar contexto"
    hide-default-actions
    max-width="28rem"
  >
    <VaSelect
      v-model="selectedContextValue"
      :options="contextOptions"
      text-by="text"
      value-by="value"
      track-by="value"
      label="Contexto disponible"
    />
    <template #footer>
      <div class="header-session-context__modal-actions">
        <VaButton preset="secondary" @click="showContextModal = false">
          Cancelar
        </VaButton>
        <VaButton :disabled="!selectedContextValue" :loading="switchingContext" @click="applySelectedContext">
          Aplicar contexto
        </VaButton>
      </div>
    </template>
  </VaModal>
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

.header-session-context__identity-trigger,
.header-session-context__context-trigger {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: inherit;
}

.header-session-context__avatar {
  flex: 0 0 auto;
}

.header-session-context__account {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
  text-align: left;
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

.header-session-context__context-trigger {
  display: grid;
  gap: 0.1rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--va-background-border);
  text-align: left;
}

.header-session-context__context-label {
  color: var(--va-text-secondary);
  font-size: 0.7rem;
  line-height: 1;
  text-transform: uppercase;
}

.header-session-context__context-value {
  color: var(--va-text-primary);
  font-size: 0.82rem;
  line-height: 1.15;
}

.header-session-context__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

@media (max-width: 768px) {
  .header-session-context {
    align-items: stretch;
    flex-direction: column;
  }

  .header-session-context__context-trigger {
    padding-left: 0;
    border-left: 0;
  }
}
</style>
