## Context

The web app already has the auth route skeleton and Firebase email/password login through `packages/web/src/gateways/firebaseAuthGateway.ts`, but `/auth/create-account`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/security-setup` are placeholders. Firebase Auth user creation already triggers `createUserProfile`, which writes `users/{uid}` and a `USER_ACCOUNT_CREATION` log. Granted access is represented by `PermissionSchema`, user profiles by `UserSchema`, account audit events by `LogSchema`, and API envelopes by `ApiResponseSchema`.

Permanent specs that must stay aligned are `firebase/auth/specs/emulator-auth.md`, `packages/web/specs/firebase-emulator-mode.md`, `packages/web/specs/frontend-foundations.md`, `firebase/functions/specs/hono-emulator-api.md`, and `openspec/specs/api-domain-write-boundary/spec.md`. Current live specs explicitly defer MFA and production Firebase Auth security posture; this change therefore separates application UX/specification from any production Auth provider, MFA, App Check, or blocking-function configuration that requires explicit human approval.

## Goals / Non-Goals

**Goals:**
- Deliver complete PUIntegra auth lifecycle UX for account creation, email verification, forgot password, reset password, and security setup.
- Enforce permission-gated registration and verified-email access before resolving PUIntegra application contexts.
- Use Firebase Auth email action codes for verification and reset completion instead of custom credential tokens.
- Limit each user to one TOTP factor and provide an admin-assisted reset path for lost authenticator access.
- Provide professional, friendly, accessible auth UI guidance with clear instructions, contextual help, and safe recovery paths.
- Add professional-grade abuse controls, neutral external responses, and sanitized audit logging.
- Keep TypeScript types inferred from Zod schemas and reuse existing shared contracts unless a missing contract is explicitly approved.

**Non-Goals:**
- No direct edits to `packages/shared/src/schemas/` without a separate explicit approval.
- No direct edits to `firebase/firestore/firestore.rules` unless implementation discovers and receives approval for a rules change.
- No production Firebase Auth provider, MFA, App Check enforcement, or blocking-function rollout without explicit approval.
- No custom password storage, custom reset tokens, or custom verification tokens.
- No auto-login after password reset completion.

## Decisions

1. Use Firebase Auth as the credential and email-action engine.
   - Rationale: Firebase already owns password hashing, verification emails, reset emails, action codes, password policy, and TOTP primitives.
   - Alternative considered: custom API-generated verification/reset tokens. Rejected because it would duplicate sensitive identity-provider behavior and increase credential risk.

2. Enforce account eligibility with provider-side registration policy plus app-side preflight.
   - Rationale: A web-only permission check cannot stop direct Firebase Auth sign-up calls against the project. A professional-grade product needs Firebase Auth blocking-function behavior or an equivalent provider-side gate to deny unauthorized email creation before account persistence.
   - Boundary: blocking-function behavior and production Auth security posture require explicit approval before implementation.
   - Alternative considered: client-only `Permission.email` lookup before `createUserWithEmailAndPassword`. Rejected as insufficient against scripted abuse and direct SDK calls.

3. Keep password recovery externally neutral.
   - Rationale: Recovery pages must not reveal whether an email exists, has a grant, is disabled, is verified, or is already registered.
   - Implementation direction: `/auth/forgot-password` displays the same success state after accepted input while the API/Firebase layer records safe internal outcomes.
   - Alternative considered: precise user-facing errors. Rejected because they enable account and invitation enumeration.

4. Route server-owned abuse controls and audit events through `packages/api`.
   - Rationale: Rate limits, suspicious-attempt classification, account lifecycle audit logs, and safe API responses are policy decisions that must not live only in browser code.
   - Existing contracts: use `ApiResponseSchema` for responses and `LogSchema` categories such as `USER_ACCOUNT_PASSWORD_RECOVERY_REQUEST`, `USER_ACCOUNT_PASSWORD_UPDATE`, `USER_ACCOUNT_EMAIL_VERIFICATION`, and `USER_ACCOUNT_MFA_ENROLL`.
   - Alternative considered: rely only on Firebase client SDK errors and quotas. Rejected because Firebase quotas are platform backstops, not PUIntegra product policy.

5. Treat email verification as a hard session gate.
   - Rationale: TOTP and protected-domain access require confirmed ownership of the account email.
   - Implementation direction: login and hydration reject or redirect unverified Firebase users before resolving domain user and granted permissions.
   - Alternative considered: allow login but hide protected pages. Rejected because existing session establishment would expose too much application context before verification.

6. Implement TOTP as an approval-gated operational flow.
   - Rationale: Firebase TOTP MFA requires Firebase Authentication with Identity Platform and MFA provider configuration. The page should be real where the project supports MFA and safely blocked where it does not.
   - Policy: each user may have only one active TOTP factor. Normal self-unenroll is not allowed while PUIntegra requires MFA for access.
   - Alternative considered: simulate TOTP locally or store TOTP secrets in Firestore. Rejected because current specs forbid simulated MFA and custom secret storage would weaken the Auth boundary.

7. Use admin-assisted MFA reset for lost authenticator access.
   - Rationale: With one TOTP factor per user, losing the authenticator app is an account recovery problem that must be handled through verified institutional support or system administration rather than self-service unenrollment.
   - Implementation direction: an authorized admin flow verifies the user out of band, removes or resets the Firebase MFA enrollment through a server-owned path, writes a `USER_ACCOUNT_MFA_UNENROLL` audit event, and requires the user to enroll a new TOTP before returning to protected domains.
   - Alternative considered: recovery codes. Deferred because it requires careful backup-code generation, hashing, presentation, storage, and support policy beyond the current auth lifecycle baseline.

8. Make auth pages instructional, contextual, and calm.
   - Rationale: Account creation, verification, recovery, reset, and MFA setup are high-anxiety flows. The UI must explain the next step, why it is needed, what the user can safely retry, and when to contact an administrator.
   - Implementation direction: use concise Spanish copy, contextual validation near fields, dedicated service-error alerts, and guided next-step actions without exposing account inventory details.
   - Alternative considered: minimal form-only pages. Rejected because they would be brittle for institutional users and poor for recovery/security workflows.

9. Use App Check as a production abuse-control layer, not a local prerequisite.
   - Rationale: App Check helps ensure requests originate from the authentic app, but enforcement affects Firebase and API access in production and must be rolled out deliberately.
   - Boundary: development/test should continue to work against emulators without requiring production App Check tokens.
   - Alternative considered: make all auth lifecycle pages depend on App Check immediately. Rejected because it would block local emulator workflows and complicate test setup.

## Risks / Trade-offs

- Provider-side registration gating requires Firebase Auth blocking-function or equivalent production configuration -> keep it explicit in tasks and stop for human approval before security-posture changes.
- App Check for Firebase Auth is preview and provider-dependent -> design the application controls so App Check strengthens the boundary but is not the only abuse defense.
- Password reset and verification emails consume Firebase quotas -> add product-level throttles before sending repeated emails and keep external responses neutral.
- TOTP enrollment can lock users out if recovery policy is incomplete -> require verified email first, one active factor, and implemented admin-assisted MFA reset before production TOTP enforcement.
- Admin-assisted MFA reset is operationally sensitive -> restrict it to authorized administrators, require out-of-band identity verification, and audit `USER_ACCOUNT_MFA_UNENROLL` without recording secrets.
- Public auth endpoints are attractive targets -> apply rate limits by IP plus normalized email/action code, log only sanitized metadata, and never log action URLs or secrets.
- Some lifecycle events originate in Firebase email action flows rather than authenticated sessions -> audit records may lack a role or active RFC and must remain account-level (`RFC: null`).

## Migration Plan

- Implement and validate all flows against Firebase emulators where available, keeping MFA/App Check production enforcement disabled until explicit approval.
- Configure Firebase email templates to use PUIntegra custom action routes only after the handler pages are tested.
- Roll out App Check in monitor mode before enforcement, then enforce only after legitimate traffic is confirmed.
- Roll out provider-side registration gating and TOTP MFA behind explicit approval and a rollback path that disables the new Firebase Auth policy while leaving the public pages in controlled blocked states.
- Do not enable production TOTP enforcement until admin-assisted MFA reset is implemented, tested, documented, and approved.

## Open Questions

- Which exact Firebase project tier and Identity Platform settings will be used for production TOTP MFA?
- What organization-level rate-limit thresholds should apply per IP, normalized email, authenticated user, and action code?
- What out-of-band evidence must an administrator collect before performing MFA reset for a user who lost authenticator access?
