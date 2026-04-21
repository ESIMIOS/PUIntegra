## ADDED Requirements

### Requirement: Requests store typed PUI activation data
The shared `RequestSchema` SHALL store the PUI activation transport payload in `data` using `PUIPUIActivaReporteEnInstitucionPayloadSchema`.

#### Scenario: Request accepts activation payload data
- **WHEN** a request document contains `data` shaped as a valid PUI activation payload
- **THEN** `RequestSchema` validates the document

#### Scenario: Request rejects malformed activation data
- **WHEN** a request document contains malformed PUI activation payload data
- **THEN** `RequestSchema` rejects the document

### Requirement: Findings store typed PUI match data
The shared `FindingSchema` SHALL store PUI match notification payload data using `PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema` instead of an unconstrained record.

#### Scenario: Finding accepts match payload data
- **WHEN** a finding document contains `data` shaped as a valid PUI match notification payload
- **THEN** `FindingSchema` validates the document

#### Scenario: Finding rejects generic data
- **WHEN** a finding document contains arbitrary generic data that does not match the PUI match payload
- **THEN** `FindingSchema` rejects the document

### Requirement: PUI and internal search phases map explicitly
The shared package SHALL provide mapper functions between internal `SEARCH_REQUEST_PHASE` values and PUI `PUIFaseBusqueda` values.

#### Scenario: Internal phase maps to PUI phase
- **WHEN** an internal search request phase is mapped to PUI transport
- **THEN** basic data maps to `FASE_1`, historical maps to `FASE_2`, and continuous maps to `FASE_3`

#### Scenario: PUI phase maps to internal phase
- **WHEN** a PUI transport phase is mapped to the internal domain
- **THEN** `FASE_1` maps to basic data, `FASE_2` maps to historical, and `FASE_3` maps to continuous

### Requirement: PUI activation payload derives internal request fields
The shared adapter layer SHALL derive internal request creation fields from a valid PUI activation payload and an active tenant RFC.

#### Scenario: Request derivation from activation payload
- **WHEN** a PUI activation payload is converted to internal request creation data
- **THEN** the adapter derives `requestId`, `FUB`, `CURP`, `missingDate`, initial status, and phase statuses

#### Scenario: Malformed PUI case id
- **WHEN** the PUI activation payload id does not follow the documented `FUB-UUID4` pattern
- **THEN** the adapter throws an error instead of producing internal request data

### Requirement: PUI match payload derives internal finding fields
The shared adapter layer SHALL derive internal finding creation fields from a valid PUI match notification payload and an active tenant RFC.

#### Scenario: Finding derivation from match payload
- **WHEN** a PUI match payload is converted to internal finding creation data
- **THEN** the adapter derives `FUB`, `CURP`, and `searchRequestPhase`

#### Scenario: Malformed finding id
- **WHEN** the PUI match payload id does not follow the documented `FUB-UUID4` pattern
- **THEN** the adapter throws an error instead of producing internal finding data

### Requirement: Mock data uses PUI-shaped request and finding payloads
The web mock dataset SHALL seed requests and findings with payloads that satisfy the shared PUI transport schemas.

#### Scenario: Mock request fixture validation
- **WHEN** canonical mock requests are validated
- **THEN** every request contains valid PUI activation payload data

#### Scenario: Mock finding fixture validation
- **WHEN** canonical mock findings are validated
- **THEN** every finding contains valid PUI match notification payload data
