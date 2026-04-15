## ADDED Requirements

### Requirement: Stage-1 entities have shared Zod schemas
The system SHALL define Zod schemas in `packages/shared/src/schemas/` for the stage-1 MVP entities needed by the mock data layer: user, institution, permission, contact, request, finding, log, and shared update/log support structures.

#### Scenario: Schema exports are available to web
- **WHEN** the web package imports a stage-1 entity schema from the shared package
- **THEN** the schema and its Zod-inferred type are available without defining a duplicate web-local entity type

#### Scenario: Existing access schemas remain compatible
- **WHEN** the stage-1 entity schemas reference role or authenticated-role values
- **THEN** they use the existing shared access constants and schemas rather than redefining role values

### Requirement: Types are inferred from Zod
The system MUST infer TypeScript entity types from Zod schemas and MUST NOT define manual TypeScript interfaces for the shared stage-1 entities.

#### Scenario: Entity type definition
- **WHEN** implementation code needs the `Institution` entity type
- **THEN** it derives that type with `z.infer<typeof InstitutionSchema>`

### Requirement: Provider context is not a tenant institution
The shared institution contract SHALL represent real tenant institutions and SHALL NOT require a tenant `Institution` document for `SYSTEM_RFC`.

#### Scenario: SYSTEM_RFC permission context
- **WHEN** a permission uses `SYSTEM_RFC` for `SYSTEM_ADMINISTRATOR`
- **THEN** the permission can be represented without requiring an `Institutions/SYSTEM_RFC` document

#### Scenario: Tenant institution seed
- **WHEN** the mock layer validates tenant institution data
- **THEN** `DEFAULT_RFC` can be represented as the tenant institution document

### Requirement: Shared schemas support mock and future Firestore shape
The shared stage-1 schemas SHALL describe document shapes that can be used by the frontend mock layer now and by Firestore-backed providers later.

#### Scenario: Mock fixture validation
- **WHEN** canonical mock fixture data is validated in tests
- **THEN** each fixture passes the corresponding shared Zod schema

#### Scenario: Firestore migration boundary
- **WHEN** a future Firestore repository returns a stage-1 entity document
- **THEN** it can validate and type the result with the same shared schema used by the mock repository
