# 8.2 `Permissions`
## Relación institucional de acceso entre correo, rol y estado

---

## Propósito y propiedad

| Aspecto | Definición |
|---|---|
| Propósito | Relacionar institución, correo y rol, mostrando además el estado vigente del acceso y su historial. |
| Propiedad | Pertenece al dominio de acceso institucional asociado al `RFC` y, cuando exista, al `userId` relacionado. |
| Papel dentro del alcance 1 | Gobernar creación de cuenta, selección de contexto y autorización efectiva sobre instituciones. |

## Estructura de datos

| Campo | Significado |
|---|---|
| `permissionId` | Identificador único del documento en la colección `Permissions`. |
| `RFC` | Institución sobre la que el permiso aplica. |
| `email` | Correo al que se habilita el permiso. |
| `userId` | Referencia al usuario operativo cuando la cuenta ya existe. |
| `role` | Rol autorizado para la combinación institución-correo. |
| `status` | Estado vigente del permiso. |
| `createdAt` | Fecha de creación del permiso. |
| `updatedAt` | Fecha de última actualización del permiso vigente. |

## Historial de cambios

### Estructura mínima de `updates[]`

| Campo histórico | Significado |
|---|---|
| `updateOrigin` | Origen funcional de la actualización histórica, usando `UPDATE_ORIGIN`. |
| `updatedByUserId` | Identificador del usuario que provocó el cambio, cuando aplique. |
| `updatedByUserRole` | Rol con el que se ejecutó el cambio, cuando aplique. |
| `updatedByUserEmail` | Correo del usuario que provocó el cambio, cuando aplique. |
| `updatedAt` | Fecha en la que se registró el cambio histórico. |
| `previousUserId` | Referencia previa al usuario operativo vinculado. |
| `updatedUserId` | Referencia actualizada al usuario operativo vinculado. |
| `previousRole` | Rol previo autorizado para el permiso. |
| `updatedRole` | Rol actualizado autorizado para el permiso. |
| `previousStatus` | Estado previo del permiso. |
| `updatedStatus` | Estado actualizado del permiso. |

## Reglas

| Regla | Implicación |
|---|---|
| Relación `Users 1:N Permissions` | Un mismo usuario puede acumular múltiples permisos sobre una o varias instituciones. |
| Relación `Institutions 1:N Permissions` | Una misma institución puede tener múltiples permisos asociados a distintos correos, usuarios o roles. |
| Un registro por institución-correo-rol | La unicidad del permiso se resuelve por la combinación `RFC` + `email` + `role`. |
| No eliminación ordinaria | Los permisos no deben eliminarse; deben actualizarse y conservar historial. |
| Creación de cuenta dependiente de permiso | Un permiso activo es condición previa para crear cuenta. |
| UI orientada por `RFC` | La lectura administrativa de permisos dentro del alcance 1 se resuelve principalmente consultando por institución. |
| Validación backend de unicidad | La unicidad de `RFC` + `email` + `role` debe verificarse al crear o actualizar el permiso; no debe confiarse al cliente. |
| Mutabilidad acotada | Dentro del alcance, al editar un permiso solo deben mutar los campos permitidos de acceso, especialmente rol y estado. |
| Notificación por correo al otorgar permiso | Cuando `SYSTEM_ADMINISTRATOR` otorgue `INSTITUTION_ADMIN` o `SYSTEM_ADMINISTRATOR`, y cuando `INSTITUTION_ADMIN` otorgue `INSTITUTION_OPERATOR`, el sistema debe enviar un correo al `email` autorizado como parte del caso de uso. |
| Atribución mínima de mutaciones | Toda entrada de `updates[]` debe indicar `updateOrigin` y conservar identidad de la persona que realizó el cambio cuando esa atribución exista. |
| Historial append-only de cambios | Los elementos de `updates[]` solo deben añadirse y no reescribirse ni eliminarse. |

## Índices

| Índice | Finalidad |
|---|---|
| `RFC` | Consultar permisos por institución. |
| `email` | Consultar permisos asociados a un correo. |
| `userId` | Consultar permisos asociados a un usuario operativo ya materializado. |
| `RFC` + `email` + `role` | Verificar unicidad funcional de la combinación autorizada. |

## Eventos de log asociados

| Evento de log | Cuándo aplica |
|---|---|
| `INSTITUTION_PERMISSION_CREATION` | Al crear un permiso institucional. |
| `INSTITUTION_PERMISSION_UPDATE` | Al actualizar rol, estado o vínculo de usuario de un permiso. |
