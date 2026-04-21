# Design: 1-webapp-foundations-skeleton

## Architecture
- Package: `packages/web`
- Organization style: layer-first (`app`, `router`, `layouts`, `pages`, `stores`, `composables`, `shared`, `components`).
- Route source of truth: documented table in `1-Análisis/.../10-frontend-y-experiencia.md` sections 10.2 to 10.5.

## Routing and layouts
- First-level route domains define layout:
  - `/site` => public layout
  - `/auth` => auth layout
  - `/app` => institutional app layout
  - `/admin` => provider backoffice layout
  - `/account` => account layout
  - `/error` => error layout
- Internal route records implement documented paths and defaults.
- Catch-all route redirects to `/error/404`.

## Guard pipeline
The guard pipeline validates:
1. Route existence fallback to `/error/404`.
2. Route and role compatibility; failures to `/error/403`.
3. Required auth for protected domains.
4. Required institution context for `/app/:rfc/*`.
5. Security bootstrap gate to `/auth/security-setup`.
6. Internal guard exceptions to `/error/500`.

## Mock mode
- Guard behavior is active in local mode.
- A developer switcher updates mock role/context stores (session derived from selected role).
- `SYSTEM_RFC` (`IEC120914FV8`) is reserved for `SYSTEM_ADMINISTRATOR` active context.
- In `/admin`, links with `:rfc` use `DEFAULT_RFC` as inspected client target while preserving `SYSTEM_RFC` as reserved active context.
- The switcher provides two-level navigation: domain selection and contextual route buttons.
- This preserves realistic route behavior while keeping all branches locally browsable.

## Interfaces
- Route metadata keys:
  - `allowedRoles`
  - `requiresAuth`
  - `requiresInstitutionContext`
  - `requiresSecuritySetup`
  - `defaultChildRedirect`
- Store contracts:
  - `authStore`: session status, role, security bootstrap state.
  - `institutionStore`: active institution RFC only (no second role in institution context).

## PWA baseline
- Add static `manifest.webmanifest`.
- Add basic `sw.js` registration and lifecycle skeleton.
- No advanced offline strategy in this change.
