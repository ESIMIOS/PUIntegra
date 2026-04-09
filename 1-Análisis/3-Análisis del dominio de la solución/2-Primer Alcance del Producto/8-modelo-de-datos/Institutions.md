# 8.5 `Institutions`
## Instituciones diversas activas dentro del SaaS

---

## Propósito y propiedad

| Aspecto | Definición |
|---|---|
| Propósito | Representar a la institución diversa activa dentro del producto. |
| Propiedad | Pertenece a la institución cuyo `RFC` coincide con el registro. |
| Papel dentro del alcance 1 | Sostener la identidad institucional, el plan comercial y la configuración sensible preparatoria del SaaS. |

## Estructura de datos

| Campo | Significado |
|---|---|
| `RFC` | Identificador único del documento en la colección `Institutions` y referencia estructural de la institución. |
| `name` | Nombre de la institución. |
| `plan` | Plan comercial vigente de la institución. |
| `planStatus` | Estado de vigencia operativa de la institución dentro del SaaS. |
| `sharedSecret` | Secreto institucional sensible para interoperabilidad futura. |
| `planStartAt` | Fecha de inicio del plan vigente. |
| `planFinishAt` | Fecha de fin del plan vigente. |
| `createdAt` | Fecha de creación del registro institucional. |
| `updatedAt` | Fecha de última actualización del registro vigente. |

## Historial de cambios

### Estructura mínima de `updates[]`

| Campo histórico | Significado |
|---|---|
| `updateOrigin` | Origen funcional de la actualización histórica, usando `UPDATE_ORIGIN`. |
| `updatedByUserId` | Identificador del usuario que provocó el cambio, cuando aplique. |
| `updatedByUserRole` | Rol con el que se ejecutó el cambio, cuando aplique. |
| `updatedByUserEmail` | Correo del usuario que provocó el cambio, cuando aplique. |
| `previousName` | Nombre previo de la institución. |
| `updatedName` | Nombre actualizado de la institución. |
| `previousPlan` | Plan comercial previo. |
| `updatedPlan` | Plan comercial actualizado. |
| `previousPlanStatus` | Estado previo de vigencia operativa del plan. |
| `updatedPlanStatus` | Estado actualizado de vigencia operativa del plan. |
| `previousPlanStartAt` | Fecha previa de inicio del plan. |
| `updatedPlanStartAt` | Fecha actualizada de inicio del plan. |
| `previousPlanFinishAt` | Fecha previa de fin del plan. |
| `updatedPlanFinishAt` | Fecha actualizada de fin del plan. |
| `previousSHA256SharedSecret` | Derivado seguro previo del secreto institucional. |
| `updatedSHA256SharedSecret` | Derivado seguro actualizado del secreto institucional. |
| `updatedAt` | Fecha en la que se registró el cambio histórico. |

## Reglas

| Regla | Implicación |
|---|---|
| Incorporación inicial por el proveedor SaaS | La institución no se autoaprovisiona; su alta inicial pertenece al dominio del proveedor. |
| `RFC` como identificador transversal | Toda correlación institucional del producto debe apoyarse en `RFC`. |
| Un solo documento por institución | Cada institución diversa debe existir una sola vez en la colección `Institutions`, usando su `RFC` como identificador único del documento. |
| Plan explícito y vigente | El registro institucional debe mantener el plan comercial actual y sus fechas relevantes de vigencia. |
| Estado operativo explícito | La vigencia operativa de la institución dentro del SaaS debe expresarse mediante `planStatus`, usando `COMMERCIAL_PLAN_STATUS`. |
| `sharedSecret` protegido | El secreto debe almacenarse cifrado en reposo y nunca exponerse en claro en vistas o logs. |
| Historial seguro de secreto | El historial no debe guardar el secreto en claro, sino derivados seguros como `SHA256`. |
| Atribución mínima de mutaciones | Toda entrada de `updates[]` debe indicar `updateOrigin` y conservar identidad de la persona que realizó el cambio cuando esa atribución exista. |
| Historial append-only de cambios | Los elementos de `updates[]` solo deben añadirse y no reescribirse ni eliminarse. |

## Índices

| Índice | Finalidad |
|---|---|
| `RFC` | Identificar unívocamente y correlacionar la institución dentro del producto. |

## Eventos de log asociados

| Evento de log | Cuándo aplica |
|---|---|
| `INSTITUTION_CREATION` | Al crear una institución en el sistema. |
| `INSTITUTION_PLAN_CREATION` | Al registrar el plan inicial de una institución. |
| `INSTITUTION_PLAN_UPDATE` | Al actualizar el plan o sus fechas relevantes. |
| `INSTITUTION_CONTACT_CREATION` | Al crear un contacto institucional asociado. |
| `INSTITUTION_CONTACT_UPDATE` | Al actualizar un contacto institucional asociado. |
| `INSTITUTION_SHARED_SECRET_UPDATE` | Al actualizar el `sharedSecret` institucional. |
