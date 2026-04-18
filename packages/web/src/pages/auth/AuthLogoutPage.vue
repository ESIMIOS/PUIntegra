<script setup lang="ts">
/**
 * @package web
 * @name AuthLogoutPage.vue
 * @version 0.0.2
 * @description Cierra sesión activa, muestra progreso de salida y redirige a login tras 15 segundos.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-15)	Se reemplaza placeholder por cierre de sesión con cuenta regresiva.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { routePaths } from '@/shared/constants/routePaths';
import { useAuthSession } from '@/composables/useAuthSession';

const LOGOUT_REDIRECT_SECONDS = 15;
const router = useRouter();
const { clearSession } = useAuthSession();
const secondsLeft = ref(LOGOUT_REDIRECT_SECONDS);
let intervalId: ReturnType<typeof setInterval> | null = null;

function goToLogin() {
  router.push(routePaths.authLogin);
}

onMounted(() => {
  clearSession();
  intervalId = setInterval(() => {
    secondsLeft.value -= 1;
    if (secondsLeft.value <= 0) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      goToLogin();
    }
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
});
</script>

<template>
  <VaCard class="auth-logout">
    <VaCardTitle>Sesión cerrada</VaCardTitle>
    <VaCardContent class="auth-logout__content">
      <p>Tu sesión fue cerrada correctamente.</p>
      <p>
        Te redirigiremos a login en <strong>{{ secondsLeft }}</strong> segundos.
      </p>
      <VaProgressBar :model-value="((LOGOUT_REDIRECT_SECONDS - secondsLeft) / LOGOUT_REDIRECT_SECONDS) * 100" />
      <VaButton @click="goToLogin">
        Ir a login ahora
      </VaButton>
    </VaCardContent>
  </VaCard>
</template>

<style scoped>
.auth-logout {
  width: min(28rem, 100%);
}

.auth-logout__content {
  display: grid;
  gap: 0.75rem;
}
</style>
