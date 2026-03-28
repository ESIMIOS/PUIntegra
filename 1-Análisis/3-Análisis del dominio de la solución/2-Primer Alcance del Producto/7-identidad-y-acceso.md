# 7. Especificación de identidad y acceso
## Reglas analíticas de cuentas, autenticación, contexto y trazabilidad

---

# 7.1 Modelo de cuentas

El modelo de identidad y acceso del alcance 1 debe distinguir claramente entre cuenta autenticable, usuario operativo, permiso institucional y contexto activo de sesión.

| Componente | Definición dentro del alcance 1 | Papel analítico | Observaciones |
|---|---|---|---|
| Cuenta autenticable | Identidad de acceso gestionada mediante Firebase Auth. | Permite autenticar a una persona usuaria dentro del sistema. | No equivale por sí misma a un rol ni a una institución. |
| Usuario operativo | Representación del usuario dentro del producto con datos propios, trazabilidad y relación con permisos. | Permite operar el SaaS más allá de la mera autenticación. | Debe materializarse dentro del sistema y no solo en Firebase Auth. |
| Permiso institucional | Relación entre usuario potencial, institución y rol, con estado propio. | Habilita el derecho a operar sobre una institución diversa con un rol concreto. | Es condición previa para crear cuenta y para acceder operativamente al sistema. |
| Contexto activo de sesión | Selección explícita de una combinación institución/rol para la sesión vigente. | Determina visibilidad, navegación y autorización efectiva. | Un usuario puede tener múltiples permisos, pero solo un contexto activo por sesión. |

## 7.1.1 Relación entre cuenta, usuario, permiso y sesión

| Relación | Regla analítica |
|---|---|
| Cuenta y permiso | La cuenta no crea el permiso; el permiso habilitante debe existir previamente. |
| Cuenta y usuario | La autenticación debe tener representación operativa dentro del sistema, no quedarse solo en el proveedor de identidad. |
| Usuario y permisos | Un usuario puede relacionarse con múltiples permisos sobre una o varias instituciones. |
| Permisos y sesión | La sesión efectiva se resuelve contra un único contexto institución/rol activo. |
| Cuenta y correo | El correo es obligatorio, único por cuenta e inmutable como identidad operativa base del acceso. |

## 7.1.2 Resultado esperado del modelo de cuentas

| Resultado esperado | Alcance |
|---|---|
| El producto puede autenticar usuarios reales mediante Firebase Auth. | Acceso y seguridad base. |
| El producto puede impedir la creación de cuentas sin permiso habilitante previo. | Gobernanza de acceso institucional. |
| El producto puede traducir autenticación en operación real mediante `Users`, `Permissions` y contexto activo. | Operación efectiva del SaaS. |
| El producto puede distinguir entre identidad personal, rol activo e institución activa. | Navegación, autorización y trazabilidad. |

---

# 7.2 Reglas de Firebase Auth

Firebase Auth es el mecanismo de autenticación del alcance 1, pero su uso queda gobernado por reglas del dominio del producto.

| Regla | Enunciado normativo | Implicación para el alcance 1 |
|---|---|---|
| `IDA-FA-01` | La autenticación del producto debe resolverse mediante Firebase Auth. | El acceso al sistema se apoya en un proveedor de identidad gestionado, no en credenciales propias del SaaS. |
| `IDA-FA-02` | Toda cuenta debe tener correo electrónico obligatorio. | El correo es el identificador base de acceso y correlación con permisos. |
| `IDA-FA-03` | Solo puede existir una cuenta por correo dentro del sistema. | La identidad autenticable debe ser única y no duplicarse. |
| `IDA-FA-04` | La creación de cuenta solo es válida si existe al menos un permiso activo asociado al correo en `Permissions`. | El alta de cuenta depende de gobernanza institucional previa. |
| `IDA-FA-05` | El correo de la cuenta no debe cambiarse como parte de la operación ordinaria del alcance. | La identidad base de acceso debe mantenerse estable para consistencia de permisos y trazabilidad. |
| `IDA-FA-06` | El uso de MFA es obligatorio para las cuentas autenticadas del sistema. | La autenticación debe exigir un segundo factor conforme al alcance definido. |
| `IDA-FA-07` | El inicio de sesión mediante proveedor social solo es admisible cuando el correo autenticado esté autorizado dentro del sistema. | Un mecanismo de login externo no sustituye la validación institucional del correo. |
| `IDA-FA-08` | La recuperación de contraseña debe poder iniciarse sin revelar si un correo existe o no. | El flujo de recuperación debe preservar seguridad y evitar enumeración de cuentas. |

## 7.2.1 Reglas de acceso derivadas de autenticación

| Regla derivada | Consecuencia operativa |
|---|---|
| Autenticación no equivale a autorización institucional | Después de autenticarse, el usuario aún debe resolver su contexto operativo permitido. |
| Permiso inactivo no habilita acceso operativo | La autenticación puede existir, pero la operación institucional no debe abrirse sin permiso vigente. |
| Rol activo e institución activa gobiernan la experiencia | Las vistas y acciones deben evaluarse contra el contexto activo, no solo contra el estado autenticado. |
| `ANONYMOUS` solo opera en dominios públicos o de acceso | `/site` y `/auth` son los dominios coherentes con ausencia de sesión operativa. |

---

# 7.3 Triggers de autenticación

Los triggers de autenticación del alcance 1 deben traducir eventos de identidad en consistencia operativa y trazabilidad dentro del producto.

| Trigger o automatización asociada | Disparador conceptual | Resultado esperado | Observaciones |
|---|---|---|---|
| `IDA-TR-01` Creación de usuario operativo | Alta exitosa de una cuenta en Firebase Auth. | Se crea la representación correspondiente del usuario en la colección `Users`. | Esta automatización asegura que la autenticación tenga una representación operativa dentro del producto. |
| `IDA-TR-02` Trazabilidad de alta de cuenta | Creación exitosa de cuenta. | Se registra el evento de creación de cuenta en logs. | Debe quedar atribuible al origen correspondiente. |
| `IDA-TR-03` Trazabilidad de inicio de sesión | Inicio de sesión exitoso. | Se registra el acceso del usuario al sistema. | Debe poder correlacionarse con identidad y contexto cuando aplique. |
| `IDA-TR-04` Trazabilidad de cierre de sesión | Cierre de sesión. | Se registra la salida del usuario del sistema. | Debe distinguirse del simple vencimiento técnico de una sesión. |
| `IDA-TR-05` Trazabilidad de recuperación de contraseña | Solicitud de recuperación y cambio exitoso de contraseña. | Se registran los eventos relevantes de recuperación y actualización de credenciales. | No debe exponerse información sensible en la evidencia. |
| `IDA-TR-06` Trazabilidad de alta de MFA | Registro exitoso del segundo factor. | Se registra el evento de inscripción de MFA. | Refuerza trazabilidad de seguridad de la cuenta. |

## 7.3.1 Restricciones sobre triggers de identidad

| Restricción | Alcance analítico |
|---|---|
| Un trigger de autenticación no debe sustituir la validación de permisos. | Automatiza consistencia, pero no crea autoridad operativa por sí mismo. |
| Los triggers deben producir datos atribuibles y trazables. | Toda mutación derivada de Auth debe quedar vinculada a un `LOG_ORIGIN` correspondiente. |
| Los triggers no deben exponer secretos ni credenciales en claro. | La trazabilidad de identidad debe respetar la política de datos sensibles del alcance. |

---

# 7.4 Eventos de log asociados a identidad y acceso

Los eventos de identidad y acceso deben quedar explícitamente clasificados en la taxonomía de logs del alcance 1.

| Categoría de log | Evento observado | Cuándo aplica | Lectura analítica |
|---|---|---|---|
| `USER_ACCOUNT_CREATION` | Creación de cuenta | Cuando una persona crea una cuenta válida dentro del sistema. | Marca el nacimiento operativo de la identidad autenticable. |
| `USER_ACCOUNT_LOGIN` | Inicio de sesión | Cuando una cuenta ingresa exitosamente al sistema. | Marca acceso efectivo del usuario autenticado. |
| `USER_ACCOUNT_LOGOUT` | Cierre de sesión | Cuando una cuenta cierra sesión. | Permite reconstruir trazabilidad de acceso y salida. |
| `USER_ACCOUNT_PASSWORD_RECOVERY_REQUEST` | Solicitud de recuperación de contraseña | Cuando un usuario inicia el proceso de recuperación. | Debe existir sin comprometer privacidad sobre la existencia de la cuenta. |
| `USER_ACCOUNT_PASSWORD_UPDATE` | Actualización de contraseña | Cuando una contraseña se actualiza exitosamente. | Representa un cambio sensible de credencial. |
| `USER_ACCOUNT_MFA_REGISTER` | Registro de MFA | Cuando una cuenta registra exitosamente su segundo factor. | Representa fortalecimiento del perfil de seguridad. |
| `USER_ACCOUNT_SETTINGS_UPDATE` | Actualización de configuración personal | Cuando el usuario cambia los datos permitidos de su cuenta. | Corresponde al dominio `/account` y no debe confundirse con configuración institucional. |

## 7.4.1 Criterios mínimos de lectura para logs de identidad y acceso

| Criterio | Exigencia |
|---|---|
| Identidad del evento | Debe poder saberse qué cuenta ejecutó o detonó el evento. |
| Origen del evento | Debe quedar identificado el `LOG_ORIGIN` correspondiente. |
| Contexto útil | Cuando aplique, debe existir correlación con institución, rol o dominio operativo. |
| Seguridad de la evidencia | El log no debe exponer secretos, contraseñas, tokens ni datos equivalentes en claro. |

---

# 7.5 Implicación analítica para el resto del alcance

La identidad y acceso del alcance 1 no debe leerse como una simple configuración de Firebase Auth, sino como una capacidad gobernada por el modelo del producto.

| Implicación | Consecuencia para el análisis |
|---|---|
| Firebase Auth es infraestructura de autenticación, no modelo completo de acceso. | Las reglas finales de operación dependen también de `Users`, `Permissions` y contexto activo. |
| La cuenta no basta para operar. | Se requiere permiso habilitante y contexto institución/rol. |
| La trazabilidad de identidad es parte del MVP. | Los eventos de acceso, recuperación, MFA y configuración personal deben quedar registrados. |
| La seguridad de identidad afecta frontend, backend y datos. | Las decisiones de acceso y evidencia deben ser coherentes entre dominios de navegación, logs y modelo de datos. |
