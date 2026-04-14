/**
 * @package web
 * @name sentry.ts
 * @version 0.0.1
 * @description Plugin de Vue para inicializar Sentry con integración de Vue Router,
 * enriquecimiento de contexto, scrubbing de secretos y soporte para metadata adicional.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-13)  Versión inicial del plugin de Sentry.  @antigravity
 */

import * as Sentry from '@sentry/vue';
import type { App } from 'vue';
import type { Router } from 'vue-router';

/** Query-parameter keys whose values must never leave the browser. */
const SECRET_PARAMS = ['token', 'password', 'code', 'secret', 'key', 'auth', 'api_key'];

/** Top-level event keys that may carry PII and should be stripped. */
const SECRET_EVENT_KEYS = new Set(['password', 'token', 'secret', 'api_key', 'authorization']);

/**
 * Recursively redacts secret keys from any plain object.
 * Returns a new object; never mutates the original.
 */
function redactSecrets(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (SECRET_EVENT_KEYS.has(k.toLowerCase())) return [k, '[Filtered]'];
      if (v && typeof v === 'object' && !Array.isArray(v))
        return [k, redactSecrets(v as Record<string, unknown>)];
      return [k, v];
    })
  );
}

/**
 * Strips sensitive query parameters from a URL string.
 */
function scrubUrl(url: string): string {
  try {
    const parsed = new URL(url);
    SECRET_PARAMS.forEach((p) => {
      if (parsed.searchParams.has(p)) parsed.searchParams.set(p, '[Filtered]');
    });
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Initialises Sentry as a Vue plugin.
 * No-op when VITE_SENTRY_DSN is absent — safe for local dev and CI.
 */
export function createSentryPlugin(router: Router) {
  return {
    install(app: App) {
      const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
      if (!dsn) return;

      const tracesSampleRate = Number(
        import.meta.env.VITE_SENTRY_TRACE_SAMPLE_RATE ?? 1
      );
      const environment = (import.meta.env.VITE_APP_ENV as string) ?? 'development';

      Sentry.init({
        app,
        dsn,
        environment,
        release: (import.meta.env.VITE_SENTRY_RELEASE as string) || undefined,
        tracesSampleRate,
        replaysSessionSampleRate: 0,
        integrations: [Sentry.browserTracingIntegration({ router })],

        beforeSend(event) {
          // Scrub request URL
          if (event.request?.url) {
            event.request.url = scrubUrl(event.request.url);
          }

          // Scrub query string on the request object
          if (event.request?.query_string && typeof event.request.query_string === 'string') {
            try {
              const qs = new URLSearchParams(event.request.query_string);
              SECRET_PARAMS.forEach((p) => { if (qs.has(p)) qs.set(p, '[Filtered]'); });
              event.request.query_string = qs.toString();
            } catch { /* non-parseable — leave as-is */ }
          }

          // Scrub extra / contexts
          if (event.extra) {
            event.extra = redactSecrets(event.extra as Record<string, unknown>);
          }

          return event;
        },
      });

    },
  };
}

// ─── Public capture helper ────────────────────────────────────────────────────

/**
 * Additional metadata attached as Sentry `extras` on every manual capture.
 * Common fields: operation, requestId, tenantRfc, userEmail.
 */
export interface SentryMetadata extends Record<string, unknown> {
  /** Human-readable description of the operation that failed. */
  operation?: string;
  /** Email of the acting user — included in the event extras for quick lookup. */
  userEmail?: string;
}

/**
 * Captures an exception and attaches optional metadata as Sentry extras.
 *
 * @example
 * captureException(err, { operation: 'submitRequest', requestId: fub, userEmail: email });
 */
export function captureException(error: unknown, metadata?: SentryMetadata): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    if (metadata) scope.setExtras(metadata);
    Sentry.captureException(error);
  });
}
