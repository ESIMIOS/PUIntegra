# 6. Historias de usuario del alcance
## Historias operativas del MVP organizadas por rol

---

# 6.1 Historias de usuario de `ANONYMOUS`

Las historias de `ANONYMOUS` cubren navegación pública y acceso inicial al sistema.

| ID | Historia de usuario | Dominio o path de referencia | Resultado esperado dentro del alcance 1 | Observaciones analíticas |
|---|---|---|---|---|
| `US-ANO-01` | Como `ANONYMOUS`, quiero visitar el sitio público del producto para obtener información pública sobre el sistema. | `/site` | El usuario puede navegar `/site` y consultar contenido informativo, comercial y de acceso. | No requiere autenticación ni contexto institucional. |
| `US-ANO-02` | Como `ANONYMOUS`, quiero iniciar sesión para comenzar una sesión en el sistema. | `/auth/login` | El usuario puede autenticarse mediante Firebase Auth y acceder al flujo de selección de contexto o a su dominio autorizado. | La autenticación no otorga por sí sola contexto institucional; este debe seleccionarse después. |
| `US-ANO-03` | Como `ANONYMOUS`, quiero solicitar recuperación de contraseña para recuperar acceso a mi cuenta. | `/auth/forgot-password` | El sistema permite iniciar el proceso de recuperación sin exponer si un correo existe o no. | Debe respetar reglas de seguridad y antiabuso. |
| `US-ANO-04` | Como `ANONYMOUS`, quiero crear una cuenta cuando exista al menos un permiso activo asociado a mi correo para poder acceder al sistema. | `/auth/create-account` | El sistema permite crear cuenta solo si existe un permiso habilitante previo. | Esta historia depende directamente del modelo de permisos, no solo de Firebase Auth. |

---

# 6.2 Historias de usuario de `INSTITUTION_ADMIN`

Las historias de `INSTITUTION_ADMIN` cubren la operación institucional con facultades administrativas dentro del SaaS.

| ID | Historia de usuario | Dominio o path de referencia | Resultado esperado dentro del alcance 1 | Observaciones analíticas |
|---|---|---|---|---|
| `US-IAD-01` | Como `INSTITUTION_ADMIN`, quiero ver las instituciones y roles que tengo asignados para seleccionar el contexto activo con el que voy a operar. | `/app/institutions` | El usuario puede ver sus asignaciones y elegir un único contexto activo institución/rol por sesión. | Esta historia materializa la regla transversal de contexto activo. |
| `US-IAD-02` | Como `INSTITUTION_ADMIN`, quiero consultar un dashboard de la institución activa para informarme rápidamente del estado general de su operación. | `/app/[RFC]/dashboard` | El usuario puede visualizar un resumen operativo de la institución activa, incluyendo errores de sincronización PUI de hallazgos. | El dashboard depende del contexto institucional activo. |
| `US-IAD-03` | Como `INSTITUTION_ADMIN`, quiero consultar el detalle de una solicitud de búsqueda para evaluar si cada solicitud está siendo atendida como corresponde. | `/app/[RFC]/requests/[FUB]` | El usuario puede ver estado, fases, actividad, respuestas internas y log asociado a una `Request`. | Esta historia confirma que `Requests` opera internamente desde el alcance 1. |
| `US-IAD-04` | Como `INSTITUTION_ADMIN`, quiero consultar logs institucionales para entender qué ha ocurrido en la operación de mi institución. | `/app/[RFC]/logs` | El usuario puede consultar eventos relevantes filtrables de la institución activa. | Debe apoyarse en categorías, tiempos y contexto institucional. |
| `US-IAD-05` | Como `INSTITUTION_ADMIN`, quiero consultar el plan contratado para verificar condiciones y fechas relevantes del plan comercial de mi institución. | `/app/[RFC]/admin/plan` | El usuario puede ver el plan vigente y sus fechas relevantes. | No implica administrar el catálogo comercial global del SaaS. |
| `US-IAD-06` | Como `INSTITUTION_ADMIN`, quiero consultar los contactos técnicos y legales de mi institución. | `/app/[RFC]/admin/contacts` | El usuario puede ver la información de contactos institucionales registrada. | Los contactos siguen siendo datos informativos, no roles operativos. |
| `US-IAD-07` | Como `INSTITUTION_ADMIN`, quiero actualizar la configuración institucional para mantener operativa la preparación de integración con la PUI. | `/app/[RFC]/admin/settings` | El usuario puede administrar parámetros institucionales, incluido `sharedSecret`, bajo reglas de seguridad y trazabilidad. | Esta historia aterriza la configuración sensible definida en fundamentos. |
| `US-IAD-08` | Como `INSTITUTION_ADMIN`, quiero listar, crear, editar y filtrar permisos de usuarios dentro de mi institución para administrar su acceso. | `/app/[RFC]/admin/permissions` | El usuario puede gestionar permisos institucionales respetando reglas de historial, mutabilidad y notificación por correo cuando el caso de uso lo requiera. | Al editar, solo deben mutarse los campos permitidos por el alcance. |
| `US-IAD-09` | Como `INSTITUTION_ADMIN`, quiero consultar mi configuración personal de cuenta y editar los campos personales permitidos. | `/account/settings` | El usuario puede ver y actualizar su información personal permitida en `/account`. | Es una historia transversal de cuenta, no exclusiva del dominio institucional. |
| `US-IAD-10` | Como `INSTITUTION_ADMIN`, quiero consultar mis logs de cuenta para revisar actividad relevante asociada a mi usuario. | `/account/logs` | El usuario puede consultar eventos propios de cuenta y autenticación. | Se diferencia de los logs institucionales por su foco en la identidad personal. |

---

# 6.3 Historias de usuario de `INSTITUTION_OPERATOR`

Las historias de `INSTITUTION_OPERATOR` cubren la operación cotidiana sobre la institución activa sin facultades administrativas institucionales.

| ID | Historia de usuario | Dominio o path de referencia | Resultado esperado dentro del alcance 1 | Observaciones analíticas |
|---|---|---|---|---|
| `US-IOP-01` | Como `INSTITUTION_OPERATOR`, quiero ver las instituciones y roles que tengo asignados para seleccionar el contexto activo con el que voy a operar. | `/app/institutions` | El usuario puede ver sus asignaciones y elegir un único contexto activo institución/rol por sesión. | Comparte la regla de sesión con `INSTITUTION_ADMIN`. |
| `US-IOP-02` | Como `INSTITUTION_OPERATOR`, quiero consultar un dashboard de la institución activa para informarme rápidamente del estado general de su operación. | `/app/[RFC]/dashboard` | El usuario puede visualizar un resumen operativo de la institución activa, incluyendo errores de sincronización PUI de hallazgos. | Comparte lectura operativa, no facultad administrativa. |
| `US-IOP-03` | Como `INSTITUTION_OPERATOR`, quiero consultar el detalle de una solicitud de búsqueda para evaluar su estado y actividad operativa. | `/app/[RFC]/requests/[FUB]` | El usuario puede ver estado, fases, actividad y log asociado de una `Request`. | Participa en la operación diaria de solicitudes. |
| `US-IOP-04` | Como `INSTITUTION_OPERATOR`, quiero consultar logs institucionales para entender qué ha ocurrido en la operación de mi institución. | `/app/[RFC]/logs` | El usuario puede consultar eventos relevantes filtrables de la institución activa. | Mantiene visibilidad operativa sin facultad de configuración institucional. |
| `US-IOP-05` | Como `INSTITUTION_OPERATOR`, quiero consultar mi configuración personal de cuenta y editar los campos personales permitidos. | `/account/settings` | El usuario puede ver y actualizar su información personal permitida en `/account`. | Es una historia transversal de cuenta. |
| `US-IOP-06` | Como `INSTITUTION_OPERATOR`, quiero consultar mis logs de cuenta para revisar actividad relevante asociada a mi usuario. | `/account/logs` | El usuario puede consultar eventos propios de cuenta y autenticación. | Se distingue de la bitácora institucional. |

---

# 6.4 Historias de usuario de `SYSTEM_ADMINISTRATOR`

Las historias de `SYSTEM_ADMINISTRATOR` cubren la operación del proveedor SaaS sobre el backoffice y la administración global del producto.

| ID | Historia de usuario | Dominio o path de referencia | Resultado esperado dentro del alcance 1 | Observaciones analíticas |
|---|---|---|---|---|
| `US-SAD-01` | Como `SYSTEM_ADMINISTRATOR`, quiero consultar todas las instituciones del sistema para revisar RFC, estado, planes y fechas relevantes. | `/admin/institutions` | El usuario puede ver el universo de instituciones registradas en el SaaS. | Esta historia pertenece al dominio del proveedor, no al dominio institucional. |
| `US-SAD-02` | Como `SYSTEM_ADMINISTRATOR`, quiero crear una nueva institución, registrando su RFC, nombre, contactos y administrador inicial, para incorporar nuevos clientes al sistema. | `/admin/new-institution` | El usuario puede incorporar una institución y dejarla preparada para su operación inicial. | Esta historia aterriza la regla de provisión inicial por el proveedor SaaS. |
| `US-SAD-03` | Como `SYSTEM_ADMINISTRATOR`, quiero actualizar la configuración institucional necesaria para mantener operativa la preparación con la PUI. | `/admin/institutions/[RFC]` | El usuario puede mantener configuraciones institucionales sensibles y operativas desde el backoffice. | Comparte dominio de configuración con mayor visibilidad transversal. |
| `US-SAD-04` | Como `SYSTEM_ADMINISTRATOR`, quiero consultar el resumen de solicitudes de una institución desde el backoffice para supervisar su estado operativo. | `/admin/institutions/[RFC]/requests` | El usuario puede ver `Requests` de una institución desde una vista global resumida. | Su lectura difiere de la vista institucional detallada. |
| `US-SAD-05` | Como `SYSTEM_ADMINISTRATOR`, quiero consultar el plan de una institución desde el backoffice para supervisar su situación comercial y operativa. | `/admin/institutions/[RFC]/plan` | El usuario puede ver plan y fechas relevantes de cualquier institución. | Corresponde al dominio transversal del proveedor. |
| `US-SAD-06` | Como `SYSTEM_ADMINISTRATOR`, quiero consultar los contactos de una institución desde el backoffice para supervisar su información institucional. | `/admin/institutions/[RFC]/contacts` | El usuario puede consultar contactos institucionales registrados para cualquier institución. | No convierte a los contactos en usuarios operativos. |
| `US-SAD-07` | Como `SYSTEM_ADMINISTRATOR`, quiero consultar logs globales del sistema para supervisar la actividad transversal del SaaS. | `/admin/logs` | El usuario puede consultar bitácoras del sistema filtradas por categorías y contexto. | Corresponde al dominio de trazabilidad global del proveedor. |
| `US-SAD-08` | Como `SYSTEM_ADMINISTRATOR`, quiero consultar mi configuración personal de cuenta y editar los campos personales permitidos. | `/account/settings` | El usuario puede ver y actualizar su información personal permitida en `/account`. | Es una historia transversal de cuenta. |
| `US-SAD-09` | Como `SYSTEM_ADMINISTRATOR`, quiero consultar mis logs de cuenta para revisar actividad relevante asociada a mi usuario. | `/account/logs` | El usuario puede consultar eventos propios de cuenta y autenticación. | Se distingue de la bitácora global del sistema. |

---

# 6.5 Criterios de lectura de las historias del alcance

Las historias anteriores deben interpretarse como historias del MVP efectivamente implementables dentro del alcance 1, no como promesas del producto completo.

| Criterio de lectura | Consecuencia analítica |
|---|---|
| Historia operativa interna | La capacidad debe poder ejercerse dentro del SaaS aunque la interoperabilidad externa real aún no exista. |
| Historia asociada a un rol | La capacidad depende del rol activo y del contexto operativo correspondiente. |
| Historia transversal de cuenta | La capacidad vive en `/account` y puede repetirse en varios roles autenticados sin dejar de ser una sola familia funcional. |
| Historia del proveedor SaaS | La capacidad pertenece al dominio de backoffice y no debe confundirse con la operación ordinaria de una institución diversa. |
