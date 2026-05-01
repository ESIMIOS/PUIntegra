# Production Auth Readiness

## Purpose

Document production approval gates for Firebase Auth account lifecycle hardening.

## Email action URLs

Firebase Auth email templates must point to PUIntegra routes after the pages are deployed and tested:

- Email verification: `/auth/verify-email`
- Password reset: `/auth/reset-password`

The Firebase email action URL must preserve Firebase query parameters such as `mode`, `oobCode`, `apiKey`, `continueUrl`, and `lang`.

## App Check rollout

- Start App Check in monitor mode for web and API traffic where supported.
- Review legitimate traffic before enforcement.
- Enforce only after emulator/local workflows and production domains are documented.
- App Check enforcement is a Firebase security posture change and requires explicit human approval.

## Account creation provider gate

The browser preflights account creation through PUIntegra API policy, but production abuse resistance also requires provider-side denial for unauthorized direct Firebase Auth signup attempts.

- Preferred gate: Firebase Auth blocking function or equivalent provider-side policy.
- The gate must deny account creation when the normalized email has no granted PUIntegra permission.
- This is a production Auth security posture change and requires explicit human approval.

## TOTP MFA rollout

- TOTP MFA requires Firebase Authentication with Identity Platform and explicit MFA provider configuration.
- Each user may have only one active TOTP factor.
- Users cannot self-unenroll the only required factor.
- If users lose authenticator access, recovery is admin-assisted.
- Production TOTP enforcement must remain disabled until admin-assisted reset is implemented, tested, documented, and approved.

## Admin-assisted MFA reset

Before resetting MFA, an authorized administrator must verify the user out of band according to the institution support process.

The reset path must:

- clear the user's Firebase MFA enrollment through a server-owned path;
- write a sanitized `USER_ACCOUNT_MFA_UNENROLL` account-level log;
- avoid logging TOTP secrets, credentials, bearer tokens, action URLs, or raw recovery evidence;
- force the user to complete `/auth/security-setup` again before protected access.

## Rollback

- Disable provider-side signup blocking if legitimate account creation is blocked unexpectedly.
- Disable App Check enforcement if legitimate production clients are rejected.
- Disable TOTP enforcement if admin-assisted recovery is unavailable or failing.
- Keep public auth pages available in controlled fallback states during rollback.
