<script setup lang="ts">
/**
 * @package web
 * @name AuthVerifyEmailPage.vue
 * @version 0.0.1
 * @description Vista placeholder de verificación de correo en el flujo de autenticación.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RoleSchema, formatUiErrorString } from '@shared';
import { z } from 'zod';
import { applyEmailVerificationCode, canResendEmailVerification, resendEmailVerification } from '@/gateways/firebaseAuthGateway';
import { useAuthSession } from '@/composables/useAuthSession';
import { resolvePreferredAuthenticatedPath } from '@/router/authLanding';
import { routePaths } from '@/shared/constants/routePaths';

const route = useRoute();
const router = useRouter();
const { authStore, activeRfc, establishLoginContext, clearSession } = useAuthSession();
const submitting = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const manualCode = ref('');
const canResend = ref(false);
const showLogoutConfirmation = ref(false);
const verificationCompleted = computed(() => !!successMessage.value && !errorMessage.value);
const arrivedFromVerifiedLink = computed(() => {
  const value = route.query.verified;
  return (Array.isArray(value) ? value[0] : value) === '1';
});

function readActionCode() {
  const value = route.query.oobCode;
  return Array.isArray(value) ? value[0] : value;
}

function formatVerificationError(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : null;
  if (code) {
    return `No pudimos verificar el correo porque el código no es válido, ya fue usado o expiró. Código: ${code}. Solicita un nuevo correo de verificación.`;
  }
  return formatUiErrorString(error);
}

async function establishAndRedirect(context: { role: z.infer<typeof RoleSchema>; rfc: string }) {
  const defaultPath = await establishLoginContext(context);
  const redirectPath = resolvePreferredAuthenticatedPath({
    activeRole: authStore.activeRole,
    requiresSecuritySetup: authStore.requiresSecuritySetup,
    activeRfc: context.rfc || activeRfc.value,
    redirectTarget: route.query.redirect,
  });
  await router.push(redirectPath || defaultPath);
}

async function continueWithDefaultRoute() {
  const login = await authStore.validateCurrentFirebaseUser();
  await establishAndRedirect(login.contexts[0]);
}

async function handleContinue() {
  errorMessage.value = null;
  submitting.value = true;
  try {
    await continueWithDefaultRoute();
  } catch {
    await router.push(routePaths.authLogin);
  } finally {
    submitting.value = false;
  }
}

async function handleLogout() {
  submitting.value = true;
  try {
    await clearSession();
    await router.push(routePaths.authLogin);
  } finally {
    submitting.value = false;
    showLogoutConfirmation.value = false;
  }
}

async function handleManualCode() {
  errorMessage.value = null;
  successMessage.value = null;
  const code = manualCode.value.trim();
  if (!code) {
    errorMessage.value = 'Escribe el código de verificación antes de continuar.';
    return;
  }
  submitting.value = true;
  try {
    await applyEmailVerificationCode(code);
    await continueWithDefaultRoute();
  } catch (error) {
    errorMessage.value = formatVerificationError(error);
  } finally {
    submitting.value = false;
  }
}

async function applyCodeIfPresent() {
  const code = readActionCode();
  if (code) {
    submitting.value = true;
    try {
      await applyEmailVerificationCode(code);
      successMessage.value = 'Tu correo fue verificado. Puedes continuar con tu sesión.';
    } catch (error) {
      errorMessage.value = formatVerificationError(error);
    } finally {
      submitting.value = false;
    }
    return;
  }

  if (!arrivedFromVerifiedLink.value) {
    return;
  }

  submitting.value = true;
  try {
    await continueWithDefaultRoute();
  } catch {
    successMessage.value = 'Tu correo fue verificado. Inicia sesión para continuar en PUIntegra.';
  } finally {
    submitting.value = false;
  }
}

async function handleResend() {
  errorMessage.value = null;
  successMessage.value = null;
  submitting.value = true;
  try {
    await resendEmailVerification();
    successMessage.value = 'Enviamos un nuevo correo de verificación si tu sesión lo permite.';
  } catch (error) {
    errorMessage.value = formatUiErrorString(error);
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  canResend.value = canResendEmailVerification();
  void applyCodeIfPresent();
});
</script>

<template>
  <VaCard class="w-full">
    <VaCardContent>
      <VaCardTitle>Verifica tu correo</VaCardTitle>
      <div class="grid gap-3 text-left mt-4">
        <p class="text-sm opacity-80">
          Necesitamos confirmar que el correo te pertenece antes de habilitar el acceso a PUIntegra y a la
          configuración de seguridad.
        </p>
        <form v-if="!verificationCompleted && !arrivedFromVerifiedLink" class="grid gap-2" @submit.prevent="handleManualCode">
          <VaInput
            v-model="manualCode"
            label="Código de verificación"
            placeholder="Pega aquí el código si lo recibiste fuera del enlace"
            data-testid="auth-verify-code"
          />
          <VaButton type="submit" :loading="submitting" :disabled="submitting || !manualCode.trim()">
            Verificar código
          </VaButton>
        </form>
        <VaAlert v-if="successMessage" color="success" icon="check_circle" dense>
          {{ successMessage }}
        </VaAlert>
        <VaAlert v-if="errorMessage" color="danger" icon="warning" dense>
          {{ errorMessage }}
        </VaAlert>
        <VaAlert v-if="!verificationCompleted && !arrivedFromVerifiedLink && !canResend" color="info" icon="info" dense>
          Para reenviar el correo necesitas haber iniciado sesión con la cuenta pendiente de verificación. Si abriste
          esta página directamente, usa el enlace recibido por correo o vuelve a iniciar sesión.
        </VaAlert>
        <div class="flex flex-wrap gap-2">
          <VaButton v-if="!verificationCompleted && !arrivedFromVerifiedLink" :loading="submitting" :disabled="submitting || !canResend" @click="handleResend">
            Reenviar correo
          </VaButton>
          <VaButton v-if="verificationCompleted" :loading="submitting" :disabled="submitting" @click="handleContinue">
            Continuar
          </VaButton>
          <VaButton preset="secondary" :disabled="submitting" @click="showLogoutConfirmation = true">
            Cerrar sesión
          </VaButton>
        </div>
      </div>
    </VaCardContent>
  </VaCard>

  <VaModal
    v-model="showLogoutConfirmation"
    title="Cerrar sesión"
    hide-default-actions
  >
    <p>Se cerrará la sesión abierta para esta cuenta.</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton preset="secondary" :disabled="submitting" @click="showLogoutConfirmation = false">Cancelar</VaButton>
        <VaButton color="danger" :loading="submitting" @click="handleLogout">Cerrar sesión</VaButton>
      </div>
    </template>
  </VaModal>
</template>
