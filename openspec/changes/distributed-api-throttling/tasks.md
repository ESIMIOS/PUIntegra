## 1. Tests First

- [x] 1.1 Add shared tests for throttle config schemas and shared fallback throttle constants.
- [x] 1.2 Add API tests for subject normalization, endpoint dimension selection, and generic over-quota response details.
- [x] 1.3 Add Firestore emulator integration tests proving counters are shared across service instances and deny on any over-quota dimension.
- [x] 1.4 Add seed and web gateway regression tests covering seeded throttle configs and preserved backend `422` display messages.

## 2. Shared Contract

- [x] 2.1 Add shared throttle endpoint constants, dimension constants, and fallback default policies in `packages/shared`.
- [x] 2.2 Add shared Zod schemas and exports for throttle config documents.

## 3. API Throttle Runtime

- [x] 3.1 Implement Firestore-backed throttle subject normalization and fixed-window counter enforcement with TTL metadata.
- [x] 3.2 Add an injected throttle dependency to the API handler layer and remove the old in-memory auth throttling.
- [x] 3.3 Wire throttling into current auth routes and RFC-scoped mutation routes with the approved endpoint dimensions.
- [x] 3.4 Update generic API throttle error behavior to return safe `422` details for over-quota requests.

## 4. Emulator And Specs

- [x] 4.1 Seed `apiThrottleConfigs` through the emulator seed flow with the approved balanced runtime rules.
- [x] 4.2 Update live specs for the Hono API and Firestore emulator data to document distributed throttling and seeded throttle config data.

## 5. Quality Gates

- [x] 5.1 Run `pnpm -r typecheck`.
- [x] 5.2 Run `pnpm -r lint`.
- [x] 5.3 Run `pnpm -r test`.
