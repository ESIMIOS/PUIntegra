# Marco Conceptual del Dominio del Problema  
## Plataforma Única de Identidad (PUI)  
### Integración de Instituciones Diversas

---

# 1. Propósito del documento

El presente documento describe el **marco conceptual del dominio del problema** asociado a la operación de la **Plataforma Única de Identidad (PUI)** y a su interacción con las **instituciones diversas** dentro del Sistema Nacional de Identificación de Personas.

El objetivo de este documento es establecer un **lenguaje ubicuo** que permita comprender los conceptos, actores, roles, entidades, identificadores, relaciones y reglas que aparecen en la normativa que regula la operación de la PUI.

El contenido se basa en los instrumentos normativos y técnicos emitidos por las autoridades competentes, y busca proporcionar una referencia conceptual común para interpretar el funcionamiento del sistema desde una perspectiva institucional y normativa.

Este documento **no constituye una especificación técnica ni una guía para el desarrollo de software**. Los elementos descritos corresponden al **dominio del problema**, es decir, a los conceptos que existen en el contexto regulatorio y operativo de la plataforma.

Los componentes tecnológicos, mecanismos de interoperabilidad, interfaces de comunicación y demás elementos de implementación pertenecen al **dominio de la solución**, y por lo tanto se encuentran fuera del alcance de este documento.

---

# 2. Contexto del dominio

La **Plataforma Única de Identidad (PUI)** es una infraestructura tecnológica que permite realizar consultas de información para apoyar las actividades de:

- investigación
- búsqueda
- localización
- identificación de personas desaparecidas o no localizadas

La plataforma se interconecta con registros, bases de datos y sistemas pertenecientes a instituciones públicas y a **instituciones diversas**, con el fin de permitir la consulta de información que pueda contribuir a la localización o identificación de personas.

El uso de la plataforma se encuentra condicionado a la existencia de un **proceso formal de búsqueda** relacionado con una persona desaparecida o no localizada.

Para efectos de la operación dentro de la plataforma, dicho proceso se identifica mediante un **Folio Único de Búsqueda (FUB)**.

---

# 3. Actores del dominio

Los actores institucionales representan organizaciones que participan en la operación del sistema o en los procesos de búsqueda.

| Actor | Descripción |
|---|---|
| RENAPO | Autoridad responsable de la operación de la Plataforma Única de Identidad y de la coordinación de su funcionamiento dentro del Sistema Nacional de Identificación de Personas |
| ATDT | Agencia que brinda apoyo técnico para la operación tecnológica de la plataforma |
| Autoridades de búsqueda | Instituciones que utilizan la plataforma para realizar consultas relacionadas con personas desaparecidas |
| Instituciones diversas | Organizaciones responsables de registros o sistemas que pueden contener información relevante para procesos de búsqueda |

## 3.1 Autoridades de búsqueda

Entre las autoridades que pueden utilizar la Plataforma Única de Identidad para realizar consultas relacionadas con procesos de búsqueda se encuentran:

- Fiscalía General de la República
- Fiscalías estatales
- Comisión Nacional de Búsqueda
- Comisiones locales de búsqueda

Estas autoridades pueden realizar consultas dentro de la plataforma conforme a la normativa aplicable.

---

# 4. Roles del dominio

Los roles representan funciones específicas que pueden ser desempeñadas por personas dentro de los procesos relacionados con la Plataforma Única de Identidad.

A diferencia de los actores institucionales, los roles no representan organizaciones, sino responsabilidades o funciones que intervienen en la operación o en los procedimientos asociados a la plataforma.

| Rol | Descripción |
|---|---|
| Representante legal de la institución diversa | Persona responsable de realizar el registro institucional de una institución diversa dentro de la plataforma |

Para realizar el registro institucional se requiere:

- contar con una cuenta en **Llave MX**
- utilizar la **e.Firma** correspondiente a la persona moral
- proporcionar la información institucional requerida durante el proceso de registro

---

# 5. Entidades del dominio

Las entidades representan conceptos del dominio identificables dentro del marco normativo y operativo de la Plataforma Única de Identidad.

En este documento, las entidades corresponden a elementos que forman parte del lenguaje ubicuo del dominio y que permiten describir los procesos, identificadores, interacciones y resultados asociados a la operación de la plataforma.

| Entidad | Descripción |
|---|---|
| Plataforma Única de Identidad (PUI) | Sistema que permite realizar consultas y correlaciones de información para apoyar la búsqueda de personas |
| Institución diversa | Organización responsable de registros o sistemas que pueden contener información relevante |
| Servicio de integración institucional | Mecanismo definido en el manual técnico mediante el cual una institución diversa permite la interconexión entre sus sistemas y la plataforma |
| Solicitud de búsqueda | Consulta generada dentro de la plataforma para obtener información relacionada con una persona |
| CURP | Identificador utilizado para realizar consultas relacionadas con una persona |
| Folio Único de Búsqueda (FUB) | Identificador que permite identificar un proceso de búsqueda dentro de la plataforma |
| Coincidencia | Resultado del cruce de información entre registros consultados y la información relacionada con una persona |

---

# 6. Identificadores del dominio

En el dominio de la Plataforma Única de Identidad existen identificadores utilizados para referenciar entidades y procesos dentro de la operación de la plataforma.

| Concepto | Identificador |
|---|---|
| Institución diversa | RFC con homoclave |
| Persona | CURP |
| Proceso de búsqueda | Folio Único de Búsqueda (FUB) |

---

# 7. Relaciones conceptuales del dominio

Las relaciones conceptuales describen cómo se vinculan los principales conceptos dentro del dominio.

| Concepto | Relación | Concepto |
|---|---|---|
| Proceso de búsqueda | se identifica mediante | Folio Único de Búsqueda |
| Solicitud de búsqueda | utiliza | CURP |
| Institución diversa | recibe | solicitud de búsqueda |
| Institución diversa | responde | solicitud de búsqueda |
| Coincidencia | resulta del | cruce de información entre registros |

---

# 8. Procesos de búsqueda

La normativa establece distintos tipos de procesos de búsqueda dentro del funcionamiento de la plataforma.

| Tipo de búsqueda | Descripción |
|---|---|
| Búsqueda para completar datos básicos | Permite obtener información mínima necesaria para identificar correctamente a una persona |
| Búsqueda histórica | Permite consultar información previamente registrada en sistemas institucionales |
| Búsqueda continua | Permite revisar de forma periódica los registros asociados a una persona dentro de los sistemas interconectados |

---

# 9. Reglas del dominio

Las siguientes reglas se desprenden del marco normativo aplicable.

| Regla | Descripción |
|---|---|
| Existencia de proceso de búsqueda | Las consultas dentro de la plataforma deben estar asociadas a un proceso formal de búsqueda |
| Identificación del proceso | Cada proceso de búsqueda se identifica mediante un Folio Único de Búsqueda |
| Uso de CURP | La CURP se utiliza como identificador para realizar consultas relacionadas con una persona |
| Protección de datos | Las instituciones participantes deben garantizar el tratamiento adecuado de los datos personales |

---

# 10. Delimitación del dominio

## 10.1 Dominio de la Plataforma Única de Identidad

El dominio de la Plataforma Única de Identidad comprende elementos relacionados con:

- la operación de la plataforma
- la gestión de accesos
- la coordinación de consultas entre instituciones
- la correlación de información

## 10.2 Dominio de las instituciones diversas

El dominio de las instituciones diversas comprende elementos relacionados con:

- los registros administrados por cada institución
- los sistemas de información institucionales
- los mecanismos utilizados para responder solicitudes de información provenientes de la plataforma

---

# 11. Contexto institucional

| Tipo de institución | Función dentro del dominio |
|---|---|
| Autoridades responsables | Operación y regulación de la plataforma |
| Autoridades de búsqueda | Uso de la plataforma para procesos de búsqueda |
| Instituciones con registros | Provisión de información mediante interconexión |

---

# 12. Referencias documentales

| ID | Documento | Tipo | Autoridad emisora | Fecha |
|---|---|---|---|---|
| REF-01 | Decreto por el que se reforman diversas disposiciones de la Ley General en Materia de Desaparición Forzada | Decreto | Congreso de la Unión | 16 julio 2025 |
| REF-02 | Lineamientos para el Desarrollo y Operación de la Plataforma Única de Identidad | Lineamientos | Secretaría de Gobernación / RENAPO | 27 noviembre 2025 |
| REF-03 | Manual Técnico de la Solución Tecnológica para Instituciones Diversas | Manual técnico | Secretaría de Gobernación / RENAPO | 23 enero 2026 |

---

# 13. Trazabilidad normativa

| Sección del documento | Documento base |
|---|---|
| Contexto del dominio | Decreto LGMDFP |
| Actores institucionales | Lineamientos PUI |
| Instituciones diversas | Lineamientos PUI |
| Interconexión institucional | Manual técnico |
| Solicitudes de búsqueda | Manual técnico |
| Identificación mediante CURP | Lineamientos y manual técnico |
| Procesos de búsqueda | Lineamientos PUI |
| Protección de datos | Lineamientos PUI |

---

# 14. Glosario

| Término | Definición |
|---|---|
| CURP | Clave Única de Registro de Población |
| FUB | Identificador utilizado para identificar un proceso de búsqueda dentro de la plataforma |
| Instituciones diversas | Organizaciones responsables de registros o sistemas que pueden contener información útil para la búsqueda |
| Llave MX | Sistema de autenticación utilizado para el registro institucional |
| Plataforma Única de Identidad | Infraestructura tecnológica utilizada para realizar consultas de información relacionadas con procesos de búsqueda |
| Servicio de integración institucional | Mecanismo de interconexión entre los sistemas de una institución diversa y la plataforma |
| Coincidencia | Resultado del cruce de información entre registros consultados y la información asociada a una persona |