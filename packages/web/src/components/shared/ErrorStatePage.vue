<script setup lang="ts">
/**
 * @package web
 * @name ErrorStatePage.vue
 * @version 0.0.1
 * @description Renderiza páginas de error con recuperación contextual y redirección controlada a login.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-15)	Implementa presentación reutilizable de errores del dominio `/error`.	@codex
 */
import {
  computed,
  onUnmounted,
  ref,
  ROLE,
  routePaths,
  useAuthStore,
  useInstitutionStore,
  useRouter,
  watch,
} from "@/bom";

const LOGIN_REDIRECT_SECONDS = 15;
const TIMER_INTERVAL_MILLISECONDS = 1000;

type ErrorState = {
  status: string;
  title: string;
  message: string;
  icon: string;
  graphicLabel: string;
  allowLoginRecovery?: boolean;
};

const props = withDefaults(defineProps<ErrorState>(), {
  allowLoginRecovery: false,
});

const authStore = useAuthStore();
const institutionStore = useInstitutionStore();
const router = useRouter();

const secondsRemaining = ref(LOGIN_REDIRECT_SECONDS);
const isLoginCountdownActive = ref(false);
let countdownId: ReturnType<typeof globalThis.setInterval> | null = null;

const primaryAction = computed(() => {
  if (!authStore.isAuthenticated || authStore.activeRole === ROLE.ANONYMOUS) {
    if (!props.allowLoginRecovery) {
      return null;
    }

    return {
      label: "Ir a iniciar sesión",
      to: routePaths.authLogin,
    };
  }

  if (authStore.activeRole === ROLE.SYSTEM_ADMINISTRATOR) {
    return {
      label: "Volver al backoffice",
      to: routePaths.adminInstitutions,
    };
  }

  if (
    (authStore.activeRole === ROLE.INSTITUTION_ADMIN || authStore.activeRole === ROLE.INSTITUTION_OPERATOR) &&
    institutionStore.activeRfc
  ) {
    return {
      label: "Volver al dashboard",
      to: routePaths.appDashboard(institutionStore.activeRfc),
    };
  }

  return {
    label: "Revisar mi cuenta",
    to: routePaths.accountSettings,
  };
});

const countdownProgress = computed(() =>
  Math.max(0, Math.round((secondsRemaining.value / LOGIN_REDIRECT_SECONDS) * 100)),
);
const iconSize = "11rem";

function clearCountdown() {
  if (countdownId !== null) {
    globalThis.clearInterval(countdownId);
    countdownId = null;
  }

  isLoginCountdownActive.value = false;
}

function startLoginCountdown() {
  clearCountdown();
  secondsRemaining.value = LOGIN_REDIRECT_SECONDS;
  isLoginCountdownActive.value = true;

  countdownId = globalThis.setInterval(() => {
    secondsRemaining.value -= 1;

    if (secondsRemaining.value <= 0) {
      clearCountdown();
      router.push(routePaths.authLogin);
    }
  }, TIMER_INTERVAL_MILLISECONDS);
}

watch(
  () => primaryAction.value?.to,
  (target) => {
    if (target === routePaths.authLogin) {
      startLoginCountdown();
      return;
    }

    clearCountdown();
  },
  { immediate: true },
);

onUnmounted(() => {
  clearCountdown();
});
</script>

<template>
  <section class="flex row w-full h-full align-center justify-center" aria-live="polite">
    <div class="flex flex-col sm12 align-center justify-center">
      <VaIcon :name="icon" :size="iconSize" color="danger" />
      <p class="danger bold">{{ status }}</p>
      <h1 class="danger fs-5">{{ title }}</h1>
      <p class="fs-2 p-4">{{ message }}</p>
      <div v-if="isLoginCountdownActive">
        <p>Te llevaremos al inicio de sesión en {{ secondsRemaining }} segundos.</p>
        <VaProgressBar class="p-4" :model-value="countdownProgress" color="danger" rounded size="large" />
      </div>
      <div class="flex gap-6">
        <VaButton v-if="primaryAction" color="primary" :to="primaryAction.to">
          {{ primaryAction.label }}
        </VaButton>
        <VaSpacer class="spacer" />
        <VaButton preset="secondary" :to="routePaths.siteHome">Ir a la página de inicio</VaButton>
      </div>
    </div>
  </section>
</template>
