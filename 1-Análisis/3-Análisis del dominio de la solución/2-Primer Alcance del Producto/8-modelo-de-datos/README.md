# 8. Especificación del modelo de datos
## Inventario analítico de colecciones del alcance 1

---

Esta sección concentra la especificación analítica de las colecciones relevantes para el alcance 1.

Para cada colección se documentan, según corresponda:

| Componente de especificación | Alcance esperado |
|---|---|
| Propósito | Razón de existir de la colección dentro del alcance 1. |
| Propiedad | Responsable operativo o dominio al que pertenece la información. |
| Estructura de datos | Campos, relaciones y semántica principal. |
| Historial de cambios | Mutaciones que deben conservar evidencia histórica. |
| Reglas | Restricciones y comportamientos obligatorios. |
| Índices | Necesidades de consulta y acceso eficiente. |
| Eventos de log asociados | Evidencia operativa que debe generarse alrededor de la colección. |

### Convención transversal de historial embebido

| Decisión | Criterio adoptado |
|---|---|
| Ubicación del historial funcional | El historial de cambios de campos mutables relevantes se conserva dentro del mismo documento de la entidad. |
| Nombre de la estructura histórica | La convención del alcance 1 es usar `updates[]` y no `changes[]`. |
| Semántica de cada entrada | Cada elemento de `updates[]` representa una transición atómica de negocio sobre campos mutables relevantes. |
| Atribución mínima de cada entrada | Cada elemento de `updates[]` debe conservar `updateOrigin`, `updatedByUserId`, `updatedByUserRole`, `updatedByUserEmail` y `updatedAt`, dejando vacíos solo los datos personales que no apliquen al origen de la mutación. |
| Relación con `Logs` | `updates[]` conserva historial funcional de la entidad; `Logs` conserva trazabilidad transversal y de auditoría. |

---

| Numeral | Colección | Propósito principal | Documento |
|---|---|---|---|
| `8.1` | `Users` | Representar operativamente a la persona usuaria con cuenta creada dentro del producto. | [Users.md](./Users.md) |
| `8.2` | `Permissions` | Relacionar institución, correo, rol y estado de acceso. | [Permissions.md](./Permissions.md) |
| `8.3` | `Requests` | Modelar solicitudes de búsqueda operadas internamente por la institución. | [Requests.md](./Requests.md) |
| `8.4` | `Findings` | Modelar hallazgos relacionados con solicitudes y preparados para interoperabilidad futura. | [Findings.md](./Findings.md) |
| `8.5` | `Institutions` | Representar la institución diversa activa dentro del SaaS y su configuración principal. | [Institutions.md](./Institutions.md) |
| `8.6` | `Contacts` | Representar contactos institucionales de tipo legal y técnico. | [Contacts.md](./Contacts.md) |
| `8.7` | `Logs` | Consolidar la bitácora de auditoría del sistema, cuentas y operación institucional. | [Logs.md](./Logs.md) |
