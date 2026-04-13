<script setup lang="ts">
/**
 * @package web
 * @name InactivityWarningModal.vue
 * @version 0.0.1
 * @description Modal de advertencia que se muestra antes del cierre de sesión por inactividad.
 * @author @antigravity
 * @changelog
 * - 0.0.1	(2026-04-12)	Versión inicial del componente.	@antigravity
 */
import { ref, watch } from 'vue';
import { useSessionInactivity } from '@/composables/useSessionInactivity';

const { isAlerting, secondsRemaining, resetTimer } = useSessionInactivity();
const show = ref(false);

watch(isAlerting, (newVal: boolean) => {
  show.value = newVal;
}, { immediate: true });

const stayLoggedIn = () => {
  resetTimer();
  show.value = false;
};
</script>

<template>
  <VaModal
    v-model="show"
    no-dismiss
    hide-default-actions
    max-width="400px"
    title="Sesión por expirar"
  >
    <p>
      Tu sesión se cerrará automáticamente en <strong>{{ secondsRemaining }}</strong> segundos debido a la inactividad.
      ¿Deseas continuar trabajando?
    </p>
    <template #footer>
      <VaButton size="small" color="warning" @click="stayLoggedIn">
        Mantener sesión iniciada
      </VaButton>
    </template>
  </VaModal>
</template>
