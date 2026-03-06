# Análisis del Manual Técnico – Plataforma Única de Identidad (PUI) para Instituciones Diversas

Documento:
Manual Técnico de la Solución Tecnológica para Instituciones Diversas.

Publicación:
Diario Oficial de la Federación – 23 de enero de 2026.

Objetivo del análisis:
Identificar las disposiciones del Manual Técnico que forman parte del dominio técnico, funcional, operativo y de seguridad de la Plataforma Única de Identidad (PUI), específicamente en lo relativo a la integración de instituciones diversas.

---

# Tabla de disposiciones relacionadas con la PUI

| Referencia | Tema | Disposición relevante | Implicación para la PUI |
|---|---|---|---|
| Introducción | Finalidad del manual | El Manual determina requisitos, procesos, intercambio de información, interconexión, gestión y trazabilidad para el desarrollo y operación de la PUI por parte de instituciones diversas. | El documento aterriza técnicamente las obligaciones de integración privada derivadas de los Lineamientos. |
| Introducción | Función operativa de la PUI | La PUI habilita un servicio web orientado a la ingesta de nuevos casos y a la notificación inmediata de coincidencias a autoridades de búsqueda e investigación. | La plataforma opera como un mecanismo de interoperabilidad y orquestación de casos y coincidencias. |
| Introducción | Condición material de consulta | Las instituciones diversas brindarán información respecto de personas que tengan asignado un Folio Único de Búsqueda del RNPDNO y, en su caso, número de carpeta de investigación. | La activación de consultas no es libre; está asociada a casos formales de desaparición o no localización. |
| Objetivo 1 | Intercambio controlado de información | El intercambio de información mediante servicios web tiene como finalidad exclusiva apoyar acciones de búsqueda y localización de personas desaparecidas o no localizadas. | Limita el uso del canal técnico a una finalidad legal específica. |
| Objetivo 2 | Consulta de reportes activos | Debe existir un endpoint para consultar reportes activos de personas desaparecidas y no localizadas. | La integración no solo recibe eventos; también puede consultar el estado de reportes activos. |
| Objetivo 3 | Reporte de hallazgos | Debe existir un endpoint para reportar coincidencias o información relevante que contribuya a la búsqueda. | La institución diversa tiene un deber activo de notificación de hallazgos. |
| Objetivo 4 | Tipos de búsqueda | Deben desarrollarse procesos diferenciados para búsqueda de datos básicos, búsqueda histórica y búsqueda continua. | El modelo de búsqueda se divide en tres fases funcionales obligatorias. |
| Def. 5 | Búsqueda continua (fase 3) | Consulta periódica automatizada sobre entradas nuevas o modificadas para detectar coincidencias con personas desaparecidas. | La fase 3 es persistente, automatizada y orientada a cambios futuros, no solo a datos existentes. |
| Def. 6 | Búsqueda histórica (fase 2) | Consulta sobre la base institucional desde la fecha de desaparición hasta el presente, con límite de 12 años si la desaparición es más antigua. | La fase 2 tiene una ventana temporal definida y acotada. |
| Def. 7 | Búsqueda para completar datos básicos (fase 1) | Consulta automatizada que devuelve los valores más recientes disponibles de los campos básicos para complementar la ficha. | La fase 1 tiene finalidad de enriquecimiento inicial del caso. |
| Def. 14 | ID de búsqueda | El ID de búsqueda es el FUB del RNPDNO al que se agrega un UUID4 para asegurar unicidad. | El identificador técnico del caso deriva explícitamente del FUB; no es arbitrario ni interno de la institución. |
| Def. 19 | PUI | La PUI es la fuente primaria de consulta permanente y en tiempo real que se interconectará con bases de datos o sistemas que permitan búsquedas continuas entre registros. | Confirma el rol de la PUI como mecanismo de consulta y correlación distribuida. |
| Def. 23 | RNPDNO | Se define como la base nacional que concentra información de personas desaparecidas y no localizadas, administrada por la CNB. | El RNPDNO es la fuente registral primaria del caso que se proyecta a la PUI. |
| Def. 29 | UUID4 | UUID versión 4 concatenado con el FUB para ser usado en conjunto como identificador del caso dentro de la plataforma. | Evita colisiones y permite unicidad técnica del ID de búsqueda. |
| Datos Generales del Sistema | Seguridad de la comunicación | La comunicación se realiza a través de API con autenticación por Bearer token, firmado/validado de JSON de respuesta y uso de TLS. | La integración debe diseñarse como consumo y exposición de APIs seguras. |
| Flujo 1 | Inicio del caso | La CNB o las Comisiones Locales de Búsqueda reciben un reporte y lo registran en el RNPDNO; dichos reportes deberán acompañarse del número de carpeta de investigación correspondiente. | El ciclo técnico inicia desde un reporte formal registrado, no desde una consulta espontánea. |
| Flujo 2 | Reenvío automático a PUI | Una vez registrado, el reporte es reenviado automáticamente del RNPDNO a la PUI. | La PUI es consumidora del registro formal del caso. |
| Flujo 3 | Activación a instituciones | La PUI envía una notificación a todas las instituciones diversas integradas a su endpoint `/activar-reporte`; los campos `id` y `curp` estarán siempre presentes. | La activación técnica mínima exige siempre un ID de búsqueda y una CURP. |
| Flujo 4.a | Fase 1 | La institución debe buscar los datos más recientes disponibles para complementar datos básicos y notificar coincidencias con `fase_busqueda = "1"`. | La fase 1 es una búsqueda inmediata de datos básicos y solo reporta si hay algo que completar. |
| Flujo 4.b | Fase 2 | La institución debe realizar una búsqueda histórica desde la fecha de desaparición hasta la fecha actual, con límite máximo de 12 años. | La fase 2 depende de fecha de desaparición y tiene una regla temporal obligatoria. |
| Flujo 4.b | Omisión de fase 2 | Si la fecha de desaparición no está presente, debe considerarse la fecha actual y omitirse la fase 2. | Sin fecha de desaparición no procede búsqueda histórica real. |
| Flujo 4.b | Cierre de fase 2 | Una vez concluidas las fases 1 y 2, la institución debe reportar la finalización de la búsqueda histórica mediante `/busqueda-finalizada`, haya o no coincidencias. | El cierre de la fase histórica es un evento obligatorio e independiente del resultado. |
| Flujo 4.c | Fase 3 | La institución debe integrar el registro al sistema de búsqueda continua y revisar periódicamente registros nuevos o modificados, notificando coincidencias con `fase_busqueda = "3"`. | La fase 3 exige persistencia del caso y monitoreo recurrente. |
| Flujo 4.c | Periodicidad de fase 3 | La metodología y periodicidad dependen de cada institución; se recomienda la mayor frecuencia posible sin afectar desempeño. Las frecuencias típicas son cada hora, cada cuatro horas o una vez al día. | El manual no impone SLA en tiempo real estricto; permite procesamiento periódico y configurable. |
| Flujo 4.c | Fin de fase 3 | La búsqueda continua de un reporte debe finalizar únicamente cuando se solicite la baja del reporte. | El ciclo de vida del monitoreo depende del evento de desactivación. |
| Flujo 6 | Desactivación del caso | Cuando una persona es localizada, CNB cambia el estatus en RNPDNO y la PUI notifica a las instituciones diversas por `/desactivar-reporte`. | El cierre del caso también se distribuye mediante integración técnica. |
| Requisitos del API institucional | Componentes mínimos | La institución debe contar con autenticación Bearer token, mecanismo de notificación activa, persistencia de búsquedas y coincidencias, sistema de monitoreo para búsqueda continua y mecanismo de resincronización. | El desarrollo exigido va más allá de exponer un endpoint; requiere persistencia, monitoreo y recuperación. |
| 7.1 `/login` | Autenticación contra la PUI | La institución diversa envía sus credenciales para obtener un JWT; `institucion_id` será el RFC con homoclave. | La autenticación con la PUI está basada en identidad institucional. |
| 7.1 `/login` | Vigencia del token | El token dura una hora y se recomienda renovarlo antes del 80% de expiración. | El cliente institucional debe gestionar renovación de tokens. |
| 7.2 `/notificar-coincidencia` | Reporte de coincidencias | Se envían datos básicos, eventuales datos biométricos, `id`, `institucion_id`, datos del evento y `fase_busqueda`. | El reporte a la PUI distingue expresamente entre coincidencias de fase 1, 2 o 3. |
| 7.2 `/notificar-coincidencia` | CURP obligatoria | `curp` es obligatoria y debe tener 18 caracteres, letras mayúsculas y números. | La CURP es la clave de búsqueda y correlación desde el punto de vista técnico. |
| 7.2 `/notificar-coincidencia` | ID obligatorio | El `id` se construye concatenando el FUB con un UUID v4, separados por guion. | Confirma formalmente la estructura del identificador técnico del caso. |
| 7.2 `/notificar-coincidencia` | `institucion_id` | El identificador institucional es el RFC con homoclave. | La trazabilidad de origen de cada coincidencia se ancla a la institución. |
| 7.2 `/notificar-coincidencia` | Coincidencias múltiples | Puede devolverse código 300 cuando se identifica a más de una persona distinta a partir de los elementos utilizados para la búsqueda. | El diseño contempla ambigüedad o multicoincidencia en la identificación. |
| 7.3 `/busqueda-finalizada` | Finalización de fase histórica | Debe enviarse `id` e `institucion_id` para registrar que la búsqueda histórica concluyó. | La PUI requiere trazabilidad del cierre de la fase 2. |
| 7.4 `/reportes` | Listado de reportes activos | Permite obtener la lista de reportes con sus datos principales, incluyendo `id`, `curp`, datos personales y fechas. | Existe un mecanismo de resincronización o recuperación de casos activos desde la PUI. |
| Sección 8 | Endpoints que implementa la institución | La institución debe desarrollar y asegurar una URL base y los endpoints `/login`, `/activar-reporte`, `/activar-reporte-prueba` y `/desactivar-reporte`. | El Manual define explícitamente el contrato API que debe exponer la institución diversa. |
| 8.1 | Autenticación de endpoints institucionales | Cada institución debe proteger sus endpoints con JWT. | La autenticación no solo aplica del lado de la PUI, también del lado de la institución. |
| 8.1 | Usuario fijo PUI | En el `/login` institucional, el usuario es fijo: `PUI`. | La plataforma se autentica ante la institución con un esquema estandarizado. |
| 8.2 `/activar-reporte` | Activación del caso | La PUI envía `id`, `curp` y, en su caso, otros datos disponibles como fecha de desaparición y datos personales. | La activación entrega datos mínimos y datos complementarios opcionales. |
| 8.2 `/activar-reporte` | CURP obligatoria | `curp` es obligatoria en la activación. | La búsqueda institucional debe arrancar a partir de la CURP. |
| 8.2 `/activar-reporte` | Fecha de desaparición opcional | `fecha_desaparicion` puede no venir informada. | La institución debe contemplar la ausencia de este dato para omitir o ajustar fase 2. |
| 8.2 | Código 504 | El endpoint puede responder 504 cuando el servidor tarda demasiado. | El diseño asume riesgos de latencia o disponibilidad en la integración. |
| 8.3 `/activar-reporte-prueba` | Validación de integración | Sirve para validar conectividad, payload, autenticación y recepción de campos obligatorios antes de operar formalmente. | La integración exige una fase explícita de pruebas de interoperabilidad. |
| 8.4 `/desactivar-reporte` | Desactivación | El endpoint requiere únicamente el `id` para desactivar la búsqueda. | El cierre técnico del caso se apoya solo en el identificador único del caso. |
| 8.4 | Efectos de desactivación | La institución debe dar de baja el caso y detener toda tarea periódica o consulta recurrente vinculada al `id`. | La institución debe implementar gestión de ciclo de vida y cancelación de procesos de monitoreo. |
| Sección 9 | Cifrado de huellas y fotos | Fotos y huellas deben enviarse en base64 y cifrarse con AES-256-GCM con la clave asignada a cada institución. | El intercambio biométrico exige cifrado adicional, no solo TLS. |
| Sección 9 | Omisión de biométricos | Si no se dispone de fotos o huellas, pueden omitirse. | El modelo acepta disponibilidad parcial de biométricos. |
| Sección 10 | Responsabilidad de seguridad | Cada institución es responsable de garantizar seguridad, disponibilidad, integridad, confidencialidad y resiliencia de infraestructura, redes y sistemas usados para conectarse a la PUI. | La seguridad de la integración recae también en la institución, no solo en la PUI. |
| Sección 10 | Análisis de seguridad | La institución debe realizar análisis basados en OWASP API Security Top 10, OWASP ASVS, NIST SP 800-53 y NIST SP 800-115. | El Manual impone un estándar elevado de ciberseguridad y pruebas. |
| Sección 10 | Verificación de autenticación y acceso | La API debe implementar JWT, tokens con expiración, validación por endpoint, método y recurso, y responder 401/403 ante accesos indebidos. | El control de acceso debe ser granular y formal. |
| Sección 10 | Validación de entradas | Los parámetros deben validarse estrictamente por tipo, longitud, formato y contenido; payloads inesperados deben rechazarse. | La institución debe implementar validación robusta de entrada y salida. |
| Sección 10 | Métodos HTTP | Solo deben habilitarse los métodos requeridos; los no usados deben responder 405. | El contrato API debe minimizar superficie de ataque. |
| Sección 10 | CORS | No debe existir `Access-Control-Allow-Origin: *` en APIs autenticadas o con datos sensibles. | Aplica endurecimiento específico de exposición web. |
| Sección 10 | Rate limiting y antiabuso | Deben existir límites por IP, usuario y token, además de sensores contra fuerza bruta, DDoS de bajo volumen y enumeración. | La institución debe incorporar protección operativa activa. |
| Sección 10 | Protección de datos sensibles | TLS 1.2+, no exponer tokens completos, contraseñas ni información personal innecesaria; logs sin datos sensibles. | Los datos de identidad y biométricos exigen minimización y protección reforzada. |
| Sección 10 | Infraestructura segura | Deben configurarse headers de seguridad, deshabilitar protocolos inseguros y evitar exponer versiones de servidor e infraestructura. | El hardening de infraestructura forma parte de los requisitos obligatorios. |
| Sección 10 | Reportes SAST/DAST/SCA | Para conectarse a la PUI la institución debe entregar reportes de seguridad sobre URL base y endpoints, libres de vulnerabilidades críticas, altas, medias y bajas. | La conectividad productiva está condicionada a evidencias formales de seguridad. |
| Anexo 1 | Infraestructura referencial | Se recomienda IP pública fija, conectividad permanente a Internet y certificado TLS válido. | El entorno deseable de integración es permanente, expuesto y controlado. |
| Anexo 1 | Servicio backend dedicado | La institución debe desarrollar un backend dedicado como punto de integración con la PUI. | La integración no se resuelve solo con adaptar un sistema legado; requiere un servicio específico. |
| Anexo 1 | Consulta interna basada en CURP | La institución puede usar bases relacionales, no relacionales, servicios internos o sistemas legados, siempre que permitan búsqueda por CURP. | La viabilidad técnica depende de contar con capacidad real de consulta por CURP. |
| Anexo 1 | Lógica de consulta y decisión | La lógica de consulta y determinación de coincidencias reside exclusivamente en la institución pública o diversa. | La PUI no resuelve el matching interno; la institución es responsable de su lógica de correlación. |
| Anexo 2 | Alta administrativa | El acceso e inscripción de instituciones diversas es mediante Llave MX y perfil de persona moral. | La incorporación tiene una fase administrativa previa a la técnica. |
| Anexo 2 | Requisitos previos | Se requiere cuenta Llave MX del representante legal, e.Firma de la persona moral y RFC institucional. | La identidad institucional y la autenticación administrativa son prerrequisitos de onboarding. |
| Anexo 2 | Identificador institucional | El RFC con homoclave queda vinculado oficialmente como identificador institucional e inalterable. | El `institucion_id` se ancla jurídicamente al RFC. |
| Anexo 2 | Alcance de Llave MX | El acceso mediante Llave MX no habilita por sí mismo el intercambio operativo; además deben desarrollarse endpoints, superar validaciones de seguridad, implementar bitácoras y aprobar pruebas en Sandbox. | Se separa claramente la fase administrativa de la fase técnica de integración. |
| Anexo 2 | Vigencia de e.Firma | La falta de vigencia de la e.Firma puede derivar en revocación automática de tokens de acceso a producción. | La continuidad administrativa impacta directamente la operación productiva. |
| Anexo 3 | Alcance del desarrollo | El desarrollo incluye componentes necesarios para recibir solicitudes oficiales, consultar sistemas internos con base en CURP y responder conforme al Manual Técnico. | Delimita el mínimo producto técnico necesario para integrarse. |
| Anexo 3 | Disponibilidad continua | El servicio backend de integración debe estar disponible de forma continua y ser accesible desde Internet de manera segura. | La operación de la integración es continua, no eventual. |
| Anexo 3 | Recepción de solicitudes | Cada solicitud contiene información estructurada y la CURP como identificador obligatorio. | Reafirma que la CURP es la clave operativa de búsqueda. |
| Anexo 3 | Procesamiento interno | La institución debe identificar la CURP, asociar la solicitud con el identificador de búsqueda y determinar el tipo de búsqueda aplicable. | La institución debe implementar lógica explícita de orquestación por caso. |
| Anexo 3 | Consulta a sistemas internos | La consulta debe realizarse usando la CURP como clave de búsqueda. | El modelo técnico se apoya en CURP como primary lookup key. |
| Anexo 3 | Construcción de respuesta | La respuesta debe incluir CURP e identificador de búsqueda, así como la información requerida para el tipo de notificación. | Toda respuesta debe ser trazable tanto al caso como a la persona buscada. |
| Anexo 3 | Trazabilidad y bitácoras | Deben registrarse todas las solicitudes recibidas, consultas internas y respuestas enviadas a la PUI. | La auditoría completa del proceso es obligatoria. |
| Anexo 3 | Validación del desarrollo | La operación productiva solo puede iniciarse tras superar pruebas de conectividad, funcionales y validaciones de seguridad. | La puesta en producción tiene una puerta formal de validación. |

---

# Elementos clave del dominio PUI derivados del Manual Técnico

## Naturaleza del Manual

El Manual Técnico traduce los Lineamientos al plano de implementación para instituciones diversas.  
Su foco no es la regulación general de la PUI, sino la forma concreta en que una institución privada o no gubernamental debe integrarse técnica y operativamente.

---

## Identificadores principales

### CURP
Es la clave obligatoria para la consulta interna en los sistemas de la institución.

### ID de búsqueda
Es el identificador técnico del caso y se construye como:

`FUB + UUID4`

No es un identificador interno libre de la institución.

### institucion_id
Es el RFC con homoclave de la institución diversa.

---

## Fases de búsqueda

### Fase 1 – Búsqueda para completar datos básicos
Consulta de los datos más recientes disponibles para complementar la ficha de búsqueda.

### Fase 2 – Búsqueda histórica
Consulta retrospectiva desde la fecha de desaparición hasta el presente, con límite máximo de 12 años.

### Fase 3 – Búsqueda continua
Monitoreo periódico de registros nuevos o modificados, hasta que el caso sea desactivado.

---

## Ciclo de vida del caso en la integración

1. La CNB o CLB registra el caso en RNPDNO.  
2. El caso se reenvía automáticamente a la PUI.  
3. La PUI activa el caso en cada institución diversa mediante `/activar-reporte`.  
4. La institución ejecuta fase 1 y fase 2.  
5. La institución reporta coincidencias mediante `/notificar-coincidencia`.  
6. La institución reporta el cierre de búsqueda histórica mediante `/busqueda-finalizada`.  
7. La institución mantiene el caso en monitoreo continuo fase 3.  
8. La PUI notifica la baja del caso mediante `/desactivar-reporte`.  
9. La institución detiene el monitoreo y da de baja el caso en sus sistemas.

---

## Endpoints del dominio técnico

### Expuestos por la PUI
- `/login`
- `/notificar-coincidencia`
- `/busqueda-finalizada`
- `/reportes`

### Expuestos por la institución diversa
- `/login`
- `/activar-reporte`
- `/activar-reporte-prueba`
- `/desactivar-reporte`

---

## Responsabilidades técnicas de la institución diversa

1. desarrollar un backend dedicado de integración  
2. recibir solicitudes oficiales emitidas por la PUI  
3. consultar sistemas internos usando la CURP  
4. determinar coincidencias con lógica propia  
5. construir respuestas conforme al contrato definido  
6. mantener persistencia local de búsquedas y coincidencias  
7. operar un sistema de monitoreo continuo  
8. implementar resincronización ante inactividad  
9. mantener trazabilidad total del proceso  
10. acreditar seguridad mediante SAST, DAST y SCA

---

## Seguridad y cumplimiento

El Manual impone un nivel alto de exigencia en materia de seguridad:

- autenticación JWT
- TLS 1.2 o superior
- validación estricta de entradas
- rate limiting
- protección contra abuso
- logs sin datos sensibles
- hardening de infraestructura
- reportes formales de seguridad sin vulnerabilidades

Además, impone requisitos administrativos y de identidad institucional:

- Llave MX
- e.Firma vigente
- RFC como identificador institucional

---

## Observaciones para la implementación

1. La PUI no hace la búsqueda interna por la institución; solo activa, recibe y coordina.  
2. La lógica de correlación y decisión reside completamente en la institución diversa.  
3. La integración exige persistencia y monitoreo continuo; no basta con responder a un webhook.  
4. La CURP es la clave operativa de búsqueda; el ID de búsqueda es la clave de caso.  
5. El monitoreo continuo puede ser periódico, no necesariamente tiempo real estricto.  
6. La viabilidad técnica depende de que la institución pueda consultar efectivamente por CURP en sus sistemas.  
7. La operación productiva depende tanto de validaciones técnicas como de requisitos administrativos y de seguridad.


## Diagrama de secuencia del flujo completo de un caso

El siguiente diagrama representa el ciclo completo de un caso desde el reporte inicial de desaparición hasta la desactivación del monitoreo en una institución diversa. Se incluyen las tres fases de búsqueda previstas en el Manual Técnico: búsqueda para completar datos básicos, búsqueda histórica y búsqueda continua.

```mermaid
sequenceDiagram
    autonumber

    participant REP as Reportante
    participant BUS as CNB / CLB
    participant RNP as RNPDNO
    participant PUI as PUI
    participant INS as Institución diversa
    participant SIS as Sistemas internos

    REP->>BUS: Reporte / denuncia de desaparición
    BUS->>RNP: Registrar caso en RNPDNO (genera FUB)
    RNP->>PUI: Reenvío automático del caso

    Note over PUI,INS: Autenticación PUI → Institución diversa
    PUI->>INS: POST /login (usuario = PUI)
    INS-->>PUI: JWT institucional

    PUI->>INS: POST /activar-reporte\nid = FUB + UUID4\ncurp + datos disponibles

    INS->>SIS: Fase 1 - búsqueda para completar datos básicos
    SIS-->>INS: Datos básicos disponibles

    alt Hay datos para complementar
        Note over INS,PUI: Autenticación Institución → PUI
        INS->>PUI: POST /login (institucion_id + clave)
        PUI-->>INS: JWT PUI

        INS->>PUI: POST /notificar-coincidencia\nfase_busqueda = "1"
    else Sin datos útiles
        Note over INS: Se omite notificación de fase 1
    end

    alt Existe fecha_desaparicion válida
        INS->>SIS: Fase 2 - búsqueda histórica
        SIS-->>INS: Coincidencias históricas

        loop Por cada coincidencia histórica
            opt Token PUI expirado o no disponible
                INS->>PUI: POST /login (institucion_id + clave)
                PUI-->>INS: JWT PUI renovado
            end
            INS->>PUI: POST /notificar-coincidencia\nfase_busqueda = "2"
        end
    else No existe fecha_desaparicion
        Note over INS: Se omite la fase 2
    end

    opt Token PUI expirado o no disponible
        INS->>PUI: POST /login (institucion_id + clave)
        PUI-->>INS: JWT PUI renovado
    end
    INS->>PUI: POST /busqueda-finalizada

    loop Fase 3 - monitoreo continuo
        INS->>SIS: Revisar registros nuevos o modificados por CURP
        SIS-->>INS: Coincidencias nuevas o vacío

        alt Se detectan coincidencias
            opt Token PUI expirado o no disponible
                INS->>PUI: POST /login (institucion_id + clave)
                PUI-->>INS: JWT PUI renovado
            end
            INS->>PUI: POST /notificar-coincidencia\nfase_busqueda = "3"
        else Sin coincidencias
            Note over INS: Continúa monitoreo periódico
        end
    end

    BUS->>RNP: Persona localizada
    RNP->>PUI: Actualización de estatus del caso

    opt Token institucional expirado o no disponible
        PUI->>INS: POST /login (usuario = PUI)
        INS-->>PUI: JWT institucional renovado
    end
    PUI->>INS: POST /desactivar-reporte\nid

    INS->>SIS: Dar de baja el caso
    INS->>SIS: Detener monitoreo y tareas periódicas

    Note over INS,PUI: Fin del ciclo de vida del caso