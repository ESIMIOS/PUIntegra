/**
 * @package web
 * @name useSessionInactivity.ts
 * @version 0.0.1
 * @description Composable para monitorear la inactividad del usuario y gestionar el cierre de sesión.
 * @author @antigravity
 * @changelog
 * - 0.0.1	(2026-04-12)	Versión inicial del composable.	@antigravity
 */

import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { 
  SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY, 
  SECONDS_TO_SHOW_INACTIVITY_ALERT 
} from '@shared';
import { routePaths } from '@/shared/constants/routePaths';

// State compartido (Singleton)
const secondsRemaining = ref(SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY);
const isAlerting = ref(false);
let timerInterval: ReturnType<typeof setInterval> | null = null;
let listenerCleanup: (() => void) | null = null;

/**
 * @description Expone el estado singleton de inactividad de sesión y configura listeners de actividad.
 */
export function useSessionInactivity() {
  const authStore = useAuthStore();
  const router = useRouter();

  const resetTimer = () => {
    secondsRemaining.value = SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY;
    isAlerting.value = false;
  };

  const handleActivity = () => {
    // Solo reiniciamos el timer mediante actividad de fondo si NO se está mostrando la alerta.
    // Una vez que la alerta aparece, se requiere una acción explícita (clic en el botón del modal).
    if (authStore.isAuthenticated && !isAlerting.value) {
      resetTimer();
    }
  };

  const startTimer = () => {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      if (!authStore.isAuthenticated) {
        resetTimer();
        return;
      }

      if (secondsRemaining.value > 0) {
        secondsRemaining.value -= 1;
        isAlerting.value = secondsRemaining.value <= SECONDS_TO_SHOW_INACTIVITY_ALERT;
      } else {
        stopTimer();
        authStore.resetToAnonymous();
        router.push(routePaths.authLogout);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const setupListeners = () => {
    if (listenerCleanup) return;
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handler = () => handleActivity();
    events.forEach(event => globalThis.addEventListener(event, handler));
    listenerCleanup = () => {
      events.forEach(event => globalThis.removeEventListener(event, handler));
    };
  };

  onMounted(() => {
    setupListeners();
    startTimer();
  });

  // El cleanup se vuelve opcional si se desea que persista durante toda la vida de la app,
  // pero lo mantenemos para consistencia si se llegara a destruir el componente raíz.
  onUnmounted(() => {
    // No limpiamos si hay otros componentes usándolo? 
    // En este caso, AppRoot siempre estará vivo, así que lo dejamos así.
  });

  // Si se cierra sesión de forma manual, reiniciamos el estado
  watchEffect(() => {
    if (!authStore.isAuthenticated) {
      resetTimer();
    }
  });

  return {
    secondsRemaining,
    isAlerting,
    resetTimer
  };
}

/**
 * @description Reinicia el estado global de inactividad entre pruebas unitarias.
 */
export function resetGlobalState() {
  secondsRemaining.value = SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY;
  isAlerting.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (listenerCleanup) {
    listenerCleanup();
    listenerCleanup = null;
  }
}
