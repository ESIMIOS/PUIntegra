<script setup lang="ts">
/**
 * @package web
 * @name AuthLoginPage.vue
 * @version 0.0.2
 * @description Implementa login mock con validación de credenciales, bloqueo temporal y selección explícita de contexto.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-15)	Se reemplaza placeholder por flujo completo de login autenticado mock.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { SystemMessage } from '@shared';
import { RoleSchema } from '@shared';
import { z } from 'zod';
import { MOCK_AUTH_ERROR_KIND } from '@/mock/auth/mockAuthService';
import { isMockDataError, MOCK_DATA_ERROR_KIND, type MockDataErrorKind } from '@/mock/errors/mockDataError';
import { logSystemMessageError } from '@/shared/logging/systemLogger';
import { systemMessageTree } from '@/shared/constants/systemMessages';
import { useAuthSession } from '@/composables/useAuthSession';
import { resolvePreferredAuthenticatedPath } from '@/router/authLanding';

const router = useRouter();
const route = useRoute();
const { authStore, establishLoginContext } = useAuthSession();

const email = ref('admin@example.test');
const password = ref('Puintegra123!');
const submitting = ref(false);
const errorMessage = ref<string | null>(null);
const errorDisplayMode = ref<'alert' | 'field'>('alert');
const lockoutSeconds = ref(0);
const contextRole = ref<z.infer<typeof RoleSchema> | null>(null);
const contextRfc = ref<string | null>(null);
const showLogoutConfirm = ref(false);

const hasPendingLogin = computed(() => !!authStore.pendingLogin);
const contextOptions = computed(() =>
  (authStore.pendingLogin?.contexts ?? []).map((context) => ({
    text: `${context.role} · ${context.rfc}`,
    value: `${context.role}::${context.rfc}`
  }))
);
const contextValue = computed({
  get() {
    if (!contextRole.value || !contextRfc.value) {
      return null;
    }
    return `${contextRole.value}::${contextRfc.value}`;
  },
  set(value: string | null) {
    if (!value) {
      contextRole.value = null;
      contextRfc.value = null;
      return;
    }
    const [role, rfc] = value.split('::');
    const parsedRole = RoleSchema.safeParse(role);
    if (!parsedRole.success || !rfc) {
      contextRole.value = null;
      contextRfc.value = null;
      return;
    }
    contextRole.value = parsedRole.data;
    contextRfc.value = rfc;
  }
});

function resetContextSelection() {
  contextRole.value = null;
  contextRfc.value = null;
}

function formatUiError(input: { code: string; message: string }) {
  return `${input.code}: ${input.message}`;
}

function setFieldError(message: string) {
  errorDisplayMode.value = 'field';
  errorMessage.value = message;
}

function setAlertError(message: string) {
  errorDisplayMode.value = 'alert';
  errorMessage.value = message;
}

const dataSystemMessageByKind: Record<MockDataErrorKind, SystemMessage> = {
  [MOCK_DATA_ERROR_KIND.VALIDATION]: systemMessageTree.shared.data.mock.validationFailed,
  [MOCK_DATA_ERROR_KIND.NOT_FOUND]: systemMessageTree.shared.data.mock.notFound,
  [MOCK_DATA_ERROR_KIND.CONFLICT]: systemMessageTree.shared.data.mock.conflictDetected,
  [MOCK_DATA_ERROR_KIND.FORBIDDEN]: systemMessageTree.shared.data.mock.forbiddenOperation,
  [MOCK_DATA_ERROR_KIND.STORAGE]: systemMessageTree.shared.data.mock.unknownFailure,
  [MOCK_DATA_ERROR_KIND.SERVER_ERROR]: systemMessageTree.shared.data.mock.unknownFailure,
  [MOCK_DATA_ERROR_KIND.UNKNOWN]: systemMessageTree.shared.data.mock.unknownFailure
};

function resolveDataSystemMessage(kind: MockDataErrorKind) {
  return dataSystemMessageByKind[kind] ?? systemMessageTree.shared.data.mock.unknownFailure;
}

async function handleValidateCredentials() {
  errorMessage.value = null;
  errorDisplayMode.value = 'alert';
  lockoutSeconds.value = 0;
  submitting.value = true;
  authStore.setPendingLogin(null);
  resetContextSelection();

  const emailCandidate = email.value.trim().toLowerCase();
  if (!emailCandidate || !emailCandidate.includes('@')) {
    setFieldError(formatUiError(systemMessageTree.web.ui.data.validation));
    submitting.value = false;
    return;
  }
  if (!password.value.trim()) {
    setFieldError(formatUiError(systemMessageTree.web.ui.data.validation));
    submitting.value = false;
    return;
  }

  try {
    const loginResult = await authStore.validateCredentials(emailCandidate, password.value);
    if (loginResult.contexts.length === 1) {
      contextRole.value = loginResult.contexts[0].role;
      contextRfc.value = loginResult.contexts[0].rfc;
    }
  } catch (error) {
    const parsed = authStore.pendingLogin;
    if (parsed) {
      authStore.setPendingLogin(null);
    }

    const authError = error as { kind?: string; code?: string; message?: string; uiMessage?: string; remainingSeconds?: number };
    if (
      authError.kind === MOCK_AUTH_ERROR_KIND.THROTHLED ||
      authError.kind === MOCK_AUTH_ERROR_KIND.NO_PERMISSIONS ||
      authError.kind === MOCK_AUTH_ERROR_KIND.INVALID_CREDENTIALS
    ) {
      const userMessage = authError.uiMessage ?? authError.message ?? systemMessageTree.shared.auth.login.invalidCredentialsAttempt.message;
      setAlertError(`${authError.code ?? 'AUTH-LOGIN-000'}: ${userMessage}`);
      lockoutSeconds.value =
        authError.kind === MOCK_AUTH_ERROR_KIND.THROTHLED && !authError.uiMessage
          ? authError.remainingSeconds ?? 0
          : 0;
      return;
    }

    if (isMockDataError(error)) {
      const dataMessage = resolveDataSystemMessage(error.kind);
      logSystemMessageError(dataMessage, error, {
        operation: 'authLogin.validateCredentials',
        errorKind: error.kind
      });
      setAlertError(formatUiError(dataMessage));
      return;
    }

    setAlertError(formatUiError(systemMessageTree.shared.data.mock.unknownFailure));
  } finally {
    submitting.value = false;
  }
}

function handleLogout() {
  authStore.logout();
  showLogoutConfirm.value = false;
}

async function handleContinue() {
  errorMessage.value = null;
  errorDisplayMode.value = 'alert';
  if (!hasPendingLogin.value) {
    setAlertError(formatUiError(systemMessageTree.web.ui.data.validation));
    return;
  }
  if (!contextRole.value || !contextRfc.value) {
    setAlertError(formatUiError(systemMessageTree.web.ui.auth.contextRequired));
    return;
  }

  submitting.value = true;
  try {
    const defaultPath = await establishLoginContext({
      role: contextRole.value,
      rfc: contextRfc.value
    });
    const redirectPath = resolvePreferredAuthenticatedPath({
      activeRole: authStore.activeRole,
      requiresSecuritySetup: authStore.requiresSecuritySetup,
      activeRfc: contextRfc.value,
      redirectTarget: route.query.redirect
    });
    await router.push(redirectPath || defaultPath);
  } catch (error) {
    const rawMessage = (error as { message?: string }).message;
    setAlertError(rawMessage
      ? `${systemMessageTree.shared.data.mock.unknownFailure.code}: ${rawMessage}`
      : formatUiError(systemMessageTree.shared.data.mock.unknownFailure));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <VaCard class="w-full">
    <VaCardContent>
      <VaCardTitle>
        {{ authStore.pendingLogin ? 'Seleccionar contexto' : 'Iniciar Sesión' }}
      </VaCardTitle>

      <form v-if="!authStore.pendingLogin" class="grid gap-3 text-left mt-4" @submit.prevent="handleValidateCredentials">
        <VaInput
          v-model="email"
          label="Correo electrónico"
          placeholder="admin@puintegra.app"
          type="email"
          required
          :error="!!errorMessage && errorDisplayMode === 'field'"
          :error-messages="errorMessage && errorDisplayMode === 'field' ? [errorMessage] : []"
          data-testid="auth-login-email"
        />
        <VaInput
          v-model="password"
          label="Contraseña"
          placeholder="********"
          type="password"
          required
          :error="!!errorMessage && errorDisplayMode === 'field'"
          data-testid="auth-login-password"
        />
        <VaAlert v-if="errorMessage && errorDisplayMode === 'alert'" color="danger" icon="warning" dense>
          {{ errorMessage }}
          <span v-if="lockoutSeconds > 0"> ({{ lockoutSeconds }}s)</span>
        </VaAlert>
        <VaButton type="submit" :loading="submitting" :disabled="submitting">
          Iniciar Sesión
        </VaButton>
      </form>

      <form v-else class="grid gap-3 text-left mt-4" @submit.prevent="handleContinue">
        <VaDivider />
        <p class="text-[var(--va-secondary)]">Selecciona el contexto con el que deseas continuar.</p>
        <VaSelect
          v-model="contextValue"
          class="w-full"
          :options="contextOptions"
          text-by="text"
          value-by="value"
          track-by="value"
          label=""
          placeholder="Elige un rol e institución"
          data-testid="auth-login-context"
        />
        <VaAlert v-if="errorMessage && errorDisplayMode === 'alert'" color="danger" icon="warning" dense>
          {{ errorMessage }}
        </VaAlert>
        <VaButton type="submit" :loading="submitting" :disabled="submitting || !contextValue">
          Continuar
        </VaButton>
        <VaButton
          preset="secondary"
          color="danger"
          class="mt-2"
          @click="showLogoutConfirm = true"
        >
          Cerrar sesión
        </VaButton>
      </form>
    </VaCardContent>
  </VaCard>

  <VaModal
    v-model="showLogoutConfirm"
    title="Confirmar cierre de sesión"
    color="danger"
    no-outside-dismiss
    hide-default-actions
  >
    <div class="py-2">
      Se perderá el progreso de tu ingreso actual y deberás volver a introducir tus credenciales.
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton preset="secondary" @click="showLogoutConfirm = false">
          Cancelar
        </VaButton>
        <VaButton color="danger" @click="handleLogout">
          Cerrar sesión
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<style scoped>
/* No more custom CSS needed! */
</style>
