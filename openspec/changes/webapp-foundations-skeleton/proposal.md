# Proposal: webapp-foundations-skeleton

## Objective
Implement the first local frontend foundation for `packages/web` as a browsable skeleton without business functionality.

## Scope
- Vue 3 webapp bootstrap with `vue-router`, Pinia, Vuetify 3, and minimal PWA registration.
- Contextual layouts and placeholder pages for documented routes in section 10.2-10.5.
- Mock session/context mode to browse guarded branches in local development.
- Smoke, routing, layout, and guard tests in Vitest.

## Out Of Scope
- Real Firebase Auth, Firestore, or API integration.
- Domain CRUD, search execution, data persistence, and production-ready feature behavior.
- Changes to shared Zod contracts.

## Contract And Security Notes
- `packages/shared/src/schemas` will not be modified in this change.
- Firebase security rules and auth configuration are not modified.

## Acceptance Matrix
| Area | Acceptance criteria |
|---|---|
| Route catalog | All documented routes from `10-frontend-y-experiencia.md` are registered and navigable. |
| Layouts | First-level domains `/site`, `/auth`, `/app`, `/admin`, `/account`, `/error` render contextual layouts. |
| Defaults | Domain defaults and documented redirects are implemented. |
| Guards | Route/role/context/security guard pipeline exists and redirects to `/error/403`, `/error/404`, `/error/500` and `/auth/security-setup` when applicable. |
| Mock mode | Developer mock switcher can change role/context (single-role model), enforce `SYSTEM_RFC` constraints, and browse guarded routes with two-level domain/context navigation. |
| Quality gates | `pnpm -r typecheck`, `pnpm -r lint`, `pnpm -r test` pass. |
