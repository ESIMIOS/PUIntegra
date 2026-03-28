# 8.7 `Logs`
## Bitácora de auditoría del sistema y de la operación institucional

---

## Propósito y propiedad

| Aspecto | Definición |
|---|---|
| Propósito | Consolidar la evidencia de auditoría de acciones ejecutadas en el sistema. |
| Propiedad | Pertenece al dominio de auditoría del sistema, contextualizado por institución, usuario o entidad impactada. |
| Papel dentro del alcance 1 | Permitir trazabilidad, cumplimiento, soporte y reconstrucción operativa de eventos. |

## Estructura de datos

| Campo o grupo | Significado |
|---|---|
| `id` | Identificador único del log. |
| `category` | Categoría funcional del evento. |
| `RFC` | Institución relacionada con el evento, cuando aplique. |
| `origin` | Origen sistémico del evento. |
| `originTraceId` | Identificador de correlación técnica de la ejecución que originó o propagó el evento, cuando exista. |
| `userId` | Usuario relacionado con el evento, cuando aplique. |
| `execution` | Datos del actor ejecutor, como `executedByUserId`, `executedByRole`, `executedByUserEmail`. |
| `impact` | Datos del usuario o permiso impactado, como `impactedUserId`, `impactedUserRole`, `impactedUserEmail`, `impactedPermissionStatus`. |
| `searchRequest` | Contexto de solicitud relacionado, como `FUB`, `CURP`, `searchRequestStatus`, `searchRequestPhase`, `searchRequestPhaseStatus`. |
| `createdAt` | Fecha de generación del evento. |

## 8.7.1 Estructura contextual mínima

| Grupo contextual | Campos identificados |
|---|---|
| `execution` | `executedByUserId`, `executedByRole`, `executedByUserEmail` |
| `impact` | `impactedUserId`, `impactedUserRole`, `impactedUserEmail`, `impactedPermissionStatus` |
| `searchRequest` | `FUB`, `CURP`, `searchRequestStatus`, `searchRequestPhase`, `searchRequestPhaseStatus` |

## Historial de cambios

| Criterio | Alcance |
|---|---|
| Los logs no usan `updates[]` | Son registros append-only e inmutables. |
| La historia está en la secuencia misma de logs | Cada evento preserva un punto temporal de la operación. |

## Reglas

| Regla | Implicación |
|---|---|
| Retención permanente | Los logs deben conservarse indefinidamente por cumplimiento. |
| No eliminación | Los logs no deben borrarse. |
| Registro cronológico append-only | Cada log es inmutable y la historia se preserva por acumulación cronológica de eventos. |
| Enriquecimiento contextual mínimo | Deben incluir `RFC` cuando el evento se relacione con una institución y correo o referencia equivalente cuando se relacione con cuenta de usuario. |
| Origen explícito | Toda mutación relevante debe quedar atribuida a un `LOG_ORIGIN`. |
| Correlación técnica opcional | Cuando el evento derive de una ejecución trazable de backend, debe incluir `originTraceId` para correlacionarlo con artefactos técnicos y otros logs funcionales de la misma ejecución. |
| Soporte de búsqueda operativa | La colección debe permitir filtrado por categoría, ventana temporal y texto sobre campos indexados. |

## Índices

| Índice | Finalidad |
|---|---|
| `RFC` + `createdAt` | Consultar logs institucionales dentro de ventanas temporales. |
| `RFC` + `category` + `createdAt` | Filtrar logs institucionales por categoría y tiempo. |
| `RFC` + `origin` + `createdAt` | Filtrar logs institucionales por origen y tiempo. |
| `userId` + `createdAt` | Consultar logs de cuenta dentro de ventanas temporales. |
| `userId` + `category` + `createdAt` | Filtrar logs de cuenta por categoría y tiempo. |
| `userId` + `origin` + `createdAt` | Filtrar logs de cuenta por origen y tiempo. |
| `originTraceId` + `createdAt` | Correlacionar eventos funcionales con una misma ejecución técnica. |

## Eventos de log asociados

| Alcance | Lectura |
|---|---|
| Bitácora transversal | `Logs` no solo registra un evento específico, sino la taxonomía completa de eventos definida por `LOG_CATEGORIES`. |
| Entidades vinculadas | Debe poder registrar eventos de instituciones, permisos, solicitudes, hallazgos, cuentas y configuración personal. |
