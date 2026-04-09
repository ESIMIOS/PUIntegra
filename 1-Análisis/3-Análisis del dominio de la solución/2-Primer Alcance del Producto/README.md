# Primer Alcance del Producto
## MVP operativo del SaaS para instituciones diversas

---

# 1. Propósito del documento

El presente documento define el **primer alcance del producto**, entendido como el **MVP operativo del SaaS** para instituciones diversas.

Su propósito es aterrizar, en forma de especificación analítica, la primera etapa de construcción del producto descrito en el **Marco Conceptual del Dominio de la Solución**.

Este documento debe ser entendible tanto por personas como por herramientas de IA, y servir como base para:

- delimitar claramente qué se construye en el alcance 1
- establecer sus definiciones funcionales y estructurales
- preparar el terreno para los alcances posteriores

---

# 2. Objetivo del primer alcance

El primer alcance busca construir la base operativa del producto para que una institución diversa pueda:

| Capacidad objetivo | Resultado esperado dentro del alcance 1 |
|---|---|
| Existencia institucional en el sistema | La institución puede existir y operar dentro del SaaS con su propio contexto. |
| Identidad, acceso y permisos | La plataforma puede administrar cuentas, autenticación y permisos institucionales. |
| Autenticación segura | El acceso se realiza con reglas explícitas de seguridad y sesión. |
| Información institucional relevante | La institución puede mantener y actualizar sus datos operativos clave. |
| Solicitudes y hallazgos internos | La operación interna de `Requests` y `Findings` existe dentro del SaaS. |
| Trazabilidad y auditoría | Las acciones relevantes quedan registradas y consultables. |
| Preparación para interoperabilidad futura | El MVP deja lista la base para evolucionar hacia la integración formal con la PUI. |

El foco del primer alcance está en la **operación institucional interna del producto**, no en la interoperabilidad completa con la PUI.

---

# 3. Delimitación del alcance

## 3.1 Lo que sí entra en el alcance 1

En este alcance se incluyen las capacidades necesarias para construir el MVP operativo del SaaS.

Estas capacidades comprenden, al menos:

| Capacidad | Alcance dentro del MVP |
|---|---|
| Experiencia pública básica del producto | Presencia pública, navegación informativa y acceso a autenticación |
| Autenticación y gestión de cuentas | Registro, ingreso, recuperación, cierre de sesión y reglas de acceso |
| Selección de contexto activo institución/rol | Elección explícita del contexto operativo de sesión |
| Administración institucional | Configuración de institución, plan, contactos y parámetros sensibles como `sharedSecret` |
| Administración de permisos | Alta, actualización, revocación y trazabilidad de permisos |
| Operación interna de solicitudes | Gestión operativa de `Requests` y sus fases dentro del SaaS, aunque aún no sean recibidas formalmente desde la PUI |
| Operación interna de hallazgos | Gestión operativa de `Findings` y su preparación dentro del SaaS, aunque aún no se emitan formalmente a la PUI |
| Backoffice del proveedor SaaS | Supervisión y administración multiinstitución |
| Trazabilidad y logs | Registro y consulta de eventos relevantes del sistema |

## 3.2 Lo que no entra en el alcance 1

Quedan fuera de este alcance:

| Capacidad diferida | Alcance de la exclusión |
|---|---|
| Autenticación técnica con la PUI | No se implementa aún la interoperabilidad técnica real con la plataforma externa |
| Recepción formal de solicitudes desde la PUI | No se implementa aún la entrada productiva de solicitudes desde endpoints de la PUI |
| Ejecución real de búsquedas sobre bases de datos institucionales | No se implementa aún la conexión operativa con las fuentes institucionales ni la lógica de búsqueda real |
| Envío formal de respuestas y hallazgos hacia la PUI | No se implementa aún la salida productiva hacia endpoints oficiales de la PUI |

La ausencia de interoperabilidad formal con la PUI en este alcance **no implica** que las entidades `Requests`, `Findings` o las configuraciones institucionales asociadas queden fuera del MVP.  
Por el contrario, dichas entidades deben existir, operar y ser utilizables dentro del producto desde este alcance, aun cuando su integración externa real se habilite en etapas posteriores.

## 3.3 Relación con los siguientes alcances

El primer alcance debe dejar preparado el producto para la evolución posterior definida en:

- `3-Segundo Alcance del Producto.md`
- `4-Tercer Alcance del Producto.md`
- `5-Cuarto Alcance del Producto.md`

---

## Nota de estructura documental

El alcance 1 se documenta de forma modular para facilitar su lectura, evolución y uso futuro por herramientas de IA especializadas.

Cuando una sección del alcance tenga un documento propio, el `README.md` funcionará solo como índice maestro de navegación y contexto.  
En esos casos, la numeración interna y el desarrollo detallado vivirán únicamente en el archivo especializado correspondiente.

| Documento | Propósito |
|---|---|
| [README.md](./README.md) | Índice maestro del alcance 1 y delimitación general |
| [4-fundamentos-del-alcance.md](./4-fundamentos-del-alcance.md) | Definiciones normativas transversales del alcance |
| [5-actores-y-roles-del-alcance.md](./5-actores-y-roles-del-alcance.md) | Delimitación de actores, roles y restricciones de operación dentro del MVP |
| [6-historias-de-usuario-del-alcance.md](./6-historias-de-usuario-del-alcance.md) | Organización de historias de usuario por rol y capacidad del alcance 1 |
| [7-identidad-y-acceso.md](./7-identidad-y-acceso.md) | Especificación analítica de cuentas, autenticación, acceso y trazabilidad asociada |
| [8-modelo-de-datos/README.md](./8-modelo-de-datos/README.md) | Índice maestro del modelo de datos y acceso a la especificación por colección |
| [9-backend-y-automatizaciones.md](./9-backend-y-automatizaciones.md) | Especificación analítica de automatización, consistencia y tipos de Cloud Functions |
| [10-frontend-y-experiencia.md](./10-frontend-y-experiencia.md) | Especificación analítica de navegación, experiencia, layouts, rutas y stack del cliente |
| [11-dependencias-internas-del-alcance.md](./11-dependencias-internas-del-alcance.md) | Mapa de dependencias funcionales y cadenas críticas del MVP |
| [12-riesgos-supuestos-y-decisiones-abiertas.md](./12-riesgos-supuestos-y-decisiones-abiertas.md) | Consolidación de incertidumbres, exposiciones y pendientes finos del alcance 1 |
| [13-relacion-con-los-siguientes-alcances.md](./13-relacion-con-los-siguientes-alcances.md) | Relación de continuidad entre el alcance 1 y la evolución posterior del producto |

---

## Mapa de dominios de navegación del alcance

| Dominio de navegación | Path raíz o patrón de referencia | Propósito dentro del alcance 1 | Roles habilitados |
|---|---|---|---|
| Sitio público | `/site` | Presentar información pública, comercial e informativa del producto. | `ANONYMOUS` y usuarios fuera de una sesión operativa. |
| Autenticación | `/auth` | Permitir ingreso, creación de cuenta, recuperación de contraseña y salida de sesión. | `ANONYMOUS` y usuarios fuera de una sesión operativa. |
| Aplicación institucional | `/app` | Sostener la operación institucional cotidiana sobre dashboard, solicitudes, contactos, permisos, configuración y logs. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`. |
| Backoffice del proveedor | `/admin` | Permitir la supervisión global del SaaS y la incorporación y consulta transversal de instituciones. | `SYSTEM_ADMINISTRATOR`. |
| Cuenta personal | `/account` | Permitir configuración personal y consulta de actividad propia del usuario autenticado. | `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`, `SYSTEM_ADMINISTRATOR`. |
| Error y restricciones | `/error` | Resolver navegación inválida, incompatibilidades entre ruta y rol y errores del sistema o infraestructura mediante los estados `403`, `404` y `500`. | Todos los roles y estados de sesión. |

---

# 4. Fundamentos del alcance

Esta sección concentrará las definiciones transversales del alcance 1 que deben ser compartidas por todo el producto.

Su desarrollo detallado se encuentra en [4-fundamentos-del-alcance.md](./4-fundamentos-del-alcance.md).

| Numeral | [Componente desarrollado en el documento detallado](./4-fundamentos-del-alcance.md) | Propósito |
|---|---|---|
| `4.1` | [Constantes e identificadores estructurales](./4-fundamentos-del-alcance.md#41-constantes-e-identificadores-estructurales) | Fijar aquello que no cambia conceptualmente dentro del producto y sus identificadores transversales. |
| `4.2` | [Variables operativas del alcance](./4-fundamentos-del-alcance.md#42-variables-operativas-del-alcance) | Definir estados o condiciones que cambian durante la operación. |
| `4.3` | [Enumeraciones normativas del alcance](./4-fundamentos-del-alcance.md#43-enumeraciones-normativas-del-alcance) | Normalizar catálogos reutilizables por datos, UI, reglas y logs. |
| `4.4` | [Reglas invariantes del alcance](./4-fundamentos-del-alcance.md#44-reglas-invariantes-del-alcance) | Fijar restricciones estructurales y operativas que deben cumplirse siempre. |
| `4.5` | [Criterios transversales de datos, cambio histórico y trazabilidad](./4-fundamentos-del-alcance.md#45-criterios-transversales-de-datos-cambio-histórico-y-trazabilidad) | Asegurar coherencia entre entidades, historial y evidencia operativa. |

---

# 5. Actores y roles involucrados en el alcance

Esta sección debe delimitar qué actores y roles participan efectivamente en el primer alcance del producto.

Su desarrollo detallado se encuentra en [5-actores-y-roles-del-alcance.md](./5-actores-y-roles-del-alcance.md).

| Numeral | [Componente desarrollado en el documento detallado](./5-actores-y-roles-del-alcance.md) | Propósito |
|---|---|---|
| `5.1` | [Actores involucrados](./5-actores-y-roles-del-alcance.md#51-actores-involucrados) | Delimitar qué participantes intervienen directa o contextualmente en el alcance 1. |
| `5.2` | [Roles operativos del sistema](./5-actores-y-roles-del-alcance.md#52-roles-operativos-del-sistema) | Precisar los perfiles de acceso efectivos del producto dentro del alcance. |
| `5.3` | [Restricciones por rol](./5-actores-y-roles-del-alcance.md#53-restricciones-por-rol) | Delimitar visibilidad, navegación y acciones permitidas por cada rol. |
| `5.4` | [Implicación analítica para el resto del alcance](./5-actores-y-roles-del-alcance.md#54-implicación-analítica-para-el-resto-del-alcance) | Asegurar que el resto del alcance mantenga la separación entre actores, roles y dominios operativos. |

---

# 6. Historias de usuario del alcance

Las historias de usuario del primer alcance deberán organizarse por rol para facilitar su lectura, análisis y posterior trazabilidad.

Su desarrollo detallado se encuentra en [6-historias-de-usuario-del-alcance.md](./6-historias-de-usuario-del-alcance.md).

| Numeral | [Componente desarrollado en el documento detallado](./6-historias-de-usuario-del-alcance.md) | Propósito |
|---|---|---|
| `6.1` | [Historias de usuario de `ANONYMOUS`](./6-historias-de-usuario-del-alcance.md#61-historias-de-usuario-de-anonymous) | Delimitar las capacidades públicas y de acceso inicial del sistema. |
| `6.2` | [Historias de usuario de `INSTITUTION_ADMIN`](./6-historias-de-usuario-del-alcance.md#62-historias-de-usuario-de-institution_admin) | Delimitar la operación institucional con facultades administrativas. |
| `6.3` | [Historias de usuario de `INSTITUTION_OPERATOR`](./6-historias-de-usuario-del-alcance.md#63-historias-de-usuario-de-institution_operator) | Delimitar la operación cotidiana institucional sin facultades administrativas. |
| `6.4` | [Historias de usuario de `SYSTEM_ADMINISTRATOR`](./6-historias-de-usuario-del-alcance.md#64-historias-de-usuario-de-system_administrator) | Delimitar la operación de backoffice y supervisión global del SaaS. |
| `6.5` | [Criterios de lectura de las historias del alcance](./6-historias-de-usuario-del-alcance.md#65-criterios-de-lectura-de-las-historias-del-alcance) | Precisar cómo deben interpretarse las historias dentro del MVP. |

---

# 7. Especificación de identidad y acceso

Esta sección debe concentrar la definición del comportamiento esperado para cuentas, autenticación, reglas de acceso, triggers y trazabilidad asociada.

Su desarrollo detallado se encuentra en [7-identidad-y-acceso.md](./7-identidad-y-acceso.md).

| Numeral | [Componente desarrollado en el documento detallado](./7-identidad-y-acceso.md) | Propósito |
|---|---|---|
| `7.1` | [Modelo de cuentas](./7-identidad-y-acceso.md#71-modelo-de-cuentas) | Precisar la relación entre cuenta autenticable, usuario operativo, permiso institucional y contexto activo. |
| `7.2` | [Reglas de Firebase Auth](./7-identidad-y-acceso.md#72-reglas-de-firebase-auth) | Delimitar las reglas de autenticación, unicidad, MFA y creación de cuenta. |
| `7.3` | [Triggers de autenticación](./7-identidad-y-acceso.md#73-triggers-de-autenticación) | Definir las automatizaciones requeridas para consistencia operativa y trazabilidad derivadas de eventos de Auth. |
| `7.4` | [Eventos de log asociados a identidad y acceso](./7-identidad-y-acceso.md#74-eventos-de-log-asociados-a-identidad-y-acceso) | Delimitar la taxonomía mínima de logs de cuenta, acceso y seguridad. |
| `7.5` | [Implicación analítica para el resto del alcance](./7-identidad-y-acceso.md#75-implicación-analítica-para-el-resto-del-alcance) | Asegurar que identidad y acceso se interpreten como una capacidad del producto y no solo como configuración técnica. |

---

# 8. Especificación del modelo de datos

Esta sección concentrará la especificación analítica de las colecciones relevantes para el alcance 1.

Su desarrollo detallado se encuentra en [8-modelo-de-datos/README.md](./8-modelo-de-datos/README.md).

| Numeral | [Colección desarrollada en el documento detallado](./8-modelo-de-datos/README.md) | Propósito |
|---|---|---|
| `8.1` | [Users](./8-modelo-de-datos/Users.md) | Representar operativamente a la persona usuaria con cuenta creada dentro del producto. |
| `8.2` | [Permissions](./8-modelo-de-datos/Permissions.md) | Relacionar institución, correo, rol y estado de acceso. |
| `8.3` | [Requests](./8-modelo-de-datos/Requests.md) | Modelar solicitudes de búsqueda operadas internamente por la institución. |
| `8.4` | [Findings](./8-modelo-de-datos/Findings.md) | Modelar hallazgos relacionados con solicitudes y preparados para interoperabilidad futura. |
| `8.5` | [Institutions](./8-modelo-de-datos/Institutions.md) | Representar la institución diversa activa dentro del SaaS y su configuración principal. |
| `8.6` | [Contacts](./8-modelo-de-datos/Contacts.md) | Representar contactos institucionales de tipo legal, técnico y de búsqueda inmediata. |
| `8.7` | [Logs](./8-modelo-de-datos/Logs.md) | Consolidar la bitácora de auditoría del sistema, cuentas y operación institucional. |

---

# 9. Especificación de backend y automatizaciones

Esta sección describe el papel del backend dentro del alcance 1 y los tipos de Cloud Functions necesarios para sostener consistencia, seguridad y trazabilidad del producto.

Su desarrollo detallado se encuentra en [9-backend-y-automatizaciones.md](./9-backend-y-automatizaciones.md).

| Numeral | [Componente desarrollado en el documento detallado](./9-backend-y-automatizaciones.md) | Propósito |
|---|---|---|
| `9.1` | [Papel del backend dentro del alcance 1](./9-backend-y-automatizaciones.md#91-papel-del-backend-dentro-del-alcance-1) | Delimitar la función operativa del backend dentro del MVP. |
| `9.2` | [Tipos de Cloud Functions requeridos](./9-backend-y-automatizaciones.md#92-tipos-de-cloud-functions-requeridos) | Clasificar las familias de automatización necesarias en el alcance. |
| `9.3` | [Responsabilidad analítica por tipo de función](./9-backend-y-automatizaciones.md#93-responsabilidad-analítica-por-tipo-de-función) | Precisar qué debe garantizar cada tipo de función dentro del producto. |
| `9.4` | [Relación entre funciones, datos y logs](./9-backend-y-automatizaciones.md#94-relación-entre-funciones-datos-y-logs) | Aterrizar cómo el backend sostiene estado, historial y evidencia. |
| `9.5` | [Criterios transversales para automatizaciones](./9-backend-y-automatizaciones.md#95-criterios-transversales-para-automatizaciones) | Fijar restricciones comunes de origen, seguridad y consistencia. |
| `9.6` | [Implicación analítica para el resto del alcance](./9-backend-y-automatizaciones.md#96-implicación-analítica-para-el-resto-del-alcance) | Conectar backend con fundamentos, identidad, datos y trazabilidad. |

---

# 10. Especificación de frontend y experiencia

Esta sección describe la estructura funcional del cliente del alcance 1: tipo de aplicación, layouts, rutas, guards, estado y stack.

Su desarrollo detallado se encuentra en [10-frontend-y-experiencia.md](./10-frontend-y-experiencia.md).

| Numeral | [Componente desarrollado en el documento detallado](./10-frontend-y-experiencia.md) | Propósito |
|---|---|---|
| `10.1` | [Tipo de página en Firebase Hosting](./10-frontend-y-experiencia.md#101-tipo-de-página-en-firebase-hosting) | Delimitar la naturaleza del cliente web dentro del alcance 1. |
| `10.2` | [Layouts](./10-frontend-y-experiencia.md#102-layouts) | Precisar los dominios de navegación y su relación con roles y estado de sesión. |
| `10.3` | [Rutas](./10-frontend-y-experiencia.md#103-rutas) | Inventariar las vistas y patrones de ruta del alcance 1. |
| `10.4` | [Route guards](./10-frontend-y-experiencia.md#104-route-guards) | Delimitar la validación de acceso, contexto y navegación permitida. |
| `10.5` | [Stores](./10-frontend-y-experiencia.md#105-stores) | Delimitar el estado compartido mínimo requerido por el cliente. |
| `10.6` | [Stack](./10-frontend-y-experiencia.md#106-stack) | Identificar la base tecnológica del frontend del alcance 1. |
| `10.7` | [Reglas transversales de frontend](./10-frontend-y-experiencia.md#107-reglas-transversales-de-frontend) | Fijar convenciones de lenguaje, organización y lectura de la experiencia. |
| `10.8` | [Implicación analítica para el resto del alcance](./10-frontend-y-experiencia.md#108-implicación-analítica-para-el-resto-del-alcance) | Conectar frontend con historias, identidad, backend y modelo de datos. |

---

# 11. Dependencias internas del alcance

Esta sección describe las dependencias internas que sostienen la coherencia funcional del alcance 1.

Su desarrollo detallado se encuentra en [11-dependencias-internas-del-alcance.md](./11-dependencias-internas-del-alcance.md).

| Numeral | [Componente desarrollado en el documento detallado](./11-dependencias-internas-del-alcance.md) | Propósito |
|---|---|---|
| `11.1` | [Propósito de la sección](./11-dependencias-internas-del-alcance.md#111-propósito-de-la-sección) | Delimitar cómo debe leerse la sección 11 dentro del alcance. |
| `11.2` | [Dependencias estructurales entre capacidades](./11-dependencias-internas-del-alcance.md#112-dependencias-estructurales-entre-capacidades) | Mostrar qué capacidades del MVP requieren otras para existir operativamente. |
| `11.3` | [Dependencias entre identidad, permisos y sesión](./11-dependencias-internas-del-alcance.md#113-dependencias-entre-identidad-permisos-y-sesión) | Explicitar la cadena mínima de acceso y operación autenticada. |
| `11.4` | [Dependencias entre frontend, backend y modelo de datos](./11-dependencias-internas-del-alcance.md#114-dependencias-entre-frontend-backend-y-modelo-de-datos) | Conectar experiencia, automatización y persistencia. |
| `11.5` | [Dependencias entre entidades del modelo de datos](./11-dependencias-internas-del-alcance.md#115-dependencias-entre-entidades-del-modelo-de-datos) | Precisar cómo se sostienen mutuamente las colecciones principales. |
| `11.6` | [Dependencias entre historial embebido y auditoría transversal](./11-dependencias-internas-del-alcance.md#116-dependencias-entre-historial-embebido-y-auditoría-transversal) | Delimitar la complementariedad entre `updates[]` y `Logs`. |
| `11.7` | [Cadenas críticas de operación del MVP](./11-dependencias-internas-del-alcance.md#117-cadenas-críticas-de-operación-del-mvp) | Sintetizar las secuencias funcionales sin las cuales el alcance pierde coherencia. |
| `11.8` | [Implicación analítica para el resto del alcance](./11-dependencias-internas-del-alcance.md#118-implicación-analítica-para-el-resto-del-alcance) | Conectar la sección 11 con las secciones previas del alcance. |

---

# 12. Riesgos, supuestos y decisiones abiertas

Esta sección consolida los supuestos aceptados, los riesgos principales del MVP y las decisiones que siguen abiertas a nivel de precisión.

Su desarrollo detallado se encuentra en [12-riesgos-supuestos-y-decisiones-abiertas.md](./12-riesgos-supuestos-y-decisiones-abiertas.md).

| Numeral | [Componente desarrollado en el documento detallado](./12-riesgos-supuestos-y-decisiones-abiertas.md) | Propósito |
|---|---|---|
| `12.1` | [Propósito de la sección](./12-riesgos-supuestos-y-decisiones-abiertas.md#121-propósito-de-la-sección) | Delimitar cómo debe leerse la sección 12 dentro del alcance. |
| `12.2` | [Supuestos aceptados del alcance 1](./12-riesgos-supuestos-y-decisiones-abiertas.md#122-supuestos-aceptados-del-alcance-1) | Hacer explícitas las condiciones de viabilidad ya aceptadas para el MVP. |
| `12.3` | [Riesgos principales del alcance 1](./12-riesgos-supuestos-y-decisiones-abiertas.md#123-riesgos-principales-del-alcance-1) | Identificar exposiciones que pueden comprometer coherencia, utilidad o seguridad del alcance. |
| `12.4` | [Decisiones abiertas del alcance](./12-riesgos-supuestos-y-decisiones-abiertas.md#124-decisiones-abiertas-del-alcance) | Delimitar los temas que conviene cerrar con más precisión antes de implementación detallada o alcances posteriores. |
| `12.5` | [Criterios de lectura de riesgos, supuestos y decisiones](./12-riesgos-supuestos-y-decisiones-abiertas.md#125-criterios-de-lectura-de-riesgos-supuestos-y-decisiones) | Evitar mezclar riesgos con reglas cerradas o pendientes finos con indefinición estructural. |
| `12.6` | [Implicación analítica para el resto del alcance](./12-riesgos-supuestos-y-decisiones-abiertas.md#126-implicación-analítica-para-el-resto-del-alcance) | Conectar la sección 12 con el estado general de madurez del alcance 1. |

---

# 13. Relación con los siguientes alcances

Esta sección explica qué deja preparado el alcance 1 para los alcances 2, 3 y 4, y también qué sigue fuera del MVP actual.

Su desarrollo detallado se encuentra en [13-relacion-con-los-siguientes-alcances.md](./13-relacion-con-los-siguientes-alcances.md).

| Numeral | [Componente desarrollado en el documento detallado](./13-relacion-con-los-siguientes-alcances.md) | Propósito |
|---|---|---|
| `13.1` | [Propósito de la sección](./13-relacion-con-los-siguientes-alcances.md#131-propósito-de-la-sección) | Delimitar cómo debe leerse la continuidad entre el alcance 1 y los alcances posteriores. |
| `13.2` | [Relación con el segundo alcance del producto](./13-relacion-con-los-siguientes-alcances.md#132-relación-con-el-segundo-alcance-del-producto) | Explicar qué deja preparado el alcance 1 para autenticación técnica y recepción formal desde la PUI. |
| `13.3` | [Relación con el tercer alcance del producto](./13-relacion-con-los-siguientes-alcances.md#133-relación-con-el-tercer-alcance-del-producto) | Explicar qué deja preparado el alcance 1 para la futura ejecución real de búsquedas institucionales. |
| `13.4` | [Relación con el cuarto alcance del producto](./13-relacion-con-los-siguientes-alcances.md#134-relación-con-el-cuarto-alcance-del-producto) | Explicar qué deja preparado el alcance 1 para el envío formal de respuestas y hallazgos. |
| `13.5` | [Qué no deja resuelto el alcance 1 para los siguientes alcances](./13-relacion-con-los-siguientes-alcances.md#135-qué-no-deja-resuelto-el-alcance-1-para-los-siguientes-alcances) | Evitar confundir preparación estructural con implementación real de interoperabilidad futura. |
| `13.6` | [Criterio de continuidad entre alcances](./13-relacion-con-los-siguientes-alcances.md#136-criterio-de-continuidad-entre-alcances) | Fijar reglas de evolución semántica y estructural del producto. |
| `13.7` | [Implicación analítica para el cierre del alcance 1](./13-relacion-con-los-siguientes-alcances.md#137-implicación-analítica-para-el-cierre-del-alcance-1) | Cerrar la lectura del alcance 1 como base operativa del producto completo. |
