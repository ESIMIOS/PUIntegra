# 11. Dependencias internas del alcance
## Relaciones de dependencia que sostienen la coherencia funcional del MVP

---

## 11.1 Propósito de la sección

La sección 11 no redefine capacidades del alcance 1. Su función es mostrar qué piezas del MVP dependen de otras para poder operar con coherencia.

| Propósito | Alcance de lectura |
|---|---|
| Explicitar dependencias internas | Mostrar qué capacidades requieren otras capacidades previas o concurrentes para existir operativamente. |
| Evitar lecturas aisladas del alcance | Recordar que frontend, backend, identidad, datos y trazabilidad no funcionan como bloques independientes. |
| Identificar cadenas críticas del MVP | Hacer visibles los puntos donde una falla conceptual o funcional rompe varias capacidades a la vez. |

## 11.2 Dependencias estructurales entre capacidades

Las capacidades principales del alcance 1 mantienen relaciones de dependencia que deben leerse como estructura interna del producto.

| Capacidad dependiente | Depende de | Tipo de dependencia | Consecuencia si la dependencia falla |
|---|---|---|---|
| Creación de cuenta | `Permissions`, identidad y acceso | Habilitación previa | No puede existir alta válida de cuenta sin permiso habilitante asociado al correo. |
| Operación institucional en `/app` | Identidad y acceso, `Users`, `Permissions`, contexto activo | Autorización operativa | La persona usuaria puede autenticarse, pero no operar institucionalmente. |
| Selección de contexto activo | `Users`, `Permissions`, frontend y stores | Resolución de sesión | La sesión autenticada no puede convertirse en experiencia operativa útil. |
| Dashboard institucional | Contexto activo, `Requests`, frontend y backend | Lectura agregada | La vista pierde valor si no existe consistencia entre datos, filtros y autorización. |
| Administración de permisos | `Permissions`, backend, logs y reglas de acceso | Gobernanza de acceso | La operación institucional futura queda incoherente o insegura. |
| Configuración institucional sensible | `Institutions`, backend, seguridad de datos y logs | Seguridad y consistencia | El producto pierde preparación real para interoperabilidad futura. |
| Operación de solicitudes | `Requests`, contexto institucional, backend y trazabilidad | Núcleo operativo | El SaaS no sostiene la operación interna principal del alcance. |
| Operación de hallazgos | `Findings`, `Requests`, backend y trazabilidad | Continuidad del flujo operativo | Se rompe la preparación interna del flujo de búsqueda y respuesta. |
| Consulta de logs | `Logs`, categorías, contexto y guards | Evidencia transversal | El MVP pierde capacidad de auditoría y diagnóstico. |
| Backoffice del proveedor | `Institutions`, `Requests`, `Contacts`, `Logs` y roles | Supervisión transversal | El proveedor no puede incorporar ni supervisar instituciones de forma coherente. |

## 11.3 Dependencias entre identidad, permisos y sesión

La cadena de acceso del alcance 1 depende de una secuencia estricta de capacidades.

| Elemento | Requiere | Resultado que habilita |
|---|---|---|
| Correo autorizado | Existencia previa de un permiso habilitante | Posibilidad de crear una cuenta válida. |
| Cuenta autenticable | Firebase Auth y reglas de identidad del producto | Posibilidad de iniciar sesión. |
| Usuario operativo | Materialización en `Users` de la cuenta autenticable | Posibilidad de existir operativamente dentro del SaaS. |
| Permiso institucional vigente | Relación válida entre correo, institución, rol y estado | Posibilidad de seleccionar contexto operativo. |
| Contexto activo de sesión | Selección explícita de institución y rol vigentes | Posibilidad de navegar y operar en `/app` o en dominios protegidos. |
| Guard de navegación coherente | Validación entre ruta, rol y contexto | Posibilidad de sostener experiencia autorizada sin fugas de visibilidad. |

## 11.4 Dependencias entre frontend, backend y modelo de datos

El alcance 1 depende de una traducción consistente entre experiencia, automatizaciones y persistencia.

| Capa o artefacto | Depende de | Consecuencia analítica |
|---|---|---|
| Layouts y rutas | Roles, contexto activo y guards | La estructura de navegación solo tiene sentido si refleja el modelo de acceso real. |
| Stores del frontend | Identidad autenticada y contexto institucional activo | El cliente necesita estado compartido para sostener continuidad operativa. |
| HTTP API calls | Reglas del dominio, autorización y modelo de datos | Las vistas no deben mutar ni consultar datos críticos de forma libre desde cliente. |
| Triggers de Auth | Firebase Auth, `Users`, logs y reglas de acceso | La autenticación debe traducirse a operación real y evidencia. |
| Triggers de Firestore | Entidades mutables, `updates[]` y logs | Los cambios de datos deben conservar estado actual, historial y trazabilidad. |
| Logs funcionales | Mutaciones del backend, identidad y contexto | La auditoría depende de que las automatizaciones produzcan evidencia suficiente. |

## 11.5 Dependencias entre entidades del modelo de datos

Las colecciones del alcance 1 no deben leerse como entidades aisladas.

| Entidad | Depende analíticamente de | Razón de dependencia |
|---|---|---|
| `Users` | Firebase Auth y `Permissions` | La persona usuaria operativa nace de la autenticación, pero su utilidad depende de permisos válidos. |
| `Permissions` | `Institutions` y reglas de rol | El permiso siempre se interpreta dentro de una institución y un rol concretos. |
| `Requests` | `Institutions` y contexto institucional | Toda solicitud pertenece al ámbito operativo de una institución diversa. |
| `Findings` | `Requests`, `Institutions` y contrato futuro con PUI | El hallazgo se interpreta como resultado relacionado con una solicitud concreta y una institución concreta. |
| `Institutions` | Gobernanza del proveedor SaaS | La institución no se incorpora por autoalta libre, sino por provisión controlada. |
| `Contacts` | `Institutions` | Los contactos existen como datos institucionales, no como identidades operativas autónomas. |
| `Logs` | Identidad, backend, entidades operativas y contexto | La bitácora transversal depende del resto del sistema para tener contenido útil y atribuible. |

## 11.6 Dependencias entre historial embebido y auditoría transversal

El alcance 1 utiliza dos mecanismos de trazabilidad complementarios y dependientes entre sí.

| Mecanismo | Depende de | Papel dentro del MVP | Qué se rompe si falta |
|---|---|---|---|
| `updates[]` | Entidad mutable, reglas de mutabilidad y atribución mínima | Conserva historial funcional de cambios atómicos sobre la entidad. | Se pierde la lectura histórica de la evolución del dato. |
| `Logs` | Backend, eventos de identidad, mutaciones operativas y categorías de log | Conserva evidencia transversal y de auditoría del sistema. | Se pierde la reconstrucción global de acciones, orígenes e impactos. |
| `originTraceId` en `Logs` | Ejecuciones trazables del backend | Permite correlacionar evidencia funcional con artefactos técnicos. | Se dificulta la depuración profunda y la reconstrucción técnica de incidentes. |
| `updateOrigin` en `updates[]` | Origen reconocible de la mutación | Permite distinguir si el cambio provino de sistema, usuario o PUI. | El historial funcional pierde atribución suficiente. |

## 11.7 Cadenas críticas de operación del MVP

Algunas capacidades del alcance 1 solo pueden leerse correctamente como cadenas completas y no como funciones aisladas.

| Cadena crítica | Secuencia mínima esperada |
|---|---|
| Alta de acceso | `Permissions` habilitante → creación de cuenta → `Users` → login → selección de contexto activo → navegación autorizada |
| Operación institucional | contexto activo → `/app/[RFC]` → dashboard o vista operativa → lectura o mutación controlada por backend → `updates[]` → `Logs` |
| Administración institucional | `INSTITUTION_ADMIN` → `/app/[RFC]/admin/*` → mutación controlada → resguardo de datos sensibles → historial embebido → evidencia en logs |
| Supervisión del proveedor | `SYSTEM_ADMINISTRATOR` → `/admin/*` → consulta o incorporación institucional → consistencia de datos → trazabilidad global |
| Trazabilidad profunda | mutación relevante → log funcional con `LOG_ORIGIN` → correlación opcional con `originTraceId` → depuración técnica y auditoría |

## 11.8 Implicación analítica para el resto del alcance

| Criterio de lectura | Consecuencia |
|---|---|
| El MVP es una red de dependencias, no un inventario de módulos aislados. | Las secciones 4 a 10 deben leerse como partes de una misma estructura operativa. |
| La identidad es la puerta de entrada, no el sistema completo. | Sin permisos, contexto activo, frontend coherente y backend consistente, la autenticación no produce operación real. |
| El modelo de datos no basta por sí mismo. | Las entidades requieren rutas, automatizaciones, historial y logs para tener sentido dentro del producto. |
| La trazabilidad no es un complemento opcional. | Historial embebido y logs son dependencias internas del MVP y no solo anexos de auditoría. |
