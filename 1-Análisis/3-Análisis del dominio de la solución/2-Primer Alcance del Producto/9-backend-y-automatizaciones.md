# 9. Especificación de backend y automatizaciones
## Automatización operativa del MVP y consistencia transversal del producto

---

## 9.1 Papel del backend dentro del alcance 1

El backend del alcance 1 no debe entenderse solo como una capa técnica de exposición de servicios. Su función dentro del MVP es sostener la consistencia operativa del producto, materializar reglas de negocio que no deben depender del cliente y garantizar trazabilidad suficiente sobre identidad, permisos, instituciones, solicitudes, hallazgos y logs.

| Aspecto | Definición |
|---|---|
| Papel principal | Orquestar mutaciones, automatizaciones y validaciones que no deben confiarse exclusivamente al frontend. |
| Relación con el MVP | Hacer utilizable el SaaS aun antes de la interoperabilidad formal con la PUI. |
| Relación con los datos | Crear, actualizar y sincronizar información operativa siguiendo las reglas del modelo de datos. |
| Relación con la trazabilidad | Garantizar que toda mutación relevante tenga origen reconocible y evidencia suficiente. |

## 9.2 Tipos de Cloud Functions requeridos

El alcance 1 requiere cuatro familias de Cloud Functions, diferenciadas por el tipo de evento que las activa y por la responsabilidad operativa que asumen.

| Tipo de Cloud Function | Disparador principal | Responsabilidad dentro del alcance 1 | Relación normativa |
|---|---|---|---|
| HTTP API calls | Llamadas HTTP controladas por el producto | Materializar comandos operativos explícitos iniciados por UI o procesos del sistema. | Deben sostener reglas de autorización, mutación controlada y generación de logs. |
| Firebase Auth blocking functions | Eventos previos a creación de cuenta o consolidación de inicio de sesión | Validar gobernanza de acceso antes de que Firebase Auth consolide el evento. | Deben impedir altas o accesos incompatibles con `Permissions` o con el bootstrap de seguridad requerido. |
| Firebase Auth triggers | Eventos posteriores de creación, actualización o baja técnica de cuentas | Mantener consistencia entre autenticación, `Users`, permisos y eventos de identidad. | Deben traducir eventos de Auth a estado operativo del producto. |
| Firestore triggers | Eventos de escritura relevantes sobre colecciones del sistema | Completar automatizaciones derivadas de cambios de datos, normalización, enriquecimiento y trazabilidad. | Deben preservar consistencia entre entidades y evitar escrituras huérfanas de contexto. |

Las automatizaciones asociadas a Storage quedan fuera del alcance 1 y se reservan para los alcances 3 y 4, cuando existan archivos o artefactos enviados como parte de la respuesta a solicitudes de búsqueda.

## 9.3 Responsabilidad analítica por tipo de función

### 9.3.1 HTTP API calls

Las funciones HTTP representan operaciones de negocio invocadas de forma deliberada por el producto.

| Criterio | Exigencia |
|---|---|
| Naturaleza | Deben ejecutar acciones explícitas del producto y no solo actuar como acceso genérico a base de datos. |
| Semántica HTTP de consulta | Las funciones orientadas a obtención de datos deben modelarse preferentemente como operaciones idempotentes usando `GET`. |
| Modelado de recursos | La identidad del recurso, su jerarquía contextual y los identificadores relevantes deben resolverse mediante segmentos de URL. |
| Variabilidad de lectura | Paginación, límites, filtros, rangos temporales y demás parámetros de consulta deben resolverse mediante `query params`. |
| Semántica HTTP de mutación | Las funciones orientadas a creación o mutación de estado deben modelarse preferentemente mediante `POST`. |
| Autorización | Deben validar contexto activo, rol y pertenencia institucional cuando la operación lo requiera. |
| Mutación | Deben crear o actualizar entidades conforme a las reglas del alcance y al uso de `updates[]`. |
| Trazabilidad | Deben registrar su origen sistémico y dejar evidencia suficiente en `Logs`. |

### 9.3.2 Firebase Auth blocking functions

Las funciones bloqueantes de Firebase Auth deben ejecutar validaciones previas al alta o al inicio de sesión, antes de que el evento técnico quede consolidado.

| Criterio | Exigencia |
|---|---|
| Naturaleza | Deben expresar reglas previas del producto y no simple enriquecimiento posterior. |
| Validación previa de cuenta | Deben impedir la creación de cuentas sin `Permission` activo para el correo autenticado. |
| Validación previa de acceso | Deben impedir o condicionar el ingreso cuando el permiso habilitante ya no es válido o cuando la habilitación mínima de seguridad aún no está completa. |
| Dependencia de plataforma | Deben entenderse como capacidad asociada a `Firebase Authentication with Identity Platform`. |

### 9.3.3 Firebase Auth triggers

Las funciones disparadas por Firebase Auth deben materializar la traducción entre una cuenta autenticable y su representación operativa en el SaaS.

| Criterio | Exigencia |
|---|---|
| Consistencia con `Users` | Deben asegurar que la cuenta autenticable tenga contraparte operativa cuando corresponda. |
| Consistencia con permisos | Deben respetar que la creación de cuenta depende de permisos habilitantes previos. |
| Consistencia de identidad | Deben preservar unicidad lógica de la cuenta por correo y su trazabilidad de acceso. |
| Evidencia operativa | Deben producir eventos de log de cuenta, autenticación, recuperación y seguridad cuando aplique. |

### 9.3.4 Firestore triggers

Las funciones disparadas por cambios en Firestore deben encargarse de automatizaciones derivadas del modelo de datos.

| Criterio | Exigencia |
|---|---|
| Naturaleza | Deben reaccionar a mutaciones relevantes del dominio y no duplicar innecesariamente lógica del cliente. |
| Consistencia de entidades | Deben conservar relaciones entre `Users`, `Permissions`, `Institutions`, `Requests`, `Findings`, `Contacts` y `Logs`. |
| Historial embebido | Deben respetar la semántica append-only de `updates[]` y su atribución mínima. |
| Trazabilidad | Deben registrar el origen sistémico de la automatización cuando produzcan efectos observables. |

## 9.4 Relación entre funciones, datos y logs

Las Cloud Functions del alcance 1 no deben tratarse como piezas aisladas. Cada tipo de función existe para proteger una relación específica entre operación, persistencia y evidencia.

| Relación | Qué debe garantizar el backend |
|---|---|
| Función → dato vigente | La mutación principal debe dejar el estado actual correcto en la entidad correspondiente. |
| Función → historial embebido | Cuando la entidad sea mutable, la transición debe reflejarse en `updates[]` con atribución mínima suficiente. |
| Función → log | Toda operación relevante debe dejar evidencia transversal en `Logs`. |
| Función → correlación técnica | Cuando exista identificador de ejecución trazable, los logs funcionales derivados deben compartir `originTraceId` para permitir depuración profunda y reconstrucción de la cadena de efectos. |
| Función → contexto | La mutación y su evidencia deben conservar institución, rol, identidad u origen sistémico cuando aplique. |

## 9.5 Criterios transversales para automatizaciones

| Criterio | Implicación para backend |
|---|---|
| Origen reconocible | Ninguna automatización debe producir cambios huérfanos de `UPDATE_ORIGIN` o `LOG_ORIGIN` cuando aplique. |
| Correlación entre trazabilidad funcional y técnica | Las automatizaciones trazables deben poder propagar un `originTraceId` común hacia los logs funcionales que produzcan. |
| No dependencia del cliente para reglas críticas | Validaciones, consistencia y trazabilidad relevantes no deben delegarse exclusivamente al frontend. |
| Semántica consistente de interfaces HTTP | Las operaciones de lectura deben privilegiar `GET` idempotente y las operaciones que generan mutación deben privilegiar `POST`, con separación clara entre identificadores en URL y variabilidad de consulta en `query params`. |
| Consumo selectivo de capacidades nativas de Auth | Login, logout, recuperación y actualización de credenciales no deben reimplementarse innecesariamente en backend cuando Firebase Auth ya provee el mecanismo base. |
| Uso explícito de `Identity Platform` donde aplique | `MFA` obligatorio y validaciones bloqueantes previas deben asumirse como parte del stack efectivo del alcance 1. |
| Seguridad de datos sensibles | Secretos y datos sensibles no deben exponerse en claro durante automatizaciones ni en su evidencia. |
| Preparación para interoperabilidad futura | El backend debe dejar preparado el producto para integrar PUI después, sin requerir rehacer el modelo operativo interno. |

## 9.6 Implicación analítica para el resto del alcance

| Criterio de lectura | Consecuencia |
|---|---|
| Backend como garante de coherencia | El modelo de datos y la identidad no deben leerse como definiciones pasivas; requieren automatización para sostenerse. |
| Automatización como parte del producto | Las Cloud Functions del alcance 1 son capacidad funcional del MVP, no solo detalle de infraestructura. |
| Trazabilidad obligatoria | La sección 9 debe leerse siempre en continuidad con fundamentos, identidad y modelo de datos. |
