## Why

The stage-1 frontend has navigable route and layout foundations, but most product pages still render placeholders because there is no data contract or data source for the MVP entities. This change defines the schema-first mock data layer needed to build reviewable frontend CRUD behavior before Firestore is introduced.

## What Changes

- Add a shared stage-1 data contract for the MVP entities used by the frontend mock layer: users, institutions, permissions, contacts, requests, findings, logs, and shared update/log support structures.
- Add a web mock data layer with deterministic seed data for one mock user, one tenant institution, and one reserved provider/system context.
- Represent `DEFAULT_RFC` as the only tenant `Institution` seed document.
- Represent `SYSTEM_RFC` as reserved provider context metadata and as a permission context for `SYSTEM_ADMINISTRATOR`, not as an `Institutions` document.
- Seed two permissions for the same mock user:
  - `SYSTEM_RFC` + `SYSTEM_ADMINISTRATOR`
  - `DEFAULT_RFC` + `INSTITUTION_ADMIN`
- Expose all mock data operations as async repository/service operations from the start, even when backed by in-memory state and LocalStorage.
- Add a web mock constant `MOCK_MILLISECONDS_RESPONSE_DELAY` to simulate future API response latency in data controllers.
- Add LocalStorage persistence for mock CRUD changes plus a reset action that restores canonical seed data.
- Add typed web data errors, user-safe error messages, and system-message catalog entries for mock/data operation diagnostics.
- Add page/data controllers and composables that can be consumed by future views, but do not replace placeholder pages in this change.
- Do not apply implementation until these artifacts are reviewed.

## Capabilities

### New Capabilities

- `stage1-shared-data-contract`: Defines the Zod-based stage-1 data contract for MVP entities and shared update/log structures.
- `web-mock-data-layer`: Defines the frontend mock data provider, async repository/service pattern, controller response delay, LocalStorage persistence, reset behavior, mock organization strategy, and data operation error handling.

### Modified Capabilities

<!-- No existing OpenSpec live capability is modified. Permanent web specs will be updated during implementation after approval. -->

## Impact

- **packages/shared**: New Zod schemas are proposed under `packages/shared/src/schemas/`; existing schema files are not modified until explicit approval.
- **packages/web**: New mock fixtures, mock delay constant, storage adapter, repositories, services, Pinia state, data/page controllers, and UI-safe error mapping for future views.
- **packages/web specs**: `packages/web/specs/mock-mode.md` will be updated and a permanent mock data layer spec will be added or updated.
- **OpenSpec/live specs**: Shared contract documentation will be added or updated to reflect the approved schema contract.
- **Firebase security rules**: Not affected.
- **Firebase Auth security posture**: Not affected.
- **Firestore integration**: Not introduced in this change; the async repository boundary prepares for a future provider replacement.
- **Dependencies**: No new dependency is expected.
