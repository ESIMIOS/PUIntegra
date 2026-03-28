# 4. Fundamentos del alcance
## Definiciones transversales del MVP operativo del SaaS

---

# 4.1 Constantes e identificadores estructurales

Las constantes e identificadores estructurales fijan aquello que no cambia conceptualmente dentro del producto y que, para el alcance 1, debe ser respetado por identidad y acceso, modelo de datos, backend, frontend y trazabilidad.

| Código | Constante | Definición normativa | Implicación para el alcance 1 |
|---|---|---|---|
| `FND-CT-01` | Naturaleza multiinstitución | El producto opera como un SaaS multiinstitución. | La plataforma debe poder administrar y operar múltiples instituciones diversas sin colapsarlas en un solo contexto global. |
| `FND-CT-02` | Unidad organizacional principal | La institución diversa es la unidad organizacional principal del sistema y se identifica por RFC. | Las decisiones de acceso, operación, visibilidad y configuración deben quedar referidas a una institución concreta. |
| `FND-CT-03` | Identidad independiente del contexto institucional | La identidad personal del usuario es independiente del contexto institucional en el que opera. | Una misma cuenta puede participar en una o varias instituciones mediante permisos, sin duplicar identidad. |
| `FND-CT-04` | Contexto operativo explícito | La operación del sistema ocurre siempre desde un contexto activo institución/rol. | La experiencia y autorización no deben depender de inferencias implícitas sobre la institución o el rol vigentes. |
| `FND-CT-05` | Diferencia entre permiso y cuenta | Un permiso habilita operación potencial sobre una institución, pero no equivale por sí mismo a una cuenta autenticada. | Deben distinguirse claramente las reglas de invitación o habilitación de las reglas de autenticación y sesión. |
| `FND-CT-06` | Diferencia entre contacto y usuario | Los contactos institucionales son registros informativos y no roles operativos del sistema. | Un contacto de tipo legal o técnico no debe recibir acceso automático a la plataforma por existir como dato institucional. |
| `FND-CT-07` | Trazabilidad obligatoria | Toda operación relevante del alcance debe dejar evidencia trazable. | No deben existir mutaciones sustantivas sin registro contextual suficiente para auditoría. |
| `FND-CT-08` | Operación interna de solicitudes y hallazgos | `Requests` y `Findings` forman parte del dominio operativo del alcance 1. | Deben existir, poder gestionarse y ser utilizables en el MVP aunque la interoperabilidad real con la PUI aún no esté habilitada. |
| `FND-CT-09` | Configuración institucional sensible dentro del MVP | La configuración institucional incluye desde este alcance parámetros necesarios para interoperabilidad futura, incluido `sharedSecret`. | El sistema debe poder establecer y actualizar estos parámetros desde el alcance 1, aun cuando su uso externo productivo ocurra después. |
| `FND-CT-10` | `RFC` como identificador institucional transversal | `RFC` es el identificador estructural transversal de la institución a lo largo del producto. | Debe aparecer de forma consistente en autenticación contextual, datos, filtros, logs, rutas y relaciones entre entidades institucionales. |
| `FND-CT-11` | `FUB` como identificador transversal de solicitud | `FUB` es el identificador transversal principal de una solicitud de búsqueda a lo largo del producto. | Debe permitir correlacionar `Requests`, `Findings`, logs y vistas operativas sobre un mismo caso. |
| `FND-CT-12` | `CURP` como identificador transversal de persona relacionada con la solicitud | `CURP` es el identificador transversal de la persona asociada a solicitudes, hallazgos y trazabilidad relacionada a lo largo del producto. | Debe conservar semántica consistente entre entidades, filtros, consultas y relaciones futuras con interoperabilidad externa. |
| `FND-CT-13` | `SYSTEM_RFC` como constante de contexto del proveedor SaaS | `SYSTEM_RFC` es la constante reservada para representar el contexto sistémico del proveedor SaaS cuando opere como `SYSTEM_ADMINISTRATOR`. | Debe distinguir el dominio operativo del proveedor respecto del dominio institucional y permitir su trazabilidad sin fingir pertenencia a una institución diversa real en ningún alcance. |

---

# 4.2 Variables operativas del alcance

Las variables operativas del alcance representan estados o condiciones que cambian durante la vida del sistema y que deben ser observables, gobernables y trazables.

| Código | Variable operativa | Qué representa | Dónde impacta |
|---|---|---|---|
| `FND-VR-01` | Institución activa de sesión | La institución sobre la que el usuario opera en un momento dado. | Route guards, visibilidad, permisos, consultas, logs. |
| `FND-VR-02` | Rol activo de sesión | El rol efectivo con el que el usuario está operando. | Acciones disponibles, navegación, reglas de autorización, auditoría. |
| `FND-VR-03` | Estado de autenticación | La condición de acceso de la cuenta dentro del sistema. | Experiencia de autenticación, seguridad, eventos de identidad y acceso. |
| `FND-VR-04` | Estado del permiso | La condición de vigencia o habilitación de un permiso institucional. | Elegibilidad para crear cuenta, acceso al contexto, administración de permisos. |
| `FND-VR-05` | Estado operativo de la institución | La condición vigente de la institución dentro del SaaS. | Backoffice, operación institucional, configuración visible y decisiones administrativas. |
| `FND-VR-06` | Plan comercial vigente | El plan comercial actualmente asignado a la institución. | Capacidades habilitadas, operación comercial, trazabilidad administrativa. |
| `FND-VR-07` | Estado general de la solicitud | La situación vigente de una `Request` dentro de su ciclo de vida interno. | Tableros, filtros, reglas de operación, logs y futura interoperabilidad. |
| `FND-VR-08` | Estado por fase de la solicitud | La condición de cada fase operativa asociada a una `Request`. | Seguimiento, visualización de avance, reglas de transición, evidencia. |
| `FND-VR-09` | Estado de sincronización de hallazgo con la PUI | La condición de un `Finding` respecto de su envío o sincronización externa. | Preparación de interoperabilidad, filtros, trazabilidad y backoffice. |
| `FND-VR-10` | Vigencia de configuración institucional sensible | La versión o estado vigente de parámetros institucionales como `sharedSecret`. | Administración institucional, seguridad, auditoría y preparación para integración externa. |

---

# 4.3 Enumeraciones normativas del alcance

Las enumeraciones normativas del alcance 1 deben centralizarse y reutilizarse consistentemente en datos, reglas, interfaz, filtros, validaciones y logs. Ninguna de ellas debe resolverse mediante texto libre disperso.

| Enumeración | Valores definidos en este momento | Qué gobierna | Criterio de uso |
|---|---|---|---|
| `ROLE` | `ANONYMOUS`, `INSTITUTION_ADMIN`, `INSTITUTION_OPERATOR`, `SYSTEM_ADMINISTRATOR` | Contextos de acceso y operación del sistema. | Debe ser la referencia única para guards, visibilidad, permisos y trazabilidad de sesión. |
| `PERMISSION_STATUS` | `GRANTED`, `REVOKED`, `DENIED` | Estado de los permisos institucionales. | Debe gobernar elegibilidad operativa y conservación de historial de cambios de permisos. |
| `INSTITUTION_CONTACT_TYPE` | `LEGAL`, `TECHNICAL` | Tipología de contactos institucionales. | Debe distinguir contactos informativos sin convertirlos en roles operativos. |
| `COMMERCIAL_PLAN` | `PORTAL`, `CLOUD`, `ENTERPRISE` | Clasificación comercial de la institución dentro del SaaS. | Debe mantenerse como enumeración cerrada y extensible, no como texto libre. |
| `LOG_CATEGORIES` | `INSTITUTION_CREATION`, `INSTITUTION_PLAN_CREATION`, `INSTITUTION_PLAN_UPDATE`, `INSTITUTION_CONTACT_CREATION`, `INSTITUTION_CONTACT_UPDATE`, `INSTITUTION_SHARED_SECRET_UPDATE`, `INSTITUTION_PERMISSION_CREATION`, `INSTITUTION_PERMISSION_UPDATE`, `INSTITUTION_SEARCH_REQUEST_PHASE_CHANGE`, `INSTITUTION_SEARCH_REQUEST_PHASE_STATUS_CHANGE`, `INSTITUTION_SEARCH_REQUEST_MATCH_FOUND`, `PUI_SEARCH_REQUEST_CREATION`, `PUI_SEARCH_REQUEST_REVOCATION`, `PUI_SEARCH_REQUEST_HISTORICAL_FINISH`, `PUI_SEARCH_REQUEST_MATCH`, `PUI_SEARCH_REQUEST_API_ERROR`, `USER_ACCOUNT_CREATION`, `USER_ACCOUNT_LOGIN`, `USER_ACCOUNT_LOGOUT`, `USER_ACCOUNT_PASSWORD_RECOVERY_REQUEST`, `USER_ACCOUNT_PASSWORD_UPDATE`, `USER_ACCOUNT_MFA_REGISTER`, `USER_ACCOUNT_SETTINGS_UPDATE` | Clasificación funcional de eventos de log. | Debe permitir filtrar, agrupar y leer la trazabilidad sin ambigüedad semántica. |
| `LOG_ORIGIN` | `SYSTEM_HTTP_API_CALL`, `SYSTEM_AUTH_TRIGGER`, `SYSTEM_STORAGE_TRIGGER`, `SYSTEM_DATA_TRIGGER` | Procedencia de una acción o mutación registrada. | Debe reutilizarse como referencia transversal para distinguir si un evento provino de una API, de autenticación o de un disparador interno del sistema; no debe quedar implícita ni embebida como texto libre. En el alcance 1, `SYSTEM_STORAGE_TRIGGER` queda predefinido como valor normativo para continuidad futura, pero no se considera todavía un origen operativo activo. |
| `UPDATE_ORIGIN` | `SYSTEM`, `USER`, `PUI` | Procedencia funcional inmediata de una mutación histórica registrada dentro de `updates[]`. | Debe reutilizarse en toda entidad mutable para distinguir si la transición fue provocada por automatización interna, por acción humana dentro del producto o por información/operación proveniente de la PUI. |
| `SEARCH_REQUEST_STATUS` | `ACTIVE`, `REVOKED` | Estado macro de cada `Request`. | Debe declararse desde este alcance y reutilizarse por datos, UI, filtros y logs, aunque la recepción formal desde la PUI ocurra después. |
| `SEARCH_REQUEST_PHASE` | `SEARCH_REQUEST_BASIC_DATA`, `SEARCH_REQUEST_HISTORICAL`, `SEARCH_REQUEST_CONTINUOUS` | Fases operativas de atención de una solicitud. | Debe modelar explícitamente las fases aun cuando la ejecución real de búsquedas institucionales se habilite en un alcance posterior. |
| `SEARCH_REQUEST_PHASE_STATUS` | `PENDING`, `IN_PROGRESS`, `DONE`, `REVOKED` | Estado de cada fase de una solicitud. | Debe permitir lectura clara del avance por fase, sus transiciones y su revocación cuando aplique. |
| `FINDING_PUI_SYNC_STATUS` | `PENDING`, `PROGRESS`, `SUCCESS`, `ERROR` | Preparación y seguimiento de la interoperabilidad de `Findings`. | Debe existir desde este alcance para poblar datos, habilitar UI y dejar lista la trazabilidad de sincronización futura. |

Nota de consistencia:

| Criterio | Implicación |
|---|---|
| Catálogo cerrado | Las enumeraciones del alcance 1 no deben resolverse mediante texto libre ni reinterpretarse localmente. |
| Reutilización transversal | Una misma enumeración debe gobernar de forma consistente datos, UI, filtros, validaciones, reglas y logs. |

---

# 4.4 Reglas invariantes del alcance

Las reglas invariantes del alcance deben cumplirse siempre, independientemente de la ruta, interfaz, automatización o colección involucrada.

| Regla | Enunciado normativo | Implicación analítica |
|---|---|---|
| `FND-RG-01` | Un usuario puede tener múltiples permisos, pero solo un contexto institución/rol activo por sesión operativa. | La experiencia no debe operar en múltiples contextos simultáneos dentro de una misma sesión activa. |
| `FND-RG-02` | La autorización operativa siempre depende de la combinación usuario, institución y rol. | No deben existir decisiones de acceso basadas solo en identidad personal o solo en institución. |
| `FND-RG-03` | La existencia de un contacto institucional no concede acceso al sistema. | Deben separarse claramente los registros informativos de los mecanismos de acceso. |
| `FND-RG-04` | La creación de una cuenta requiere la existencia previa de al menos un permiso habilitante asociado al correo. | La cuenta nace sobre una relación operativa válida, no como identidad aislada sin contexto elegible. |
| `FND-RG-05` | Un correo electrónico corresponde a una sola cuenta autenticable dentro del sistema. | Debe evitarse la duplicidad de cuentas para una misma identidad de acceso. |
| `FND-RG-06` | Los permisos deben poder cambiar de estado conservando historial de cambios. | La administración de permisos requiere trazabilidad temporal y semántica. |
| `FND-RG-07` | Las instituciones deben poder administrar su configuración operativa y preparatoria desde este alcance, incluido `sharedSecret`. | La preparación institucional no puede quedar postergada a la fase de interoperabilidad real. |
| `FND-RG-08` | Las solicitudes y hallazgos pueden existir y operar internamente antes de la integración formal con la PUI. | El MVP debe ser utilizable y verificable con estas entidades dentro del propio SaaS. |
| `FND-RG-09` | La visibilidad de datos, vistas y acciones depende del rol activo y del contexto institucional activo. | La UI y el backend deben responder al contexto efectivo, no solo al usuario autenticado. |
| `FND-RG-10` | Toda acción relevante debe poder dejar evidencia trazable en logs. | La ausencia de log en una mutación relevante debe considerarse un incumplimiento del alcance. |
| `FND-RG-11` | Los logs complementan a las entidades operativas, no las sustituyen. | El modelo de datos no debe delegar el estado vigente de una entidad exclusivamente a la lectura de logs. |
| `FND-RG-12` | El sistema distingue estrictamente entre operación institucional y operación del proveedor SaaS. | El backoffice del proveedor y la aplicación institucional deben mantenerse como dominios de acceso diferenciados. |
| `FND-RG-13` | La incorporación inicial de una institución al producto y la habilitación de su plan no son acciones autoejecutables por la propia institución; corresponden al dominio operativo del proveedor SaaS. | La institución no debe poder autoaprovisionarse como cliente operativo sin intervención del dominio del proveedor. |
| `FND-RG-14` | Los logs son registros permanentes de cumplimiento y no deben eliminarse. | La trazabilidad histórica debe preservarse como evidencia continua del sistema. |

---

# 4.5 Criterios transversales de datos, cambio histórico y trazabilidad

Estos criterios deben orientar la especificación de colecciones, reglas de negocio, mutaciones, eventos y lectura operativa del alcance 1.

| Código | Criterio transversal | Exigencia normativa | Aplicación esperada |
|---|---|---|---|
| `FND-CR-01` | Propiedad operativa explícita | Toda entidad principal debe dejar claro a qué institución, usuario o dominio operativo pertenece. | `Users`, `Permissions`, `Requests`, `Findings`, `Institutions`, `Contacts`, `Logs`. |
| `FND-CR-02` | Separación entre dato vigente e historial | El estado actual de una entidad no debe confundirse con su historial de cambios. | Modelo de datos, lecturas de UI, lógica de negocio y auditoría. |
| `FND-CR-03` | Historial suficiente de mutación | Todo cambio sustantivo debe conservar, cuando aplique, fecha, actor, `UPDATE_ORIGIN` y transición entre valor previo y valor actualizado. Cuando el cambio involucre secretos o datos sensibles equivalentes, el historial no debe almacenar el valor en claro; debe conservar únicamente representaciones no reversibles de verificación, como su `SHA256`, u otros derivados seguros que no revelen el secreto. | Entidades administrativas, configuración sensible, permisos, solicitudes, hallazgos. |
| `FND-CR-04` | Reconstrucción contextual del evento | Los logs deben permitir reconstruir quién ejecutó la acción, en qué contexto, sobre qué entidad y con qué impacto. | Lectura operativa, cumplimiento, auditoría y soporte. |
| `FND-CR-05` | Consistencia de referencias institucionales y temporales | Los campos de contexto institucional y tiempo deben modelarse de manera consistente entre colecciones. | Consultas, filtros, joins lógicos, trazabilidad y reporting. |
| `FND-CR-06` | Trazabilidad de acciones humanas y automatizadas | La evidencia debe cubrir tanto acciones ejecutadas por personas como automatizaciones del sistema. | Auth, backend, Cloud Functions, procesos internos y futura interoperabilidad. |
| `FND-CR-07` | Preparación real para interoperabilidad futura | Las entidades preparatorias no deben resolverse con placeholders conceptuales si el MVP necesita operarlas. | `Requests`, `Findings`, estados de sincronización, configuración sensible institucional. |
| `FND-CR-08` | Mutación siempre atribuible | Ningún dato relevante debe actualizarse sin poder atribuir el cambio a un origen definido. | Reglas de logs, origen de cambio, lectura administrativa y auditoría. |
| `FND-CR-09` | Protección de secretos en reposo y en vistas | Los secretos institucionales, como `sharedSecret`, deben almacenarse cifrados en reposo dentro del sistema. Solo podrán descifrarse durante acciones internas que realmente los requieran y no deberán exponerse en claro en vistas, formularios, tablas, bitácoras ni interfaces dirigidas a usuarios. | Configuración institucional sensible, backend, automatizaciones, logs y frontend administrativo. |
| `FND-CR-10` | No eliminación de datos operativos | Los datos operativos del alcance no se eliminan como mecanismo ordinario; se crean, se actualizan y conservan historial cuando corresponda. | Colecciones operativas, trazabilidad, lectura histórica y cumplimiento. |
| `FND-CR-11` | Historial append-only de cambios | Las estructuras de historial deben modelarse mediante `updates[]` dentro del mismo documento de la entidad mutable. Sus elementos solo admiten incorporación de nuevos registros; no deben reescribirse ni eliminarse. Cada entrada histórica debe representar una transición atómica de negocio sobre campos mutables relevantes e incluir, como mínimo, `updateOrigin`, `updatedByUserId`, `updatedByUserRole`, `updatedByUserEmail` y `updatedAt`, dejando valores nulos o vacíos solo cuando la naturaleza del origen no permita atribución personal directa. | Entidades con historial de cambios, auditoría funcional y reconstrucción temporal. |
| `FND-CR-12` | Mutación canalizada por origen reconocible | Ningún dato relevante debe mutarse como escritura directa carente de origen; toda creación o actualización debe quedar atribuida a un `UPDATE_ORIGIN` reconocible dentro del historial funcional de la entidad, y cuando exista auditoría transversal adicional, a un `LOG_ORIGIN` consistente en la bitácora del sistema. | Reglas de escritura, backend, automatizaciones, logs y auditoría. |
| `FND-CR-13` | Enriquecimiento contextual mínimo de logs | Cuando una acción se relacione con una institución, el log debe incluir `RFC`; cuando se relacione con identidad o cuenta de usuario, el log debe incluir el correo o referencia equivalente del usuario involucrado. | Logs institucionales, logs de cuenta, soporte, filtros y cumplimiento. |

---

# 4.6 Implicación de alcance para el resto del documento

Las definiciones anteriores obligan a leer el alcance 1 bajo el siguiente criterio:

| Criterio de lectura | Consecuencia |
|---|---|
| Interoperabilidad formal diferida | Significa que aún no existen integraciones productivas con la PUI. |
| Operación interna implementada | Significa que el SaaS sí debe modelar, almacenar, visualizar y gestionar internamente las entidades necesarias para operar el MVP. |
| Preparación institucional real | Significa que la configuración sensible y los estados preparatorios deben existir desde el alcance 1 porque forman parte del uso real del producto. |
