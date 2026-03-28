# 12. Riesgos, supuestos y decisiones abiertas
## Cierre analítico del alcance 1 desde incertidumbre, exposición y pendientes de definición

---

## 12.1 Propósito de la sección

La sección 12 consolida aquello que el alcance 1 asume como válido, aquello que puede comprometer su éxito y aquello que aún requiere cierre analítico posterior.

| Componente | Propósito dentro del alcance 1 |
|---|---|
| Supuestos aceptados | Hacer explícitas las condiciones bajo las que el alcance 1 se considera viable. |
| Riesgos del alcance | Identificar exposiciones que pueden degradar utilidad, coherencia o seguridad del MVP. |
| Decisiones abiertas | Delimitar los temas que todavía conviene cerrar antes de fases posteriores o antes de implementación detallada. |

## 12.2 Supuestos aceptados del alcance 1

Los siguientes supuestos se consideran aceptados para poder leer el alcance 1 como un MVP utilizable.

| ID | Supuesto aceptado | Implicación dentro del alcance 1 |
|---|---|---|
| `SUP-01` | La interoperabilidad formal con la PUI todavía no existe, pero el producto debe operar internamente `Requests` y `Findings`. | El MVP se valida por su operación interna, no por integración externa productiva. |
| `SUP-02` | La incorporación inicial de instituciones depende del dominio del proveedor SaaS. | El producto no contempla autoaprovisionamiento institucional libre en este alcance. |
| `SUP-03` | La autenticación se resuelve mediante Firebase Auth con `MFA` obligatorio, lo que implica asumir `Firebase Authentication with Identity Platform` como parte efectiva del stack del alcance. | El alcance no introduce un mecanismo propio de autenticación independiente, pero sí asume las capacidades ampliadas necesarias para `MFA` y validaciones bloqueantes. |
| `SUP-04` | El correo es la identidad operativa base de acceso y correlación con permisos. | La gobernanza de acceso depende de la estabilidad del correo como identificador. |
| `SUP-05` | Una persona usuaria puede tener múltiples permisos, pero solo un contexto institución/rol activo por sesión. | La experiencia se construye sobre una única resolución operativa vigente a la vez. |
| `SUP-06` | El historial funcional relevante se conserva dentro de cada entidad mutable mediante `updates[]`. | El alcance no introduce una colección genérica transversal de actualizaciones como fuente primaria de historial. |
| `SUP-07` | Los logs son obligatorios como evidencia transversal del sistema. | La trazabilidad no es opcional ni pospuesta a un alcance posterior. |
| `SUP-08` | Los secretos institucionales, como `sharedSecret`, existen desde este alcance como configuración real. | El MVP debe ser capaz de administrarlos sin exponerlos en claro. |
| `SUP-09` | El frontend del alcance 1 se organiza como `WebApp` en Firebase Hosting con comportamiento de `PWA`. | La experiencia debe leerse como un único cliente con dominios diferenciados, no como micrositios desconectados. |
| `SUP-10` | El backend es responsable de sostener validaciones, mutaciones, automatizaciones y trazabilidad críticas. | El alcance no confía estas reglas exclusivamente al cliente. |
| `SUP-11` | El alcance 1 no implementa artefactos ni automatizaciones de Storage. | El uso de archivos en respuestas a solicitudes de búsqueda queda diferido a los alcances 3 y 4. |
| `SUP-12` | El dashboard institucional ya tiene criterio de cálculo funcional cerrado. | La vista debe tomar el 100% de solicitudes como universo, distribuir por estatus y fase, y resumir por estatus de fase con cantidad y porcentaje. |
| `SUP-13` | Las interfaces de búsqueda de logs deben ser uniformes en todo el producto. | La variación entre vistas de logs se resuelve por filtros fijos de contexto, no por experiencias radicalmente distintas. |
| `SUP-14` | El dominio `/error` del alcance 1 queda acotado a tres estados explícitos. | La experiencia de error del MVP se limita, por el momento, a `403`, `404` y `500`. |

## 12.3 Riesgos principales del alcance 1

Los siguientes riesgos no invalidan el alcance 1, pero sí pueden comprometer su utilidad, coherencia o seguridad si no se gestionan explícitamente.

| ID | Riesgo | Impacto potencial sobre el MVP | Mitigación analítica esperada |
|---|---|---|---|
| `RSG-01` | Ambigüedad entre operación interna y falsa promesa de interoperabilidad real con la PUI | Puede generar expectativas incorrectas sobre el estado del producto. | Mantener explícita en todo el alcance la diferencia entre operación interna utilizable e interoperabilidad externa diferida. |
| `RSG-02` | Inconsistencia entre Firebase Auth, `Users` y `Permissions` | Puede permitir autenticación sin operación válida o producir usuarios incoherentes. | Mantener triggers, reglas de acceso y lectura de contexto alineados. |
| `RSG-03` | Pérdida de coherencia entre ruta, rol y contexto activo | Puede abrir vistas incorrectas o bloquear experiencia legítima. | Sostener route guards y resolución estricta del contexto activo. |
| `RSG-04` | Subespecificación de `Requests` y `Findings` por ausencia de integración real externa | Puede producir una implementación demasiado superficial para validar el MVP. | Mantener modelo de datos, historias, frontend y backend operables aun sin integración real. |
| `RSG-05` | Manejo inadecuado de datos sensibles institucionales | Puede exponer secretos o degradar la seguridad del producto. | Mantener cifrado en reposo, no exposición en vistas y uso restringido en automatizaciones. |
| `RSG-06` | Historial embebido incompleto o sin atribución suficiente | Puede volver opaca la evolución de entidades mutables. | Exigir `updates[]` con `updateOrigin`, atribución mínima y semántica append-only. |
| `RSG-07` | Logs insuficientes o no correlacionables | Puede dificultar auditoría, soporte e investigación de incidentes. | Mantener `LOG_ORIGIN`, enriquecimiento contextual y `originTraceId` cuando exista ejecución trazable. |
| `RSG-08` | Divergencia entre backoffice del proveedor y operación institucional | Puede mezclar visibilidades, permisos y responsabilidades de dominios distintos. | Mantener separados `/admin`, `/app` y sus reglas de acceso. |
| `RSG-09` | Crecimiento prematuro de alcance por querer anticipar toda la integración futura con la PUI | Puede volver inmanejable el MVP y retrasar validación real del producto. | Seguir delimitando el alcance 1 como base operativa preparada, no como solución final completa. |
| `RSG-10` | Dependencia excesiva del cliente para reglas críticas | Puede permitir inconsistencias entre UI, datos y trazabilidad. | Reservar al backend la autoridad sobre validaciones, mutaciones y evidencia relevante. |
| `RSG-11` | Subestimación del costo operativo asociado a `Identity Platform` y al uso de factores que se cobran por mensaje | Puede volver engañosa la lectura económica del MVP si se asume que toda autenticación avanzada conserva el mismo costo base. | Mantener explícito que `MFA` obligatorio y factores telefónicos pueden introducir costo variable por uso y deben evaluarse desde planeación operativa. |

## 12.4 Decisiones abiertas del alcance

Por el momento, el alcance 1 ya no conserva decisiones abiertas de primer nivel que bloqueen la precisión analítica del MVP.

## 12.5 Criterios de lectura de riesgos, supuestos y decisiones

| Criterio de lectura | Consecuencia |
|---|---|
| Un supuesto aceptado no es una incertidumbre residual. | Debe leerse como base vigente del alcance, salvo que se reabra explícitamente. |
| Un riesgo no equivale a una falla actual. | Representa exposición potencial que debe gestionarse mediante diseño, reglas y trazabilidad. |
| Una decisión abierta no invalida el análisis ya cerrado. | Delimita puntos donde aún conviene reservar definición fina sin romper el alcance actual. |
| La sección 12 no sustituye la delimitación del alcance. | Debe leerse en continuidad con fundamentos, dependencias internas y relaciones con alcances posteriores. |

## 12.6 Implicación analítica para el resto del alcance

| Criterio | Implicación |
|---|---|
| El alcance 1 ya tiene decisiones estructurales sólidas. | La mayoría de los elementos críticos del MVP ya no deben tratarse como pendientes conceptuales. |
| Los riesgos del MVP se concentran más en coherencia y ejecución que en falta de modelo. | El trabajo posterior debe enfocarse en aterrizar correctamente lo ya definido. |
| Las decisiones abiertas de primer nivel han quedado resueltas. | El producto ya tiene forma operativa suficiente para seguir avanzando hacia especificación técnica más fina sin depender de pendientes analíticos mayores. |
