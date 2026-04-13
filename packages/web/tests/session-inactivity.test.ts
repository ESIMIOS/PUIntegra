import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApp } from 'vue';
import { useSessionInactivity, resetGlobalState } from '../src/composables/useSessionInactivity';
import { useAuthStore } from '../src/stores/authStore';
import { createPinia, setActivePinia, getActivePinia } from 'pinia';
import { SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY, SECONDS_TO_SHOW_INACTIVITY_ALERT, ROLE } from '@shared';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}));

function withSetup<T>(composable: () => T) {
  let result: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => {};
    },
  });
  app.use(getActivePinia()!);
  const host = document.createElement('div');
  app.mount(host);
  return [result!, app] as const;
}

describe('useSessionInactivity integration', () => {
  beforeEach(() => {
    resetGlobalState();
    setActivePinia(createPinia());
    vi.useFakeTimers();
    push.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with default timeout', () => {
    const [result] = withSetup(() => useSessionInactivity());
    expect(result.secondsRemaining.value).toBe(SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY);
    expect(result.isAlerting.value).toBe(false);
  });

  it('should decrement timer over time', () => {
    // Authenticate before setup
    const authStore = useAuthStore();
    authStore.isAuthenticated = true;

    const [result] = withSetup(() => useSessionInactivity());
    
    vi.advanceTimersByTime(1000);
    expect(result.secondsRemaining.value).toBe(SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY - 1);
  });

  it('should trigger alert state when threshold is reached', () => {
    const authStore = useAuthStore();
    authStore.isAuthenticated = true;

    const [result] = withSetup(() => useSessionInactivity());
    
    // Advance to alert threshold
    vi.advanceTimersByTime((SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY - SECONDS_TO_SHOW_INACTIVITY_ALERT) * 1000);
    expect(result.isAlerting.value).toBe(true);
  });

  it('should reset timer on user activity', () => {
    const authStore = useAuthStore();
    authStore.isAuthenticated = true;

    const [result] = withSetup(() => useSessionInactivity());
    
    vi.advanceTimersByTime(5000);
    expect(result.secondsRemaining.value).toBe(SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY - 5);

    // Simulate activity
    window.dispatchEvent(new MouseEvent('mousemove'));
    
    expect(result.secondsRemaining.value).toBe(SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY);
  });

  it('should logout user when timer reaches zero', () => {
    const authStore = useAuthStore();
    authStore.isAuthenticated = true;
    authStore.activeRole = ROLE.INSTITUTION_ADMIN;

    withSetup(() => useSessionInactivity());

    vi.advanceTimersByTime((SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY + 1) * 1000);
    
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.activeRole).toBe(ROLE.ANONYMOUS);
    expect(push).toHaveBeenCalledWith('/auth/logout');
  });

  it('should NOT reset timer on background activity while alerting', () => {
    const authStore = useAuthStore();
    authStore.isAuthenticated = true;

    const [result] = withSetup(() => useSessionInactivity());
    
    // Advance to alert state
    vi.advanceTimersByTime((SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY - SECONDS_TO_SHOW_INACTIVITY_ALERT) * 1000);
    expect(result.isAlerting.value).toBe(true);
    const timeAtAlert = result.secondsRemaining.value;

    // Simulate activity
    window.dispatchEvent(new MouseEvent('mousemove'));
    
    // Timer should NOT have reset
    expect(result.secondsRemaining.value).toBe(timeAtAlert);
    expect(result.isAlerting.value).toBe(true);
  });

  it('should stop alerting ONLY when resetTimer is called explicitly', () => {
    const authStore = useAuthStore();
    authStore.isAuthenticated = true;

    const [result] = withSetup(() => useSessionInactivity());
    
    // Advance to alert state
    vi.advanceTimersByTime((SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY - SECONDS_TO_SHOW_INACTIVITY_ALERT) * 1000);
    expect(result.isAlerting.value).toBe(true);

    // Reset via explicit call (simulating modal button)
    result.resetTimer();
    expect(result.secondsRemaining.value).toBe(SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY);
    expect(result.isAlerting.value).toBe(false);
  });
});
