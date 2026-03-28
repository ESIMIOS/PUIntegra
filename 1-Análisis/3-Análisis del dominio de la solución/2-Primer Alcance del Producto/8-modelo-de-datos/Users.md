# 8.1 `Users`
## Representación operativa de la persona usuaria dentro del producto

---

## Propósito y propiedad

| Aspecto | Definición |
|---|---|
| Propósito | Representar al usuario con cuenta creada dentro del producto más allá de Firebase Auth. |
| Propiedad | Corresponde al usuario cuyo `userId` coincide con el registro. |
| Papel dentro del alcance 1 | Permite sostener identidad operativa, configuración personal, trazabilidad y relación con permisos. |

## Estructura de datos

| Campo | Significado |
|---|---|
| `userId` | Identificador único del usuario dentro del sistema. |
| `name` | Nombre visible del usuario. |
| `email` | Correo electrónico de la cuenta autenticable. |
| `phone` | Teléfono del usuario. |
| `emojiIcon` | Representación visual personal configurable por el usuario. |
| `createdAt` | Fecha de creación del registro. |
| `updatedAt` | Fecha de última actualización del registro vigente. |

## Historial de cambios

### Estructura mínima de `updates[]`

| Campo histórico | Significado |
|---|---|
| `updateOrigin` | Origen funcional de la actualización histórica, usando `UPDATE_ORIGIN`. |
| `updatedByUserId` | Identificador del usuario que provocó el cambio, cuando aplique. |
| `updatedByUserRole` | Rol con el que se ejecutó el cambio, cuando aplique. |
| `updatedByUserEmail` | Correo del usuario que provocó el cambio, cuando aplique. |
| `updatedAt` | Fecha en la que se registró el cambio histórico. |
| `previousName` | Nombre visible previo del usuario. |
| `updatedName` | Nombre visible actualizado del usuario. |
| `previousEmojiIcon` | Ícono visual previo del usuario. |
| `updatedEmojiIcon` | Ícono visual actualizado del usuario. |

## Reglas

| Regla | Implicación |
|---|---|
| Un registro por correo | No deben existir múltiples registros de `Users` para un mismo correo. |
| Creación derivada de cuenta | El registro debe originarse cuando una cuenta se crea válidamente dentro del sistema. |
| Representación operativa obligatoria | La autenticación no debe quedarse solo en Firebase Auth; debe existir su contraparte en `Users`. |
| Edición personal acotada | Los cambios personales del alcance se concentran en datos como nombre visible y `emojiIcon`. |
| Atribución mínima de mutaciones | Toda entrada de `updates[]` debe indicar `updateOrigin` y conservar identidad de la persona que realizó el cambio cuando esa atribución exista. |
| Historial append-only de cambios | Los elementos de `updates[]` solo deben añadirse y no reescribirse ni eliminarse. |

## Índices

| Índice | Finalidad |
|---|---|
| `email` | Ubicar y validar unicidad operativa por correo. |

## Eventos de log asociados

| Evento de log | Cuándo aplica |
|---|---|
| `USER_ACCOUNT_CREATION` | Al materializar el usuario operativo a partir de una cuenta creada válidamente dentro del sistema. |
| `USER_ACCOUNT_SETTINGS_UPDATE` | Al actualizar configuración personal permitida del usuario. |
