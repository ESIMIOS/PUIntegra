# Mock Data Layer (Live Spec)

## Purpose

Define the persistent frontend mock data architecture used to support stage-1 data operations before Firestore integration.

## Scope

- Shared schema-backed mock dataset in `packages/web/src/mock`.
- Async repositories and services over mock state.
- LocalStorage hydration, persistence, and reset.
- Data controllers/composables with simulated API response delay.
- Typed technical errors and user-safe error messaging for data operations.

## Dataset contract

- One tenant institution document: `DEFAULT_RFC`.
- One reserved provider context metadata record: `SYSTEM_RFC`.
- One mock user: `mock-user-001` / `admin@example.test`.
- Two permissions for the same mock user:
  - `SYSTEM_RFC` + `SYSTEM_ADMINISTRATOR`
  - `DEFAULT_RFC` + `INSTITUTION_ADMIN`
- `SYSTEM_RFC` is not modeled as a tenant institution document.

## Layer boundaries

- Seed layer: canonical fixture dataset.
- Storage layer: LocalStorage load/save/reset with schema validation and seed fallback.
- Repository layer: data read/write operations without artificial delay.
- Service layer: use-case operations with atomic mutation and rollback on failure.
- Store layer: reactive load/save/error/reset orchestration.
- Controller layer: UI-oriented load/mutate wrappers with delay simulation.
- Shared web helpers (outside mock scope): reusable utilities such as deep clone and UI message catalogs.

## Async and delay strategy

- Repositories and services return promises.
- Repositories/services must not add artificial delay.
- `MOCK_MILLISECONDS_RESPONSE_DELAY` is applied in controllers/composables only.
- Delay behavior must be testable via fake timers or test-safe override.

## Error handling strategy

- Typed errors: validation, not_found, conflict, forbidden, storage, unknown.
- `webSystemMessages` carry technical diagnostics with safe metadata only.
- `webUIMessages` provides user-facing copy and must not expose technical internals.
- Store/controller layers map typed errors to UI messages without mixing telemetry and UI catalogs.

## Testing expectations

- Shared schema success/failure tests.
- Fixture valid/invalid tests.
- Repository success/error tests.
- Storage hydration/fallback/persistence/reset tests.
- Service success/error and atomic rollback tests.
- Controller loading/saving/error/reset and delay tests.
- Route context regression tests for provider/tenant separation.
