<script setup lang="ts">
/**
 * @package web
 * @name AuthCreateAccountPage.vue
 * @version 0.0.1
 * @description Vista placeholder de creación de cuenta en el flujo de autenticación.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onUnmounted, ref } from 'vue';
import { formatUiErrorString } from '@shared';
import { createAccount, resendEmailVerification } from '@/gateways/firebaseAuthGateway';
import { evaluatePasswordPolicy, isPasswordPolicySatisfied } from '@/shared/auth/passwordPolicy';

const email = ref('');
const displayName = ref('');
const password = ref('');
const confirmPassword = ref('');
const submitting = ref(false);
const errorMessage = ref<string | null>(null);
const createdEmail = ref<string | null>(null);
const resendMessage = ref<string | null>(null);
const resendCooldown = ref(0);
let resendCooldownTimer: ReturnType<typeof globalThis.setInterval> | null = null;

const normalizedEmail = computed(() => email.value.trim().toLowerCase());
const passwordStatus = computed(() => evaluatePasswordPolicy(password.value));
const hasValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail.value));
const hasValidName = computed(() => displayName.value.trim().length >= 2);
const passwordsMatch = computed(() => !!confirmPassword.value && password.value === confirmPassword.value);
const canSubmit = computed(
  () => hasValidEmail.value && hasValidName.value && isPasswordPolicySatisfied(passwordStatus.value) && passwordsMatch.value,
);
const passwordPolicyMessage = computed(() => {
  if (!password.value || isPasswordPolicySatisfied(passwordStatus.value)) {
    return [];
  }
  return ['Debe cumplir la política de contraseña indicada abajo.'];
});

function clearResendCooldown() {
  if (resendCooldownTimer) {
    globalThis.clearInterval(resendCooldownTimer);
    resendCooldownTimer = null;
  }
}

function startResendCooldown() {
  clearResendCooldown();
  resendCooldown.value = 60;
  resendCooldownTimer = globalThis.setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0) {
      resendCooldown.value = 0;
      clearResendCooldown();
    }
  }, 1000);
}

async function handleSubmit() {
  errorMessage.value = null;
  if (!canSubmit.value) {
    errorMessage.value = 'Revisa el correo, el nombre y la política de contraseña antes de continuar.';
    return;
  }

  submitting.value = true;
  try {
    const result = await createAccount({
      displayName: displayName.value.trim(),
      email: normalizedEmail.value,
      password: password.value,
    });
    createdEmail.value = result.email;
    startResendCooldown();
  } catch (error) {
    errorMessage.value = formatUiErrorString(error);
  } finally {
    submitting.value = false;
  }
}

async function handleResend() {
  errorMessage.value = null;
  resendMessage.value = null;
  submitting.value = true;
  try {
    await resendEmailVerification();
    resendMessage.value = 'Enviamos nuevamente el correo de verificación.';
    startResendCooldown();
  } catch (error) {
    errorMessage.value = formatUiErrorString(error);
  } finally {
    submitting.value = false;
  }
}

onUnmounted(() => {
  clearResendCooldown();
});
</script>

<template>
  <VaCard class="w-full">
    <VaCardContent>
      <VaCardTitle>Crea tu cuenta</VaCardTitle>
      <div v-if="createdEmail" class="grid gap-3 text-left mt-4">
        <VaAlert color="success" icon="mark_email_read" dense>
          Revisa tu correo {{ createdEmail }} para verificar la cuenta antes de entrar a PUIntegra.
        </VaAlert>
        <p class="text-sm opacity-80">
          Tu cuenta requiere un permiso institucional previo. Si no reconoces esta invitación, contacta al
          administrador de tu institución.
        </p>
        <VaAlert v-if="resendMessage" color="info" icon="mark_email_read" dense>
          {{ resendMessage }}
        </VaAlert>
        <VaAlert v-if="errorMessage" color="danger" icon="warning" dense>
          {{ errorMessage }}
        </VaAlert>
        <div class="flex flex-wrap gap-2">
          <VaButton :loading="submitting" :disabled="submitting || resendCooldown > 0" @click="handleResend">
            {{ resendCooldown > 0 ? `Reenviar verificación (${resendCooldown}s)` : 'Reenviar verificación' }}
          </VaButton>
        </div>
      </div>
      <form v-else class="grid gap-3 text-left mt-4" @submit.prevent="handleSubmit">
        <p class="text-sm opacity-80">
          Usa el correo asociado a tu permiso institucional. Después te enviaremos una verificación para confirmar
          que el correo te pertenece.
        </p>
        <VaInput
          v-model="email"
          label="Correo electrónico"
          placeholder="usuario@institucion.gob.mx"
          type="email"
          required
          immediate
          :error="!!email && !hasValidEmail"
          :error-messages="email && !hasValidEmail ? ['Escribe un correo electrónico válido.'] : []"
          data-testid="auth-create-email"
        />
        <VaInput
          v-model="displayName"
          label="Nombre visible"
          placeholder="María Operadora"
          required
          immediate
          :error="!!displayName && !hasValidName"
          :error-messages="displayName && !hasValidName ? ['Escribe al menos 2 caracteres.'] : []"
          data-testid="auth-create-name"
        />
        <VaInput
          v-model="password"
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          type="password"
          required
          immediate
          :error="!!password && !isPasswordPolicySatisfied(passwordStatus)"
          :error-messages="passwordPolicyMessage"
          data-testid="auth-create-password"
        />
        <ul class="text-xs opacity-80 leading-5">
          <li :class="passwordStatus.minLength ? 'text-success' : ''">Mínimo 8 caracteres</li>
          <li :class="passwordStatus.uppercase ? 'text-success' : ''">Una mayúscula</li>
          <li :class="passwordStatus.number ? 'text-success' : ''">Un número</li>
        </ul>
        <VaInput
          v-model="confirmPassword"
          label="Confirmar contraseña"
          placeholder="Repite la contraseña"
          type="password"
          required
          immediate
          :error="!!confirmPassword && !passwordsMatch"
          :error-messages="confirmPassword && !passwordsMatch ? ['Las contraseñas deben ser iguales.'] : []"
          data-testid="auth-create-confirm"
        />
        <p v-if="confirmPassword && !passwordsMatch" class="text-xs text-danger">Las contraseñas deben ser iguales.</p>
        <p v-if="confirmPassword && passwordsMatch" class="text-xs text-success">Las contraseñas coinciden</p>
        <VaAlert v-if="errorMessage" color="danger" icon="warning" dense>
          {{ errorMessage }}
        </VaAlert>
        <VaButton data-testid="auth-create-submit" type="submit" :loading="submitting" :disabled="submitting || !canSubmit">
          Crear cuenta
        </VaButton>
      </form>
    </VaCardContent>
  </VaCard>
</template>
