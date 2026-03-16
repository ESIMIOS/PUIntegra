# shared — Agent Context

This package is the spec layer of PUIntegra. It has no runtime dependencies
other than Zod. Everything here is consumed by both api/ and web/.

## Rules specific to this package
- All exports must be explicitly declared in src/index.ts
- Schema files follow the pattern: <entity>.schema.ts
- Types are never declared — always use z.infer<>
- Utils must be pure functions with no side effects
- Every schema must have a corresponding test in tests/

NEVER modify src/schemas/ without explicit approval from the project owner.
Any change here is a breaking contract change.
Propose → get approval → implement. Never the other way.
