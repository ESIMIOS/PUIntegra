## Context

The current frontend foundation supports route domains, layouts, guards, mock session switching, theme behavior, and observability. The stage-1 product pages are still mostly placeholders because the repository has not yet defined shared Zod schemas for the stage-1 business entities or a frontend data source to exercise those pages.

Stage-1 analysis documents define `SYSTEM_RFC` as a reserved provider context for `SYSTEM_ADMINISTRATOR`, not as a real institution diversa. They also define `DEFAULT_RFC` as the tenant context used by the current web skeleton. This design keeps that distinction: the mock data layer has one tenant institution document and one reserved provider context.

Permanent references:
- Shared schema contracts live under `packages/shared/src/schemas/`.
- Frontend mock behavior lives in `packages/web/specs/mock-mode.md`.
- Frontend architectural patterns live in `packages/web/specs/frontend-foundations.md`.
- Global engineering rules live in `openspec/specs/engineering-standards.md`.

## Goals / Non-Goals

**Goals:**

- Define stage-1 Zod schemas before writing mock implementation code.
- Keep all TypeScript types inferred from Zod schemas.
- Create deterministic mock data for one user, one tenant institution, and one provider/system context.
- Support mock CRUD flows through async operations from the beginning.
- Simulate future API response timing in data controllers with a centralized mock delay constant.
- Persist mock CRUD changes to LocalStorage and provide reset to seed data.
- Separate responsibilities into contract, seed, storage, repository, service, store, controller, and page layers.
- Keep Firestore replacement localized to future provider/repository implementations.
- Add typed error handling and system messages for mock/data operation failures.
- Provide controllers/composables for future views without implementing page UI in this change.
- Establish success and error scenario test coverage for data, services, stores, and controllers so follow-up UI/UX changes can consume a trusted contract.

**Non-Goals:**

- No Firestore SDK integration.
- No Firebase Emulator integration for mock data.
- No Firestore rules changes.
- No Firebase Auth security posture, provider, MFA, blocking function, or production auth configuration changes.
- No real email notification delivery.
- No production backend implementation.
- No `SYSTEM_RFC` tenant institution document.
- No placeholder page replacement or business view implementation.

## Decisions

### D1 — Schema-first shared contract

**Decision**: Add the missing stage-1 entity schemas in `packages/shared/src/schemas/` only after explicit approval. Web mock data must validate against those schemas and infer types through `z.infer`.

**Rationale**: The mock data represents future Firestore document shapes. Letting web invent local types would create a second contract and increase migration cost.

**Alternatives considered**:
- Web-local mock schemas: rejected because they would drift from shared contracts.
- Untyped fixtures: rejected because they would not protect future Firestore shape.

### D2 — One tenant institution plus reserved provider context

**Decision**: Seed one tenant `Institution` document for `DEFAULT_RFC` and separate mock-only metadata for `SYSTEM_RFC` as provider context. `SYSTEM_RFC` appears in permissions and logs, but not in the institution list.

**Rationale**: Stage-1 rules explicitly state that `SYSTEM_ADMINISTRATOR` uses `SYSTEM_RFC` inside the same permissions model without pretending the provider is an institution diversa.

**Alternatives considered**:
- Create a fake `Institutions/SYSTEM_RFC` document: rejected because it contradicts the domain rule.
- Omit system context from mock data: rejected because `/admin` flows and guard tests require it.

### D3 — Async operations from the start

**Decision**: Every repository and service operation returns `Promise<T>` or `Promise<void>`, even when the mock implementation uses synchronous memory and LocalStorage internally.

**Rationale**: Firestore operations will be async. Making controllers, stores, loading states, tests, and pages async now prevents later rewrites.

**Alternatives considered**:
- Synchronous mock APIs with later async migration: rejected because it would force broad frontend changes later.

### D4 — Centralized mock response delay in controllers

**Decision**: Define `MOCK_MILLISECONDS_RESPONSE_DELAY` in the web mock/constants layer and apply it in data controllers/composables for load, save, reset, and mutation handlers. Repositories and services remain focused on data behavior and do not own UI timing simulation.

**Rationale**: The UI must exercise loading and saving states now so future API/Firestore latency does not require controller or page rewrites. Keeping the delay in controllers makes it easy to disable or tune in tests while preserving fast repository and service tests.

**Alternatives considered**:
- Delay inside repositories: rejected because storage/data tests would become slower and timing would be mixed with data access.
- Delay inside services: rejected because business-rule tests would become slower and services would own UI simulation concerns.
- No latency simulation: rejected because pages could ship without meaningful loading/saving-state coverage.

### D5 — Layered responsibility boundary

**Decision**: Implement the mock layer with explicit responsibilities:

- Shared contract layer: Zod schemas and inferred types.
- Mock seed layer: canonical validated fixtures.
- Mock storage layer: LocalStorage hydration, persistence, invalid-state fallback, reset.
- Repository layer: async collection-style queries and persistence operations.
- Service/use-case layer: business rules, cross-entity updates, history entries, and logs.
- Pinia store layer: reactive state, loading/saving/error flags, action orchestration.
- Controller/composable layer: page-specific loading, submit handlers, field errors, and `MOCK_MILLISECONDS_RESPONSE_DELAY` response simulation.
- Page/component layer: out of scope for this change except for preserving existing placeholders.

**Rationale**: This keeps future Firestore work from leaking into page components and keeps mock CRUD behavior testable without mounting Vue pages.

### D6 — Technical messages separate from user-facing errors

**Decision**: Extend the web system-message catalog for data operation diagnostics while keeping user-facing error copy in frontend error mapping.

**Rationale**: `SystemMessageSchema` is a technical envelope for observability and troubleshooting. Users need safe, concise UI copy that does not expose codes, stack traces, LocalStorage keys, secrets, or validation payloads.

### D7 — Success and error scenarios as confidence boundary

**Decision**: Treat repository, service, store, and controller tests as the confidence boundary for later UI/UX work. Every implemented operation must include at least one success scenario and at least one relevant error scenario when the operation can fail.

**Rationale**: This change intentionally avoids business views. Strong operation-level tests are the substitute for page behavior confidence and let follow-up UI changes focus on presentation rather than rediscovering data-layer failures.

## Risks / Trade-offs

- **Shared schema scope may grow too large** -> Mitigation: implement only fields needed by stage-1 docs and mock-backed pages; defer nonessential fields.
- **Mock CRUD may accidentally become production logic** -> Mitigation: keep it under web mock modules and document that Firestore replaces the provider boundary later.
- **LocalStorage state may become stale after schema changes** -> Mitigation: validate hydrated state and fall back to canonical seed data on invalid payloads.
- **`SYSTEM_RFC` may be confused with a tenant institution** -> Mitigation: tests assert institution lists exclude `SYSTEM_RFC`; docs state it is reserved provider context only.
- **Async mock operations can feel overbuilt** -> Mitigation: keep internals simple and apply the response delay only in controllers.
- **Mock response delay can slow automated tests** -> Mitigation: centralize `MOCK_MILLISECONDS_RESPONSE_DELAY` and test delay helpers with fake timers or test overrides instead of sleeping in every test.
- **Future UI changes may depend on untested edge cases** -> Mitigation: require success/error tests for repository, service, store, and controller operations before any view consumes them.

## Migration Plan

1. Review and approve this OpenSpec change.
2. Approve the proposed shared schema additions before modifying `packages/shared/src/schemas/`.
3. Write tests first for shared schemas, seed validation, repositories, services, stores, and controllers.
4. Implement shared schemas and exports.
5. Implement the mock seed, storage, repository, service, store, and controller layers.
6. Add `MOCK_MILLISECONDS_RESPONSE_DELAY` and apply it to data controller load/save/reset/mutation handlers.
7. Update permanent web/shared specs.
8. Run quality gates.

Rollback: remove the mock provider modules and controller wiring. Existing placeholder pages remain unchanged. No Firestore, security rules, or auth configuration changes are involved.

## Open Questions

- None.
