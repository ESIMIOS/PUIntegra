# Shared Foundations (Live Spec)

## Purpose

Define persistent rules for `packages/shared` as the system-wide contract package consumed by `api` and `web`.

## Engineering standards reference

- Global project-wide engineering standards live in [`openspec/specs/engineering-standards.md`](../../../openspec/specs/engineering-standards.md).
- This includes language policy, JSDoc/changelog rules, dependency versioning policy, and spec maintenance model.

## Shared-specific constraints

- All exports must be explicitly declared in `src/index.ts`.
- System-wide constants and enums are defined in this package and consumed through package contracts (`@puintegra/shared` in workspace consumers, or package-local aliasing where configured).
- Schema files follow `<entity>.schema.ts`.
- Types are inferred from Zod schemas (`z.infer`), never handwritten.
- Any change in `src/schemas` requires explicit human approval before implementation.

## Constant and role modeling guideline

- Keep role/status string literals in one constant source file (for example `src/constants/access.ts`).
- Build `RoleSchema`, `AuthenticatedRoleSchema`, and role subsets from that source.
- Do not retype role literals in multiple arrays/schemas.
- Prefer explicit derived subsets (auditable) over opaque transformations when the subset is part of the domain contract.
