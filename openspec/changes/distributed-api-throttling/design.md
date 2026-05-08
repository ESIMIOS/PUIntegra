## Context

`packages/api` currently throttles only a subset of auth lifecycle routes through an in-memory `Map` inside `authDependencies.ts`. That design is not shared across Cloud Functions instances, cannot express reusable per-field runtime policies, and keeps endpoint limits embedded in runtime code. This change adds a new shared contract in `packages/shared/src/schemas/` and therefore must keep the contract first, tests second, implementation third ordering. Permanent references for this work are `openspec/specs/api-domain-write-boundary/spec.md`, `firebase/functions/specs/hono-emulator-api.md`, `firebase/firestore/specs/emulator-data.md`, and the new shared schema files under `packages/shared/src/schemas/`.

## Goals / Non-Goals

**Goals:**
- Enforce throttling with Firestore-backed fixed-window counters shared across instances.
- Support simple per-field dimensions per endpoint and deny requests when any applied dimension exceeds quota.
- Keep runtime throttle policy configurable through Firestore with shared fallback defaults.
- Reuse one generic `422` over-quota API error contract that the web layer can already render.
- Ensure stale counter documents become logically irrelevant at runtime and are physically deleted by Firestore TTL.

**Non-Goals:**
- Adding scheduled cleanup jobs, cron functions, or manual purge tools.
- Changing Firestore client security rules.
- Adding custom frontend retry timers or throttle-specific UI behavior beyond existing error rendering.
- Extending throttling to read-only data routes or routes outside the current auth and RFC-scoped mutation rollout.

## Decisions

### Use Firestore for config and counters

- Decision: store runtime endpoint policies in `apiThrottleConfigs` and fixed-window counters in `apiThrottleCounters`.
- Rationale: Firestore is already available in the Firebase runtime, supports transactions for quota increments, and avoids introducing Redis or other infrastructure.
- Alternative considered: Redis-backed counters. Rejected because it adds infra and ops scope that the repo does not currently carry.

### Use simple dimension policies per endpoint

- Decision: each endpoint config declares only simple dimensions such as `ip`, `email`, `user`, `rfc`, and route-specific atomic identifiers like `permission` or `contact_type`.
- Rationale: the runtime stays easier to inspect and debug, while still allowing defensive enforcement by writing every simple subject that applies to the request.
- Alternative considered: composite subjects per route. Rejected because they add extra counter records and complexity without clear value for the current rollout.

### Keep subject keys readable and normalized

- Decision: counter document IDs include readable normalized subject strings, and the same subject parts are stored as structured fields in the document.
- Rationale: this matches the approved observability choice and keeps production debugging simple without extra decoding logic.
- Alternative considered: hashed or opaque subject keys. Rejected because it makes operational inspection harder and was explicitly ruled out.

### Enforce fixed-window counters with runtime TTL metadata

- Decision: compute `windowStart = floor(now / windowMs) * windowMs`, persist `expiresAt = windowStart + windowMs + 24h`, reuse one stable counter document per `endpointKey + dimensionKey + subjectKey`, and reset the document logically when the stored window no longer matches the current fixed window.
- Rationale: fixed windows keep the Firestore transaction logic simple and predictable; stable IDs keep counter documents readable; `expiresAt` provides a clear TTL target without scheduled cleanup.
- Alternative considered: sliding windows or token buckets. Rejected because they increase document/query complexity without current product need.

### Throttle at the handler layer

- Decision: compute throttle subjects in HTTP handlers after payload parsing and token verification, then call an injected throttle dependency before business logic.
- Rationale: route subjects depend on request headers, normalized payload fields, path params, and verified actor identity. Keeping this in handlers prevents service-layer coupling to transport concerns.
- Alternative considered: global middleware or service-level throttling. Rejected because those layers either lack the necessary context or duplicate route-specific logic.

## Risks / Trade-offs

- [Risk] Hot routes may create many counter documents with readable identifiers. → Mitigation: keep quotas narrow, keep counters server-only, and use TTL to reduce retention.
- [Risk] Firestore transactions add latency to API writes. → Mitigation: keep the algorithm fixed-window, one transaction per dimension, and only roll out to the approved route set.
- [Risk] Invalid runtime config could disable route-specific policies unexpectedly. → Mitigation: validate config docs with shared Zod schemas, log a structured warning, and fall back to shared defaults.
- [Risk] Shared schema changes widen the system contract. → Mitigation: keep the shared additions minimal and derive all TypeScript types from Zod exports.

## Migration Plan

1. Add shared throttle constants and schemas.
2. Add shared and API tests for config parsing, subject normalization, and multi-instance counter enforcement.
3. Implement the Firestore-backed throttle service and wire handlers to it.
4. Seed emulator `apiThrottleConfigs` documents and update live specs.
5. Run typecheck, lint, and tests before presenting the change.

Rollback strategy: disable route-specific config documents and revert to shared fallback behavior, or revert the change set entirely if runtime performance or correctness issues appear.

## Open Questions

- None. The implementation choices for store, cleanup, dimensions, and readable subjects are fixed by the approved plan.
