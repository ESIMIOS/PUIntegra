# Error Observability — Sentry (Live Spec)

## Purpose

Document the standard for runtime error capture and observability in `packages/web`,
covering plugin setup, scope enrichment, manual capture, and the `beforeSend` security contract.

---

## Architecture

| Concern | File |
|---|---|
| Sentry initialisation (plugin) | `packages/web/src/plugins/sentry.ts` |
| Auth scope sync | `packages/web/src/composables/useSentryScope.ts` |
| Session inactivity → logout | `packages/web/src/composables/useSessionInactivity.ts` |

### Plugin registration

`createSentryPlugin(router)` is registered in `main.ts` **before** the app is mounted.
It is a no-op when `VITE_SENTRY_DSN` is absent — safe in local dev and CI.

```ts
// main.ts
import { createSentryPlugin } from '@/plugins/sentry';
app.use(createSentryPlugin(router));
```

### Scope enrichment

`useSentryScope()` must be called **once** in `AppRoot.vue` (or equivalent top-level component).
It reactively syncs auth state with the active Sentry scope.

```ts
// AppRoot.vue <script setup>
import { useSentryScope } from '@/composables/useSentryScope';
useSentryScope();
```

**Context set on login:**

| Sentry field | Source |
|---|---|
| `user.id` | `authStore.uid` |
| `user.email` | `authStore.email` |
| tag `role` | `authStore.activeRole` |
| tag `tenantRfc` | `authStore.allowedInstitutionRfcs[0]` |

On logout: `Sentry.setUser(null)` clears all user context.

---

## Manual error capture

Use `captureException` from `@/plugins/sentry` for all explicit error reporting.
**Never call `Sentry.*` directly** — this ensures the DSN guard and metadata contract are always applied.

```ts
import { captureException } from '@/plugins/sentry';

captureException(err, {
  operation: 'submitRequest',   // what the user was doing
  requestId: fub,               // relevant IDs
  userEmail: authStore.email ?? undefined,
});
```

### `SentryMetadata` interface

```ts
interface SentryMetadata extends Record<string, unknown> {
  operation?: string;   // human-readable description of the failing operation
  userEmail?: string;   // email of the acting user
}
```

All fields are optional. Add any contextual key-value pairs that aid diagnosis.
The `beforeSend` hook will automatically scrub secret keys before the event is transmitted.

---

## Environment variables

Managed in `packages/web/.env.example` (committed, empty values) and `.env.local` (git-ignored).

| Variable | Required in prod | Default | Purpose |
|---|---|---|---|
| `VITE_SENTRY_DSN` | Yes | — | Routes events to the Sentry project |
| `VITE_APP_ENV` | Yes | `development` | Tags events by environment (set automatically by Vite mode file) |
| `VITE_SENTRY_RELEASE` | Recommended | — | Links events to a deploy/version |
| `VITE_SENTRY_TRACE_SAMPLE_RATE` | No | `1` | Fraction of performance transactions captured (0–1) |

In production set `VITE_SENTRY_TRACE_SAMPLE_RATE=0.1` to avoid quota exhaustion.

---

## `beforeSend` security contract

All events pass through a `beforeSend` hook before transmission. It:

1. **Scrubs URL query parameters** — replaces values of `token`, `password`, `code`, `secret`, `key`, `auth`, `api_key` with `[Filtered]`.
2. **Redacts secret keys in `event.extra`** — recursively replaces values for `password`, `token`, `secret`, `api_key`, `authorization`.

**Rule**: if a new secret-carrying field is added to the codebase, add its key to the
`SECRET_PARAMS` / `SECRET_EVENT_KEYS` constants in `sentry.ts`.

---

## Anti-patterns

- ❌ `Sentry.captureException(err)` directly — bypasses DSN guard and metadata.
- ❌ Passing raw secrets (tokens, passwords) in `SentryMetadata` — `beforeSend` will catch them, but don't rely on it as the first line of defence.
- ❌ Calling `useSentryScope()` more than once — mount it only in `AppRoot`.
- ❌ Hardcoding the DSN — always use `VITE_SENTRY_DSN`.
