# 5. Actores y roles involucrados en el alcance
## Participantes efectivos del MVP operativo del SaaS

---

# 5.1 Actores involucrados

Los actores involucrados en el alcance 1 son los participantes organizacionales o humanos que intervienen de forma directa o contextual en el MVP operativo del SaaS.

| Actor | Tipo de actor | Participación en el alcance 1 | Papel dentro del alcance | Observaciones analíticas |
|---|---|---|---|---|
| Proveedor SaaS | Organizacional | Directa | Incorpora instituciones, administra el producto y sostiene la operación global del SaaS. | Es el dominio que habilita la incorporación inicial de instituciones y opera el backoffice. |
| Institución diversa | Organizacional | Directa | Usa el producto como cliente operativo del SaaS para administrar su contexto institucional y operar internamente solicitudes y hallazgos. | Es la unidad organizacional principal del producto del lado cliente. |
| Usuarios institucionales | Humano | Directa | Operan el SaaS desde la perspectiva de la institución diversa conforme a permisos y roles autorizados. | Su operación siempre ocurre dentro de un contexto activo institución/rol. |
| Personal interno del proveedor SaaS | Humano | Directa | Opera el backoffice del producto y supervisa instituciones, configuración global y trazabilidad transversal. | Se materializa operativamente mediante el rol `SYSTEM_ADMINISTRATOR`. |
| PUI | Sistema/actor externo | Contextual | Define el contexto de interoperabilidad futura y la semántica de solicitudes y hallazgos. | En el alcance 1 no participa mediante integración técnica real, pero sí condiciona el modelo operativo del producto. |

## 5.1.1 Actores que no se vuelven actores operativos directos del alcance 1

| Elemento | Por qué no se trata como actor operativo directo en el alcance 1 | Dónde sí impacta |
|---|---|---|
| Sistemas internos de la institución diversa | En este alcance aún no se conectan ni ejecutan búsquedas reales. | Alcances posteriores, diseño del modelo de datos y preparación operativa. |
| Bases de datos institucionales | Aún no se consultan operativamente desde el producto. | Alcance 3 y preparación del modelo de solicitudes y fases. |
| Mecanismos reales de integración con la PUI | La interoperabilidad técnica todavía no se habilita. | Alcance 2, alcance 4 y configuración institucional preparatoria. |

---

# 5.2 Roles operativos del sistema

Los roles operativos del sistema delimitan la forma en que una persona usuaria puede interactuar con el producto.

| Rol | Naturaleza | Dominio operativo | Responsabilidad principal dentro del alcance 1 | Observaciones analíticas |
|---|---|---|---|---|
| `ANONYMOUS` | Rol de acceso no autenticado | Público y autenticación | Acceder a vistas públicas, autenticarse, crear cuenta cuando exista permiso habilitante y solicitar recuperación de contraseña. | No opera sobre datos institucionales ni sobre backoffice. |
| `INSTITUTION_ADMIN` | Rol autenticado institucional | Aplicación institucional | Administrar configuración institucional, permisos, contactos, plan visible, logs institucionales y operación institucional con visibilidad administrativa. | Es el rol con mayor amplitud dentro del contexto de una institución diversa. |
| `INSTITUTION_OPERATOR` | Rol autenticado institucional | Aplicación institucional | Operar el día a día sobre dashboard, solicitudes, detalle de solicitudes y logs institucionales. | No debe asumir facultades administrativas institucionales reservadas al administrador. |
| `SYSTEM_ADMINISTRATOR` | Rol autenticado interno del proveedor | Backoffice del proveedor SaaS | Incorporar instituciones, supervisar el sistema, consultar operación global y administrar información transversal del SaaS. | Opera bajo el dominio del proveedor, no como institución diversa. |

## 5.2.1 Elementos que no constituyen roles operativos

| Elemento | Motivo | Implicación |
|---|---|---|
| Contacto legal | Es un dato institucional informativo. | No concede acceso ni visibilidad operativa por sí mismo. |
| Contacto técnico | Es un dato institucional informativo. | No concede acceso ni visibilidad operativa por sí mismo. |
| Institución diversa | Es un actor organizacional, no un rol. | Su operación se materializa mediante usuarios con permisos y roles. |
| PUI | Es un actor externo/contextual, no un rol del sistema. | No se modela como perfil de acceso dentro del SaaS. |

---

# 5.3 Restricciones por rol

Las restricciones por rol delimitan visibilidad, navegación y acciones permitidas dentro del alcance 1.

| Rol | Puede operar en contexto institucional | Puede operar en backoffice del proveedor | Capacidades principales en el alcance 1 | Restricciones relevantes |
|---|---|---|---|---|
| `ANONYMOUS` | No | No | Navegar páginas públicas, iniciar sesión, crear cuenta si existe permiso activo asociado al correo y solicitar recuperación de contraseña. | No accede a `/app`, `/admin`, `/account` ni a datos autenticados. |
| `INSTITUTION_ADMIN` | Sí | No | Ver instituciones asignadas, seleccionar contexto activo, consultar dashboard, administrar contactos, permisos, configuración institucional, plan visible, solicitudes y logs institucionales. | Su visibilidad queda limitada a instituciones donde tenga permiso. No accede al backoffice del proveedor. |
| `INSTITUTION_OPERATOR` | Sí | No | Ver instituciones asignadas, seleccionar contexto activo, consultar dashboard, solicitudes, detalle de solicitudes y logs institucionales. | No administra configuración institucional, contactos, permisos ni backoffice. |
| `SYSTEM_ADMINISTRATOR` | No como institución diversa real, salvo representación sistémica mediante `SYSTEM_RFC` dentro del mismo modelo de `Permissions` | Sí | Consultar instituciones del sistema, incorporar nuevas instituciones, consultar requests desde backoffice, ver planes, contactos y logs globales. | No opera como usuario institucional ordinario ni comparte el mismo dominio de visibilidad que los roles institucionales. |

## 5.3.1 Restricciones transversales de sesión y asignación

| Restricción | Alcance analítico |
|---|---|
| Un usuario puede tener múltiples permisos sobre varias instituciones y roles. | La asignación puede ser múltiple, pero la sesión operativa activa no lo es. |
| Solo puede existir un contexto institución/rol activo por sesión. | La navegación y autorización deben resolverse contra un único contexto vigente. |
| Un rol no sustituye al permiso. | La capacidad operativa depende de la relación usuario, institución y rol. |
| La pertenencia a una institución no equivale a acceso. | Solo los permisos habilitantes permiten seleccionar y operar un contexto institucional. |

## 5.3.2 Lectura de rutas por rol dentro del alcance 1

| Dominio de navegación | Roles habilitados | Observación |
|---|---|---|
| Sitio público `/site` | `ANONYMOUS` y cualquier usuario fuera de una sesión operativa | Corresponde a páginas públicas, informativas y comerciales del producto. |
| Autenticación `/auth` | `ANONYMOUS` y cualquier usuario fuera de una sesión operativa | Corresponde a páginas de acceso, creación de cuenta, recuperación y cierre de sesión. |
| Aplicación institucional `/app` | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR` | Requiere permiso habilitante y contexto institucional activo. |
| Backoffice `/admin` | `SYSTEM_ADMINISTRATOR` | Corresponde al dominio del proveedor SaaS. |
| Cuenta `/account` | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`, `SYSTEM_ADMINISTRATOR` | Es un dominio transversal de configuración personal y lectura de actividad propia. |
| Error y restricciones `/error` | Todos los roles y estados de sesión | Expresa rutas inválidas, incompatibilidades entre ruta y rol y errores del sistema o infraestructura. |

---

# 5.4 Implicación analítica para el resto del alcance

La distinción entre actores y roles debe mantenerse en todo el alcance.

| Distinción | Consecuencia para el análisis |
|---|---|
| Actor organizacional vs rol operativo | No debe confundirse a la institución o al proveedor con un perfil de acceso concreto. |
| Contacto institucional vs usuario operativo | Los contactos se modelan como datos; los usuarios operan mediante identidad y permisos. |
| Dominio institucional vs dominio del proveedor | La aplicación institucional y el backoffice deben mantenerse conceptualmente separados. |
| Actor contextual externo vs participante operativo directo | La PUI influye sobre el modelo del MVP, pero no interviene aún como integración técnica real en el alcance 1. |
