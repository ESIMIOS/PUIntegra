# Marco Conceptual del Dominio de la Solución
## Plataforma Única de Identidad (PUI)
### SaaS para integración operativa de instituciones diversas

---

# 1. Propósito del documento

El presente documento define el **marco conceptual del dominio de la solución** para un producto de software comercializable bajo modelo **SaaS** orientado a **instituciones diversas** que requieren prepararse e integrarse de manera ordenada a la **Plataforma Única de Identidad (PUI)**.

Su propósito es establecer un **lenguaje ubicuo** y una comprensión compartida sobre:

- qué producto queremos construir
- qué problema de negocio resuelve
- cuáles son sus actores, roles y conceptos principales
- qué capacidades funcionales forman parte del primer alcance
- qué elementos pertenecen al dominio de la solución y cuáles quedan fuera

Este documento está pensado como **contexto general para personas y herramientas de IA** que participen en el diseño, especificación e implementación del producto.

---

# 2. Naturaleza de la solución

La solución propuesta **no es la PUI** ni sustituye a la autoridad operadora.  
La solución propuesta es un **producto SaaS multi-tenant** que ayuda a una institución diversa a:

- organizar su preparación institucional para la integración
- administrar usuarios, permisos y contactos
- recibir, visualizar y dar seguimiento a solicitudes de búsqueda
- registrar hallazgos y evidencias de atención
- mantener trazabilidad y cumplimiento operativo
- configurar los elementos necesarios para la interoperabilidad con la PUI

En otras palabras, la solución funciona como una **capa de preparación, operación y gobernanza institucional** entre:

- la institución diversa y sus sistemas internos
- la institución diversa y la PUI
- la institución diversa y el proveedor del SaaS

---

# 3. Problema que resuelve

El marco normativo obliga a que instituciones diversas puedan interconectarse con la PUI y colaborar en procesos de búsqueda mediante consultas, monitoreo y notificación de coincidencias.

Sin embargo, para muchas instituciones diversas el problema real no es solamente “consumir o exponer una API”, sino contar con una solución que les permita:

- tener una representación institucional formal dentro del sistema
- administrar quién puede operar la integración y con qué alcance
- conservar evidencia operativa y trazabilidad de cumplimiento
- visualizar solicitudes de búsqueda y su estado por fase
- preparar configuraciones, contactos y credenciales de integración
- alinear su operación interna con el contrato funcional que exige la autoridad

El producto busca resolver esa brecha: convertir obligaciones normativas y técnicas en un **producto operable, administrable y escalable** para múltiples instituciones cliente.

---

# 4. Visión del producto

La visión del producto es construir una plataforma SaaS que permita a una institución diversa pasar de un estado de **obligación regulatoria difusa** a un estado de **capacidad operativa gestionada**.

La solución debe permitir que una institución:

- se incorpore como cliente del SaaS
- administre su estructura operativa mínima para la PUI
- gestione usuarios y roles institucionales
- monitoree solicitudes de búsqueda y hallazgos
- mantenga evidencia auditable de su actuación
- llegue preparada a la fase de integración formal con API y web services

La solución también debe permitir que el proveedor SaaS opere un **backoffice centralizado** para gestionar instituciones, planes, contactos y supervisión general del servicio.

---

# 5. Delimitación del dominio de la solución

## 5.1 Lo que sí pertenece al dominio de la solución

Forman parte del dominio de la solución:

- el producto SaaS y sus módulos funcionales
- la administración multi-tenant por institución
- la gestión de identidad, acceso y permisos dentro del SaaS
- la visualización y seguimiento operativo de solicitudes de búsqueda
- la gestión de hallazgos
- la bitácora y trazabilidad institucional
- la configuración de elementos necesarios para interoperar con la PUI
- la operación del proveedor SaaS sobre múltiples instituciones cliente

## 5.2 Lo que no pertenece al dominio de la solución

No forman parte del dominio de la solución:

- la definición jurídica de la PUI
- la operación interna de RENAPO, ATDT, CNB, CLB, FGR o fiscalías
- la regulación de desaparición forzada y búsqueda de personas
- la definición normativa de CURP, FUB o RNPDNO
- la lógica interna de búsqueda de la autoridad

## 5.3 Fuera del alcance del primer corte

Para este primer alcance, el producto se enfoca más en la **capacidad funcional y operativa** que en la interconexión oficial completa. Por tanto, quedan fuera o solo como frontera conceptual:

- la implementación completa de los web services oficiales de la PUI
- la certificación o validación técnica final frente a la autoridad
- la conexión productiva real con sistemas internos de cada institución cliente
- la automatización profunda de matching o correlación específica de cada sector
- la administración del ciclo de vida normativo de Llave MX o e.Firma fuera de su reflejo funcional en el sistema

---

# 6. Supuesto principal de diseño

La hipótesis principal de esta solución es la siguiente:

> Una institución diversa necesita primero una plataforma interna de operación, control, trazabilidad y preparación institucional; después, sobre esa base, puede conectarse de forma segura y ordenada con la PUI.

Esto implica que el SaaS debe diseñarse desde el inicio como un sistema **integration-ready**, aunque el primer alcance no implemente toda la interoperabilidad oficial.

---

# 7. Actores del dominio de la solución

| Actor | Descripción |
|---|---|
| Proveedor SaaS | Organización que desarrolla, opera y comercializa la plataforma |
| Institución cliente | Institución diversa que contrata el SaaS para prepararse y operar su integración con la PUI |
| PUI | Plataforma externa con la que el SaaS deberá interoperar en una etapa posterior |
| Sistemas internos de la institución | Sistemas, bases de datos o procesos propios de cada institución que contienen información útil para búsqueda |
| Usuario institucional | Persona usuaria que opera el SaaS en nombre de una institución cliente |
| Administrador del sistema | Usuario del proveedor SaaS que administra instituciones y la operación general de la plataforma |

---

# 8. Roles del sistema

Los roles observados en el borrador funcional del board `Specifications` son:

| Rol | Descripción |
|---|---|
| `ANONYMOUS` | Usuario no autenticado que solo puede acceder a páginas públicas o de autenticación |
| `INSTITUTION_ADMIN` | Responsable de administrar la operación de una institución dentro del SaaS |
| `INSTITUTION_OPERATOR` | Responsable de operar solicitudes, revisar estados, hallazgos y trazabilidad institucional |
| `SYSTEM_ADMINISTRATOR` | Usuario del proveedor SaaS con visibilidad transversal del sistema y de todas las instituciones |

## 8.1 Regla clave de sesión

Un usuario puede tener permisos sobre:

- múltiples instituciones
- múltiples roles dentro de una misma institución

Pero durante una sesión operativa solo debe existir **un contexto activo institución/rol**.

Esta regla convierte a la **selección de contexto activo** en un concepto central del dominio de la solución.

---

# 9. Áreas funcionales del producto

El primer alcance del producto se organiza en las siguientes áreas funcionales.

| Área | Propósito |
|---|---|
| Sitio público | Presentar el producto, casos de uso, precios, información comercial y acceso |
| Autenticación | Permitir acceso seguro, recuperación de cuenta y cierre de sesión |
| Aplicación institucional | Proveer a cada institución un espacio de operación diaria |
| Administración institucional | Permitir configurar plan, contactos, permisos y parámetros de integración |
| Backoffice del proveedor | Administrar instituciones, planes, contactos y supervisión global |
| Cuenta personal | Permitir al usuario gestionar su perfil y revisar actividad propia |
| Auditoría y logs | Mantener trazabilidad de acciones del sistema, usuarios e instituciones |
| Preparación de integración | Configurar y resguardar los elementos funcionales necesarios para interoperar con la PUI |

---

# 10. Estructura conceptual de navegación

El borrador funcional del board organiza la solución en grupos de rutas de primer nivel que, a nivel conceptual, representan módulos del producto:

| Grupo de rutas | Significado conceptual |
|---|---|
| `/site` | Sitio comercial y público del producto |
| `/auth` | Acceso, creación de cuenta, recuperación y salida |
| `/app` | Área operativa de una institución cliente |
| `/admin` | Backoffice del proveedor SaaS |
| `/account` | Configuración personal del usuario |
| `/error` | Manejo explícito de navegación inválida o acceso no permitido |

Estas rutas no se incluyen aquí como detalle técnico de frontend, sino como reflejo de que el producto tiene **seis contextos de interacción claramente diferenciados**.

---

# 11. Entidades del dominio de la solución

| Entidad | Descripción |
|---|---|
| Institución | Tenant del SaaS; representa a una institución diversa cliente |
| Usuario | Persona autenticada con identidad propia dentro del sistema |
| Permiso | Relación que autoriza a un usuario a operar sobre una institución con un rol específico |
| Contexto activo de sesión | Combinación institución/rol seleccionada por el usuario para trabajar |
| Contacto institucional | Persona de contacto relevante para operación, onboarding o cumplimiento |
| Plan comercial | Condiciones comerciales asociadas a una institución cliente |
| Configuración de integración | Parámetros institucionales requeridos para interoperabilidad futura con PUI |
| Solicitud de búsqueda | Caso operativo recibido o registrado que representa un requerimiento de búsqueda asociado a una persona |
| Fase de búsqueda | Etapa funcional de la solicitud: completar datos básicos, histórica o continua |
| Hallazgo | Información relevante encontrada por la institución respecto de una solicitud |
| Log de auditoría | Registro inmutable de acciones, eventos, cambios y operaciones del sistema |
| Estado de solicitud | Situación general de una solicitud dentro de su ciclo de vida |
| Estado de fase | Situación particular de cada fase dentro de una solicitud |

---

# 12. Identificadores relevantes en la solución

| Concepto | Identificador principal | Observación |
|---|---|---|
| Institución | RFC con homoclave | Identificador natural del tenant institucional |
| Persona asociada a búsqueda | CURP | Clave de referencia operativa para búsquedas |
| Caso de búsqueda | FUB | Identificador del proceso de búsqueda proveniente del dominio regulatorio |
| Solicitud técnica | `requestId` / `id` de búsqueda | Debe poder alinearse con la convención `FUB + UUID4` cuando exista integración formal |
| Usuario | `userId` | Identificador interno del usuario autenticado |
| Permiso | `permissionId` | Identificador interno del permiso |
| Hallazgo | `findingId` | Identificador interno del hallazgo |
| Contacto | `contactId` | Identificador interno del contacto |
| Evento de log | `id` de log | Identificador interno del registro de auditoría |

---

# 13. Relaciones conceptuales principales

| Concepto | Relación | Concepto |
|---|---|---|
| Institución | contrata | Plan comercial |
| Usuario | recibe | Permiso |
| Permiso | habilita operación sobre | Institución |
| Permiso | asigna | Rol |
| Usuario | selecciona | Contexto activo de sesión |
| Institución | administra | Contactos institucionales |
| Institución | administra | Configuración de integración |
| Institución | recibe y atiende | Solicitudes de búsqueda |
| Solicitud de búsqueda | se identifica por | FUB y/o `requestId` |
| Solicitud de búsqueda | se relaciona con | CURP |
| Solicitud de búsqueda | se descompone en | Fases de búsqueda |
| Hallazgo | pertenece a | Solicitud de búsqueda |
| Hallazgo | pertenece a | Institución |
| Log de auditoría | registra acciones sobre | Usuario, institución, permiso, solicitud o hallazgo |

---

# 14. Capacidades funcionales del primer alcance

## 14.1 Sitio público

El sitio público debe comunicar:

- propuesta de valor del producto
- casos de uso
- información comercial
- precios o planes
- acceso a autenticación
- canal de contacto

## 14.2 Autenticación y acceso

El producto debe permitir:

- iniciar sesión
- crear cuenta cuando exista autorización previa
- recuperar contraseña
- cerrar sesión
- exigir MFA

La autenticación se concibe como una capacidad transversal de seguridad, no solo como una pantalla de acceso.

## 14.3 Operación institucional

Dentro del contexto de una institución, el producto debe permitir:

- ver un dashboard resumido
- consultar solicitudes de búsqueda
- revisar el detalle de una solicitud
- observar estado general, estado por fase y cronología
- consultar hallazgos asociados
- revisar actividad y trazabilidad

## 14.4 Administración institucional

La institución debe poder:

- consultar su plan
- administrar contactos
- administrar permisos
- configurar parámetros de integración

## 14.5 Backoffice del proveedor

El proveedor SaaS debe poder:

- listar instituciones del sistema
- crear nuevas instituciones
- revisar el estado general de cada institución
- consultar planes y contactos
- revisar solicitudes desde perspectiva global
- auditar la operación del sistema completo

## 14.6 Cuenta de usuario

Cada usuario debe poder:

- revisar y editar aspectos básicos de su perfil
- consultar sus propios logs o actividad relacionada
- seleccionar el contexto activo institución/rol cuando corresponda

## 14.7 Auditoría y cumplimiento

La plataforma debe mantener:

- logs cronológicos
- filtros por categoría y periodo
- búsqueda textual sobre campos indexados
- trazabilidad sobre acciones de usuario y del sistema

---

# 15. Solicitud de búsqueda como entidad central operativa

En el dominio de la solución, la **solicitud de búsqueda** es la entidad operativa central.

Representa el caso que la institución necesita atender dentro del SaaS y debe permitir, como mínimo:

- conocer a qué institución pertenece
- conocer la CURP asociada
- conocer el FUB asociado
- conocer su estado general
- conocer el estado de cada fase
- visualizar fechas de creación y actualización
- relacionar hallazgos, cambios y logs

## 15.1 Fases de búsqueda

La solución debe modelar explícitamente las tres fases establecidas en el dominio regulatorio:

| Fase | Finalidad en la solución |
|---|---|
| Fase 1 | Completar datos básicos de la persona |
| Fase 2 | Realizar búsqueda histórica |
| Fase 3 | Dar seguimiento continuo a nuevos o modificados registros |

En la solución, estas fases no son solo datos externos; son también **unidades visibles de seguimiento operativo**.

---

# 16. Hallazgo como contrato de salida

El **hallazgo** representa información relevante encontrada por la institución en relación con una solicitud.

Conceptualmente, el hallazgo cumple una doble función:

- es evidencia operativa para la institución
- es la base del contrato de información que en el futuro se enviará a la PUI

Por ello, el diseño del hallazgo debe alinearse desde el inicio con un esquema compatible con el manual técnico, incluyendo cuando aplique:

- identidad de la persona
- datos de contacto
- datos de domicilio
- datos del evento
- referencias institucionales
- fase de búsqueda en que se originó

Esto convierte al hallazgo en una entidad clave para diseñar el sistema con enfoque **contract-first**.

---

# 17. Permisos y gobernanza institucional

La gobernanza institucional dentro del SaaS descansa en la entidad **Permiso**.

Un permiso relaciona:

- una institución
- un correo o usuario
- un rol
- un estado

El permiso no debe verse solo como control de acceso. También es:

- el mecanismo de habilitación operativa
- la base para creación de cuentas autorizadas
- la evidencia de quién puede actuar por una institución
- un registro histórico de cambios administrativos

## 17.1 Reglas relevantes de permisos

Derivado del borrador funcional, destacan las siguientes reglas:

- un usuario solo puede crear cuenta si su correo tiene autorización previa
- los permisos no se eliminan; se actualizan y conservan historial
- el correo asociado al permiso no cambia
- un usuario puede acumular múltiples permisos en distintas instituciones o roles

---

# 18. Configuración de integración

Aunque la integración oficial no sea el foco del primer corte, la solución debe reconocer un subdominio de **configuración de integración**.

Este subdominio agrupa los elementos que preparan a la institución para interoperar con la PUI, por ejemplo:

- secreto compartido o credencial institucional
- parámetros de autenticación
- configuraciones de seguridad
- datos institucionales requeridos para trazabilidad

La intención no es resolver todavía toda la integración, sino asegurar que el producto tenga un lugar conceptual claro para alojar esa capacidad.

---

# 19. Backoffice del proveedor como subdominio propio

El producto no es solo una consola institucional. También necesita un subdominio de **operación del proveedor SaaS**.

Este subdominio existe para:

- administrar el catálogo de instituciones cliente
- supervisar estado, plan y fechas relevantes
- operar altas institucionales
- mantener visión global de la plataforma
- revisar logs de sistema

Esto implica que el dominio de la solución es, desde el inicio, **B2B SaaS multi-tenant**, no una aplicación mono-institución.

---

# 20. Reglas conceptuales del dominio de la solución

Las siguientes reglas son fundamentales para entender el comportamiento esperado del sistema:

| Regla | Descripción |
|---|---|
| Multi-tenant institucional | Cada institución cliente opera como tenant separado dentro del SaaS |
| Contexto activo único | Un usuario solo puede operar con una institución/rol activo a la vez |
| Alta condicionada por permiso | No cualquier correo puede crear cuenta; debe existir autorización previa |
| MFA obligatoria | El acceso al producto requiere autenticación reforzada |
| Trazabilidad total | Las acciones relevantes deben quedar registradas |
| Historial administrativo | Cambios de permisos y configuraciones relevantes deben conservar historia |
| Alineación con PUI | Solicitudes, fases y hallazgos deben diseñarse en congruencia con el contrato regulatorio y técnico |
| Propiedad institucional de operación | Solicitudes, hallazgos y contactos pertenecen al contexto de una institución |
| Contenido en español | La experiencia funcional del producto se presenta en español |
| Código y artefactos técnicos en inglés | Nombres de rutas, código, archivos y artefactos técnicos siguen convención en inglés |

---

# 21. Flujos conceptuales principales

## 21.1 Incorporación de institución

1. El proveedor SaaS da de alta una institución.
2. Se registran datos institucionales, plan y contactos.
3. Se habilitan permisos iniciales.
4. La institución queda preparada para operar dentro del SaaS.

## 21.2 Incorporación de usuario

1. Existe un permiso autorizado para un correo.
2. El usuario crea su cuenta.
3. El sistema vincula la cuenta con sus permisos.
4. El usuario inicia sesión con MFA.

## 21.3 Selección de contexto operativo

1. El usuario autenticado revisa sus instituciones y roles disponibles.
2. Selecciona una combinación institución/rol.
3. Esa combinación se vuelve el contexto activo de la sesión.
4. Toda la navegación operativa posterior depende de ese contexto.

## 21.4 Atención de solicitud de búsqueda

1. La institución visualiza la solicitud.
2. Revisa estado general y estado por fases.
3. Revisa cronología y actividad asociada.
4. Registra o consulta hallazgos.
5. Conserva evidencia en logs.

## 21.5 Gestión administrativa institucional

1. El administrador institucional revisa plan, contactos y permisos.
2. Realiza actualizaciones permitidas.
3. El sistema registra trazabilidad del cambio.

## 21.6 Supervisión del proveedor

1. El administrador del sistema revisa instituciones activas.
2. Consulta datos comerciales y operativos.
3. Audita logs y estado global.

---

# 22. Principios de diseño del producto

El dominio de la solución debe guiarse por los siguientes principios:

- **Security by design**: la seguridad no es accesorio, es estructural
- **Auditability by default**: toda acción relevante deja rastro
- **Tenant isolation**: la operación institucional se mantiene separada
- **Contract-first readiness**: las estructuras centrales deben nacer alineadas al contrato de la PUI
- **Operational clarity**: el usuario debe entender qué solicitudes existen, en qué estado están y qué falta por atender
- **Configuración antes que personalización**: el producto debe ser comercializable y repetible entre instituciones
- **Preparación antes que interoperabilidad completa**: el MVP funcional prioriza capacidad operativa interna

---

# 23. Diferencia entre dominio del problema y dominio de la solución

La distinción debe mantenerse explícita:

| Dominio del problema | Dominio de la solución |
|---|---|
| Define qué es la PUI y bajo qué reglas existe | Define qué producto construiremos para que una institución opere hacia esa realidad |
| Describe actores normativos y procesos jurídicos | Describe actores del producto, módulos, entidades SaaS y reglas de operación |
| Usa lenguaje regulatorio | Usa lenguaje de producto, operación, trazabilidad y software multi-tenant |
| Se enfoca en obligaciones y procesos de búsqueda | Se enfoca en cómo una institución cliente gestiona dichas obligaciones dentro del SaaS |

---

# 24. Hipótesis de trabajo para este primer marco

Este marco conceptual asume lo siguiente:

- el primer alcance del producto prioriza funcionalidades operativas visibles
- las estructuras de datos centrales deben diseñarse desde el inicio pensando en la futura integración con PUI
- la plataforma debe servir tanto a la institución cliente como al proveedor SaaS
- la gestión de permisos, logs, solicitudes y hallazgos es parte del núcleo del producto
- la integración oficial por API y web services es una frontera externa posterior, no el punto de partida del diseño funcional

---

# 25. Referencias base

| ID | Referencia | Uso dentro de este documento |
|---|---|---|
| REF-01 | Decreto por el que se reforman, adicionan y derogan diversas disposiciones de la Ley General en Materia de Desaparición Forzada | Base del contexto jurídico y del rol de CURP, FUB y PUI |
| REF-02 | Lineamientos para el Desarrollo y Operación de la Plataforma Única de Identidad | Base del modelo operativo, seguridad, accesos y tipos de búsqueda |
| REF-03 | Manual Técnico de la Solución Tecnológica para Instituciones Diversas | Base del contrato funcional y técnico esperado para instituciones diversas |
| REF-04 | `Specifications` board en Whimsical | Base del borrador de alcance funcional del producto SaaS |
| REF-05 | Marco Conceptual del Dominio del Problema PUI | Base para diferenciar problema regulatorio y solución de software |

---

# 26. Conclusión conceptual

El producto que buscamos construir es un **SaaS multi-tenant de preparación, operación y gobernanza institucional** para instituciones diversas que necesitan integrarse a la PUI.

Su núcleo conceptual no es la API en sí misma, sino la capacidad de una institución para:

- operar con usuarios y roles definidos
- administrar permisos y contactos
- atender solicitudes de búsqueda
- registrar hallazgos
- conservar trazabilidad
- prepararse estructuralmente para interoperar con la PUI

Ese es el centro del dominio de la solución y debe orientar las especificaciones, el modelado y la implementación posterior.
