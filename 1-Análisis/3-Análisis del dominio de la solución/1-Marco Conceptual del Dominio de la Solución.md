# Marco Conceptual del Dominio de la Solución
## Plataforma Única de Identidad (PUI)
### SaaS para integración operativa de instituciones diversas

---

# 1. Propósito del documento

El presente documento define el **marco conceptual del dominio de la solución** para el producto de software que buscamos construir alrededor de la integración de **instituciones diversas** con la **Plataforma Única de Identidad (PUI)**.

Su propósito es establecer, a alto nivel, una comprensión compartida sobre:

- qué producto completo queremos construir
- qué problema resuelve
- cuáles son sus actores, roles y entidades principales
- cuáles son sus reglas conceptuales
- cómo se divide su construcción por alcances evolutivos

Este documento funciona como **documento madre** del dominio de la solución.  
No busca describir solo el MVP ni una etapa aislada de implementación, sino el **producto total al que queremos llegar** y la forma en que decidimos construirlo progresivamente.

---

# 2. Objetivo de la solución

La solución propuesta consiste en un **SaaS** orientado a instituciones diversas que necesitan prepararse, operar y evolucionar hacia una integración formal con la PUI.

El objetivo del producto es que una institución diversa pueda contar con una plataforma propia para:

- organizar su operación institucional alrededor de la PUI
- administrar identidad, acceso, permisos y contactos
- recibir y atender solicitudes de búsqueda provenientes de la PUI
- ejecutar búsquedas sobre sus sistemas y bases de datos
- emitir respuestas y hallazgos conforme al contrato aplicable
- mantener trazabilidad, control y evidencia de cumplimiento

En consecuencia, la solución no debe entenderse solo como una integración técnica o un conjunto de endpoints, sino como un **producto integral de preparación, operación, cumplimiento e interoperabilidad**.

---

# 3. Problema que resuelve

El marco normativo obliga a que instituciones diversas permitan consultas, búsquedas y notificación de información útil para la búsqueda de personas desaparecidas o no localizadas.

Sin embargo, para una institución diversa el problema real no se reduce a:

- exponer servicios web
- recibir solicitudes de la autoridad
- responder técnicamente a una API

El problema de negocio y operación incluye además:

- contar con una representación institucional formal en el sistema
- saber quién puede operar y con qué facultades
- tener control sobre usuarios, permisos y contactos
- dar seguimiento a solicitudes y fases de atención
- preparar su operación para consultar sus propias bases de datos
- conservar evidencia trazable de todo lo que hace
- evolucionar de una preparación institucional a una integración formal con la PUI

El producto busca resolver esa brecha: transformar obligaciones normativas y técnicas en una **solución operable, administrable y escalable** para múltiples instituciones diversas.

---

# 4. Delimitación del dominio de la solución

## 4.1 Lo que sí pertenece al dominio de la solución

Forman parte del dominio de la solución:

- el producto SaaS y su modelo de operación
- la administración institucional dentro del sistema
- la gestión de identidad, acceso y permisos
- la operación institucional sobre solicitudes de búsqueda
- la preparación y configuración para interoperar con la PUI
- la ejecución de búsquedas institucionales
- la emisión de respuestas y hallazgos
- la trazabilidad, auditoría y cumplimiento
- la operación del proveedor SaaS sobre múltiples instituciones diversas

## 4.2 Lo que no pertenece al dominio de la solución

No forman parte del dominio de la solución:

- la definición jurídica de la PUI
- la regulación de desaparición forzada y búsqueda de personas
- la operación interna de RENAPO, ATDT, CNB, CLB, FGR o fiscalías
- la definición normativa de CURP, FUB o RNPDNO
- la lógica interna de búsqueda de la autoridad

## 4.3 Relación con el dominio del problema

El **dominio del problema** describe la realidad regulatoria, institucional y operativa que da origen a la PUI.  
El **dominio de la solución** describe el producto que construiremos para que una institución diversa pueda operar frente a esa realidad.

En términos simples:

- el dominio del problema explica **qué es la PUI y bajo qué reglas existe**
- el dominio de la solución explica **qué producto construiremos para operar hacia la PUI**

---

# 5. Naturaleza de la solución

La solución propuesta **no es la PUI** ni sustituye a la autoridad operadora.

La solución es un **producto SaaS** que funciona como una capa de:

- preparación institucional
- operación institucional
- gobernanza interna
- trazabilidad y cumplimiento
- interoperabilidad progresiva con la PUI

La solución se ubica conceptualmente entre:

- la institución diversa y sus sistemas internos
- la institución diversa y la PUI
- la institución diversa y el proveedor del SaaS

Por ello, el valor del producto no está solo en la conectividad, sino en permitir que una institución diversa pase de una **obligación regulatoria difusa** a una **capacidad operativa gestionada**.

---

# 6. Visión del producto completo

La visión del producto es construir una plataforma que permita a una institución diversa:

- incorporarse al ecosistema del producto
- administrar su configuración institucional
- controlar quién opera dentro de su contexto
- recibir y atender solicitudes de búsqueda
- ejecutar búsquedas en sus propias fuentes de información
- emitir respuestas y hallazgos hacia la PUI
- conservar trazabilidad completa de su actuación

La visión también incluye al proveedor SaaS como operador de un **backoffice centralizado** para supervisar, administrar y acompañar a múltiples instituciones diversas.

Por tanto, el producto completo debe entenderse como una solución con dos perspectivas simultáneas:

- la perspectiva de la **institución diversa**
- la perspectiva del **proveedor SaaS**

---

# 7. Evolución del producto por alcances

El producto se construirá de manera evolutiva. El marco conceptual conserva la visión completa y cada alcance desarrolla una parte de esa visión.

Nota de lectura:

- el número de **alcance** expresa la etapa evolutiva del producto
- el número inicial del **archivo** expresa el orden sugerido de lectura dentro de esta carpeta

| Alcance | Título | Descripción | Documento de referencia |
|---|---|---|---|
| 1 | MVP operativo del SaaS | Construcción del producto base para administración institucional, usuarios, permisos, contactos, dashboard, trazabilidad y visualización operativa | [2-Primer Alcance del Producto](./2-Primer%20Alcance%20del%20Producto/README.md) |
| 2 | Integración de endpoints para autenticación y recepción de solicitudes de la PUI | Habilitación de autenticación técnica con la PUI y recepción formal de solicitudes de búsqueda desde los endpoints definidos por la autoridad | [3-Segundo Alcance del Producto.md](./3-Segundo%20Alcance%20del%20Producto.md) |
| 3 | Implementación de búsquedas en bases de datos | Ejecución de las búsquedas requeridas sobre las bases de datos y sistemas de las instituciones diversas conforme a las fases definidas | [4-Tercer Alcance del Producto.md](./4-Tercer%20Alcance%20del%20Producto.md) |
| 4 | Envío de respuestas a hallazgos | Emisión formal de respuestas y hallazgos desde la institución diversa hacia la PUI conforme al contrato técnico aplicable | [5-Cuarto Alcance del Producto.md](./5-Cuarto%20Alcance%20del%20Producto.md) |

---

# 8. Actores del dominio de la solución

Los actores del dominio de la solución son los participantes organizacionales o humanos que intervienen en el producto.

| Actor | Descripción |
|---|---|
| Proveedor SaaS | Organización que desarrolla, opera y comercializa la plataforma |
| Institución diversa | Organización usuaria del SaaS que busca prepararse, operar y evolucionar su integración con la PUI |
| PUI | Plataforma externa con la que el producto debe interoperar progresivamente |
| Usuarios institucionales | Personas usuarias de la institución diversa que operan el SaaS conforme a roles autorizados |
| Personal interno del proveedor SaaS | Personas usuarias internas del proveedor responsables de la administración y supervisión global del producto |

## 8.1 Sistemas relacionados

Existen también sistemas relacionados que forman parte del contexto de la solución, aunque no se modelan como actores humanos:

- sistemas internos de la institución diversa
- bases de datos institucionales
- mecanismos de integración con la PUI

---

# 9. Roles del sistema

Los roles del sistema corresponden a perfiles de acceso y operación definidos para la plataforma.

| Rol | Descripción |
|---|---|
| `ANONYMOUS` | Usuario no autenticado que solo puede acceder a páginas públicas o de autenticación |
| `INSTITUTION_ADMIN` | Responsable de la administración institucional dentro del SaaS |
| `INSTITUTION_OPERATOR` | Responsable de la operación diaria sobre solicitudes, estados, fases y trazabilidad |
| `SYSTEM_ADMINISTRATOR` | Usuario interno del proveedor SaaS con visibilidad transversal del sistema |

Los contactos institucionales de tipo **Técnico**, **Legal** y **Búsqueda inmediata** no son roles operativos del sistema. Son datos institucionales informativos.

## 9.1 Regla clave de sesión

Un usuario puede tener permisos sobre:

- múltiples instituciones diversas
- múltiples roles dentro de una misma institución diversa

Pero durante una sesión operativa solo debe existir **un contexto activo institución/rol**.

---

# 10. Áreas funcionales del producto completo

Para representar correctamente el producto total, sus áreas funcionales deben entenderse a nivel general, sin confundirlas con un solo alcance de implementación.

| Área funcional | Propósito |
|---|---|
| Gestión comercial e incorporación institucional | Incorporar instituciones diversas al producto y administrar su relación con el proveedor SaaS |
| Gestión de identidad y acceso | Administrar autenticación, usuarios, permisos y selección de contexto |
| Administración institucional | Gestionar plan, contactos, parámetros institucionales y configuración de integración |
| Operación institucional | Permitir seguimiento, supervisión y atención de solicitudes de búsqueda |
| Integración con PUI | Recibir solicitudes, autenticarse técnicamente y sostener la interoperabilidad con la plataforma externa |
| Ejecución de búsquedas institucionales | Consultar sistemas y bases de datos de la institución diversa conforme a las fases de búsqueda |
| Gestión de hallazgos y respuestas | Construir y emitir respuestas institucionales hacia la PUI |
| Trazabilidad y cumplimiento | Mantener logs, evidencia operativa, seguimiento y auditoría |
| Operación del proveedor SaaS | Administrar instituciones diversas, supervisar el sistema y sostener la operación global |

---

# 11. Estructura conceptual de interacción

El producto se organiza en contextos de interacción diferenciados que expresan las grandes formas en que será experimentado y operado:

| Contexto | Significado conceptual |
|---|---|
| Sitio público | Espacio de comunicación comercial e informativa |
| Autenticación | Espacio de acceso, creación de cuenta, recuperación y salida |
| Aplicación institucional | Espacio principal de operación de una institución diversa |
| Backoffice del proveedor | Espacio de administración global del SaaS |
| Cuenta personal | Espacio de configuración y actividad propia del usuario |
| Error y restricciones | Espacio de manejo explícito de navegación inválida o acceso no permitido |

Esta estructura no debe leerse como una especificación de frontend, sino como una forma de expresar los grandes contextos de interacción del producto.

---

# 12. Entidades del dominio de la solución

| Entidad | Descripción |
|---|---|
| Institución diversa | Organización usuaria del SaaS dentro del dominio de la solución |
| Usuario | Persona autenticada con identidad propia dentro del sistema |
| Permiso | Relación que autoriza a un usuario a operar sobre una institución diversa con un rol específico |
| Contexto activo de sesión | Combinación institución/rol seleccionada por el usuario para trabajar |
| Contacto institucional | Persona de referencia institucional de tipo técnico o legal; su registro es informativo y no implica acceso al sistema |
| Plan comercial | Conjunto de condiciones comerciales y funcionales asociadas a una institución diversa |
| Configuración de integración | Entidad conceptual que agrupa la información y parámetros institucionales requeridos para interoperabilidad futura con la PUI |
| Solicitud de búsqueda | Caso operativo recibido exclusivamente desde la PUI que representa un requerimiento de búsqueda asociado a una persona |
| Fase de búsqueda | Etapa funcional de atención de una solicitud |
| Hallazgo | Respuesta formal emitida por una institución diversa en relación con una solicitud de búsqueda |
| Log de auditoría | Entidad unificada de auditoría que registra acciones, eventos, cambios y operaciones del sistema mediante categorías, orígenes y referencias contextuales |
| Estado de solicitud | Situación general de una solicitud dentro de su ciclo de vida, determinada por la autoridad a través del API |
| Estado de fase | Situación particular de cada fase dentro de una solicitud, determinada por la atención operativa de la institución diversa |

---

# 13. Identificadores relevantes

| Concepto | Identificador principal | Observación |
|---|---|---|
| Institución diversa | RFC con homoclave | Identificador natural de la institución diversa dentro del producto |
| Persona asociada a búsqueda | CURP | Dato de referencia, criterio principal de búsqueda y dato de correlación para la atención institucional |
| Caso de búsqueda | FUB | Identificador principal visible para los usuarios y referencia de negocio de la solicitud |
| Solicitud técnica | `requestId` / `id` de búsqueda | Identificador técnico secundario que debe poder alinearse con la convención `FUB + UUID4` cuando exista integración formal |
| Usuario | `userId` | Identificador interno del usuario autenticado |
| Permiso | `permissionId` | Identificador interno del permiso |
| Hallazgo | `findingId` | Identificador interno del hallazgo |
| Contacto | `contactId` | Identificador interno del contacto |
| Evento de log | `id` de log | Identificador interno del registro de auditoría |

---

# 14. Relaciones conceptuales principales

| Concepto | Relación | Concepto |
|---|---|---|
| Institución diversa | opera bajo | Plan comercial |
| Plan comercial | condiciona | Capacidades funcionales de la institución diversa |
| Usuario | recibe | Permiso |
| Permiso | habilita operación sobre | Institución diversa |
| Permiso | asigna | Rol |
| Usuario | selecciona | Contexto activo de sesión |
| Institución diversa | administra | Contactos institucionales |
| Institución diversa | administra | Configuración de integración |
| PUI | envía | Solicitudes de búsqueda |
| Institución diversa | recibe y atiende | Solicitudes de búsqueda |
| Solicitud de búsqueda | pertenece a | Una sola institución diversa |
| Solicitud de búsqueda | se identifica principalmente por | FUB |
| Solicitud de búsqueda | puede contener como referencia técnica | `requestId` |
| Solicitud de búsqueda | se relaciona con | CURP |
| Solicitud de búsqueda | se descompone en | Tres fases secuenciales de búsqueda |
| Contacto institucional | pertenece a | Institución diversa |
| Hallazgo | responde a | Solicitud de búsqueda |
| Hallazgo | es emitido por | Institución diversa |
| Log de auditoría | registra acciones sobre | Usuario, institución diversa, permiso, solicitud o hallazgo |

---

# 15. Modelo conceptual de atención de solicitudes

La **solicitud de búsqueda** es la entidad operativa central del producto completo.

Su origen es externo: no se crea dentro del SaaS, sino que existe cuando es recibida desde la PUI.

Aunque la autoridad pueda distribuir el mismo caso a varias instituciones diversas, dentro del dominio de la solución cada institución lo trata como una solicitud propia e independiente en su contexto operativo.

## 15.1 Fases de búsqueda

Toda solicitud se modela mediante tres fases secuenciales:

| Fase | Finalidad |
|---|---|
| Datos básicos | Completar información básica de la persona |
| Búsqueda histórica | Consultar información retrospectiva dentro de la ventana aplicable |
| Búsqueda continua | Mantener monitoreo periódico de registros nuevos o modificados |

La fase de búsqueda continua se activa después de que han sido atendidas las fases de datos básicos y búsqueda histórica. Una vez abierta, permanece vigente hasta que la autoridad notifica el cierre de la solicitud.

### Criterio operativo comunicado por la autoridad

Para la fase de búsqueda histórica, cuando no se cuente con `fecha_desaparicion`, debe tomarse como referencia la fecha en que se levantó la solicitud de búsqueda. En todos los casos, la búsqueda histórica debe acotarse a un máximo de 12 años hacia atrás contados desde el momento en que se realiza la búsqueda.

## 15.2 Estados de la solicitud y de las fases

El estado de la solicitud y el estado de cada fase son conceptos distintos.

### Estado de la solicitud

El estado de la solicitud es determinado por la autoridad a través del API. En este marco se reconocen al menos los siguientes estados:

- Activa
- Terminada

### Estado de fase

El estado de cada fase es determinado por la atención operativa de la institución diversa. En este marco se reconocen los siguientes estados:

- Pendiente
- En progreso
- Realizada
- Cancelada

Las fases de datos básicos y búsqueda histórica quedan en `Realizada` cuando efectivamente fueron atendidas. Solo pueden quedar en `Cancelada` si estaban `En progreso` y la autoridad notificó el cierre de la búsqueda antes de su conclusión.

La fase de búsqueda continua permanece abierta mientras la solicitud siga activa y pasa a `Cancelada` cuando la autoridad notifica que la solicitud ha terminado.

---

# 16. Hallazgo como contrato de salida

El **hallazgo** representa la respuesta formal emitida por la institución diversa en relación con una solicitud.

Conceptualmente, el hallazgo cumple una doble función:

- es evidencia operativa de la respuesta institucional
- es la base del contrato de información que en el futuro se enviará a la PUI

Por ello, el diseño del hallazgo debe alinearse con un esquema compatible con el manual técnico, incluyendo cuando aplique:

- identidad de la persona
- datos de contacto
- datos de domicilio
- datos del evento
- referencias institucionales
- fase de búsqueda en que se originó

El hallazgo no se modela como borrador ni como nota interna de trabajo. Su existencia conceptual corresponde a una respuesta institucional determinada.

---

# 17. Permisos y gobernanza institucional

La gobernanza institucional dentro del SaaS descansa en la entidad **Permiso**.

Un permiso relaciona:

- una institución diversa
- un correo o usuario
- un rol
- un estado

El permiso no debe verse solo como control de acceso. También es:

- el mecanismo de habilitación operativa
- la base para creación de cuentas autorizadas
- la evidencia de quién puede actuar por una institución diversa
- un registro histórico de cambios administrativos

En la atención de solicitudes, la operación es compartida y colaborativa. No se introduce en este marco la figura de responsable asignado por solicitud; la trazabilidad de la participación se resuelve mediante el log de auditoría identificable por usuario.

---

# 18. Trazabilidad y auditoría

El **log de auditoría** se concibe como una entidad unificada.

Cada entrada puede incluir, según la naturaleza del evento:

- categoría y origen
- referencia a la institución diversa mediante RFC
- referencia al usuario mediante `userId`
- datos de ejecución como usuario, email y rol
- datos de impacto sobre usuario, email, rol y estado de permiso
- datos de solicitud de búsqueda como FUB, CURP, estado de solicitud, fase y estado de fase

La función conceptual del log no es solo técnica. Es también:

- evidencia operativa
- soporte de auditoría
- instrumento de trazabilidad institucional
- base de cumplimiento

---

# 19. Reglas conceptuales del dominio de la solución

| Regla | Descripción |
|---|---|
| Separación por institución diversa | Cada institución diversa opera de manera separada dentro del SaaS |
| Contexto activo único | Un usuario solo puede operar con una institución/rol activo a la vez |
| Alta condicionada por permiso | No cualquier correo puede crear cuenta; debe existir autorización previa |
| Contactos sin acceso implícito | Registrar un contacto técnico o legal no implica que esa persona tenga acceso al sistema |
| Plan con efecto funcional | El plan comercial no solo expresa condiciones contractuales; también puede habilitar o limitar capacidades funcionales |
| Solicitudes originadas en PUI | Las solicitudes de búsqueda solo existen en la solución cuando son recibidas desde la PUI |
| Solicitud institucional independiente | Si la autoridad envía el mismo caso a varias instituciones diversas, cada una lo atiende como una solicitud independiente en su propio contexto |
| FUB como identificador principal | El FUB es el identificador principal visible en la operación del sistema |
| CURP como referencia y criterio de búsqueda | La CURP funciona como dato de referencia y como criterio principal de búsqueda y correlación |
| Tres fases obligatorias | Toda solicitud contiene las fases de datos básicos, búsqueda histórica y búsqueda continua |
| Secuencia de fases | Las fases se atienden secuencialmente: datos básicos, búsqueda histórica y búsqueda continua |
| Distinción de estados | El estado de la solicitud lo define la autoridad; el estado de las fases lo define la atención institucional |
| Cancelación por instrucción externa | Las fases solo se cancelan cuando una instrucción de la autoridad interrumpe su atención |
| Búsqueda continua persistente | La fase de búsqueda continua permanece abierta hasta que la autoridad notifica el cierre de la solicitud |
| Hallazgos como respuesta formal | Los hallazgos solo existen como respuesta emitida por la institución diversa |
| Trazabilidad total | Las acciones relevantes deben quedar registradas |
| Contenido en español | La experiencia funcional del producto se presenta en español |
| Código y artefactos técnicos en inglés | Nombres de rutas, código, archivos y artefactos técnicos siguen convención en inglés |

---

# 20. Principios de diseño del producto

El dominio de la solución debe guiarse por los siguientes principios:

- **Security by design**: la seguridad es estructural en toda la solución
- **Auditability by default**: toda acción relevante deja rastro
- **Contract-first readiness**: las estructuras centrales deben nacer preparadas para interoperar con la PUI
- **Institution isolation**: la operación de cada institución diversa se mantiene separada
- **Operational clarity**: el usuario debe entender qué solicitudes existen, en qué estado están y qué falta por atender
- **Configuración antes que personalización**: el producto debe ser comercializable y repetible entre instituciones diversas
- **Evolución por alcances**: el producto debe crecer por etapas sin romper su coherencia conceptual

---

# 21. Hipótesis de trabajo del marco

Este marco conceptual asume lo siguiente:

- el producto se desarrollará por alcances evolutivos
- las estructuras centrales deben diseñarse desde el inicio pensando en la futura integración con la PUI
- la plataforma debe servir tanto a las instituciones diversas como al proveedor SaaS
- solicitudes de búsqueda y hallazgos forman parte del dominio completo de la solución, aunque su operación efectiva se habilite progresivamente por alcances

---

# 22. Referencias base

| ID | Referencia | Uso dentro de este documento |
|---|---|---|
| REF-01 | Decreto por el que se reforman, adicionan y derogan diversas disposiciones de la Ley General en Materia de Desaparición Forzada | Base del contexto jurídico y del rol de CURP, FUB y PUI |
| REF-02 | Lineamientos para el Desarrollo y Operación de la Plataforma Única de Identidad | Base del modelo operativo, seguridad, accesos y tipos de búsqueda |
| REF-03 | Manual Técnico de la Solución Tecnológica para Instituciones Diversas | Base del contrato funcional y técnico esperado para instituciones diversas |
| REF-04 | `Specifications` board en Whimsical | Base del borrador funcional inicial del producto |
| REF-05 | Marco Conceptual del Dominio del Problema PUI | Base para diferenciar problema regulatorio y solución de producto |

---

# 23. Conclusión conceptual

El producto que buscamos construir es un **SaaS de preparación, operación, cumplimiento e interoperabilidad** para instituciones diversas que necesitan integrarse a la PUI.

Su núcleo conceptual no es la API en sí misma, sino la capacidad de una institución diversa para:

- operar con usuarios y roles definidos
- administrar permisos, contactos y configuración institucional
- recibir y atender solicitudes de búsqueda
- ejecutar búsquedas sobre sus propias fuentes de información
- emitir respuestas y hallazgos
- conservar trazabilidad completa
- evolucionar por alcances hacia una integración formal con la PUI

Ese es el centro del dominio de la solución y debe orientar las especificaciones, el modelado y la implementación posterior.
