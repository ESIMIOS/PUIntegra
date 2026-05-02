## Why

The current deployment workflows publish Firebase Hosting only, while the deployed app relies on the Hono Cloud Function API behind `/api/**`. Stage and production also need explicit environment requirements so Firebase, Cloudflare, GitHub, and committed mode files stay aligned before production traffic moves to `app.puintegra.com`.

## What Changes

- Tune staging and production GitHub Actions to validate the monorepo, build the web app and API package, then deploy Firebase Hosting and Functions together.
- Keep staging on the Firebase default Hosting URL, with no staging custom domain.
- Document production custom-domain setup for `app.puintegra.com` through Firebase Hosting and the Cloudflare `puintegra.com` zone.
- Keep service account JSON authentication for deploys, using repository-level GitHub secrets.
- Read non-secret public `VITE_*` Firebase and Sentry configuration from committed `.env.staging` and `.env.production` files.
- Add an idempotent post-deploy bootstrap that grants a configured email `SYSTEM_ADMINISTRATOR` permission on `SYSTEM_RFC` without setting a real password.
- Document that future government PUI API calls require a backend egress path with a reserved static IPv4, separate from user-facing Hosting and Functions ingress.
- Do not change shared Zod schemas, Firebase security rules, Storage rules, Auth providers, MFA, blocking functions, or production auth posture.

## Capabilities

### New Capabilities
- `stage-production-deployment`: Defines the stage and production CI/CD deployment contract, environment prerequisites, domain exposure, and backend egress boundary.

### Modified Capabilities
- None.

## Impact

- Affected code: `.github/workflows/deploy-staging.yml`, `.github/workflows/deploy-production.yml`, `packages/api/src/ops/`, `packages/web/src/pages/auth/AuthLoginPage.vue`.
- Affected specs/docs: new OpenSpec capability under this change and a permanent deployment spec.
- Affected systems: GitHub Actions, Firebase Hosting, Firebase Functions, Firebase Console project setup, Cloudflare DNS/WAF for `puintegra.com`.
- Shared Zod schemas are not affected.
- Firebase security rules are not affected.
