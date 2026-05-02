## Context

The repo already has separate GitHub Actions workflows for `stage` and `main`, but they currently build only the web package and deploy Firebase Hosting. `firebase.json` rewrites `/api/**` to the Cloud Function named `api`, and `packages/api/src/index.ts` exports both the Hono HTTP function and the Auth user profile trigger, so environment deploys must keep Hosting and Functions in sync.

Permanent Firebase behavior is documented under `firebase/*/specs/`; this change does not alter Auth, Firestore, Storage, or shared Zod schema contracts. The new permanent deployment contract will live in `openspec/specs/stage-production-deployment/spec.md` because it coordinates GitHub Actions, Firebase Hosting/Functions, Cloudflare, and environment configuration.

## Goals / Non-Goals

**Goals:**
- Make stage and production deploys validate the monorepo before publishing.
- Deploy Firebase Hosting and Functions together for `puintegra-staging` and `puintegra-production`.
- Keep staging on the Firebase default Hosting URL.
- Document production exposure through `app.puintegra.com` in the Cloudflare `puintegra.com` zone.
- Bootstrap a configured system administrator permission after staging and production deploys.
- Document that government PUI API calls need a backend static egress IPv4 path in a separate future integration.

**Non-Goals:**
- No shared Zod schema changes.
- No Firebase security rules, Storage rules, Auth provider, MFA, blocking function, or production auth posture changes.
- No real-user password seeding or forced email verification state changes.
- No Cloud NAT, Cloud Run, Cloud Tasks, Pub/Sub, or government PUI API integration implementation in this change.
- No migration from service account JSON to Workload Identity Federation.

## Decisions

- **Deploy with Firebase CLI instead of Hosting-only action.** The workflow will use the repo-pinned `firebase-tools` dependency through `pnpm exec firebase deploy --only hosting,functions`. This publishes the API function together with Hosting rewrites. Alternative considered: keep `FirebaseExtended/action-hosting-deploy`; rejected because it does not deploy Functions.
- **Use committed mode files for public runtime config.** Workflows will let Vite read non-secret `VITE_*` Firebase and Sentry values from `.env.staging` and `.env.production`, and will resolve the Firebase deploy project from `VITE_FIREBASE_PROJECT_ID` in the same file. Alternative considered: repository-level suffixed variables for each environment; rejected because these values are public configuration and the deployment policy now prefers committed mode files.
- **Bootstrap permission, not credentials.** The post-deploy bootstrap writes only a `permissions/{email__system}` grant for `SYSTEM_ADMINISTRATOR`; the real person must create or recover their Firebase Auth account through the app flow. Alternative considered: creating an Auth user and setting a password from CI; rejected because it would place real credentials in operational automation.
- **Keep production automatic from `main`.** The production workflow must not require manual reviewers unless the deployment policy changes later.
- **Keep static egress IPv4 separate from user-facing deployment.** User ingress through Hosting and Functions has no fixed-source-IP requirement. Future government API calls must originate from backend code routed through a reserved static IPv4 using VPC egress and Cloud NAT.

## Risks / Trade-offs

- **Function deploys can require broader service account permissions** -> Document the required Firebase/GCP setup and validate in staging before production.
- **Production custom-domain setup has console/DNS dependencies** -> Keep the workflow deployable before DNS cutover and document Cloudflare/Firebase prerequisites separately.
- **Cloudflare proxy can delay Firebase certificate validation if enabled too early** -> Keep the DNS record unproxied until Firebase verifies the domain and provisions the certificate.
- **Automatic production deploys increase blast radius** -> Require full quality gates in the production workflow and keep deploy credentials in explicit repository secrets.
- **Bootstrap could overwrite a revoked admin permission** -> Keep the bootstrap email explicit in `PUINTEGRA_BOOTSTRAP_SYSTEM_ADMIN_EMAIL` and make the script idempotent for the configured account only.

## Migration Plan

1. Add the OpenSpec capability and permanent deployment spec.
2. Update staging and production workflows to run gates, build web/API, and deploy Hosting + Functions.
3. Configure repository-level GitHub secrets and the bootstrap email variable outside the repo.
4. Validate staging deploy from `stage`.
5. Configure Firebase Hosting custom domain and Cloudflare DNS/WAF for `app.puintegra.com`.
6. Validate production deploy from `main`.

Rollback: revert the workflow changes or redeploy the previous commit to the affected Firebase project. If custom-domain cutover fails, disable Cloudflare proxy or remove the custom DNS record while keeping Firebase default Hosting URLs available.

## Open Questions

- None for this implementation.
