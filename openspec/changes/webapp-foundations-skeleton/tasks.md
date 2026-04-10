# Tasks: webapp-foundations-skeleton

## 1. Tests first
- Add Vitest + Vue testing baseline for `packages/web`.
- Implement smoke tests for app bootstrap and plugin initialization.
- Implement routing tests for full documented route registration and default redirects.
- Implement layout mapping tests for representative routes.
- Implement guard tests for role mismatch, context mismatch, and security bootstrap redirect.

## 2. Frontend foundation implementation
- Create Vite entrypoints (`index.html`, `src/main.ts`) and app composition layer.
- Wire Pinia, router, Vuetify, and minimal service worker registration.
- Implement route registry and all documented paths.
- Implement contextual layouts and placeholder pages.
- Implement `authStore`, `institutionStore`, and mock session/context composables.
- Add developer mock switcher panel for local browsing.

## 3. Specs and documentation
- Add permanent frontend live spec in `packages/web/specs/frontend-foundations.md`.
- Add permanent mock behavior live spec in `packages/web/specs/mock-mode.md`.
- Keep BoM rules documented in `packages/web/specs/bill-of-materials.md`.
- Document route contract, guard contract, and mock-mode behavior with:
  - single-role session model,
  - `SYSTEM_RFC` reserved context,
  - `/admin` `:rfc` links using `DEFAULT_RFC` for client inspection in local tests.

## 4. Quality gates
- Run and pass:
  - `pnpm -r typecheck`
  - `pnpm -r lint`
  - `pnpm -r test`

## Constraints verification
- No changes in `packages/shared/src/schemas`.
- No changes to Firebase security posture or rules.
