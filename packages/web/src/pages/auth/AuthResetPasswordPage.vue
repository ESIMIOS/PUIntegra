<script setup lang="ts">
/**
 * @package web
 * @name AuthResetPasswordPage.vue
 * @version 0.0.1
 * @description Vista placeholder de restablecimiento de contraseña por enlace.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatUiErrorString } from '@shared';
import { confirmPasswordResetWithCode, verifyPasswordResetCodeForEmail } from '@/gateways/firebaseAuthGateway';
import { routePaths } from '@/shared/constants/routePaths';
import { evaluatePasswordPolicy, isPasswordPolicySatisfied } from '@/shared/auth/passwordPolicy';

const route = useRoute();
const router = useRouter();
const password = ref('');
const confirmPassword = ref('');
const accountEmail = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const loading = ref(false);
const actionCode = ref<string | null>(null);
const manualCode = ref('');
const passwordStatus = computed(() => evaluatePasswordPolicy(password.value));
const passwordsMatch = computed(() => !!confirmPassword.value && password.value === confirmPassword.value);
const canSubmit = computed(() => !!accountEmail.value && isPasswordPolicySatisfied(passwordStatus.value) && passwordsMatch.value);
const passwordPolicyMessage = computed(() => {
  if (!password.value || isPasswordPolicySatisfied(passwordStatus.value)) {
    return [];
  }
  return ['Debe cumplir la política de contraseña indicada abajo.'];
});

function readActionCode() {
  const value = route.query.oobCode;
  return Array.isArray(value) ? value[0] : value;
}

async function validateCode(code: string) {
  errorMessage.value = null;
  loading.value = true;
  actionCode.value = code;
  try {
    accountEmail.value = await verifyPasswordResetCodeForEmail(code);
  } catch (error) {
    actionCode.value = null;
    accountEmail.value = null;
    errorMessage.value = formatUiErrorString(error);
  } finally {
    loading.value = false;
  }
}

async function handleManualCode() {
  const code = manualCode.value.trim();
  if (!code) {
    errorMessage.value = 'Escribe el código de restablecimiento antes de continuar.';
    return;
  }
  await validateCode(code);
}

async function handleSubmit() {
  errorMessage.value = null;
  if (!canSubmit.value) {
    errorMessage.value = 'Revisa la política de contraseña y confirma que ambas coincidan.';
    return;
  }
  loading.value = true;
  try {
    await confirmPasswordResetWithCode(actionCode.value!, password.value);
    successMessage.value = 'Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión con la nueva contraseña.';
    accountEmail.value = null;
    actionCode.value = null;
    password.value = '';
    confirmPassword.value = '';
  } catch (error) {
    errorMessage.value = formatUiErrorString(error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const code = readActionCode();
  if (code) {
    void validateCode(code);
  }
});
</script>

<template>
  <VaCard class="w-full">
    <VaCardContent>
      <VaCardTitle>Nueva contraseña</VaCardTitle>
      <div v-if="successMessage" class="grid gap-3 text-left mt-4">
        <VaAlert color="success" icon="check_circle" dense>
          {{ successMessage }}
        </VaAlert>
        <VaButton data-testid="auth-reset-login" @click="router.push(routePaths.authLogin)">
          Ir a iniciar sesión
        </VaButton>
      </div>
      <form v-else-if="!accountEmail" class="grid gap-3 text-left mt-4" @submit.prevent="handleManualCode">
        <p class="text-sm opacity-80">
          Pega el código de restablecimiento recibido por correo o copiado desde los logs del emulador.
        </p>
        <VaInput
          v-model="manualCode"
          label="Código de restablecimiento"
          placeholder="Código oobCode"
          required
          immediate
          data-testid="auth-reset-code"
        />
        <VaAlert v-if="errorMessage" color="danger" icon="warning" dense>
          {{ errorMessage }}
        </VaAlert>
        <VaButton data-testid="auth-reset-code-submit" type="submit" :loading="loading" :disabled="loading || !manualCode.trim()">
          Validar código
        </VaButton>
      </form>
      <form v-else class="grid gap-3 text-left mt-4" @submit.prevent="handleSubmit">
        <p class="text-sm opacity-80">
          Define una contraseña nueva para {{ accountEmail ?? 'tu cuenta' }}. Al terminar, inicia sesión nuevamente.
        </p>
        <VaInput
          v-model="password"
          label="Nueva contraseña"
          placeholder="Mínimo 8 caracteres"
          type="password"
          required
          immediate
          :error="!!password && !isPasswordPolicySatisfied(passwordStatus)"
          :error-messages="passwordPolicyMessage"
          data-testid="auth-reset-password"
        />
        <ul class="text-xs opacity-80 leading-5">
          <li :class="passwordStatus.minLength ? 'text-success' : ''">Mínimo 8 caracteres</li>
          <li :class="passwordStatus.uppercase ? 'text-success' : ''">Una mayúscula</li>
          <li :class="passwordStatus.number ? 'text-success' : ''">Un número</li>
        </ul>
        <VaInput
          v-model="confirmPassword"
          label="Confirmar nueva contraseña"
          placeholder="Repite la contraseña"
          type="password"
          required
          immediate
          :error="!!confirmPassword && !passwordsMatch"
          :error-messages="confirmPassword && !passwordsMatch ? ['Las contraseñas deben ser iguales.'] : []"
          data-testid="auth-reset-confirm"
        />
        <p v-if="confirmPassword && !passwordsMatch" class="text-xs text-danger">Las contraseñas deben ser iguales.</p>
        <p v-if="confirmPassword && passwordsMatch" class="text-xs text-success">Las contraseñas coinciden</p>
        <VaAlert v-if="errorMessage" color="danger" icon="warning" dense>
          {{ errorMessage }}
        </VaAlert>
        <VaButton data-testid="auth-reset-submit" type="submit" :loading="loading" :disabled="loading || !canSubmit">
          Guardar contraseña
        </VaButton>
      </form>
    </VaCardContent>
  </VaCard>
</template>
