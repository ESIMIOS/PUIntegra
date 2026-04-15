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
- Constants and schemas belong to the same domain concept but different responsibilities:
  - `src/constants/*`: canonical domain values for business logic.
  - `src/schemas/*`: runtime validation contracts for unknown/dynamic inputs.
- Transport contracts for external web-service payloads are schema-first. When an external contract must be validated at runtime, the `src/schemas/*` file is the canonical source and any `src/constants/*` module may only re-export or support that schema-backed contract.

## Constant and role modeling guideline

- Keep role/status string literals in one constant source file (for example `src/constants/access.ts`).
- Build `RoleSchema`, `AuthenticatedRoleSchema`, and role subsets from that source.
- For stage and domain vocabularies, model constants with:
  - `UPPER_SNAKE_CASE` object (`as const`)
  - `<Domain>Values` derived from that object
  - `z.enum(<Domain>Values)` in schema files
- Keep access artifacts paired and discoverable:
  - constants: `src/constants/access.ts`
  - schemas: `src/schemas/access.schema.ts`
- Do not retype role literals in multiple arrays/schemas.
- Prefer explicit derived subsets (auditable) over opaque transformations when the subset is part of the domain contract.

## Stage-1 entity contract note

- Stage-1 entity schemas (`user`, `institution`, `permission`, `contact`, `request`, `finding`, `log`) are shared contracts consumed by web and future api providers.
- Stage-1 enumerations must stay aligned with `1-Análisis/3-Análisis del dominio de la solución/2-Primer Alcance del Producto/4-fundamentos-del-alcance.md` section `4.3 Enumeraciones normativas del alcance`.
- Stage-1 entity timestamps use UTC epoch milliseconds (`number`) through `TimestampMillisecondsUtcSchema`.
- The provider/system context (`SYSTEM_RFC`) is modeled through permissions and context metadata, not as a tenant institution document.
- Tenant institution collections must represent real institution RFCs only (for example `DEFAULT_RFC` in mock seed).

## PUI transport contract guideline

- PUI web-service payloads are modeled in `src/schemas/pui-transport.schema.ts`.
- PUI transport schemas preserve wire field names and wire formats, including `snake_case` fields and `YYYY-MM-DD` date strings.
- TypeScript PUI transport types are inferred from Zod schemas; handwritten interfaces for the same payload shape are not maintained in parallel.
- `src/constants/PUI.ts` is intentionally absent; PUI transport constants and schemas live together in the schema-backed contract.
- Internal domain documents keep query/index fields separately from PUI transport payload data.
- `RequestSchema.data` stores `PUIPUIActivaReporteEnInstitucionPayload`.
- `FindingSchema.data` stores `PUIInstitucionNotificaCoincidenciaEnPUIPayload`.
- PUI transport dates convert to internal UTC epoch milliseconds only at mapper or adapter boundaries.
- Invalid PUI calendar dates must throw at conversion boundaries instead of silently becoming `null`.
- PUI/internal enum translation must live in explicit mapper utilities, not inline string comparisons in services or UI code.
