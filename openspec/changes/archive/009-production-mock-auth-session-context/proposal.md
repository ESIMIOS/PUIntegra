## Why

The authenticated MVP still relies on placeholder login/logout pages and a dummy header session component, so users cannot exercise a production-like session lifecycle. This change introduces deterministic mock-backed authentication that is shaped as a replaceable backend boundary for future Firebase Authentication integration.

## What Changes

- Replace the `/auth/login` placeholder with a production-ready, accessible email/password login flow backed by a mock auth service.
- Require an existing mock user, valid mock password, and granted permissions before entering authenticated domains.
- Persist authenticated session state in localStorage until explicit logout, similar to Firebase Auth persistence.
- Require explicit context selection when a user has multiple valid role/RFC permissions.
- Replace the `/auth/logout` placeholder with a logout completion page that clears session, shows progress, and redirects to login after 15 seconds.
- Make `HeaderSessionContext.vue` standalone by reading real session state from stores/services instead of props.
- Add header account menu, logout confirmation modal, and permission-based context switch modal.
- Add auth/session audit logging through the mock backend layer using existing log contracts where representable.
- Add login validation, invalid-credential handling, and local lockout after repeated failures.

## Capabilities

### New Capabilities

- `mock-auth-session`: Covers mock-backed login, persisted session hydration, logout, user identity state, permission-based context selection, and authenticated header session context.

### Modified Capabilities

- None.

## Impact

- Affected web areas: auth pages, `authStore`, mock data/auth services, layouts, `DashboardShell`, `HeaderSessionContext`, route/navigation tests, and mock persistence tests.
- Shared Zod schemas affected: none. Existing `UserSchema`, `PermissionSchema`, `RoleSchema`, and `LogSchema` are sufficient.
- Firebase security rules affected: none.
- Firebase Auth configuration affected: none.
- No new runtime dependency is expected.
