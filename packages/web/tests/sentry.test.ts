/**
 * @package web
 * @name sentry.test.ts
 * @version 0.0.1
 * @description Tests for Sentry plugin and useSentryScope composable.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-14)  Versión inicial.  @antigravity
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApp, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import type { App } from 'vue';
import type { Router } from 'vue-router';

// ── Mock @sentry/vue before any imports that use it ───────────────────────────
vi.mock('@sentry/vue', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: 'BrowserTracing' })),
  setUser: vi.fn(),
  setTag: vi.fn(),
  withScope: vi.fn(),
  captureException: vi.fn(),
}));

import * as Sentry from '@sentry/vue';

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockRouter = {} as Router;
const mockApp = { config: {} } as unknown as App;

function withSetup(composable: () => void): App {
  const app = createApp({
    setup() {
      composable();
      return () => {};
    },
  });
  app.use(createPinia());
  const host = document.createElement('div');
  app.mount(host);
  return app;
}

function captureInitOptions(): Record<string, unknown> {
  const calls = vi.mocked(Sentry.init).mock.calls;
  if (calls.length === 0) throw new Error('Sentry.init was not called');
  return calls[0][0] as Record<string, unknown>;
}

// ── createSentryPlugin ────────────────────────────────────────────────────────

describe('createSentryPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // Task 1.1
  it('does NOT call Sentry.init when VITE_SENTRY_DSN is absent', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    const { createSentryPlugin } = await import('../src/plugins/sentry');
    const plugin = createSentryPlugin(mockRouter);
    plugin.install(mockApp);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  // Task 1.2
  it('calls Sentry.init with DSN, VITE_APP_ENV, and release when DSN is set', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123');
    vi.stubEnv('VITE_APP_ENV', 'staging');
    vi.stubEnv('VITE_SENTRY_RELEASE', 'v1.2.3');
    const { createSentryPlugin } = await import('../src/plugins/sentry');
    const plugin = createSentryPlugin(mockRouter);
    plugin.install(mockApp);
    expect(Sentry.init).toHaveBeenCalledOnce();
    const opts = captureInitOptions();
    expect(opts.dsn).toBe('https://test@sentry.io/123');
    expect(opts.environment).toBe('staging');
    expect(opts.release).toBe('v1.2.3');
  });

  // Task 1.3
  it('reads tracesSampleRate from VITE_SENTRY_TRACE_SAMPLE_RATE and defaults to 1', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123');

    // explicit value
    vi.stubEnv('VITE_SENTRY_TRACE_SAMPLE_RATE', '0.1');
    const { createSentryPlugin: createA } = await import('../src/plugins/sentry');
    createA(mockRouter).install(mockApp);
    expect((captureInitOptions()).tracesSampleRate).toBe(0.1);

    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123');

    // absent → defaults to 1
    const { createSentryPlugin: createB } = await import('../src/plugins/sentry');
    createB(mockRouter).install(mockApp);
    expect((captureInitOptions()).tracesSampleRate).toBe(1);
  });
});

// ── beforeSend ────────────────────────────────────────────────────────────────

describe('beforeSend hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function getBeforeSend() { //NOSONAR
    const { createSentryPlugin } = await import('../src/plugins/sentry');
    createSentryPlugin(mockRouter).install(mockApp);
    const opts = captureInitOptions();
    // eslint-disable-next-line no-unused-vars
    return opts.beforeSend as (e: Record<string, unknown>) => Record<string, unknown> | null;
  }

  // Task 1.7
  it('scrubs secret query params from request URL', async () => {
    const beforeSend = await getBeforeSend();
    const event = {
      request: { url: 'https://app.example.com/auth/reset?token=abc123&code=xyz&foo=bar' },
    };
    const result = beforeSend(event) as typeof event;
    const url = new URL(result.request.url);
    expect(url.searchParams.get('token')).toBe('[Filtered]');
    expect(url.searchParams.get('code')).toBe('[Filtered]');
    expect(url.searchParams.get('foo')).toBe('bar');
  });

  it('scrubs secret query params from request query_string', async () => {
    const beforeSend = await getBeforeSend();
    const event = {
      request: { url: 'https://app.example.com/', query_string: 'password=secret&page=2' },
    };
    const result = beforeSend(event) as { request: { query_string: string } };
    const qs = new URLSearchParams(result.request.query_string);
    expect(qs.get('password')).toBe('[Filtered]');
    expect(qs.get('page')).toBe('2');
  });

  // Task 1.8
  it('recursively redacts secret keys from event.extra', async () => {
    const beforeSend = await getBeforeSend();
    const event = {
      extra: {
        operation: 'login',
        password: 'supersecret',
        nested: { token: 'abc', safe: 'value' },
      },
    };
    const result = beforeSend(event) as { extra: Record<string, unknown> };
    expect(result.extra.operation).toBe('login');
    expect(result.extra.password).toBe('[Filtered]');
    const nested = result.extra.nested as Record<string, unknown>;
    expect(nested.token).toBe('[Filtered]');
    expect(nested.safe).toBe('value');
  });
});

// ── useSentryScope ────────────────────────────────────────────────────────────

describe('useSentryScope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // Task 1.4
  it('calls Sentry.setUser with id and email when authenticated', async () => {
    const { useSentryScope } = await import('../src/composables/useSentryScope');
    const { useAuthStore } = await import('../src/stores/authStore');
    const app = withSetup(() => useSentryScope());
    const store = useAuthStore();
    store.uid = 'user-123';
    store.email = 'user@example.com';
    store.isAuthenticated = true;
    await nextTick();
    expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'user-123', email: 'user@example.com' });
    app.unmount();
  });

  // Task 1.5
  it('calls Sentry.setUser(null) when not authenticated', async () => {
    const { useSentryScope } = await import('../src/composables/useSentryScope');
    const { useAuthStore } = await import('../src/stores/authStore');
    // start authenticated then logout
    const app = withSetup(() => useSentryScope());
    const store = useAuthStore();
    store.isAuthenticated = true;
    await nextTick();
    store.resetToAnonymous();
    await nextTick();
    expect(Sentry.setUser).toHaveBeenLastCalledWith(null);
    app.unmount();
  });

  // Task 1.6
  it('calls Sentry.setTag with tenantRfc and role on authentication', async () => {
    const { useSentryScope } = await import('../src/composables/useSentryScope');
    const { useAuthStore } = await import('../src/stores/authStore');
    const { ROLE } = await import('@shared');
    const app = withSetup(() => useSentryScope());
    const store = useAuthStore();
    store.allowedInstitutionRfcs = ['RFC123456789'];
    store.setRole(ROLE.INSTITUTION_ADMIN);
    await nextTick();
    expect(Sentry.setTag).toHaveBeenCalledWith('tenantRfc', 'RFC123456789');
    expect(Sentry.setTag).toHaveBeenCalledWith('role', ROLE.INSTITUTION_ADMIN);
    app.unmount();
  });

  it('is a no-op when VITE_SENTRY_DSN is absent', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SENTRY_DSN', '');
    const { useSentryScope } = await import('../src/composables/useSentryScope');
    const { useAuthStore } = await import('../src/stores/authStore');
    const app = withSetup(() => useSentryScope());
    const store = useAuthStore();
    store.isAuthenticated = true;
    await nextTick();
    expect(Sentry.setUser).not.toHaveBeenCalled();
    app.unmount();
  });
});
