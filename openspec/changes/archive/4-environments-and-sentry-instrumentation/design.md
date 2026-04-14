## Context

PUIntegra has two related gaps: no frontend error observability and no formal deployment environment strategy. Both are addressed in this change because the environment strategy is a prerequisite — Sentry needs a canonical `environment` value, and that value must be determined by the build pipeline, not manually set per-developer.

Current state constraints:
- Auth state is managed via `authStore` (Pinia) — `role` is available; `uid` and `email` are being added.
- Tenant RFC is in `authStore.allowedInstitutionRfcs[0]`.
- The project uses Vite, so env vars are injected via `VITE_*` prefix.
- Tests run in Vitest — Sentry must be a no-op during tests.
- No `.firebaserc` exists; only one Firebase project is currently configured.

## Goals / Non-Goals

**Goals:**
- Define three named environments: `development` (local only), `staging`, `production`.
- Map each environment to a dedicated Firebase project via `.firebaserc` aliases.
- Use per-mode Vite env files (`.env.development`, `.env.staging`, `.env.production`) so builds are self-describing.
- Introduce `VITE_APP_ENV` as the single canonical runtime environment string.
- Automate deployments via GitHub Actions: `stage` branch → staging, `main` branch → production. `development` is **not CI-deployed** — it is used locally on feature branches before pushing to `stage`.
- Capture unhandled Vue errors and performance data in production via Sentry.
- Enrich every Sentry event with `userId`, `userEmail`, `tenantRfc`, `route`, and `role`.
- Gate Sentry initialisation on `VITE_SENTRY_DSN` — no-op when absent.

**Non-Goals:**
- Backend (Cloud Functions) instrumentation — separate change.
- Sentry session replay or profiling.
- Modifying Zod schemas or Firestore rules.
- Multi-region Firebase setup.

## Decisions

### D0 — `VITE_APP_ENV` as canonical environment identifier

**Decision**: Replace `VITE_SENTRY_ENVIRONMENT` with `VITE_APP_ENV`. Sentry reads from `VITE_APP_ENV`; it is set per Vite mode file.

**Rationale**: A single env identifier prevents drift between tools (Sentry, future feature flags, logging levels). All tooling reads from one place.

**Values**: `development` | `staging` | `production`

---

### D1 — Per-mode Vite env files

**Decision**: Use Vite's built-in mode system:
- `.env.development` — loaded by `vite dev` and `vite build --mode development`
- `.env.staging` — loaded by `vite build --mode staging`
- `.env.production` — loaded by `vite build --mode production` (also default for `vite build`)

CI injects `--mode staging` or `--mode production` at build time.

**Rationale**: Keeps environment-specific values in version-controlled, diff-able files. Secrets are still injected via CI env vars (not committed).

---

### D2 — `.firebaserc` with three project aliases

**Decision**: Add `.firebaserc` mapping:
```json
{
  "projects": {
    "default":    "<dev-firebase-project-id>",
    "staging":    "<staging-firebase-project-id>",
    "production": "<production-firebase-project-id>"
  }
}
```

Firebase CLI commands use `--project staging` / `--project production` in CI.

---

### D3 — GitHub Actions branch-based deploy jobs

**Decision**:
- Push to `stage` → build with `--mode staging` → deploy to staging Firebase project.
- Push to `main` → build with `--mode production` → deploy to production Firebase project.

Each job uses a dedicated service account secret (`FIREBASE_SERVICE_ACCOUNT_STAGING` / `FIREBASE_SERVICE_ACCOUNT_PRODUCTION`).

---

### D4 — Dedicated Sentry plugin file

**Decision**: Sentry initialisation lives in `packages/web/src/plugins/sentry.ts`, exported as a Vue plugin. `captureException(error, metadata?)` is the only public API for manual error capture.

**Rationale**: Keeps `main.ts` lean and makes the plugin independently testable. Enforces DSN guard and metadata contract on every capture.

---

### D5 — Scope enrichment via `useSentryScope` composable

**Decision**: `useSentryScope()` watches `authStore` and calls `Sentry.setUser` / `Sentry.setTag` reactively. Mounted once in `AppRoot.vue`.

**Context set on login**: `user.id` (uid), `user.email`, tag `role`, tag `tenantRfc`.
**On logout**: `Sentry.setUser(null)`.

## Risks / Trade-offs

- **Three Firebase projects need to be provisioned** → Mitigation: document project IDs in `.firebaserc`; placeholder values committed, real IDs added as CI secrets or `.env.local`.
- **PII in Sentry events** → Mitigation: `beforeSend` scrubs `token`, `password`, `code`, `secret`, `key`, `auth`, `api_key` from URLs and extras recursively.
- **Bundle size increase (~50 KB gzipped for `@sentry/vue`)** → Acceptable.
- **Test pollution** → `VITE_SENTRY_DSN` is never set in CI test jobs; early-exit guard prevents SDK calls.
- **`tracesSampleRate=1` in dev** → Expected; lower to `0.1` in `.env.production`.

## Migration Plan

1. Create `.firebaserc` with three project aliases (placeholder IDs).
2. Create Vite mode env files (`.env.development`, `.env.staging`, `.env.production`).
3. Replace `VITE_SENTRY_ENVIRONMENT` with `VITE_APP_ENV` everywhere.
4. Complete Sentry plugin + composable + registration.
5. Add GitHub Actions deploy jobs.
6. Provision real Firebase projects and update `.firebaserc` + CI secrets.

**Rollback**: Remove Sentry plugin registration from `main.ts`. Revert `.firebaserc` and GitHub Actions jobs. No schema or Firestore changes to revert.

## Open Questions

- What are the real Firebase project IDs for staging and production? (Placeholders used until provisioned.)
- Should `tracesSampleRate` in staging match production (`0.1`) or development (`1`)?


**Decision**: Sentry initialisation lives in `packages/web/src/plugins/sentry.ts`, exported as a Vue plugin, and registered in `main.ts` alongside other plugins.

**Rationale**: Keeps `main.ts` lean and makes the plugin independently testable and mockable. Follows the existing `packages/web` plugin pattern (router, pinia are also registered separately).

**Alternatives considered**:
- Inline in `main.ts` — rejected: harder to mock in tests and violates single-responsibility.

---

### D2 — Scope enrichment via a dedicated composable

**Decision**: A composable `useSentryScope` watches `authStore` state and calls `Sentry.setUser` / `Sentry.setTag` reactively. It is mounted once in `AppRoot.vue`.

**Rationale**: Decouples identity propagation from both the Sentry plugin and the auth store. The composable can be unit-tested with a mocked Sentry client.

**Alternatives considered**:
- Pinia plugin / watcher inside `authStore` — rejected: couples monitoring concern to the domain store.

---

### D3 — Environment variable strategy

**Decision**: Three env vars control Sentry behaviour:

| Variable | Purpose | Required in prod |
|---|---|---|
| `VITE_SENTRY_DSN` | Routes events to the correct project | Yes |
| `VITE_SENTRY_ENVIRONMENT` | Tags events (`production`, `staging`) | Yes |
| `VITE_SENTRY_RELEASE` | Links events to a specific deploy | Recommended |

If `VITE_SENTRY_DSN` is absent or empty, `sentry.ts` exits early without calling `Sentry.init`.

**Rationale**: Prevents accidental event submission in local dev and test environments. The DSN is never committed to source control per project security policy.

---

### D4 — Vue Router integration

**Decision**: Pass the router instance to `Sentry.init` via `routingInstrumentation: Sentry.vueRouterInstrumentation(router)`.

**Rationale**: Provides automatic transaction names matching route `name` fields, and breadcrumbs on every navigation — no manual instrumentation needed.

## Risks / Trade-offs

- **PII in breadcrumbs** → Mitigation: configure `beforeSend` hook to scrub sensitive query params (`token`, `password`) before events leave the browser.
- **Bundle size increase (~50 KB gzipped)** → Acceptable; Sentry is lazy-loaded after app bootstrap if tree-shaking is insufficient.
- **Sentry quota exhaustion under high traffic** → Mitigation: set `tracesSampleRate: 0.1` (10 % of transactions) and `replaysSessionSampleRate: 0` (replay not enabled).
- **Test pollution** → Mitigation: `VITE_SENTRY_DSN` is never set in CI test jobs; the early-exit guard in `sentry.ts` prevents any SDK calls.

## Migration Plan

1. Add `@sentry/vue` to `packages/web` dependencies.
2. Create `packages/web/src/plugins/sentry.ts`.
3. Create `packages/web/src/composables/useSentryScope.ts`.
4. Register plugin and composable in `main.ts` / `AppRoot.vue`.
5. Add `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`, `VITE_SENTRY_RELEASE` to `.env.example` (values empty).
6. Add the same vars as GitHub Actions secrets and inject in the build step of the CI workflow.
7. Verify in Sentry dashboard that a test event arrives after deploy to staging.

**Rollback**: Remove the plugin registration from `main.ts`. No Firestore or schema changes to revert.

## Open Questions

- Should `tracesSampleRate` be configurable via env var or hardcoded? (Current proposal: hardcode `0.1` for now, revisit after first month of data.)
- Do we want Sentry `beforeSend` to filter out 4xx errors from the API to reduce noise?
