## Why

PUIntegra has two related gaps: no runtime error visibility in production, and no formal deployment environment strategy. Errors go undetected until user reports, and there is no defined separation between development, staging, and production — no per-environment Firebase projects, no Vite env files, and no automated deploy pipeline beyond SonarQube. Both gaps are addressed together because the environment strategy is the prerequisite for Sentry to correctly tag events by environment.

## What Changes

### Environment strategy
- Define three official environments: `development`, `staging`, `production`.
- Create `.firebaserc` mapping each environment to a dedicated Firebase project alias.
- Add per-environment Vite env files: `.env.development`, `.env.staging`, `.env.production`, `.env.example`.
- Introduce `VITE_APP_ENV` as the single canonical runtime environment identifier (replaces `VITE_SENTRY_ENVIRONMENT`).
- Add a `check-env.mjs` script that warns on missing optional vars before `dev`/`build`.
- Extend GitHub Actions with two deploy jobs: `develop` branch → staging Firebase project, `main` branch → production Firebase project.

### Sentry instrumentation
- Install `@sentry/vue` in `packages/web`.
- Create `packages/web/src/plugins/sentry.ts`: `Sentry.init` gated on `VITE_SENTRY_DSN`, Vue Router integration, `tracesSampleRate` from `VITE_SENTRY_TRACE_SAMPLE_RATE` (default 1), `replaysSessionSampleRate: 0`, `beforeSend` PII scrubbing.
- Create `packages/web/src/composables/useSentryScope.ts`: reactive sync of `authStore` state (`uid`, `email`, `activeRole`, `tenantRfc`) to Sentry scope.
- Add `uid` and `email` fields to `authStore`.
- Expose `captureException(error, metadata?)` helper; `SentryMetadata` interface includes `userEmail`.
- Register plugin in `main.ts`; mount `useSentryScope()` in `AppRoot.vue`.

## Capabilities

### New Capabilities

- `environment-strategy`: Defines and operationalises three deployment environments (development / staging / production), each backed by a dedicated Firebase project, per-environment Vite env files, and an automated GitHub Actions deploy pipeline.
- `sentry-instrumentation`: Captures unhandled errors and performance data in the Vue 3 frontend, enriches every event with `userId`, `userEmail`, `tenantRfc`, `route`, and `role` context, and routes them to the configured Sentry project.

### Modified Capabilities

<!-- No existing spec-level requirements change. -->

## Impact

- **packages/web**: `plugins/sentry.ts`, `composables/useSentryScope.ts`, `stores/authStore.ts` (uid + email fields), `main.ts` (plugin registration), `AppRoot.vue` (composable mount), `.env.*` files, `scripts/check-env.mjs`.
- **packages/shared**: No Zod schema changes required.
- **Firebase**: `.firebaserc` with project aliases; `firebase.json` hosting targets.
- **CI**: `.github/workflows/` — new deploy jobs for staging and production; secrets `VITE_SENTRY_DSN`, `VITE_SENTRY_RELEASE`, Firebase service account tokens.
- **Firebase security rules**: Not affected.
- **Dependencies**: `@sentry/vue` added to `packages/web`.
