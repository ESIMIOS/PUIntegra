# 8.4 `Findings`
## Hallazgos relacionados con solicitudes y preparados para interoperabilidad futura

---

## Propósito y propiedad

| Aspecto | Definición |
|---|---|
| Propósito | Representar hallazgos asociados a una solicitud de búsqueda. |
| Propiedad | Pertenece a la institución cuyo `RFC` coincide con el hallazgo. |
| Papel dentro del alcance 1 | Permitir gestionar internamente respuestas/hallazgos con estructura preparada para la interoperabilidad futura con la PUI. |

## Estructura de datos

| Campo | Significado |
|---|---|
| `findingId` | Identificador único interno del hallazgo dentro del sistema. |
| `RFC` | Institución que emite o administra el hallazgo. |
| `FUB` | Solicitud con la que el hallazgo se correlaciona. |
| `CURP` | Persona relacionada con el hallazgo. |
| `searchRequestPhase` | Fase de búsqueda a la que corresponde el hallazgo. |
| `PUISyncStatus` | Estado de preparación o sincronización externa del hallazgo. |
| `data` | Cuerpo principal del hallazgo, con forma contractual preparada para interoperabilidad futura. |
| `createdAt` | Fecha de creación del hallazgo. |
| `updatedAt` | Fecha de última actualización del hallazgo vigente. |

## 8.4.1 Contenido principal de `data`

| Grupo de información | Contenido identificado |
|---|---|
| Identidad de la persona | `curp`, `nombre_completo`, `nombre`, `primer_apellido`, `segundo_apellido`, `fecha_nacimiento`, `lugar_nacimiento`, `sexo_asignado` |
| Contacto | `telefono`, `correo` |
| Domicilio principal | `domicilio.direccion`, `domicilio.calle`, `domicilio.numero`, `domicilio.colonia`, `domicilio.codigo_postal`, `domicilio.municipio_o_alcaldia`, `domicilio.entidad_federativa` |
| Identificador contractual del hallazgo | `id` |
| Evidencia fotográfica y biométrica | `fotos.formato_fotos`, `fotos.huellas.rone`, `fotos.huellas.rtwo`, `formato_huellas` |
| Contexto institucional y del evento | `institucion_id`, `tipo_evento`, `fecha_evento`, `descripcion_lugar_evento`, `fase_busqueda` |
| Dirección del evento | `direccion_evento.direccion`, `direccion_evento.calle`, `direccion_evento.numero`, `direccion_evento.colonia`, `direccion_evento.codigo_postal`, `direccion_evento.municipio_o_alcaldia`, `direccion_evento.entidad_federativa` |

## Historial de cambios

### Estructura mínima de `updates[]`

| Campo histórico | Significado |
|---|---|
| `updateOrigin` | Origen funcional de la actualización histórica, usando `UPDATE_ORIGIN`. |
| `updatedByUserId` | Identificador del usuario que provocó el cambio, cuando aplique. |
| `updatedByUserRole` | Rol con el que se ejecutó el cambio, cuando aplique. |
| `updatedByUserEmail` | Correo del usuario que provocó el cambio, cuando aplique. |
| `updatedAt` | Fecha en la que se registró el cambio histórico. |
| `previousPUISyncStatus` | Estado previo de sincronización o preparación frente a la PUI. |
| `updatedPUISyncStatus` | Estado actualizado de sincronización o preparación frente a la PUI. |

## Reglas

| Regla | Implicación |
|---|---|
| Entidad operativa del MVP | `Findings` debe existir y poder gestionarse en el alcance 1 aunque el envío formal a la PUI ocurra después. |
| Estructura preparada para contrato futuro | Su `data` debe mantener forma compatible con la interoperabilidad prevista. |
| `findingId` como identificador único interno | La unicidad técnica del registro debe descansar en `findingId`. |
| `data.id` como identificador contractual preparado para PUI | El campo `data.id` no reemplaza a `findingId`; debe construirse conforme al requerimiento contractual externo basado en la concatenación de `FUB` y la respuesta correspondiente. |
| Correlación obligatoria con solicitud | Debe poder relacionarse con `Requests` mediante `FUB`, `CURP` y fase correspondiente. |
| Estado de sincronización explícito | La preparación o avance hacia interoperabilidad futura debe modelarse mediante `PUISyncStatus`. |
| Atribución mínima de mutaciones | Toda entrada de `updates[]` debe indicar `updateOrigin` y conservar identidad de la persona que realizó el cambio cuando esa atribución exista. |
| Historial append-only de cambios | Los elementos de `updates[]` solo deben añadirse y no reescribirse ni eliminarse. |

## Índices

| Índice | Finalidad |
|---|---|
| `findingId` | Ubicar y validar unicidad interna del hallazgo. |
| `RFC` | Consultar hallazgos por institución. |
| `CURP` | Consultar hallazgos por persona relacionada. |
| `FUB` | Consultar hallazgos por solicitud/caso. |

## Eventos de log asociados

| Evento de log | Cuándo aplica |
|---|---|
| `INSTITUTION_SEARCH_REQUEST_MATCH_FOUND` | Al registrar un hallazgo o coincidencia relevante asociada a una solicitud. |
