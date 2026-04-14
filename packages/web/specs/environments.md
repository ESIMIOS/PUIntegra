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

Per-environment defaults live in **committed** mode files — they contain no secrets and are safe to track.
Only `VITE_SENTRY_RELEASE` is injected by CI at build time (git SHA).

| File | Committed | Loaded when |
|---|---|---|
| `.env.development` | ✅ | `vite dev` (local development only — not deployed by CI) |
| `.env.staging` | ✅ | `vite build --mode staging` (CI: push to `stage`) |
| `.env.production` | ✅ | `vite build` or `--mode production` (CI: push to `main`) |
| `.env.local` | ❌ (git-ignored) | Always (overrides mode files — use to enable Sentry locally) |
| `.env.example` | ✅ | Reference only — never loaded by Vite |

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

This replaces the old `check-env.mjs` pre-script which ran before Vite and could not see Vite env files.

---

## Anti-patterns

- ❌ Hardcoding environment names as strings — always read from `VITE_APP_ENV`.
- ❌ Using `import.meta.env.MODE` in application logic.
- ❌ Committing `.env.local` or any file containing real secrets.
- ❌ Running `firebase deploy` without `--project <alias>` — defaults to `default` (dev).
- ❌ Using `VITE_SENTRY_ENVIRONMENT` — replaced by `VITE_APP_ENV`.
- ❌ Adding `VITE_*` vars from mode files to a pre-Vite Node.js check script — Vite env files are not visible to `process.env` before Vite starts. Use `checkEnvPlugin` in `vite.config.ts` instead.
