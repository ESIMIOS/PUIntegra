<script setup lang="ts">
/**
 * @package web
 * @name AuthForgotPasswordPage.vue
 * @version 0.0.1
 * @description Vista placeholder de solicitud de recuperación de contraseña.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { computed, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatUiErrorString } from '@shared';
import { requestPasswordRecovery } from '@/gateways/firebaseAuthGateway';
import { routePaths } from '@/shared/constants/routePaths';

const router = useRouter();
const email = ref('');
const submitting = ref(false);
const errorMessage = ref<string | null>(null);
const submitted = ref(false);
const submittedEmail = ref<string | null>(null);
const resendCooldown = ref(0);
let resendCooldownTimer: ReturnType<typeof globalThis.setInterval> | null = null;
const normalizedEmail = computed(() => email.value.trim().toLowerCase());
const hasValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail.value));

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
  if (!hasValidEmail.value) {
    errorMessage.value = 'Escribe un correo electrónico válido.';
    return;
  }

  submitting.value = true;
  try {
    await requestPasswordRecovery(normalizedEmail.value);
    submitted.value = true;
    submittedEmail.value = normalizedEmail.value;
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
      <VaCardTitle>Recupera tu contraseña</VaCardTitle>
      <div v-if="submitted" class="grid gap-3 text-left mt-4">
        <VaAlert color="success" icon="mark_email_read" dense>
          Si la cuenta existe, enviaremos instrucciones a {{ submittedEmail }}.
        </VaAlert>
        <p class="text-sm opacity-80">
          Revisa tu bandeja de entrada y la carpeta de correo no deseado. Por seguridad, este mensaje no confirma si
          el correo está registrado.
        </p>
        <div class="flex flex-wrap gap-2">
          <VaButton :loading="submitting" :disabled="submitting || resendCooldown > 0" @click="handleSubmit">
            {{ resendCooldown > 0 ? `Enviar de nuevo (${resendCooldown}s)` : 'Enviar de nuevo' }}
          </VaButton>
          <VaButton preset="secondary" :disabled="submitting" @click="router.push(routePaths.authLogin)">
            Ir a iniciar sesión
          </VaButton>
        </div>
      </div>
      <form v-else class="grid gap-3 text-left mt-4" @submit.prevent="handleSubmit">
        <p class="text-sm opacity-80">
          Escribe el correo de tu cuenta. Si está registrado, recibirás un enlace temporal para definir una nueva
          contraseña.
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
          data-testid="auth-forgot-email"
        />
        <VaAlert v-if="errorMessage" color="danger" icon="warning" dense>
          {{ errorMessage }}
        </VaAlert>
        <VaButton
          data-testid="auth-forgot-submit"
          type="submit"
          :loading="submitting"
          :disabled="submitting || !hasValidEmail"
        >
          Enviar instrucciones
        </VaButton>
      </form>
    </VaCardContent>
  </VaCard>
</template>
