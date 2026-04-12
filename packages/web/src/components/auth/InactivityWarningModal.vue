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
  <v-dialog
    v-model="show"
    persistent
    max-width="400"
  >
    <v-card>
      <v-card-title class="text-h5 bg-warning text-white">
        Sesión por expirar
      </v-card-title>
      <v-card-text class="pt-4">
        Tu sesión se cerrará automáticamente en <strong>{{ secondsRemaining }}</strong> segundos debido a la inactividad.
        ¿Deseas continuar trabajando?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="warning"
          variant="elevated"
          @click="stayLoggedIn"
        >
          Mantener sesión iniciada
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
