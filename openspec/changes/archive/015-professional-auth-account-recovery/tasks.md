## 1. Tests First

- [x] 1.1 Review `PermissionSchema`, `UserSchema`, `LogSchema`, `ApiResponseSchema`, and auth-related shared constants; confirm no shared schema change is required before writing implementation code.
- [x] 1.2 Add web auth gateway tests for account creation, verification resend, verification code handling, forgot password, reset password, unverified login blocking, one-factor TOTP policy, admin-reset-required recovery, and TOTP unavailable/supported branches.
- [x] 1.3 Add route guard and auth landing tests for unverified users, verified users, security setup redirects, and public auth route redirects.
- [x] 1.4 Add page tests for `/auth/create-account`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/security-setup` success, validation, loading, error, blocked states, and friendly contextual guidance.
- [x] 1.5 Add API tests for auth lifecycle policy endpoints, neutral recovery responses, rate-limit decisions, admin-assisted MFA reset, sanitized audit payloads, and safe API error envelopes.
- [x] 1.6 Add tests proving secrets and action URLs are not logged by auth lifecycle utilities or API handlers.

## 2. API Policy And Audit Boundary

- [x] 2.1 Implement auth lifecycle API route structure in `packages/api` using shared Zod-derived types and existing Hono response patterns.
- [x] 2.2 Implement registration eligibility policy using normalized email, granted permissions, existing account conflict handling, and safe external errors.
- [x] 2.3 Implement abuse-control utilities for account creation, verification resend, forgot password, reset password, and TOTP setup attempts.
- [x] 2.4 Implement password recovery request handling with Firebase reset email delivery where appropriate and neutral success responses.
- [x] 2.5 Implement admin-assisted MFA reset policy for lost authenticator access with authorized admin checks, out-of-band verification metadata, Firebase TOTP unenrollment/reset, and no self-service removal of the only required factor.
- [x] 2.6 Implement sanitized account-level audit logging for recovery request, password update, email verification, MFA enrollment, MFA unenrollment/reset, and throttling events.
- [x] 2.7 Update `firebase/functions/specs/hono-emulator-api.md` and `openspec/specs/api-domain-write-boundary/spec.md` for the new auth lifecycle API boundary.

## 3. Firebase Auth Gateway And Session Rules

- [x] 3.1 Add Firebase Auth gateway methods for account creation, verification email resend, action-code verification, password reset email request, reset code validation, password reset confirmation, and TOTP enrollment/challenge states.
- [x] 3.2 Update login and hydration so users with `emailVerified: false` cannot resolve PUIntegra domain user or permission contexts.
- [x] 3.3 Add safe mapping from Firebase Auth errors to canonical UI/system messages without exposing account inventory details.
- [x] 3.4 Enforce one active TOTP factor per user in gateway/session behavior and direct lost-access cases to admin-assisted recovery.
- [x] 3.5 Keep provider-side registration blocking, App Check enforcement, and TOTP MFA production configuration disabled unless explicit approval is granted.
- [x] 3.6 If approval is granted, implement provider-side signup denial and TOTP/App Check configuration tasks separately with rollback notes; otherwise keep controlled blocked states.
- [x] 3.7 Update `firebase/auth/specs/emulator-auth.md` and `packages/web/specs/firebase-emulator-mode.md` for supported auth lifecycle behavior, one-factor TOTP policy, admin-assisted recovery, and remaining production-gated boundaries.

## 4. Web Auth Pages

- [x] 4.1 Implement `/auth/create-account` with email/password inputs, password confirmation, permission-gated submission, verification-email transition, and professional Spanish copy with contextual help.
  - Follow-up UX hardening: immediate validation, field-level password policy errors, conditional match feedback, and resend cooldown.
- [x] 4.2 Implement `/auth/verify-email` as both pending-verification standby page and Firebase verification action-code handler with clear next-step guidance.
  - Follow-up UX hardening: hide verification controls after success and redirect unverified login attempts here.
  - Follow-up session hardening: verified users can continue the existing Firebase session without using the login button again; logout requires confirmation.
- [x] 4.3 Implement `/auth/forgot-password` with neutral success UX, contextual validation errors, friendly recovery guidance, and no account enumeration.
  - Follow-up UX hardening: immediate email validation, submitted-email reminder, and resend cooldown.
- [x] 4.4 Implement `/auth/reset-password` with reset-code validation, new password form, policy feedback, success redirect to login, and invalid/expired-code recovery path.
  - Follow-up UX hardening: manual emulator code entry and field-level password policy errors.
  - Follow-up UX hardening: password reset now shows a success state and explicit login action instead of immediate redirect.
- [x] 4.5 Implement `/auth/security-setup` with Firebase TOTP enrollment when enabled, one-factor messaging, lost-authenticator admin-contact guidance, and controlled unavailable state when MFA is not configured.
- [x] 4.6 Update auth navigation/catalog copy and `packages/web/specs/frontend-foundations.md` if route behavior or visible page responsibilities changed.

## 5. Production Security Readiness

- [x] 5.1 Document Firebase email template action URLs for `/auth/verify-email` and `/auth/reset-password`.
- [x] 5.2 Document App Check monitor-mode and enforcement rollout steps for web and API calls.
- [x] 5.3 Document Firebase Auth blocking-function or equivalent provider-side registration gate approval requirements.
- [x] 5.4 Document TOTP MFA approval requirements, one-factor policy, admin-assisted lost-authenticator recovery, required out-of-band verification, and rollback behavior.
- [x] 5.5 Verify no implementation changes `firebase/firestore/firestore.rules`, production Auth providers, MFA policy, App Check enforcement, or blocking functions without explicit human approval.

## 6. Quality Gates

- [x] 6.1 Run `pnpm --filter @puintegra/web test`.
- [x] 6.2 Run `pnpm --filter @puintegra/api exec vitest`.
  - `pnpm --filter @puintegra/api exec vitest` starts watch mode; stopped it and ran `pnpm --filter @puintegra/api exec vitest run` successfully.
- [x] 6.3 Run `pnpm -r typecheck`.
- [x] 6.4 Run `pnpm -r lint`.
- [x] 6.5 Run `pnpm -r test`.
- [x] 6.6 Run any affected Firebase emulator integration tests if API Auth or trigger behavior changes.
  - `pnpm --filter @puintegra/api exec vitest run` included `tests/firestore.rules.test.ts` successfully.
