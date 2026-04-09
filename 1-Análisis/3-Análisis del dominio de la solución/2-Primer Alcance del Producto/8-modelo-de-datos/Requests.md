# 8.3 `Requests`
## Solicitudes de búsqueda operadas internamente por la institución

---

## Propósito y propiedad

| Aspecto | Definición |
|---|---|
| Propósito | Modelar solicitudes de búsqueda dirigidas a una institución diversa. |
| Propiedad | Pertenece a la institución cuyo `RFC` coincide con la solicitud. |
| Papel dentro del alcance 1 | Permitir seguimiento, visualización, cambio de fases y lectura operativa interna, aun antes de la recepción formal desde la PUI. |

## Estructura de datos

| Campo | Significado |
|---|---|
| `FUB` | Identificador transversal principal de la solicitud. |
| `CURP` | Identificador de la persona asociada a la solicitud. |
| `requestId` | Identificador único del documento en la colección `Requests`. |
| `RFC` | Institución responsable de atender la solicitud. |
| `missingDate` | Fecha asociada al caso o desaparición. |
| `searchRequestStatus` | Estado general vigente de la solicitud. |
| `searchRequestBasicDataPhaseStatus` | Estado de la fase de datos básicos. |
| `searchRequestHistoricalPhaseStatus` | Estado de la fase histórica. |
| `searchRequestContinuousPhaseStatus` | Estado de la fase continua. |
| `updates[]` | Historial append-only de transiciones del estado general y de los estados vigentes por fase. |
| `createdAt` | Fecha de creación del registro. |
| `updatedAt` | Fecha de última actualización del estado vigente. |

## Historial de cambios

### Estructura mínima de `updates[]`

| Campo histórico | Significado |
|---|---|
| `updateOrigin` | Origen funcional de la actualización histórica, usando `UPDATE_ORIGIN`. |
| `updatedByUserId` | Identificador del usuario que provocó el cambio, cuando aplique. |
| `updatedByUserRole` | Rol con el que se ejecutó el cambio, cuando aplique. |
| `updatedByUserEmail` | Correo del usuario que provocó el cambio, cuando aplique. |
| `updatedAt` | Fecha en la que se registró la transición histórica. |
| `previousSearchRequestStatus` | Estado general previo de la solicitud. |
| `updatedSearchRequestStatus` | Estado general actualizado de la solicitud. |
| `previousSearchRequestBasicDataPhaseStatus` | Estado previo de la fase de datos básicos. |
| `updatedSearchRequestBasicDataPhaseStatus` | Estado actualizado de la fase de datos básicos. |
| `previousSearchRequestHistoricalPhaseStatus` | Estado previo de la fase histórica. |
| `updatedSearchRequestHistoricalPhaseStatus` | Estado actualizado de la fase histórica. |
| `previousSearchRequestContinuousPhaseStatus` | Estado previo de la fase continua. |
| `updatedSearchRequestContinuousPhaseStatus` | Estado actualizado de la fase continua. |

### Otros mecanismos históricos

| Mecanismo histórico | Alcance |
|---|---|
| Logs asociados | Conservan la evidencia histórica de creación, revocación, cambios de fase y eventos relevantes. |

## Reglas

| Regla | Implicación |
|---|---|
| Entidad operativa del MVP | `Requests` debe existir y poder usarse dentro del alcance 1 aunque la recepción formal desde la PUI se habilite después. |
| Relación `Institutions 1:N Requests` | Una institución diversa puede tener múltiples solicitudes de búsqueda relacionadas dentro del SaaS. |
| Estado y fases explícitos | La solicitud debe poder leerse tanto por estado general como por estado de cada fase. |
| `requestId` como identificador único de colección | La unicidad técnica del registro debe descansar en `requestId` y no en `FUB`. |
| `FUB` único por institución | `FUB` debe conservarse como identificador funcional del caso y puede usarse para acceder a una solicitud dentro del contexto de un `RFC`, aunque pueda repetirse entre instituciones distintas. |
| Correlación transversal | `FUB`, `CURP` y `RFC` deben permitir relacionar la solicitud con hallazgos y logs. |
| No depende de interoperabilidad real para existir | La operatividad interna precede a la integración externa. |
| Atribución mínima de mutaciones | Toda entrada de `updates[]` debe indicar `updateOrigin` y conservar identidad de la persona que realizó el cambio cuando esa atribución exista. |
| Historial append-only de cambios | Los elementos de `updates[]` solo deben añadirse y no reescribirse ni eliminarse. |

## Índices

| Índice | Finalidad |
|---|---|
| `requestId` | Ubicar y validar unicidad interna de la solicitud. |
| `RFC` | Consultar solicitudes por institución. |
| `CURP` | Consultar solicitudes por persona relacionada. |
| `RFC` + `FUB` | Consultar una solicitud específica por caso dentro del contexto institucional. |

## Eventos de log asociados

| Evento de log | Cuándo aplica |
|---|---|
| `PUI_SEARCH_REQUEST_CREATION` | Al registrar internamente la creación de una solicitud con semántica de origen PUI. |
| `PUI_SEARCH_REQUEST_REVOCATION` | Al revocar o desactivar operativamente una solicitud. |
| `PUI_SEARCH_REQUEST_HISTORICAL_FINISH` | Al concluir la fase histórica cuando corresponda. |
| `PUI_SEARCH_REQUEST_MATCH` | Al registrar coincidencias relevantes de la solicitud. |
| `PUI_SEARCH_REQUEST_API_ERROR` | Al registrar incidentes de interoperabilidad futura o simulada asociados a la solicitud. |
| `INSTITUTION_SEARCH_REQUEST_PHASE_CHANGE` | Al cambiar de fase operativa. |
| `INSTITUTION_SEARCH_REQUEST_PHASE_STATUS_CHANGE` | Al actualizar el estado de una fase específica. |
