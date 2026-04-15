## Context

`packages/shared/src/constants/PUI.ts` currently captures the PUI web-service contract as TypeScript interfaces, enums, comments, min/max constraints, and regex expectations. That file is useful as source material, but it cannot validate unknown transport payloads at runtime and conflicts with the project rule that shared contracts are Zod-first.

Internal `RequestSchema` and `FindingSchema` already model operational PUIntegra documents. This change keeps those internal documents query-friendly while storing the original PUI transport payload in a typed `data` property. Permanent shared rules live in `packages/shared/specs/shared-foundations.md`, and the request/finding model docs live under `1-Análisis/3-Análisis del dominio de la solución/2-Primer Alcance del Producto/8-modelo-de-datos/`.

## Goals / Non-Goals

**Goals:**

- Make PUI transport Zod schemas the canonical shared contract for PUI payloads.
- Infer all PUI transport TypeScript types from Zod schemas.
- Store typed PUI activation payloads in `RequestSchema.data`.
- Store typed PUI match-notification payloads in `FindingSchema.data`.
- Add explicit boundary adapters for enum mapping, ID derivation, and PUI date conversion.
- Update tests, mock seed data, and live specs so follow-up API/Firestore work inherits the same contracts.

**Non-Goals:**

- No real PUI HTTP client or Cloud Function endpoint is added in this change.
- No Firebase security rules are changed.
- No production authentication or provider configuration is changed.
- No UI/UX business views are implemented.
- No data migration is run against a production Firestore dataset.

## Decisions

### PUI transport schemas are canonical

Create `packages/shared/src/schemas/pui-transport.schema.ts` and move the effective PUI contract there: value constants, derived value arrays, regex/min/max constants, Zod schemas, and `z.infer` types. `PUI.ts` must not remain a second independent contract source and is removed because no runtime imports require transitional compatibility.

Alternative considered: keep interfaces in `PUI.ts` and define schemas elsewhere. This was rejected because two parallel contract definitions will drift.

### Internal documents keep operational fields plus typed payload data

`Requests` keep `requestId`, `RFC`, `FUB`, `CURP`, `missingDate`, status, phase statuses, and update history for indexing and UI use. They add `data: PUIPUIActivaReporteEnInstitucionPayloadSchema` for the PUI activation payload.

`Findings` keep `findingId`, `RFC`, `FUB`, `CURP`, `searchRequestPhase`, PUI sync fields, responses, and update history. Their `data` becomes `PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema`.

Alternative considered: derive all internal fields from transport payloads at runtime. This was rejected because the model docs require internal query/index fields and future Firestore reads need stable document fields.

### Adapters own derivation and consistency

Add shared mapper functions for:

- `SEARCH_REQUEST_PHASE` <-> `PUIFaseBusqueda`
- PUI activation payload -> internal request creation data
- PUI match payload -> internal finding creation data
- PUI `id` -> `FUB` extraction using the documented `FUB-UUID4` pattern

Schemas validate payload shape; adapters validate cross-field derivation rules and throw on invalid boundary data. This keeps schema complexity lower and makes mapper failures easier to test.

### PUI dates convert only at boundaries

PUI transport dates remain `YYYY-MM-DD` strings inside PUI payload schemas. Internal domain timestamps remain UTC epoch milliseconds. Shared date utilities convert between these formats using UTC midnight, and invalid calendar dates throw instead of silently becoming `null`.

Alternative considered: store transport dates as timestamps inside PUI payloads. This was rejected because it would mutate the external wire contract.

## Risks / Trade-offs

- PUI comments may contain ambiguous optionality -> implement only constraints explicitly expressed by the current contract and cover ambiguity in tests.
- Removing `PUI.ts` can break untracked external imports -> verify repository imports and expose all PUI contracts from `@puintegra/shared`.
- Cross-field validation in Zod can increase complexity -> keep payload shape validation in schemas and document mapper-level consistency checks.
- Mock seeds may need broad fixture edits -> update seed and fixture tests in the same change to prevent stale generic payloads.

## Migration Plan

1. Add failing shared tests for PUI transport validation, date conversion, enum mapping, and request/finding payload migration.
2. Add `pui-transport.schema.ts` and export schemas/types.
3. Add shared date and mapper utilities.
4. Update `RequestSchema`, `FindingSchema`, and tests.
5. Update mock seeds and affected web tests.
6. Update permanent shared/model specs.
7. Run `pnpm -r typecheck`, `pnpm -r lint`, and `pnpm -r test`.

Rollback is straightforward before production API adoption: revert the schema, mapper, seed, and documentation changes together.

## Open Questions

- No open questions remain for `PUI.ts`; repository imports use schema-backed exports.
