## 1. Tests (write first — TDD)

- [x] 1.1 Write unit test for `sentry.ts` plugin: verify `Sentry.init` is NOT called when `VITE_SENTRY_DSN` is absent
- [x] 1.2 Write unit test for `sentry.ts` plugin: verify `Sentry.init` IS called with correct DSN, `VITE_APP_ENV`, and release when `VITE_SENTRY_DSN` is set
- [x] 1.3 Write unit test for `sentry.ts` plugin: verify `tracesSampleRate` reads from `VITE_SENTRY_TRACE_SAMPLE_RATE` and defaults to `1`
- [x] 1.4 Write unit test for `useSentryScope` composable: verify `Sentry.setUser({ id, email })` is called when `authStore.isAuthenticated` becomes `true`
- [x] 1.5 Write unit test for `useSentryScope` composable: verify `Sentry.setUser(null)` is called when `authStore.isAuthenticated` becomes `false`
- [x] 1.6 Write unit test for `useSentryScope` composable: verify `Sentry.setTag` is called with `tenantRfc` and `role`
- [x] 1.7 Write unit test for `beforeSend` hook: verify `token`, `password`, `code` URL query params are replaced with `[Filtered]`
- [x] 1.8 Write unit test for `beforeSend` hook: verify secret keys in `event.extra` are recursively redacted

## 2. Dependencies

- [x] 2.1 Add `@sentry/vue` to `packages/web/package.json` dependencies
- [x] 2.2 Run `pnpm install` to update lockfile

## 3. Environment strategy

- [x] 3.1 Create `.firebaserc` at repo root with three aliases: `default` (development), `staging`, `production` (use placeholder project IDs until provisioned)
- [x] 3.2 Create `packages/web/.env.development` — set `VITE_APP_ENV=development`, `VITE_SENTRY_TRACE_SAMPLE_RATE=1`
- [x] 3.3 Create `packages/web/.env.staging` — set `VITE_APP_ENV=staging`, `VITE_SENTRY_TRACE_SAMPLE_RATE=0.5`
- [x] 3.4 Create `packages/web/.env.production` — set `VITE_APP_ENV=production`, `VITE_SENTRY_TRACE_SAMPLE_RATE=0.1`
- [x] 3.5 Update `packages/web/.env.example` — replace `VITE_SENTRY_ENVIRONMENT` with `VITE_APP_ENV`; document all vars
- [x] 3.6 Update `packages/web/.env.local` — replace `VITE_SENTRY_ENVIRONMENT` with `VITE_APP_ENV=development`
- [x] 3.7 Update `packages/web/scripts/check-env.mjs` — replace `VITE_SENTRY_ENVIRONMENT` with `VITE_APP_ENV`

## 4. Sentry plugin

- [x] 4.1 Create `packages/web/src/plugins/sentry.ts` with `Sentry.init` gated on `VITE_SENTRY_DSN`, Vue Router integration, `tracesSampleRate` from env, `replaysSessionSampleRate: 0`, `beforeSend` PII scrubbing, `captureException` helper
- [x] 4.2 Update `plugins/sentry.ts` to read `VITE_APP_ENV` instead of `VITE_SENTRY_ENVIRONMENT`
- [x] 4.3 Register `createSentryPlugin(router)` in `packages/web/src/app/createWebApp.ts` (before `app.mount`)

## 5. Auth store

- [x] 5.1 Add `uid: string | null` and `email: string | null` to `authStore` state and clear them in `resetToAnonymous`

## 6. Scope enrichment composable

- [x] 6.1 Create `packages/web/src/composables/useSentryScope.ts` — watches auth state, calls `Sentry.setUser({ id, email })` / `Sentry.setTag` / `Sentry.setUser(null)`
- [x] 6.2 Mount `useSentryScope()` once in `packages/web/src/app/AppRoot.vue`

## 7. CI — deploy pipeline

- [x] 7.1 Create `.github/workflows/deploy-staging.yml` — triggers on push to `develop`; runs `vite build --mode staging`; deploys to staging Firebase project via `firebase deploy --project staging`
- [x] 7.2 Create `.github/workflows/deploy-production.yml` — triggers on push to `main`; runs `vite build --mode production`; deploys to production Firebase project via `firebase deploy --project production`
- [x] 7.3 Document required GitHub Actions secrets in `packages/web/.env.example` comments: `VITE_SENTRY_DSN`, `VITE_SENTRY_RELEASE`, `FIREBASE_SERVICE_ACCOUNT_STAGING`, `FIREBASE_SERVICE_ACCOUNT_PRODUCTION`

## 8. Live specs

- [x] 8.1 Create `packages/web/specs/error-observability.md` documenting Sentry usage, `captureException` API, env vars, `beforeSend` contract, and anti-patterns
- [x] 8.2 Create `packages/web/specs/environments.md` documenting the three environments, Firebase project aliases, Vite mode files, branch-to-environment mapping, and how `VITE_APP_ENV` is detected

## 9. Quality Gates

- [x] 9.1 `pnpm -r typecheck` passes with zero errors
- [x] 9.2 `pnpm -r lint` passes with zero warnings
- [x] 9.3 `pnpm -r test` passes with zero failures (all new tests green)
