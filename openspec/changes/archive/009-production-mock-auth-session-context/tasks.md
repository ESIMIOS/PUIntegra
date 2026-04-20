## 1. Tests First

- [x] 1.1 Add mock auth service tests for valid login, unknown email, invalid password, missing permissions, repeated-failure lockout, session persistence, hydration, and logout.
- [x] 1.2 Update auth page tests for email/password validation, service error messages, context selection, safe navigation, logout progress, and immediate login action.
- [x] 1.3 Add HeaderSessionContext tests for real identity rendering, account menu links, logout confirmation, context modal contents, and context switch navigation.
- [x] 1.4 Update shell tests for prop-free HeaderSessionContext usage in app, admin, account, and DashboardShell.

## 2. Mock Auth Backend Layer

- [x] 2.1 Add web-only mock auth credential fixtures separate from shared UserSchema and mock user records.
- [x] 2.2 Add mock auth storage helpers with a localStorage key separate from the mock dataset key.
- [x] 2.3 Implement mock auth service operations for login validation, lockout, persisted session hydration, context selection, and logout.
- [x] 2.4 Validate user, permission, role, and log payloads with existing Zod schemas before writing session state or logs.
- [x] 2.5 Append successful login/logout domain logs with existing `USER_ACCOUNT_LOGIN`, `USER_ACCOUNT_LOGOUT`, and `SYSTEM_AUTH_TRIGGER` contracts.
- [x] 2.6 Emit technical system messages for failed credentials and lockout without inventing unsupported domain log categories.

## 3. Stores And Controllers

- [x] 3.1 Extend authStore state with user display identity, email, emoji icon, available contexts, selected context, and hydration status.
- [x] 3.2 Replace direct UI-driven session mutation with store actions that delegate to the mock auth service.
- [x] 3.3 Ensure anonymous reset clears identity, permissions, active context, persisted auth session, and institution RFC state.
- [x] 3.4 Update or add composables/controllers so pages and HeaderSessionContext consume a stable auth/session API.

## 4. Login And Logout Pages

- [x] 4.1 Replace AuthLoginPage placeholder with accessible Vuestic email/password form and Spanish validation copy.
- [x] 4.2 Add post-credential context selection UI that blocks navigation until the user chooses a valid permission context.
- [x] 4.3 Route institution contexts to `/app/<rfc>/dashboard` and system administrator context to `/admin/institutions`.
- [x] 4.4 Replace AuthLogoutPage placeholder with session clearing, logout message, 15-second progress redirect, and immediate login action.

## 5. Header And Shell Integration

- [x] 5.1 Refactor HeaderSessionContext to remove identity props and render session state from store/controller data.
- [x] 5.2 Add Vuestic account menu with Account links and logout action from the identity trigger.
- [x] 5.3 Add logout confirmation modal in HeaderSessionContext that routes to `/auth/logout` only after confirmation.
- [x] 5.4 Add role/RFC context modal that lists granted contexts and switches through the auth/session service.
- [x] 5.5 Remove hardcoded account/session props from DashboardShell, AppLayout, AdminLayout, and AccountLayout.

## 6. Specs And Quality Gates

- [x] 6.1 Propose any needed persistent frontend spec update before editing `packages/web/specs/frontend-foundations.md`.
- [x] 6.2 Run `pnpm --filter @puintegra/web test` and fix failures.
- [x] 6.3 Run `pnpm --filter @puintegra/web typecheck` and fix errors.
- [x] 6.4 Run `pnpm --filter @puintegra/web lint` and fix warnings.
- [x] 6.5 Run full monorepo gates if implementation touches shared exports, route contracts beyond web, or persistent specs.
