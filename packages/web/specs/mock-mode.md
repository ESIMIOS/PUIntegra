# Mock Mode (Live Spec)

## Purpose

Define the functional contract of local frontend mock mode (`packages/web`) for navigating the route/layout skeleton without backend integration.

## Scope

- Applies to the `MockSessionSwitcher` development panel.
- Applies to stores and guards that resolve local navigation.
- Does not define business operations or real persistence.

## Session and role state

- The effective session is modeled by a single active role (`authStore.activeRole`).
- There is no second role in institution context.
- Supported roles:
  - `ANONYMOUS`
  - `INSTITUTION_ADMIN`
  - `INSTITUTION_OPERATOR`
  - `SYSTEM_ADMINISTRATOR`

## RFC contract by role

- `SYSTEM_RFC` is a reserved constant with value `IEC120914FV8`.
- RFC assignment rules in the mock panel:
  - `ANONYMOUS -> ""`
  - `SYSTEM_ADMINISTRATOR -> SYSTEM_RFC`
  - `INSTITUTION_ADMIN -> DEFAULT_RFC`
  - `INSTITUTION_OPERATOR -> DEFAULT_RFC`
- `Active RFC` in UI is read-only.

## Guard constraints

- If a route requires authentication and role is `ANONYMOUS`, redirect to `/auth/login`.
- If role is `SYSTEM_ADMINISTRATOR` without `SYSTEM_RFC`, redirect to `/error/403`.
- If role is institutional while using `SYSTEM_RFC`, redirect to `/error/403`.
- `/error/*` routes must not enter redirection loops because of these validations.

## Mock panel navigation

- Layout shells do not expose internal links for domain navigation.
- All development navigation lives in the mock panel.
- The panel offers two-level navigation:
  - Level 1: domain selection (`site`, `auth`, `app`, `admin`, `account`, `error`).
  - Level 2: contextual route buttons for the selected domain.
- Domain availability:
  - `app` enabled only for institutional roles.
  - `admin` enabled only for `SYSTEM_ADMINISTRATOR`.
  - `account` enabled for any authenticated role.

## Special rule for `/admin` with `SYSTEM_ADMINISTRATOR`

- The active session context remains `SYSTEM_RFC`.
- `/admin` links with `:rfc` are built using `DEFAULT_RFC` as the inspected target institution in local tests.
- This rule separates reserved system context from inspected client institution.

## Out of scope

- Real Firebase/Auth/API integration.
- Real permission resolution from backend.
- Mock state persistence outside local runtime.
