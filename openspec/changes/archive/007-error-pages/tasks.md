## 1. Contract and Test Setup

- [x] 1.1 Confirm no shared schema changes are required for role, system-message, or route behavior.
- [x] 1.2 Add tests for error page content, context-aware actions, and login countdown behavior.

## 2. Frontend Implementation

- [x] 2.1 Add reusable error page presentation and local login countdown behavior.
- [x] 2.2 Replace the 403, 404, and 500 placeholder pages with status-specific content.
- [x] 2.3 Preserve the existing error layout and route mapping.

## 3. Verification

- [x] 3.1 Run `pnpm --filter @puintegra/web test`.
- [x] 3.2 Run `pnpm --filter @puintegra/web typecheck`.
- [x] 3.3 Run `pnpm --filter @puintegra/web lint`.
- [x] 3.4 Run `pnpm -r typecheck`, `pnpm -r lint`, and `pnpm -r test`.
