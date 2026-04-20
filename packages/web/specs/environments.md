# Deployment Environments (Live Spec)

## Overview

PUIntegra defines three named environments. `staging` and `production` are
deployed automatically via GitHub Actions. `development` is **local only** —
used by developers on feature branches before pushing to `stage`.
Each environment maps to a dedicated Firebase project and is identified at
runtime via `VITE_APP_ENV`.

| Environment | `VITE_APP_ENV` | Firebase alias | Used by |
|---|---|---|---|
| Development | `development` | `default` (`puintegra-dev`) | Local `vite dev` — **not deployed by CI** |
| Staging | `staging` | `staging` (`puintegra-staging`) | CI: push to `stage` branch |
| Production | `production` | `production` (`puintegra-production`) | CI: push to `main` branch |

---

## Environment detection

**Always use `VITE_APP_ENV`** — the single canonical identifier. Never read
`import.meta.env.MODE` directly in application code.

```ts
// ✅ Correct
const env = import.meta.env.VITE_APP_ENV; // 'development' | 'staging' | 'production'

// ❌ Avoid
const env = import.meta.env.MODE;         // Vite internal — not semantically stable
```

---

## Vite mode files

Per-environment defaults live in **committed root mode files** — they contain no secrets and are safe to track.
Only `VITE_SENTRY_RELEASE` is injected by CI at build time (git SHA).

| File | Committed | Loaded when |
|---|---|---|
| Root `.env.development` | ✅ | `vite dev` (local development only — not deployed by CI) |
| Root `.env.staging` | ✅ | `vite build --mode staging` (CI: push to `stage`) |
| Root `.env.production` | ✅ | `vite build` or `--mode production` (CI: push to `main`) |
| Root `.env.local` | ❌ (git-ignored) | Always (overrides mode files — use for local secrets/overrides) |
| Root `.env.example` | ✅ | Reference only — never loaded by Vite |

`packages/web/vite.config.ts` sets `envDir` to the repository root so web and API tooling share one env source of truth.

Default values per mode:

| Variable | development | staging | production |
|---|---|---|---|
| `VITE_APP_ENV` | `development` | `staging` | `production` |
| `VITE_SENTRY_DSN` | — (absent, Sentry disabled) | committed value | committed value |
| `VITE_SENTRY_TRACE_SAMPLE_RATE` | `1` | `0.5` | `0.1` |

CI-injected at build time (not in mode files):

| Variable | Source |
|---|---|
| `VITE_SENTRY_RELEASE` | `github.sha` at build time |

---

## Local Firebase emulator variables

The web package uses public Firebase client configuration. These values are safe to document because they are bundled into the browser and are not secrets.

Required for local emulator-backed development:

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Public Firebase web API key for the selected project |
| `VITE_FIREBASE_AUTH_DOMAIN` | Public Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID, typically `puintegra-dev` locally |
| `VITE_FIREBASE_STORAGE_BUCKET` | Public Firebase Storage bucket name |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Public Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Public Firebase app ID |
| `VITE_FIREBASE_AUTH_EMULATOR_URL` | Auth Emulator URL, default `http://127.0.0.1:9099` |
| `VITE_FIRESTORE_EMULATOR_HOST` | Firestore Emulator host, default `127.0.0.1` |
| `VITE_FIRESTORE_EMULATOR_PORT` | Firestore Emulator port, default `8081` |
| `VITE_API_BASE_URL` | Optional base URL for the Functions API when the web app is not served behind Hosting rewrites or Vite's local `/api` proxy |

Local seed scripts also require a process environment variable for emulator-only institution data. This is not a Vite variable, is loaded by API emulator scripts from root env files, and must not be committed with real values.

The local Auth Emulator password is deterministic development data, currently `local-password`, and is defined by `packages/api/src/emulator/seedData.ts`.

| Variable | Purpose |
|---|---|
| `PUINTEGRA_EMULATOR_INSTITUTION_SHARED_SECRET` | Shared secret stored in the seeded local institution document |

---

## Firebase project aliases (`.firebaserc`)

```json
{
  "projects": {
    "default":    "puintegra-dev",
    "staging":    "puintegra-staging",
    "production": "puintegra-production"
  }
}
```

> **Note**: Replace placeholder project IDs with real Firebase project IDs once provisioned.

---

## CI/CD branch-to-environment mapping

Defined in `.github/workflows/`:

| Workflow file | Trigger | Build mode | Firebase target |
|---|---|---|---|
| `deploy-staging.yml` | push to `stage` | `--mode staging` | `puintegra-staging` |
| `deploy-production.yml` | push to `main` | `--mode production` | `puintegra-production` |

Required GitHub Actions secrets:

| Secret | Purpose |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_STAGING` | Firebase service account for staging deploy |
| `FIREBASE_SERVICE_ACCOUNT_PRODUCTION` | Firebase service account for production deploy |

> `VITE_SENTRY_DSN` is **not** a GitHub Actions secret — it is committed directly in `.env.staging` and `.env.production` (it is a public value that ends up in the JS bundle).

---

## Build-time env validation (`vite.config.ts`)

A `checkEnvPlugin` Vite plugin runs during `configResolved` (after all `.env.*` files are merged) and fails the build early with a clear message if required vars are missing.

**Rules enforced:**
- `VITE_APP_ENV` must always be set (guaranteed by committed mode files — failure means a mode file is missing)
- `VITE_SENTRY_DSN` must be set for `staging` and `production` builds (committed in `.env.staging`/`.env.production`)
- Validation is **skipped in `test` mode** (Vitest runs with `mode=test`, no `.env.test` needed)

This replaces the previous pre-script approach (`check-env.mjs`) which ran before Vite loaded env files and therefore could not see any `VITE_*` variables.

---

## Anti-patterns

- ❌ Hardcoding environment names as strings — always read from `VITE_APP_ENV`.
- ❌ Using `import.meta.env.MODE` in application logic.
- ❌ Committing root `.env.local` or any file containing real secrets.
- ❌ Running `firebase deploy` without `--project <alias>` — defaults to `default` (dev).
- ❌ Using `VITE_SENTRY_ENVIRONMENT` — replaced by `VITE_APP_ENV`.
- ❌ Adding `VITE_*` vars from mode files to a pre-Vite Node.js check script — Vite env files are not visible to `process.env` before Vite starts. Use `checkEnvPlugin` in `vite.config.ts` instead.
