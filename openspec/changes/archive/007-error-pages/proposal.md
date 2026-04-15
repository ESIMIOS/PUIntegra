## Why

The `/error` domain is part of the documented Alcance 1 route contract, but the current pages still render generic placeholders. Operators need clear recovery paths when access, navigation, or system failures interrupt their workflow.

## What Changes

- Replace `/error/403`, `/error/404`, and `/error/500` placeholder views with production-ready Spanish error pages.
- Add context-aware recovery actions derived from existing auth and institution state.
- Add a 15-second automatic redirect with a visible time bar only when the recovery target is `/auth/login`.
- Add distinct absurd icon-based graphics for each error state.
- Preserve the existing router and guard mapping for 403, 404, and 500.

## Capabilities

### New Capabilities
- `web-error-pages`: Defines the user-facing behavior for the web error domain.

### Modified Capabilities
- None.

## Impact

- **packages/shared**: No schema changes. Existing `RoleSchema`, `AuthenticatedRoleSchema`, and `SystemMessageSchema` are sufficient.
- **packages/web**: Error page views, reusable error presentation behavior, route-aware recovery actions, and focused tests.
- **Firebase security rules**: Not affected.
- **Dependencies**: No new dependencies.
