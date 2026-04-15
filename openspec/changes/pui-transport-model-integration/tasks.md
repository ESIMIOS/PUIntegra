## 1. Tests First

- [ ] 1.1 Add shared PUI transport schema tests for activation payloads, active reports, match notification payloads, enums, required fields, regex constraints, min/max constraints, and invalid payload failures.
- [ ] 1.2 Add shared tests proving PUI match notification payloads reject event-specific fields when `fase_busqueda` is `FASE_1`.
- [ ] 1.3 Add shared date utility tests for PUI `YYYY-MM-DD` to UTC timestamp milliseconds, UTC timestamp milliseconds to PUI date string, optional missing dates, and invalid calendar dates throwing errors.
- [ ] 1.4 Add shared mapper tests for internal `SEARCH_REQUEST_PHASE` to PUI `PUIFaseBusqueda` mapping in both directions.
- [ ] 1.5 Add shared adapter tests proving PUI activation payloads derive request creation fields and malformed `FUB-UUID4` ids throw.
- [ ] 1.6 Add shared adapter tests proving PUI match payloads derive finding creation fields and malformed `FUB-UUID4` ids throw.
- [ ] 1.7 Add request and finding schema migration tests proving `RequestSchema.data` requires PUI activation payload data and `FindingSchema.data` requires PUI match payload data.
- [ ] 1.8 Add web mock fixture regression tests proving canonical mock requests and findings use PUI-shaped payload data.

## 2. Shared Contract Approval

- [ ] 2.1 Confirm explicit human approval to modify `packages/shared/src/schemas/` before editing shared schema files.
- [ ] 2.2 Confirm whether `packages/shared/src/constants/PUI.ts` should be kept as a transitional re-export after imports migrate or deleted in the same change.

## 3. PUI Transport Schemas

- [ ] 3.1 Add `packages/shared/src/schemas/pui-transport.schema.ts` with PUI transport constants, value arrays, regex/min/max constants, Zod schemas, and schema-inferred types.
- [ ] 3.2 Implement PUI schemas for login payloads/responses, active report activation/deactivation payloads, active report list response, match notification payloads, historical-finished payloads, common person/address/biometric structures, and transport enums.
- [ ] 3.3 Ensure all PUI transport types are inferred from Zod and no independent handwritten interfaces remain for the same payloads.
- [ ] 3.4 Update `packages/shared/src/index.ts` to export PUI transport schemas, constants, and inferred types.
- [ ] 3.5 Migrate or replace `packages/shared/src/constants/PUI.ts` so it no longer acts as a duplicate contract source.

## 4. Date And Mapper Boundaries

- [ ] 4.1 Add shared PUI date utilities for converting PUI `YYYY-MM-DD` strings to internal UTC timestamp milliseconds and back.
- [ ] 4.2 Ensure invalid calendar dates and unsafe timestamps throw explicit errors at conversion boundaries.
- [ ] 4.3 Add shared mapper utilities for `SEARCH_REQUEST_PHASE` and `PUIFaseBusqueda` in both directions.
- [ ] 4.4 Add shared adapter utilities that derive internal request creation data from PUI activation payloads and active tenant RFC.
- [ ] 4.5 Add shared adapter utilities that derive internal finding creation data from PUI match payloads and active tenant RFC.

## 5. Request And Finding Schema Migration

- [ ] 5.1 Update `RequestSchema` to include `data: PUIPUIActivaReporteEnInstitucionPayloadSchema` while retaining internal query and status fields.
- [ ] 5.2 Update `FindingSchema` so `data` uses `PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema` instead of generic unknown record data.
- [ ] 5.3 Update schema exports and dependent imports after request/finding schema changes.
- [ ] 5.4 Ensure internal timestamps remain UTC epoch milliseconds and PUI transport dates remain `YYYY-MM-DD` strings inside payload data.

## 6. Mock Data Migration

- [ ] 6.1 Update canonical mock request seed data so every request includes valid PUI activation payload `data`.
- [ ] 6.2 Update canonical mock finding seed data so every finding includes valid PUI match notification payload `data`.
- [ ] 6.3 Update affected mock repositories, services, controllers, and stores only where type changes require it.
- [ ] 6.4 Ensure mock fixture validation rejects old generic finding data and malformed request payload data.

## 7. Live Specs And Documentation

- [ ] 7.1 Update `packages/shared/specs/shared-foundations.md` to document PUI transport schemas as canonical shared contracts and `PUI.ts` as non-canonical or removed.
- [ ] 7.2 Update `1-Análisis/3-Análisis del dominio de la solución/2-Primer Alcance del Producto/8-modelo-de-datos/Requests.md` to document `data` as `PUIPUIActivaReporteEnInstitucionPayload` and internal-field derivation rules.
- [ ] 7.3 Update `1-Análisis/3-Análisis del dominio de la solución/2-Primer Alcance del Producto/8-modelo-de-datos/Findings.md` to document `data` as `PUIInstitucionNotificaCoincidenciaEnPUIPayload`.
- [ ] 7.4 Document PUI date conversion and mapper boundary rules in the relevant permanent shared spec.

## 8. Quality Gates

- [ ] 8.1 Run `pnpm -r typecheck` and ensure zero errors.
- [ ] 8.2 Run `pnpm -r lint` and ensure zero warnings.
- [ ] 8.3 Run `pnpm -r test` and ensure zero failures.
