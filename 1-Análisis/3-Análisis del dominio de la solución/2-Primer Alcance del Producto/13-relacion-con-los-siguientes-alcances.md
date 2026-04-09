# 13. Relación con los siguientes alcances
## Qué deja preparado el alcance 1 para la evolución posterior del producto

---

## 13.1 Propósito de la sección

La sección 13 debe leerse como la relación de continuidad entre el alcance 1 y los alcances posteriores del producto. No define aún dichos alcances en detalle, pero sí explicita qué base deja lista el MVP para que puedan existir sin rehacer su estructura principal.

| Propósito | Alcance de lectura |
|---|---|
| Delimitar continuidad evolutiva | Mostrar qué queda preparado para que los siguientes alcances puedan desarrollarse sobre una base coherente. |
| Evitar sobrelectura del alcance 1 | Aclarar qué preparación ya existe y qué todavía no forma parte del MVP actual. |
| Conservar trazabilidad entre etapas | Permitir que la evolución futura se apoye en definiciones ya cerradas de identidad, datos, backend, frontend y trazabilidad. |

## 13.2 Relación con el segundo alcance del producto

El segundo alcance se orienta a la autenticación técnica con la PUI y a la recepción formal de solicitudes desde la plataforma externa. El alcance 1 no implementa esa interoperabilidad productiva, pero sí deja lista la base que la vuelve abordable.

| Elemento preparado en alcance 1 | Cómo habilita el alcance 2 |
|---|---|
| Configuración institucional sensible, incluido `sharedSecret` | Permite que la autenticación técnica futura con la PUI no parta de cero en el modelo institucional. |
| Operación interna de `Requests` | Permite que la recepción formal de solicitudes externas se conecte contra una entidad ya existente y operable. |
| Enumeraciones de estados y fases de solicitud | Permite que las solicitudes recibidas desde la PUI aterricen sobre una semántica interna ya definida. |
| `Logs`, `LOG_ORIGIN` y `originTraceId` | Permiten que la futura interoperabilidad quede trazable desde el inicio. |
| Backend con familias de Cloud Functions ya clasificadas | Permite ubicar con claridad las automatizaciones de autenticación y recepción formal dentro de la arquitectura del producto. |
| Frontend institucional y backoffice ya diferenciados | Permite que la llegada de solicitudes reales encuentre una experiencia de lectura y supervisión ya organizada. |

## 13.3 Relación con el tercer alcance del producto

El tercer alcance se orienta a la implementación de búsquedas en bases de datos y sistemas de instituciones diversas. El alcance 1 no ejecuta aún búsquedas reales, pero sí deja lista la estructura que permitirá operar y seguir esas búsquedas.

| Elemento preparado en alcance 1 | Cómo habilita el alcance 3 |
|---|---|
| `Requests` con estado general y estado por fase | Permite que la futura ejecución de búsquedas se exprese sobre un ciclo de vida ya modelado. |
| `Findings` como entidad interna ya operable | Permite que los resultados de búsqueda tengan una entidad receptora ya definida. |
| Dashboard, detalle de request y logs institucionales | Permiten que la ejecución futura de búsquedas tenga superficies de lectura y seguimiento ya previstas. |
| Separación entre contexto institucional y dominio del proveedor | Permite que la ejecución operativa y la supervisión global de búsquedas se mantengan diferenciadas. |
| `updates[]` embebido en entidades mutables | Permite conservar transición histórica de estados y resultados durante la operación real de búsquedas. |
| Criterios de backend y automatización | Permiten ubicar la futura ejecución de búsquedas como parte del producto y no como scripts aislados. |

## 13.4 Relación con el cuarto alcance del producto

El cuarto alcance se orienta al envío formal de respuestas y hallazgos hacia la PUI. El alcance 1 no realiza ese envío productivo, pero sí deja lista la preparación para que los hallazgos internos evolucionen hacia respuesta externa formal.

| Elemento preparado en alcance 1 | Cómo habilita el alcance 4 |
|---|---|
| `Findings` ya existentes dentro del SaaS | Permite que la respuesta formal futura no requiera crear desde cero la entidad de hallazgo. |
| `FINDING_PUI_SYNC_STATUS` | Permite seguir la futura sincronización o envío hacia la PUI con una semántica ya prevista. |
| Reglas de seguridad sobre datos sensibles y configuración institucional | Permiten que el envío futuro se construya sobre bases de resguardo ya definidas. |
| Trazabilidad transversal del sistema | Permite que la emisión futura de respuestas quede auditada y correlacionada con el resto del flujo. |
| Relación entre `Requests`, `Findings` y `Logs` | Permite que la respuesta externa pueda reconstruirse como continuidad de un caso ya identificado por `FUB`, `RFC` y contexto operativo. |

## 13.5 Qué no deja resuelto el alcance 1 para los siguientes alcances

Preparar la evolución no equivale a implementarla.

| Límite del alcance 1 | Consecuencia para los alcances posteriores |
|---|---|
| No existe autenticación técnica real con la PUI | El alcance 2 aún debe definir contratos, validaciones y automatizaciones específicas de interoperabilidad. |
| No existe recepción formal productiva de solicitudes desde la PUI | El alcance 2 aún debe definir la entrada externa real y su traducción operativa. |
| No existe ejecución real de búsquedas sobre sistemas institucionales | El alcance 3 aún debe definir conectividad, ejecución y correlación de búsquedas. |
| No existe envío formal productivo de hallazgos hacia la PUI | El alcance 4 aún debe definir estructura de respuesta, reglas de emisión y trazabilidad externa. |

## 13.6 Criterio de continuidad entre alcances

La evolución del producto debe conservar continuidad semántica, no solo continuidad técnica.

| Criterio | Implicación |
|---|---|
| Continuidad de identidad y contexto | Los siguientes alcances deben respetar la separación entre cuenta, permiso, rol e institución activa. |
| Continuidad del modelo de datos | Los siguientes alcances deben extender `Requests`, `Findings`, `Institutions`, `Logs` y demás entidades sin romper su semántica ya fijada. |
| Continuidad de trazabilidad | Toda nueva interoperabilidad o automatización debe integrarse a la evidencia funcional y técnica ya definida. |
| Continuidad de experiencia | Las nuevas capacidades deben integrarse a los dominios de navegación ya establecidos, evitando rehacer la estructura del cliente. |
| Continuidad de delimitación | Cada alcance posterior debe construir sobre la base del alcance 1 sin convertirlo retroactivamente en un producto distinto. |

## 13.7 Implicación analítica para el cierre del alcance 1

| Criterio de lectura | Consecuencia |
|---|---|
| El alcance 1 no es un prototipo aislado. | Debe entenderse como la base operativa del producto completo. |
| El alcance 1 no implementa aún la interoperabilidad total. | Su valor consiste en dejar el producto utilizable y estructuralmente preparado. |
| Los siguientes alcances dependen de lo aquí definido. | La calidad del modelo de identidad, datos, frontend, backend y trazabilidad del alcance 1 condiciona la evolución posterior. |
