/**
 * @package shared
 * @name PUI.ts
 * @version 0.0.1
 * @description Define los contratos de datos y enumeraciones para la integración con la Plataforma Única de Información (PUI).
 * Basado en el Manual Técnico de Integración con la PUI, versión 1.0
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo con contratos de login, notificaciones y reportes activos.	@tirsomartinezreyes
 */
/** Login de la institución en la PUI */
export interface PUILoginInstitucionEnPUIRequest {
	/**
	 * RFC de la institución con homoclave
	 * Min: 12, Max: 13.   Min: 4, Max: 13. Regex: ^[A-Z0-9]{4,13}$
	 */
	institucion_id: string
	/** Min: 16, Max: 20. Debe incluir Mayúscula, Número y Carácter Especial ( !, @, #, $, %, ^, &, *, (, ), -, _, ., +) */
	clave: string
}

/** Login de la PUI en la institución */
export interface PUILoginPUIEnInstitucionRequest {
	/** Valor fijo obligatorio: "PUI" */
	usuario: 'PUI'
	/** Min: 16, Max: 20. Debe incluir Mayúscula, Número y Carácter Especial ( !, @, #, $, %, ^, &, *, (, ), -, _, ., +) */
	clave: string
}

export interface PUILoginResponse {
	/** Bearer Token (JWT) con vigencia de 1 hora. */
	token: string
}

/**
 * Catálogo de entidades federativas.
 * Mapeo de las posiciones 12-13 de la CURP al nombre oficial del estado.
 */
export enum PUILugarNacimiento {
	AS = 'AGUASCALIENTES',
	BC = 'BAJA CALIFORNIA',
	BS = 'BAJA CALIFORNIA SUR',
	CC = 'CAMPECHE',
	CS = 'CHIAPAS',
	CH = 'CHIHUAHUA',
	DF = 'CDMX',
	CL = 'COAHUILA',
	CM = 'COLIMA',
	DG = 'DURANGO',
	GT = 'GUANAJUATO',
	GR = 'GUERRERO',
	HG = 'HIDALGO',
	JC = 'JALISCO',
	MC = 'MÉXICO',
	MN = 'MICHOACÁN',
	MS = 'MORELOS',
	NT = 'NAYARIT',
	NL = 'NUEVO LEÓN',
	OC = 'OAXACA',
	PL = 'PUEBLA',
	QO = 'QUERÉTARO',
	QR = 'QUINTANA ROO',
	SP = 'SAN LUIS POTOSÍ',
	SL = 'SINALOA',
	SR = 'SONORA',
	TC = 'TABASCO',
	TS = 'TAMAULIPAS',
	TL = 'TLAXCALA',
	VZ = 'VERACRUZ',
	YN = 'YUCATÁN',
	ZS = 'ZACATECAS',
	NE = 'FORÁNEO',
	XX = 'DESCONOCIDO'
}

/** Sexo asignado de la persona reportada. */
export enum PUISexoAsignado {
	H = 'H', // Hombres
	M = 'M', // Mujeres
	X = 'X' // Resto de los casos
}

/** Identificadores de las fases funcionales de búsqueda. */
export enum PUIFaseBusqueda {
	FASE_1 = '1', // Búsqueda para completar datos básicos
	FASE_2 = '2', // Búsqueda histórica
	FASE_3 = '3' // Búsqueda continua
}

export interface PUINombreCompleto {
	/** Min: 1, Max: 50. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{1,50}$ */
	nombre: string
	/** Min: 1, Max: 50. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{1,50}$ */
	primer_apellido: string
	/** Min: 1, Max: 50. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{1,50}$ */
	segundo_apellido?: string
}

export interface PUIDomicilio {
	/** Max: 500. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()\-]{0,500}$ */
	direccion?: string
	/** Max: 50. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()\-]{0,50}$ */
	calle?: string
	/** Max: 50. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()\-]{0,50}$ */
	numero?: string
	/** Max: 50. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()\-]{0,50}$ */
	colonia?: string
	/** Max: 5. Regex: ^\d{0,5}$ */
	codigo_postal?: string
	/** Max: 100. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()\-]{0,100}$ */
	municipio_o_alcaldia?: string
	/** Max: 40. Regex: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()\-]{0,40}$ */
	entidad_federativa?: string
}

/**
 * Etiquetas oficiales para el mapeo de huellas dactilares.
 * Referencia: Anexo 4 del Manual Técnico.
 */
export enum PUIEtiquetaHuella {
	R1 = 'rone', // Pulgar derecho
	R2 = 'rtwo', // Índice derecho
	R3 = 'rthree', // Medio derecho
	R4 = 'rfour', // Anular derecho
	R5 = 'rfive', // Meñique derecho
	L1 = 'lone', // Pulgar izquierdo
	L2 = 'ltwo', // Índice izquierdo
	L3 = 'lthree', // Medio izquierdo
	L4 = 'lfour', // Anular izquierdo
	L5 = 'lfive', // Meñique izquierdo
	RPALM = 'rpalm', // Palma derecha
	LPALM = 'lpalm' // Palma izquierda
}

/**
 * Estructura de huellas dactilares.
 * Cada buella debe tener una resolución mínima de 500 dppi y en escala de grises de 8 bits.
 * Los valores deben estar en Base64 y cifrados con AES-256-GCM.
 */
export interface PUIHuellas {
	rone?: PUIEtiquetaHuella.R1
	rtwo?: PUIEtiquetaHuella.R2
	rthree?: PUIEtiquetaHuella.R3
	rfour?: PUIEtiquetaHuella.R4
	rfive?: PUIEtiquetaHuella.R5
	lone?: PUIEtiquetaHuella.L1
	ltwo?: PUIEtiquetaHuella.L2
	lthree?: PUIEtiquetaHuella.L3
	lfour?: PUIEtiquetaHuella.L4
	lfive?: PUIEtiquetaHuella.L5
	rpalm?: PUIEtiquetaHuella.RPALM
	lpalm?: PUIEtiquetaHuella.LPALM
}

/**
 * Contrato de datos para notificar coincidencias a la PUI.
 */
export interface PUIInstitucionNotificaCoincidenciaEnPUIPayload {
	/**
	 * Identificador técnico: <FUB>-<UUID4>.
	 * Longitud: Min 36, Max 75.
	 */
	id: string

	/** RFC con homoclave de la institución informadora.
	 * Min: 4, Max: 13. Regex: ^[A-Z0-9]{4,13}$
	 */
	institucion_id: string

	/**
	 * CURP de 18 caracteres.
	 * Min: 18, Max: 18. Regex: ^[A-Z0-9]{18}$
	 */
	curp: string

	/** Fase en la que se identifica la coincidencia. */
	fase_busqueda: PUIFaseBusqueda

	nombre_completo?: PUINombreCompleto
	/** Formato ISO 8601: YYYY-MM-DD. Longitud fija: 10. */
	fecha_nacimiento?: string
	lugar_nacimiento: PUILugarNacimiento
	sexo_asignado?: PUISexoAsignado

	/** Max: 15. Regex: ^\+?\d{0,15}$ */
	telefono?: string
	/** Max: 50. Regex: ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,50}$ */
	correo?: string
	domicilio?: PUIDomicilio

	/** Fotos en Base64 y cifradas con AES-256-GCM. Max 240KB por imagen. */
	fotos?: string[]
	/** Formato de imagen (ej. bmp, jpg, png). Max: 20 caracteres. */
	formato_fotos?: string

	huellas?: PUIHuellas
	/** Formato de huella (ej. wsq). Max: 50 caracteres. */
	formato_huellas?: string

	// --- Atributos de evento: Deben omitirse si fase_busqueda es "1" ---

	/** Max: 500. Descripción de la operación administrativa. ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()\-]{0,500}$*/
	tipo_evento?: string
	/** Fecha del evento en formato YYYY-MM-DD. Longitud: 10. */
	fecha_evento?: string
	/** Max: 500. Nombre del sitio o sucursal. ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()\-]{0,500}$ */
	descripcion_lugar_evento?: string
	direccion_evento?: PUIDomicilio
}

/** Mensaje de respuesta para notificar coincidencias, finalización de busqueda. o recepción de reporte */
export interface PUINotificarResponse {
	message: string
}

/**
 * Payload recibido por la Institución Diversa en el endpoint /activar-reporte.
 * Basado en la Sección 8.2 del Manual Técnico.
 */
export interface PUIPUIActivaReporteEnInstitucionPayload {
	/**
	 * Identificador técnico único del caso: <FUB>-<UUID4>.
	 * Longitud: Min 36, Max 75.
	 * Requerido: Sí.
	 */
	id: string

	/**
	 * Clave Única de Registro de Población.
	 * Longitud: Min 18, Max 18.
	 * Expresión Regular: ^[A-Z0-9]{18}$
	 * Requerido: Sí.
	 */
	curp: string

	/**
	 * Nombre(s) de la persona desaparecida.
	 * Longitud: Max 50.
	 * Expresión Regular: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{0,50}$
	 * Requerido: No.
	 */
	nombre?: string

	/**
	 * Primer apellido de la persona.
	 * Longitud: Max 50.
	 * Expresión Regular: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{0,50}$
	 * Requerido: No.
	 */
	primer_apellido?: string

	/**
	 * Segundo apellido de la persona.
	 * Longitud: Max 50.
	 * Expresión Regular: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{0,50}$
	 * Requerido: No.
	 */
	segundo_apellido?: string

	/**
	 * Fecha de nacimiento en formato ISO 8601 (YYYY-MM-DD).
	 * Longitud: Min 10, Max 10.
	 * Requerido: No.
	 */
	fecha_nacimiento?: string

	/**
	 * Fecha en que ocurrió la desaparición (YYYY-MM-DD).
	 * Si este campo es nulo o vacío, se debe omitir la Fase 2 (Histórica).
	 * Longitud: Min 10, Max 10.
	 * Requerido: No.
	 */
	fecha_desaparicion?: string

	/**
	 * Estado de nacimiento según catálogo oficial.
	 * Longitud: Max 20.
	 * Requerido: Sí.
	 */
	lugar_nacimiento: PUILugarNacimiento

	/**
	 * Sexo asignado codificado como H, M o X.
	 * Longitud: Min 1, Max 1.
	 * Expresión Regular: ^[MHX]{1}$
	 * Requerido: No.
	 */
	sexo_asignado?: PUISexoAsignado

	/**
	 * Teléfono de contacto de la persona reportada.
	 * Longitud: Max 15.
	 * Expresión Regular: ^\+?\d{0,15}$
	 * Requerido: No.
	 */
	telefono?: string

	/**
	 * Correo electrónico registrado.
	 * Longitud: Max 50.
	 * Requerido: No.
	 */
	correo?: string

	/**
	 * Dirección completa registrada (último domicilio conocido).
	 * Longitud: Max 500.
	 * Requerido: No.
	 */
	direccion?: string

	/** Calle del domicilio. Longitud: Max 50. Requerido: No. */
	calle?: string

	/** Número exterior/interior. Longitud: Max 20. Requerido: No. */
	numero?: string

	/** Colonia del domicilio. Longitud: Max 50. Requerido: No. */
	colonia?: string

	/**
	 * Código postal (5 dígitos).
	 * Longitud: Max 5.
	 * Expresión Regular: ^\d{0,5}$
	 * Requerido: No.
	 */
	codigo_postal?: string

	/** Municipio o Alcaldía. Longitud: Max 100. Requerido: No. */
	municipio_o_alcaldia?: string

	/** Entidad federativa del domicilio. Longitud: Max 40. Requerido: No. */
	entidad_federativa?: string
}

/**
 * Contrato de datos para notificar la finalización de la busqueda a la PUI.
 */
export interface PUIInstitucionNotificaBusquedaFinalizadaEnPUIPayload {
	/**
	 * Identificador técnico: <FUB>-<UUID4>.
	 * Longitud: Min 36, Max 75.
	 */
	id: string

	/** RFC con homoclave de la institución informadora.
	 * Min: 4, Max: 13. Regex: ^[A-Z0-9]{4,13}$
	 */
	institucion_id: string
}

/**
 * Estructura de un reporte activo dentro de la PUI.
 * Basado en la respuesta del endpoint /reportes.
 */
export interface PUIReporteActivo {
	/**
	 * Identificador único técnico del caso (<FUB>-<UUID4>).
	 * Longitud: Min 36, Max 75.
	 */
	id: string

	/**
	 * Clave Única de Registro de Población.
	 * Longitud: Min 18, Max 18.
	 * Expresión Regular: ^[A-Z0-9]{18}$
	 */
	curp: string

	/**
	 * Nombre(s) de la persona.
	 * Longitud: Min 1, Max 50.
	 * Expresión Regular: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{1,50}$
	 */
	nombre: string

	/**
	 * Primer apellido de la persona.
	 * Longitud: Min 1, Max 50.
	 * Expresión Regular: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{1,50}$
	 */
	primer_apellido: string

	/**
	 * Segundo apellido de la persona (Opcional).
	 * Longitud: Max 50.
	 * Expresión Regular: ^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{1,50}$
	 */
	segundo_apellido?: string

	/**
	 * Fecha de nacimiento (ISO 8601).
	 * Longitud: Min 10, Max 10.
	 * Expresión Regular: ^\d{4}-\d{2}-\d{2}$
	 */
	fecha_nacimiento: string

	/**
	 * Fecha de la desaparición o extravío (Opcional).
	 * Longitud: Min 10, Max 10.
	 * Expresión Regular: ^\d{4}-\d{2}-\d{2}$
	 */
	fecha_desaparicion?: string

	/**
	 * Fecha de alta del reporte en el RNPDNO.
	 * Longitud: Min 10, Max 10.
	 * Expresión Regular: ^\d{4}-\d{2}-\d{2}$
	 */
	fecha_registro: string

	/**
	 * Estado de nacimiento según catálogo oficial.
	 * Longitud: Max 20.
	 */
	lugar_nacimiento: PUILugarNacimiento

	/**
	 * Género/Sexo de la persona.
	 * Longitud: Min 1, Max 1.
	 * Expresión Regular: ^[MHX]{1}$
	 */
	sexo_asignado: PUISexoAsignado
}

/** Mensaje de respuesta de la consulta de reportes activos en la PUI */
export type PUIInstitucionConsultaReportesActivosEnPUIResponse = PUIReporteActivo[]

/**
 * Payload recibido por la Institución Diversa en el endpoint /desactivar-reporte.
 * Basado en la Sección 8.2 del Manual Técnico.
 */
export interface PUIPUIDesactivaReporteEnInstitucionPayload {
	/**
	 * Identificador técnico único del caso: <FUB>-<UUID4>.
	 * Longitud: Min 36, Max 75.
	 * Requerido: Sí.
	 */
	id: string
}
