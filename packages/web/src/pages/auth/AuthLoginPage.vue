<script setup lang="ts">
/**
 * @package web
 * @name AuthLoginPage.vue
 * @version 0.0.5
 * @description Implementa login Firebase con validación de credenciales y selección explícita de contexto.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.5	(2026-04-20)	Autoaplica el único contexto disponible y omite el modal de selección.	@codex
 * - 0.0.4	(2026-04-19)	Extrae selección de contexto a modal compartido y mantiene cierre de sesión confirmado.	@codex
 * - 0.0.3	(2026-04-19)	Mueve la redirección de sesión existente a una verificación no bloqueante.	@codex
 * - 0.0.2	(2026-04-15)	Se reemplaza placeholder por flujo completo de login autenticado.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RoleSchema, formatUiErrorString } from '@shared';
import { z } from 'zod';
import { systemMessageTree } from '@/shared/constants/systemMessages';
import { useAuthSession } from '@/composables/useAuthSession';
import { resolvePreferredAuthenticatedPath } from '@/router/authLanding';
import { hasSavedContext } from '@/gateways/firebaseAuthGateway';
import { routePaths } from '@/shared/constants/routePaths';
import SessionContextModal from '@/components/shared/SessionContextModal.vue';

const router = useRouter();
const route = useRoute();
const { authStore, activeRfc, ensureHydratedSession, establishLoginContext } = useAuthSession();

const email = ref('admin@example.test');
const password = ref('local-password');
const submitting = ref(false);
const errorMessage = ref<string | null>(null);
const errorDisplayMode = ref<'alert' | 'field'>('alert');
const showContextModal = ref(false);
const manualLoginStarted = ref(false);
const redirectAttemptId = ref(0);

const hasPendingLogin = computed(() => !!authStore.pendingLogin);

function setFieldError(message: string) {
  errorDisplayMode.value = 'field';
  errorMessage.value = message;
}

function setAlertError(message: string) {
  errorDisplayMode.value = 'alert';
  errorMessage.value = message;
}

function isUnverifiedEmailError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'AUTH-LOGIN-006';
}

function resetValidateCredentialsState() {
  manualLoginStarted.value = true;
  redirectAttemptId.value += 1;
  errorMessage.value = null;
  errorDisplayMode.value = 'alert';
  submitting.value = true;
  authStore.setPendingLogin(null);
  showContextModal.value = false;
}

function hasValidCredentialsInput(emailCandidate: string) {
  const validationError = formatUiErrorString(systemMessageTree.web.ui.data.validation);
  if (!emailCandidate || !emailCandidate.includes('@')) {
    setFieldError(validationError);
    submitting.value = false;
    return false;
  }

  if (!password.value.trim()) {
    setFieldError(validationError);
    submitting.value = false;
    return false;
  }

  return true;
}

async function handleValidateCredentials() {
  resetValidateCredentialsState();

  const emailCandidate = email.value.trim().toLowerCase();
  if (!hasValidCredentialsInput(emailCandidate)) {
    return;
  }

  try {
    const login = await authStore.validateCredentials(emailCandidate, password.value);
    if (login.contexts.length === 1) {
      await establishAndRedirect(login.contexts[0]);
      return;
    }
    showContextModal.value = true;
  } catch (error) {
    showContextModal.value = false;
    if (authStore.pendingLogin) {
      authStore.setPendingLogin(null);
    }
    if (isUnverifiedEmailError(error)) {
      await router.push(routePaths.authVerifyEmail);
      return;
    }
    setAlertError(formatUiErrorString(error));
  } finally {
    submitting.value = false;
  }
}

async function establishAndRedirect(context: { role: z.infer<typeof RoleSchema>; rfc: string }) {
  try {
    const defaultPath = await establishLoginContext(context);
    const redirectPath = resolvePreferredAuthenticatedPath({
      activeRole: authStore.activeRole,
      requiresSecuritySetup: authStore.requiresSecuritySetup,
      activeRfc: context.rfc,
      redirectTarget: route.query.redirect,
    });
    showContextModal.value = false;
    await router.push(redirectPath || defaultPath);
  } catch (error) {
    setAlertError(formatUiErrorString(error));
  }
}

async function handleContinue(context: { role: z.infer<typeof RoleSchema>; rfc: string }) {
  errorMessage.value = null;
  errorDisplayMode.value = 'alert';
  if (!hasPendingLogin.value) {
    setAlertError(formatUiErrorString(systemMessageTree.web.ui.data.validation));
    return;
  }

  submitting.value = true;
  try {
    await establishAndRedirect(context);
  } finally {
    submitting.value = false;
  }
}

async function redirectExistingSession() {
  const attemptId = redirectAttemptId.value;
  if (!hasSavedContext() && !authStore.isAuthenticated) {
    return;
  }

  try {
    const hydrated = authStore.isAuthenticated ? null : await ensureHydratedSession();
    if (manualLoginStarted.value || attemptId !== redirectAttemptId.value) {
      return;
    }
    if (!authStore.isAuthenticated) {
      return;
    }

    const redirectPath = resolvePreferredAuthenticatedPath({
      activeRole: authStore.activeRole,
      requiresSecuritySetup: authStore.requiresSecuritySetup,
      activeRfc: hydrated?.activeRfc ?? activeRfc.value,
      redirectTarget: route.query.redirect,
    });
    if (redirectPath !== route.fullPath) {
      await router.replace(redirectPath);
      return;
    }
  } catch {
    authStore.clearLocalSession();
  }
}

onMounted(() => {
  manualLoginStarted.value = false;
  void redirectExistingSession();
});
</script>

<template>
  <VaCard v-show="!showContextModal" class="w-full">
    <VaCardContent>
      <VaCardTitle>Iniciar Sesión</VaCardTitle>

      <form class="grid gap-3 text-left mt-4" @submit.prevent="handleValidateCredentials">
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
        </VaAlert>
        <VaButton type="submit" :loading="submitting" :disabled="submitting">Iniciar Sesión</VaButton>
        <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
          <VaButton preset="plain" size="small" :to="routePaths.authCreateAccount">Crear cuenta</VaButton>
          <VaButton preset="plain" size="small" :to="routePaths.authForgotPassword">Olvidé mi contraseña</VaButton>
        </div>
      </form>
    </VaCardContent>
  </VaCard>

  <SessionContextModal
    v-model="showContextModal"
    :contexts="authStore.pendingLogin?.contexts ?? []"
    :loading="submitting"
    :allow-cancel="false"
    confirm-text="Continuar"
    no-outside-dismiss
    no-esc-dismiss
    select-test-id="auth-login-context"
    @confirm="handleContinue"
  />
</template>
