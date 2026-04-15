## ADDED Requirements

### Requirement: PUI transport contracts have runtime schemas
The shared package SHALL define Zod schemas for PUI transport payloads and responses using the PUI web-service contract as the validation source.

#### Scenario: Activation payload validation
- **WHEN** an unknown value is parsed as a PUI activation payload
- **THEN** the parser validates the payload with `PUIPUIActivaReporteEnInstitucionPayloadSchema`

#### Scenario: Active report validation
- **WHEN** an unknown value is parsed as a PUI active report
- **THEN** the parser validates the payload with `PUIReporteActivoSchema`

#### Scenario: Match notification validation
- **WHEN** an unknown value is parsed as an institution match notification payload
- **THEN** the parser validates the payload with `PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema`

### Requirement: PUI transport types are inferred from Zod
The shared package MUST infer PUI transport TypeScript types from Zod schemas and MUST NOT maintain independent handwritten interfaces for the same payload shape.

#### Scenario: Type derivation
- **WHEN** implementation code needs a PUI transport type
- **THEN** it imports a Zod-inferred type from the shared PUI transport schema exports

#### Scenario: Transitional compatibility
- **WHEN** existing imports still reference `packages/shared/src/constants/PUI.ts`
- **THEN** that module either re-exports the schema-backed contract or is removed after imports migrate

### Requirement: PUI validation preserves transport semantics
The PUI transport schemas SHALL keep PUI wire field names and transport formats instead of converting them to internal domain formats during parsing.

#### Scenario: PUI date remains transport string
- **WHEN** a PUI payload contains a date field
- **THEN** the PUI schema validates it as a `YYYY-MM-DD` transport string

#### Scenario: Invalid transport field
- **WHEN** a PUI payload violates a documented regex, enum, length, or required-field constraint
- **THEN** schema parsing fails with a Zod validation result

### Requirement: PUI match payload enforces phase-one event omission
The PUI match notification payload schema SHALL reject event-specific fields when `fase_busqueda` is `FASE_1`.

#### Scenario: Phase-one match omits event details
- **WHEN** `fase_busqueda` is `FASE_1` and event-specific fields are omitted
- **THEN** the match notification payload is valid

#### Scenario: Phase-one match includes event details
- **WHEN** `fase_busqueda` is `FASE_1` and event-specific fields are present
- **THEN** the match notification payload is invalid

### Requirement: PUI date conversion is explicit and UTC-based
The shared package SHALL provide utilities that convert PUI `YYYY-MM-DD` transport dates to internal UTC timestamp milliseconds and back.

#### Scenario: Date string to timestamp
- **WHEN** a valid PUI date string is converted to an internal timestamp
- **THEN** the result is UTC midnight for that calendar date in milliseconds

#### Scenario: Timestamp to date string
- **WHEN** a valid internal UTC timestamp is converted to a PUI date
- **THEN** the result is a `YYYY-MM-DD` string

#### Scenario: Invalid calendar date
- **WHEN** an invalid calendar date such as `2026-02-30` is converted
- **THEN** the conversion throws an error
