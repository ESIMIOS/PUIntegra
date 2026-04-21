## Why

PUIntegra now has the PUI web-service TypeScript contract available, but it is only compile-time documentation and cannot validate external payloads at runtime. The shared model must promote PUI transport payloads to Zod-backed contracts before internal `Requests` and `Findings` depend on them.

## What Changes

- Add PUI transport Zod schemas as the canonical source of truth for PUI web-service payload validation and inferred TypeScript types.
- Replace duplicated or handwritten PUI transport interfaces with schema-inferred types and remove `packages/shared/src/constants/PUI.ts` as a duplicate contract surface.
- Update `RequestSchema` so internal request documents store `data: PUIPUIActivaReporteEnInstitucionPayload`.
- Update `FindingSchema` so internal finding documents store `data: PUIInstitucionNotificaCoincidenciaEnPUIPayload` instead of an unconstrained record.
- Add mapper utilities between internal domain enums and PUI transport enums, especially `SEARCH_REQUEST_PHASE` and `PUIFaseBusqueda`.
- Add PUI date conversion utilities for `YYYY-MM-DD` transport values and internal UTC timestamp milliseconds.
- Update mock seed data and tests to use the typed PUI payloads.
- Update model and shared live specs so future Firestore/API implementation follows the same boundary rules.

## Capabilities

### New Capabilities

- `pui-transport-contract`: Runtime validation and type inference for PUI transport payloads, enums, identifiers, dates, and response shapes.
- `pui-domain-adapters`: Boundary mapping between PUI transport payloads and PUIntegra internal request/finding domain documents.

### Modified Capabilities

- None. There are no existing OpenSpec capability specs for these contracts under `openspec/specs/`.

## Impact

- Affected shared schema files:
  - `packages/shared/src/schemas/pui-transport.schema.ts` will be added.
  - `packages/shared/src/schemas/request.schema.ts` will add typed PUI activation payload data.
  - `packages/shared/src/schemas/finding.schema.ts` will replace generic finding data with typed PUI match payload data.
  - `packages/shared/src/index.ts` will export the new schemas, constants, mappers, utilities, and inferred types.
- Affected shared constants:
  - `packages/shared/src/constants/PUI.ts` will be removed because no imports require transitional compatibility.
- Affected web mock files:
  - mock seed, fixture tests, repository/service/controller tests that validate requests/findings.
- Affected documentation:
  - `packages/shared/specs/shared-foundations.md`
  - `1-Análisis/3-Análisis del dominio de la solución/2-Primer Alcance del Producto/8-modelo-de-datos/Requests.md`
  - `1-Análisis/3-Análisis del dominio de la solución/2-Primer Alcance del Producto/8-modelo-de-datos/Findings.md`
- Firebase security rules are not affected.
