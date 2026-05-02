## 1. Tests And Validation Strategy

- [x] 1.1 Define workflow validation through existing monorepo gates and optional `actionlint` syntax checks.
- [x] 1.2 Confirm no shared Zod schema tests are required because this change does not alter shared contracts.

## 2. Deployment Specifications

- [x] 2.1 Add permanent `stage-production-deployment` spec covering stage, production, Cloudflare, env, and PUI egress boundaries.
- [x] 2.2 Keep the change spec aligned with the permanent deployment contract.

## 3. Workflow Implementation

- [x] 3.1 Update staging deploy workflow to run gates, build web/API, and deploy Firebase Hosting + Functions to staging.
- [x] 3.2 Update production deploy workflow to run gates, build web/API, and deploy Firebase Hosting + Functions to production.
- [x] 3.3 Scope deploy credentials and runtime variables to GitHub environments.

## 4. Quality Gates

- [x] 4.1 Run `pnpm -r typecheck`.
- [x] 4.2 Run `pnpm -r lint`.
- [x] 4.3 Run `pnpm -r test`.
- [x] 4.4 Run `pnpm --filter @puintegra/api run test:firestore-rules`.
- [x] 4.5 Run workflow syntax validation with `actionlint` when available.

## 5. Repository-Level Configuration And Bootstrap

- [x] 5.1 Update workflows to read public Vite config and Firebase project IDs from committed mode files.
- [x] 5.2 Add idempotent system administrator permission bootstrap script and tests.
- [x] 5.3 Run the bootstrap script after staging and production deploys.
- [x] 5.4 Omit default login credentials from staging and production builds.
- [x] 5.5 Re-run focused validation for the bootstrap and login changes.
- [x] 5.6 Remove repository-variable dependency for public `VITE_*` values and Firebase project IDs.
