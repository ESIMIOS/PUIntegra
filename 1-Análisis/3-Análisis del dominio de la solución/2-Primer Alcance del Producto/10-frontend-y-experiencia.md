# 10. Especificación de frontend y experiencia
## Estructura funcional de navegación, vistas y experiencia del MVP

---

## 10.1 Tipo de página en Firebase Hosting

El frontend del alcance 1 debe entenderse como una `WebApp` hospedada en Firebase Hosting, con comportamiento de `PWA`, capaz de sostener tanto la experiencia pública como la experiencia autenticada del producto.

| Aspecto | Definición analítica |
|---|---|
| Medio de entrega | Firebase Hosting |
| Naturaleza del cliente | `WebApp` |
| Capacidad esperada | `PWA` |
| Papel dentro del alcance 1 | Unificar experiencia pública, autenticación, operación institucional, cuenta personal y backoffice del proveedor. |
| Implicación de producto | La experiencia debe sentirse como un único producto con dominios diferenciados de navegación, no como sitios aislados sin continuidad. |

## 10.2 Layouts

Las rutas de primer nivel del producto deben leerse como dominios de navegación. Cada dominio define un layout, un propósito principal y una relación específica con el estado de sesión y el rol activo.

| Layout o dominio | Path raíz | Propósito dentro del alcance 1 | Roles habilitados | Observaciones |
|---|---|---|---|---|
| Sitio público | `/site` | Presentar información pública, comercial e introductoria del producto. | `ANONYMOUS` y usuarios fuera de una sesión operativa. | Su vista por default es `/site/home`. |
| Autenticación | `/auth` | Resolver ingreso, creación de cuenta, recuperación de contraseña y salida de sesión. | `ANONYMOUS` y usuarios fuera de una sesión operativa. | Su vista por default es `/auth/login`. |
| Aplicación institucional | `/app` | Sostener la operación institucional cotidiana sobre dashboard, solicitudes, permisos, contactos, configuración y logs. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`. | Requiere contexto institucional activo y permiso habilitante. |
| Backoffice del proveedor | `/admin` | Sostener la supervisión global del SaaS y la administración multiinstitución. | `SYSTEM_ADMINISTRATOR`. | Corresponde al dominio operativo del proveedor. |
| Cuenta personal | `/account` | Permitir configuración personal y consulta de actividad propia del usuario autenticado. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`, `SYSTEM_ADMINISTRATOR`. | Es un dominio transversal a la operación autenticada. |
| Error y restricciones | `/error` | Resolver navegación inválida, incompatibilidades entre ruta y rol y errores del sistema o infraestructura. | Todos los roles y estados de sesión. | Maneja explícitamente `403`, `404` y `500`. |

## 10.3 Rutas

Las rutas internas del alcance 1 deben interpretarse como vistas funcionales dentro de cada layout. Cuando una ruta interna esté marcada como `default`, debe redirigir o cargar la vista por default del dominio correspondiente.

| Ruta o patrón | Dominio o layout | Propósito principal | Roles habilitados | ¿Es default? | Observaciones |
|---|---|---|---|---|---|
| `/site/home` | Sitio público | Mostrar en una sola página información del sistema, casos de uso, precios, información del producto, contacto y acceso a login. | `ANONYMOUS` y usuarios fuera de sesión operativa. | Sí, bajo `/site`. | Es la entrada pública principal del producto. |
| `/auth/login` | Autenticación | Permitir ingreso con Firebase Auth y MFA. | `ANONYMOUS` y usuarios fuera de sesión operativa. | Sí, bajo `/auth`. | Debe aplicar protección contra abuso por intentos repetidos. |
| `/auth/create-account` | Autenticación | Permitir creación de cuenta. | `ANONYMOUS` con permiso activo asociado al correo. | No | Solo debe habilitarse cuando exista al menos un permiso activo asociado al correo. |
| `/auth/forgot-password` | Autenticación | Permitir solicitar recuperación o cambio de contraseña. | `ANONYMOUS` y usuarios fuera de sesión operativa. | No | No debe confirmar si el correo existe o no. |
| `/auth/logout` | Autenticación | Mostrar confirmación de cierre de sesión y ofrecer navegación posterior. | Usuarios con sesión abierta o cerrándose. | No | Debe cerrar sesión si está abierta y resolver continuidad de navegación. |
| `/app/institutions` | Aplicación institucional | Listar instituciones donde la persona usuaria tiene permisos, mostrando RFC, nombre, rol, correo y estado del permiso. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`. | No | Funciona como punto de selección de contexto institucional. |
| `/app/[RFC]` | Aplicación institucional | Resolver el contenedor de navegación de una institución específica. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`. | No | Debe redirigir a la vista por default de la institución. |
| `/app/[RFC]/dashboard` | Aplicación institucional | Mostrar el resumen operativo institucional, incluyendo distribución de solicitudes por estatus, fase y estatus por fase. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`. | Sí, bajo `/app/[RFC]`. | Debe tomar el 100% de las solicitudes de la institución como universo objetivo y privilegiar lectura sintética y visual. |
| `/app/[RFC]/admin` | Aplicación institucional | Contener la administración institucional. | `INSTITUTION_ADMIN`. | No | No debe estar disponible para `INSTITUTION_OPERATOR`. |
| `/app/[RFC]/admin/plan` | Aplicación institucional | Mostrar el plan comercial vigente de la institución. | `INSTITUTION_ADMIN`. | Sí, bajo `/app/[RFC]/admin`. | Es la vista inicial del dominio administrativo institucional. |
| `/app/[RFC]/admin/contacts` | Aplicación institucional | Mostrar los contactos institucionales. | `INSTITUTION_ADMIN`. | No | Debe distinguir contactos legales y técnicos. |
| `/app/[RFC]/admin/settings` | Aplicación institucional | Configurar parámetros sensibles institucionales, incluido `sharedSecret`. | `INSTITUTION_ADMIN`. | No | La UI no debe exponer secretos en claro. |
| `/app/[RFC]/admin/permissions` | Aplicación institucional | Mostrar, crear, editar y filtrar permisos. | `INSTITUTION_ADMIN`. | No | En edición solo deben mutarse `role` y `status`. |
| `/app/[RFC]/requests` | Aplicación institucional | Listar solicitudes de búsqueda de la institución. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`. | No | Debe priorizar lectura operativa institucional. |
| `/app/[RFC]/requests/[FUB]` | Aplicación institucional | Mostrar el detalle de una solicitud específica. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`. | No | Debe priorizar estatus, línea de tiempo de actividad y tabla de actividad. |
| `/app/[RFC]/logs` | Aplicación institucional | Mostrar logs detallados de actividad institucional. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`. | No | Debe aplicar filtro fijo por `RFC`, permitir filtros por categoría, origen y tiempo, y mostrar tabla resumida con vista modal de detalle. |
| `/admin/institutions` | Backoffice del proveedor | Listar instituciones del sistema. | `SYSTEM_ADMINISTRATOR`. | No | Es el punto principal de consulta multiinstitución del proveedor. |
| `/admin/new-institution` | Backoffice del proveedor | Incorporar una nueva institución, sus contactos y su administrador. | `SYSTEM_ADMINISTRATOR`. | No | Materializa la incorporación inicial del cliente al SaaS. |
| `/admin/institutions/[RFC]` | Backoffice del proveedor | Resolver el contenedor de navegación de una institución desde backoffice. | `SYSTEM_ADMINISTRATOR`. | No | Debe agrupar vistas institucionales desde la perspectiva del proveedor. |
| `/admin/institutions/[RFC]/requests` | Backoffice del proveedor | Mostrar solicitudes de la institución desde una vista más resumida que `/app`. | `SYSTEM_ADMINISTRATOR`. | No | No debe exponer la misma profundidad operativa institucional que la vista `/app`. |
| `/admin/institutions/[RFC]/requests/[FUB]` | Backoffice del proveedor | Mostrar el detalle de una solicitud específica desde backoffice. | `SYSTEM_ADMINISTRATOR`. | No | Debe servir supervisión y trazabilidad. |
| `/admin/institutions/[RFC]/plan` | Backoffice del proveedor | Mostrar el detalle del plan institucional. | `SYSTEM_ADMINISTRATOR`. | No | Permite supervisión comercial y operativa. |
| `/admin/institutions/[RFC]/contacts` | Backoffice del proveedor | Mostrar contactos institucionales. | `SYSTEM_ADMINISTRATOR`. | No | Funciona como vista transversal de revisión. |
| `/admin/logs` | Backoffice del proveedor | Mostrar logs globales del sistema. | `SYSTEM_ADMINISTRATOR`. | No | Debe permitir visión global y además filtrar por `RFC`, `userId` o correo, categoría, origen y tiempo. |
| `/account/settings` | Cuenta personal | Mostrar configuración personal y permitir edición de `displayName` e icono emoji. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`, `SYSTEM_ADMINISTRATOR`. | Sí, bajo `/account`. | Debe estar desacoplada del contexto institucional activo. |
| `/account/logs` | Cuenta personal | Mostrar logs relacionados con la cuenta personal. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`, `SYSTEM_ADMINISTRATOR`. | No | Debe aplicar filtro fijo por `userId` y permitir filtros adicionales por categoría, origen y tiempo. |
| `/error/404` | Error y restricciones | Resolver rutas no encontradas. | Todos los roles y estados de sesión. | No | Es la salida de navegación inválida por inexistencia. |
| `/error/403` | Error y restricciones | Resolver accesos incompatibles entre ruta, rol o contexto. | Todos los roles y estados de sesión. | No | Es la salida de navegación prohibida. |
| `/error/500` | Error y restricciones | Resolver errores del sistema o de infraestructura. | Todos los roles y estados de sesión. | No | Es la salida de error interno del producto o de sus dependencias técnicas. |

### 10.3.1 Precisión funcional del dashboard institucional

La vista `/app/[RFC]/dashboard` ya no debe leerse como un tablero abstracto, sino como una vista con criterios de cálculo explícitos.

| Componente del dashboard | Criterio definido |
|---|---|
| Universo objetivo | El 100% de las solicitudes de búsqueda de la institución diversa. |
| Gráfica por estatus general | Debe distribuir ese universo según `SEARCH_REQUEST_STATUS`, distinguiendo al menos `ACTIVE` y `REVOKED`. |
| Gráfica por fase | Debe distribuir el subconjunto de solicitudes activas según `SEARCH_REQUEST_PHASE`, distinguiendo `SEARCH_REQUEST_BASIC_DATA`, `SEARCH_REQUEST_CONTINUOUS` y `SEARCH_REQUEST_HISTORICAL`. |
| Tabla resumen por fase y estatus de fase | Debe mostrar, para las solicitudes activas, el valor en cantidad y porcentaje de `SEARCH_REQUEST_PHASE_STATUS` por cada `SEARCH_REQUEST_PHASE`. |

### 10.3.2 Precisión funcional de búsquedas de logs en UI

Las interfaces de búsqueda de logs deben ser uniformes en su estructura, variando solo el filtro fijo derivado del dominio y del rol.

| Aspecto | Regla definida |
|---|---|
| Filtro fijo institucional | En logs institucionales, la búsqueda debe quedar siempre restringida al `RFC` de la institución activa. |
| Filtro fijo de cuenta | En logs de cuenta, la búsqueda debe quedar siempre restringida al `userId` de la persona usuaria autenticada. |
| Alcance de `SYSTEM_ADMINISTRATOR` | Puede consultar todos los logs y además filtrar por `RFC`, `userId` o correo. |
| Filtros comunes | Todas las vistas de logs deben permitir filtrar por categoría, origen y ventana temporal. |
| Ventana temporal relativa | Debe admitir al menos `10 minutos`, `1 hora`, `1 día`, `esta semana`, `semana pasada`, `este mes` y `mes pasado`. |
| Ventana temporal absoluta | Debe admitir fecha y hora inicial y final. |
| Paginación | Los resultados deben paginarse en bloques de 100 registros. |
| Ordenamiento | Debe poder elegirse ascendente o descendente; por default debe ser descendente, mostrando primero los registros más recientes. |
| Vista resumida | La tabla principal debe mostrar, como mínimo, fecha, hora, `RFC`, categoría, origen, correo y rol de quien ejecutó. |
| Vista detallada | Debe existir una vista modal con el detalle completo de la información disponible del log. |

### 10.3.3 Precisión funcional del dominio `/error`

El alcance 1 debe sostener un dominio de error acotado y explícito.

| Estado de error | Propósito dentro del alcance 1 |
|---|---|
| `/error/403` | Resolver accesos incompatibles entre ruta, rol o contexto vigente. |
| `/error/404` | Resolver rutas inexistentes o recursos de navegación no encontrados. |
| `/error/500` | Resolver errores del sistema o de infraestructura del producto. |

Por el momento, el alcance 1 debe limitarse a estos tres estados de error.

## 10.4 Route guards

Los guards de navegación del alcance 1 deben sostener coherencia entre sesión, rol, contexto institucional y ruta solicitada.

| Guard o criterio | Comportamiento esperado |
|---|---|
| Existencia de ruta | Toda ruta inexistente debe redirigir a `/error/404`. |
| Compatibilidad ruta/rol | Toda incompatibilidad entre ruta y rol debe redirigir a `/error/403`. |
| Error interno del sistema o infraestructura | Todo fallo no atribuible a ruta inexistente o incompatibilidad de acceso debe resolverse mediante `/error/500`. |
| Contexto institucional activo | La navegación dentro de `/app/[RFC]` debe validar que la persona usuaria tenga permiso habilitante sobre la institución solicitada. |
| Cambio de ruta | En cada cambio de ruta debe verificarse si el rol vigente y la institución activa siguen autorizando la vista solicitada. |
| Default interno | Cuando un subdominio marque una vista como `default`, la navegación al contenedor debe redirigir o cargar esa vista por default. |
| Cambio de contexto institución/rol | El producto debe ofrecer un mecanismo explícito para cambiar el contexto activo de sesión. |
| Relectura desde `/account` | El cambio de contexto debe ser posible aun cuando la persona usuaria se encuentre en el dominio `/account`. |

## 10.5 Stores

La capa de estado del frontend debe sostener, como mínimo, la identidad autenticada y el contexto institucional activo.

| Store | Propósito analítico | Estado que debe sostener | Observaciones |
|---|---|---|---|
| `authStore` | Sostener el estado de autenticación y la información mínima de la cuenta operativa. | Sesión autenticada, identidad básica, estado de acceso y continuidad de la cuenta en frontend. | Corresponde al store relacionado con autenticación. |
| `institutionStore` | Sostener el contexto institucional activo de la sesión. | Institución activa, rol activo y selección operativa vigente. | Corresponde al store relacionado con institución activa. |

## 10.6 Stack

El stack de frontend del alcance 1 debe leerse como la combinación mínima necesaria para hospedar una `WebApp` navegable, con estado local coherente y separación por dominios de experiencia.

| Elemento del stack | Papel dentro del alcance 1 |
|---|---|
| Firebase Hosting | Publicar y servir la `WebApp` del producto. |
| `PWA` | Hacer que la experiencia se comporte como aplicación web utilizable y continua. |
| Vue 3 | Sostener la construcción del cliente y de sus vistas. |
| `vue-router` | Resolver layouts, vistas internas, navegación y guards. |
| Pinia | Sostener el estado compartido del frontend. |

## 10.7 Reglas transversales de frontend

Además de las rutas y layouts, el alcance 1 requiere convenciones explícitas de experiencia, lenguaje y organización del frontend.

| Regla transversal | Implicación dentro del alcance 1 |
|---|---|
| Idioma técnico en inglés | Código, rutas, componentes, archivos, librerías y nombres técnicos deben expresarse en inglés. |
| Contenido de producto en español | El contenido orientado a la persona usuaria debe expresarse en español. |
| Convención de rutas | Las rutas de primer nivel representan layouts; las rutas internas representan vistas. |
| Convención de logs en UI | Las vistas de logs deben sostener estructura uniforme de búsqueda, lectura cronológica, filtros por categoría, origen y tiempo, paginación en bloques de 100 y detalle modal del evento. |
| Convención para archivos `.vue` | Deben usarse `Single File Components` y nombres en `PascalCase`. |
| Convención para componentes | Debe evitarse el sufijo `Component` salvo cuando no exista alternativa clara de nombre. |
| Convención para archivos de código puro | Deben usar `camelCase` y un sufijo que explicite el tipo de archivo, como `authStore.ts`. |

## 10.8 Implicación analítica para el resto del alcance

| Criterio de lectura | Consecuencia |
|---|---|
| Frontend como estructura operativa | El frontend no debe leerse como una capa visual aislada, sino como la organización de la experiencia del producto por dominios, rutas y contexto. |
| Navegación dependiente de identidad y permisos | La sección 10 debe interpretarse siempre en continuidad con actores, roles, identidad, acceso y datos. |
| Rutas como contrato funcional | Las rutas del alcance 1 deben servir como puente entre historias de usuario, backend y modelo de datos. |
| Experiencia preparada para evolución | La estructura de layouts, stores y stack debe permitir crecimiento hacia interoperabilidad y capacidades posteriores sin rehacer la base del cliente. |
