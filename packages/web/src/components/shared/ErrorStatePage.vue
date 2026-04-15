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
    (authStore.activeRole === ROLE.INSTITUTION_ADMIN ||
      authStore.activeRole === ROLE.INSTITUTION_OPERATOR) &&
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
  Math.max(
    0,
    Math.round((secondsRemaining.value / LOGIN_REDIRECT_SECONDS) * 100),
  ),
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
  <section class="error-state" aria-live="polite">
    <div class="error-state__graphic" :aria-label="graphicLabel">
      <VaIcon :name="icon" :size="iconSize" />
    </div>

    <p class="error-state__status">{{ status }}</p>
    <h1>{{ title }}</h1>
    <p class="error-state__message">{{ message }}</p>

    <div v-if="isLoginCountdownActive" class="error-state__countdown">
      <p>
        Te llevaremos al inicio de sesión en {{ secondsRemaining }} segundos.
      </p>
      <VaProgressBar
        class="error-state__progress"
        :model-value="countdownProgress"
        color="danger"
        rounded
        size="small"
      />
    </div>

    <div class="error-state__actions">
      <VaButton v-if="primaryAction" color="primary" :to="primaryAction.to">
        {{ primaryAction.label }}
      </VaButton>
      <VaButton preset="secondary" :to="routePaths.siteHome">
        Ir a la página de inicio
      </VaButton>
    </div>
  </section>
</template>

<style scoped>
.error-state {
  display: grid;
  justify-items: center;
  width: min(72rem, 100%);
  gap: 1.5rem;
  color: var(--va-text-primary);
}

.error-state__graphic {
  line-height: 1;
  color: var(--domain-accent);
}

.error-state__status {
  margin: 0;
  color: var(--domain-accent);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0;
}

.error-state h1 {
  width: min(90vw, 58rem);
  margin: 0;
  color: var(--domain-accent);
  font-size: clamp(2.2rem, 3.6vw, 3.8rem);
  letter-spacing: 0;
  line-height: 1.1;
  text-wrap: pretty;
}

.error-state__message {
  width: min(90vw, 56rem);
  margin: 0;
  color: var(--va-text-secondary);
  font-size: clamp(1.05rem, 1.6vw, 1.35rem);
  line-height: 1.6;
  text-wrap: pretty;
}

.error-state__countdown {
  display: grid;
  width: min(34rem, 100%);
  gap: 0.75rem;
}

.error-state__countdown p {
  margin: 0;
  color: var(--va-text-primary);
}

.error-state__progress {
  width: 100%;
}

.error-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
</style>
