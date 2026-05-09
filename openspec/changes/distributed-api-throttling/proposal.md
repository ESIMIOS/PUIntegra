## Why

The API currently enforces auth lifecycle throttling with a per-instance in-memory `Map`, which breaks under multi-instance execution and leaves non-auth API mutations without consistent abuse controls. PUIntegra needs a shared, configurable throttling strategy that works across Cloud Functions instances, preserves safe API responses, and keeps endpoint policy outside hardcoded runtime state.

## What Changes

- Add a distributed API throttling framework backed by Firestore counters and runtime throttle configuration documents.
- Introduce simple per-field throttle dimensions so a request is rejected when any configured applied factor exceeds quota.
- Add shared throttle endpoint keys, default policies, and runtime config Zod schemas in `packages/shared`.
- Refactor current auth throttling and wire the framework into current auth routes plus RFC-scoped write routes.
- Seed emulator throttle configuration documents and expose TTL-ready counter metadata for runtime cleanup.
- Update API and emulator live specs to document distributed throttling behavior and seeded throttle config data.

## Capabilities

### New Capabilities
- `api-throttling`: Distributed API throttling with Firestore-backed runtime config, simple per-field dimensions, shared defaults, safe over-quota responses, and TTL-managed counter cleanup.

### Modified Capabilities
- `api-domain-write-boundary`: Protected API-boundary writes now include server-owned throttling decisions for auth and RFC-scoped mutation routes.

## Impact

- Shared contracts: `packages/shared/src/schemas/*`, shared exports, and shared throttle constants are affected.
- API runtime: Hono handlers, API dependency wiring, route subject normalization, and Firestore transaction logic are affected.
- Emulator data: seed modules must populate `apiThrottleConfigs`.
- Firebase security rules are not affected.
