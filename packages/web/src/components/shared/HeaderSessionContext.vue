<script setup lang="ts">
/**
 * @package web
 * @name HeaderSessionContext.vue
 * @version 0.0.3
 * @description Muestra identidad y contexto de sesión real con menú de cuenta y selector de contextos disponibles.
 * @author @antigravity
 * @changelog
 * - 0.0.4	(2026-04-21)	Corrección de estilos para mejor visualización de menu de usuario.	@tirsomartinezreyes
 * - 0.0.3	(2026-04-19)	Reutiliza modal compartido para cambio de contexto.	@codex
 * - 0.0.2	(2026-04-15)	Se vuelve componente standalone con menú, logout confirmado y cambio de contexto.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-12)	Contexto visual de sesión para headers autenticados.	@antigravity
 */

import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { RoleSchema } from "@shared";
import { z } from "zod";
import { routePaths } from "@/shared/constants/routePaths";
import { useAuthSession } from "@/composables/useAuthSession";
import SessionContextModal from "@/components/shared/SessionContextModal.vue";

const router = useRouter();
const { authStore, applyContext } = useAuthSession();

const showAccountMenu = ref(false);
const showLogoutModal = ref(false);
const showContextModal = ref(false);
const switchingContext = ref(false);

const displayName = computed(() => authStore.name ?? "Sin nombre");
const displayEmail = computed(() => authStore.email ?? "Sin correo");
const displayRole = computed(() => authStore.activeRole);
const displayRfc = computed(() => authStore.activeContext?.rfc ?? "");
const displayIcon = computed(() => authStore.emojiIcon || "person");

async function goToAccountSettings() {
  showAccountMenu.value = false;
  await router.push(routePaths.accountSettings);
}

async function goToAccountInstitutions() {
  showAccountMenu.value = false;
  await router.push(routePaths.accountInstitutions);
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

async function applySelectedContext(context: { role: z.infer<typeof RoleSchema>; rfc: string }) {
  switchingContext.value = true;
  try {
    const path = await applyContext(context);
    showContextModal.value = false;
    await router.push(path);
  } finally {
    switchingContext.value = false;
  }
}
</script>

<template>
  <aside class="header-session-context" aria-label="Contexto de sesión">
    <VaDropdown>
      <template #anchor>
        <button class="header-session-context__identity-trigger" type="button" aria-label="Abrir menú de cuenta">
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
      <VaDropdownContent class="mt-3">
        <VaList>
          <VaListLabel>Cuenta</VaListLabel>
          <VaListItem class="cp" @click="goToAccountInstitutions">
            <VaListItemSection icon class="mr0 ml0">
              <VaIcon name="account_balance" />
            </VaListItemSection>
            <VaListItemSection>
              <VaListItemLabel>Instituciones</VaListItemLabel>
            </VaListItemSection>
          </VaListItem>
          <VaListItem class="cp" @click="goToAccountSettings">
            <VaListItemSection icon class="mr0 ml0">
              <VaIcon name="manage_accounts" />
            </VaListItemSection>
            <VaListItemSection>
              <VaListItemLabel>Configuración</VaListItemLabel>
            </VaListItemSection>
          </VaListItem>
          <VaListItem class="cp" @click="goToAccountLogs">
            <VaListItemSection icon class="mr0 ml0">
              <VaIcon name="receipt_long" />
            </VaListItemSection>
            <VaListItemSection>
              <VaListItemLabel>Logs</VaListItemLabel>
            </VaListItemSection>
          </VaListItem>

          <VaListSeparator class="" />
          <VaListItem class="cp" @click="showLogoutModal = true">
            <VaListItemSection icon class="mr0 ml0">
              <VaIcon name="logout" />
            </VaListItemSection>
            <VaListItemSection>
              <VaListItemLabel>Cerrar sesión</VaListItemLabel>
            </VaListItemSection>
          </VaListItem>
        </VaList>
      </VaDropdownContent>
    </VaDropdown>

    <button
      class="header-session-context__context-trigger"
      type="button"
      aria-label="Cambiar contexto de rol y RFC"
      @click="authStore.availableContexts.length > 1 && !switchingContext ? (showContextModal = true) : null"
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
    color="danger"
    hide-default-actions
    max-width="28rem"
    no-outside-dismiss
  >
    <p>¿Deseas cerrar la sesión actual?</p>
    <template #footer>
      <div class="header-session-context__modal-actions">
        <VaButton preset="secondary" @click="showLogoutModal = false">Cancelar</VaButton>
        <VaButton color="danger" @click="confirmLogout">Cerrar sesión</VaButton>
      </div>
    </template>
  </VaModal>

  <SessionContextModal
    v-model="showContextModal"
    :contexts="authStore.availableContexts"
    :initial-context="authStore.activeContext"
    :loading="switchingContext"
    confirm-text="Aplicar contexto"
    @confirm="applySelectedContext"
  />
</template>

<style scoped>

.va-list-item-label {
  color: var(--va-text-primary);
}
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
