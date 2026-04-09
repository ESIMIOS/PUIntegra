# 8.6 `Contacts`
## Contactos institucionales de tipo legal, técnico y de búsqueda inmediata

---

## Propósito y propiedad

| Aspecto | Definición |
|---|---|
| Propósito | Representar personas de contacto institucional de tipo legal, técnico o de búsqueda inmediata. |
| Propiedad | Pertenece a la institución cuyo `RFC` coincide con el registro. |
| Papel dentro del alcance 1 | Mantener información institucional de referencia sin convertirla en acceso operativo al sistema. |

## Estructura de datos

| Campo | Significado |
|---|---|
| `contactId` | Identificador único del contacto. |
| `type` | Tipo de contacto institucional. |
| `RFC` | Institución a la que pertenece el contacto. |
| `name` | Nombre del contacto. |
| `phone` | Teléfono del contacto. |
| `contactCURP` | CURP de la persona contacto. |
| `contactRFC` | RFC de la persona contacto, cuando aplique. |
| `efirmaCertificate` | Referencia al certificado de e.firma asociado al contacto, cuando aplique. |

## Historial de cambios

### Estructura mínima de `updates[]`

| Campo histórico | Significado |
|---|---|
| `updateOrigin` | Origen funcional de la actualización histórica, usando `UPDATE_ORIGIN`. |
| `updatedByUserId` | Identificador del usuario que provocó el cambio, cuando aplique. |
| `updatedByUserRole` | Rol con el que se ejecutó el cambio, cuando aplique. |
| `updatedByUserEmail` | Correo del usuario que provocó el cambio, cuando aplique. |
| `updatedAt` | Fecha en la que se registró el cambio histórico. |
| `previousRFC` | `RFC` previo asociado al contacto. |
| `updatedRFC` | `RFC` actualizado asociado al contacto. |
| `previousType` | Tipo previo del contacto institucional. |
| `updatedType` | Tipo actualizado del contacto institucional. |
| `previousName` | Nombre previo del contacto. |
| `updatedName` | Nombre actualizado del contacto. |
| `previousPhone` | Teléfono previo del contacto. |
| `updatedPhone` | Teléfono actualizado del contacto. |
| `previousContactCURP` | CURP previa de la persona contacto. |
| `updatedContactCURP` | CURP actualizada de la persona contacto. |
| `previousEfirmaCertificate` | Referencia previa al certificado de e.firma. |
| `updatedEfirmaCertificate` | Referencia actualizada al certificado de e.firma. |
| `previousContactRFC` | RFC previo de la persona contacto, cuando aplique. |
| `updatedContactRFC` | RFC actualizado de la persona contacto, cuando aplique. |

## Reglas

| Regla | Implicación |
|---|---|
| Relación `Institutions 1:N Contacts` | Una institución puede mantener múltiples contactos institucionales asociados. |
| Contactos no son roles operativos | Su existencia no concede acceso al sistema. |
| Tipología cerrada | El tipo debe resolverse mediante `INSTITUTION_CONTACT_TYPE`. |
| Propiedad institucional explícita | Todo contacto debe quedar asociado a una institución concreta mediante `RFC`. |
| Atribución mínima de mutaciones | Toda entrada de `updates[]` debe indicar `updateOrigin` y conservar identidad de la persona que realizó el cambio cuando esa atribución exista. |
| Historial append-only de cambios | Los elementos de `updates[]` solo deben añadirse y no reescribirse ni eliminarse. |

## Índices

| Índice | Finalidad |
|---|---|
| `RFC` | Consultar contactos por institución. |

## Eventos de log asociados

| Evento de log | Cuándo aplica |
|---|---|
| `INSTITUTION_CONTACT_CREATION` | Al crear un contacto institucional. |
| `INSTITUTION_CONTACT_UPDATE` | Al actualizar un contacto institucional. |
