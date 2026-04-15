/**
 * @package shared
 * @name pui-transport.schema.ts
 * @version 0.0.1
 * @description Define contratos Zod para payloads de transporte de la Plataforma Única de Información.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial del contrato de transporte PUI basado en Zod.	@tirsomartinezreyes
 */

import { z } from 'zod'

export const PUI_RFC_REGEX = /^[A-Z0-9]{4,13}$/
export const PUI_CURP_REGEX = /^[A-Z0-9]{18}$/
export const PUI_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
export const PUI_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+.]).{16,20}$/
export const PUI_PERSON_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{1,50}$/
export const PUI_OPTIONAL_PERSON_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ '-]{0,50}$/
export const PUI_TEXT_20_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()-]{0,20}$/
export const PUI_TEXT_40_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()-]{0,40}$/
export const PUI_TEXT_50_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()-]{0,50}$/
export const PUI_TEXT_100_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()-]{0,100}$/
export const PUI_TEXT_500_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#'/:()-]{0,500}$/
export const PUI_POSTAL_CODE_REGEX = /^\d{0,5}$/
export const PUI_PHONE_REGEX = /^\+?\d{0,15}$/
export const PUI_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,50}$/
export const PUI_CASE_ID_REGEX = /^.+-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

export const PUI_LUGAR_NACIMIENTO = {
	AS: 'AGUASCALIENTES',
	BC: 'BAJA CALIFORNIA',
	BS: 'BAJA CALIFORNIA SUR',
	CC: 'CAMPECHE',
	CS: 'CHIAPAS',
	CH: 'CHIHUAHUA',
	DF: 'CDMX',
	CL: 'COAHUILA',
	CM: 'COLIMA',
	DG: 'DURANGO',
	GT: 'GUANAJUATO',
	GR: 'GUERRERO',
	HG: 'HIDALGO',
	JC: 'JALISCO',
	MC: 'MÉXICO',
	MN: 'MICHOACÁN',
	MS: 'MORELOS',
	NT: 'NAYARIT',
	NL: 'NUEVO LEÓN',
	OC: 'OAXACA',
	PL: 'PUEBLA',
	QO: 'QUERÉTARO',
	QR: 'QUINTANA ROO',
	SP: 'SAN LUIS POTOSÍ',
	SL: 'SINALOA',
	SR: 'SONORA',
	TC: 'TABASCO',
	TS: 'TAMAULIPAS',
	TL: 'TLAXCALA',
	VZ: 'VERACRUZ',
	YN: 'YUCATÁN',
	ZS: 'ZACATECAS',
	NE: 'FORÁNEO',
	XX: 'DESCONOCIDO'
} as const

export const PuiLugarNacimientoValues = [
	PUI_LUGAR_NACIMIENTO.AS,
	PUI_LUGAR_NACIMIENTO.BC,
	PUI_LUGAR_NACIMIENTO.BS,
	PUI_LUGAR_NACIMIENTO.CC,
	PUI_LUGAR_NACIMIENTO.CS,
	PUI_LUGAR_NACIMIENTO.CH,
	PUI_LUGAR_NACIMIENTO.DF,
	PUI_LUGAR_NACIMIENTO.CL,
	PUI_LUGAR_NACIMIENTO.CM,
	PUI_LUGAR_NACIMIENTO.DG,
	PUI_LUGAR_NACIMIENTO.GT,
	PUI_LUGAR_NACIMIENTO.GR,
	PUI_LUGAR_NACIMIENTO.HG,
	PUI_LUGAR_NACIMIENTO.JC,
	PUI_LUGAR_NACIMIENTO.MC,
	PUI_LUGAR_NACIMIENTO.MN,
	PUI_LUGAR_NACIMIENTO.MS,
	PUI_LUGAR_NACIMIENTO.NT,
	PUI_LUGAR_NACIMIENTO.NL,
	PUI_LUGAR_NACIMIENTO.OC,
	PUI_LUGAR_NACIMIENTO.PL,
	PUI_LUGAR_NACIMIENTO.QO,
	PUI_LUGAR_NACIMIENTO.QR,
	PUI_LUGAR_NACIMIENTO.SP,
	PUI_LUGAR_NACIMIENTO.SL,
	PUI_LUGAR_NACIMIENTO.SR,
	PUI_LUGAR_NACIMIENTO.TC,
	PUI_LUGAR_NACIMIENTO.TS,
	PUI_LUGAR_NACIMIENTO.TL,
	PUI_LUGAR_NACIMIENTO.VZ,
	PUI_LUGAR_NACIMIENTO.YN,
	PUI_LUGAR_NACIMIENTO.ZS,
	PUI_LUGAR_NACIMIENTO.NE,
	PUI_LUGAR_NACIMIENTO.XX
] as const

export const PUI_SEXO_ASIGNADO = {
	H: 'H',
	M: 'M',
	X: 'X'
} as const
export const PuiSexoAsignadoValues = [PUI_SEXO_ASIGNADO.H, PUI_SEXO_ASIGNADO.M, PUI_SEXO_ASIGNADO.X] as const

export const PUI_FASE_BUSQUEDA = {
	FASE_1: '1',
	FASE_2: '2',
	FASE_3: '3'
} as const
export const PuiFaseBusquedaValues = [PUI_FASE_BUSQUEDA.FASE_1, PUI_FASE_BUSQUEDA.FASE_2, PUI_FASE_BUSQUEDA.FASE_3] as const

export const PUI_ETIQUETA_HUELLA = {
	R1: 'rone',
	R2: 'rtwo',
	R3: 'rthree',
	R4: 'rfour',
	R5: 'rfive',
	L1: 'lone',
	L2: 'ltwo',
	L3: 'lthree',
	L4: 'lfour',
	L5: 'lfive',
	RPALM: 'rpalm',
	LPALM: 'lpalm'
} as const
export const PuiEtiquetaHuellaValues = [
	PUI_ETIQUETA_HUELLA.R1,
	PUI_ETIQUETA_HUELLA.R2,
	PUI_ETIQUETA_HUELLA.R3,
	PUI_ETIQUETA_HUELLA.R4,
	PUI_ETIQUETA_HUELLA.R5,
	PUI_ETIQUETA_HUELLA.L1,
	PUI_ETIQUETA_HUELLA.L2,
	PUI_ETIQUETA_HUELLA.L3,
	PUI_ETIQUETA_HUELLA.L4,
	PUI_ETIQUETA_HUELLA.L5,
	PUI_ETIQUETA_HUELLA.RPALM,
	PUI_ETIQUETA_HUELLA.LPALM
] as const

export const PuiRfcSchema = z.string().regex(PUI_RFC_REGEX)
export const PuiCurpSchema = z.string().regex(PUI_CURP_REGEX)
export const PuiDateSchema = z.string().length(10).regex(PUI_DATE_REGEX)
export const PuiCaseIdSchema = z.string().min(36).max(75).regex(PUI_CASE_ID_REGEX)
export const PuiPasswordSchema = z.string().min(16).max(20).regex(PUI_PASSWORD_REGEX)
export const PuiLugarNacimientoSchema = z.enum(PuiLugarNacimientoValues)
export const PuiSexoAsignadoSchema = z.enum(PuiSexoAsignadoValues)
export const PuiFaseBusquedaSchema = z.enum(PuiFaseBusquedaValues)
export const PuiEtiquetaHuellaSchema = z.enum(PuiEtiquetaHuellaValues)

const PuiPersonNameSchema = z.string().min(1).max(50).regex(PUI_PERSON_NAME_REGEX)
const PuiOptionalPersonNameSchema = z.string().max(50).regex(PUI_OPTIONAL_PERSON_NAME_REGEX)
const PuiPhoneSchema = z.string().max(15).regex(PUI_PHONE_REGEX)
const PuiEmailSchema = z.string().max(50).regex(PUI_EMAIL_REGEX)
const PuiText20Schema = z.string().max(20).regex(PUI_TEXT_20_REGEX)
const PuiText40Schema = z.string().max(40).regex(PUI_TEXT_40_REGEX)
const PuiText50Schema = z.string().max(50).regex(PUI_TEXT_50_REGEX)
const PuiText100Schema = z.string().max(100).regex(PUI_TEXT_100_REGEX)
const PuiText500Schema = z.string().max(500).regex(PUI_TEXT_500_REGEX)
const PuiPostalCodeSchema = z.string().max(5).regex(PUI_POSTAL_CODE_REGEX)

export const PUILoginInstitucionEnPUIRequestSchema = z.object({
	institucion_id: PuiRfcSchema,
	clave: PuiPasswordSchema
})

export const PUILoginPUIEnInstitucionRequestSchema = z.object({
	usuario: z.literal('PUI'),
	clave: PuiPasswordSchema
})

export const PUILoginResponseSchema = z.object({
	token: z.string().min(1)
})

export const PUINombreCompletoSchema = z.object({
	nombre: PuiPersonNameSchema,
	primer_apellido: PuiPersonNameSchema,
	segundo_apellido: PuiPersonNameSchema.optional()
})

export const PUIDomicilioSchema = z.object({
	direccion: PuiText500Schema.optional(),
	calle: PuiText50Schema.optional(),
	numero: PuiText50Schema.optional(),
	colonia: PuiText50Schema.optional(),
	codigo_postal: PuiPostalCodeSchema.optional(),
	municipio_o_alcaldia: PuiText100Schema.optional(),
	entidad_federativa: PuiText40Schema.optional()
})

export const PUIHuellasSchema = z.object({
	rone: z.literal(PUI_ETIQUETA_HUELLA.R1).optional(),
	rtwo: z.literal(PUI_ETIQUETA_HUELLA.R2).optional(),
	rthree: z.literal(PUI_ETIQUETA_HUELLA.R3).optional(),
	rfour: z.literal(PUI_ETIQUETA_HUELLA.R4).optional(),
	rfive: z.literal(PUI_ETIQUETA_HUELLA.R5).optional(),
	lone: z.literal(PUI_ETIQUETA_HUELLA.L1).optional(),
	ltwo: z.literal(PUI_ETIQUETA_HUELLA.L2).optional(),
	lthree: z.literal(PUI_ETIQUETA_HUELLA.L3).optional(),
	lfour: z.literal(PUI_ETIQUETA_HUELLA.L4).optional(),
	lfive: z.literal(PUI_ETIQUETA_HUELLA.L5).optional(),
	rpalm: z.literal(PUI_ETIQUETA_HUELLA.RPALM).optional(),
	lpalm: z.literal(PUI_ETIQUETA_HUELLA.LPALM).optional()
})

const puiEventFieldKeys = ['tipo_evento', 'fecha_evento', 'descripcion_lugar_evento', 'direccion_evento'] as const

export const PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema = z
	.object({
		id: PuiCaseIdSchema,
		institucion_id: PuiRfcSchema,
		curp: PuiCurpSchema,
		fase_busqueda: PuiFaseBusquedaSchema,
		nombre_completo: PUINombreCompletoSchema.optional(),
		fecha_nacimiento: PuiDateSchema.optional(),
		lugar_nacimiento: PuiLugarNacimientoSchema,
		sexo_asignado: PuiSexoAsignadoSchema.optional(),
		telefono: PuiPhoneSchema.optional(),
		correo: PuiEmailSchema.optional(),
		domicilio: PUIDomicilioSchema.optional(),
		fotos: z.array(z.string().min(1)).optional(),
		formato_fotos: z.string().max(20).optional(),
		huellas: PUIHuellasSchema.optional(),
		formato_huellas: z.string().max(50).optional(),
		tipo_evento: PuiText500Schema.optional(),
		fecha_evento: PuiDateSchema.optional(),
		descripcion_lugar_evento: PuiText500Schema.optional(),
		direccion_evento: PUIDomicilioSchema.optional()
	})
	.superRefine((payload, context) => {
		if (payload.fase_busqueda !== PUI_FASE_BUSQUEDA.FASE_1) {
			return
		}

		for (const key of puiEventFieldKeys) {
			if (payload[key] !== undefined) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: [key],
					message: 'Phase one match payloads must omit event-specific fields.'
				})
			}
		}
	})

export const PUINotificarResponseSchema = z.object({
	message: z.string().min(1)
})

export const PUIPUIActivaReporteEnInstitucionPayloadSchema = z.object({
	id: PuiCaseIdSchema,
	curp: PuiCurpSchema,
	nombre: PuiOptionalPersonNameSchema.optional(),
	primer_apellido: PuiOptionalPersonNameSchema.optional(),
	segundo_apellido: PuiOptionalPersonNameSchema.optional(),
	fecha_nacimiento: PuiDateSchema.optional(),
	fecha_desaparicion: PuiDateSchema.optional(),
	lugar_nacimiento: PuiLugarNacimientoSchema,
	sexo_asignado: PuiSexoAsignadoSchema.optional(),
	telefono: PuiPhoneSchema.optional(),
	correo: PuiEmailSchema.optional(),
	direccion: PuiText500Schema.optional(),
	calle: PuiText50Schema.optional(),
	numero: PuiText20Schema.optional(),
	colonia: PuiText50Schema.optional(),
	codigo_postal: PuiPostalCodeSchema.optional(),
	municipio_o_alcaldia: PuiText100Schema.optional(),
	entidad_federativa: PuiText40Schema.optional()
})

export const PUIInstitucionNotificaBusquedaFinalizadaEnPUIPayloadSchema = z.object({
	id: PuiCaseIdSchema,
	institucion_id: PuiRfcSchema
})

export const PUIReporteActivoSchema = z.object({
	id: PuiCaseIdSchema,
	curp: PuiCurpSchema,
	nombre: PuiPersonNameSchema,
	primer_apellido: PuiPersonNameSchema,
	segundo_apellido: PuiPersonNameSchema.optional(),
	fecha_nacimiento: PuiDateSchema,
	fecha_desaparicion: PuiDateSchema.optional(),
	fecha_registro: PuiDateSchema,
	lugar_nacimiento: PuiLugarNacimientoSchema,
	sexo_asignado: PuiSexoAsignadoSchema
})

export const PUIInstitucionConsultaReportesActivosEnPUIResponseSchema = z.array(PUIReporteActivoSchema)

export const PUIPUIDesactivaReporteEnInstitucionPayloadSchema = z.object({
	id: PuiCaseIdSchema
})

export type PuiLugarNacimiento = z.infer<typeof PuiLugarNacimientoSchema>
export type PuiSexoAsignado = z.infer<typeof PuiSexoAsignadoSchema>
export type PuiFaseBusqueda = z.infer<typeof PuiFaseBusquedaSchema>
export type PuiEtiquetaHuella = z.infer<typeof PuiEtiquetaHuellaSchema>
export type PUILoginInstitucionEnPUIRequest = z.infer<typeof PUILoginInstitucionEnPUIRequestSchema>
export type PUILoginPUIEnInstitucionRequest = z.infer<typeof PUILoginPUIEnInstitucionRequestSchema>
export type PUILoginResponse = z.infer<typeof PUILoginResponseSchema>
export type PUINombreCompleto = z.infer<typeof PUINombreCompletoSchema>
export type PUIDomicilio = z.infer<typeof PUIDomicilioSchema>
export type PUIHuellas = z.infer<typeof PUIHuellasSchema>
export type PUIInstitucionNotificaCoincidenciaEnPUIPayload = z.infer<typeof PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema>
export type PUINotificarResponse = z.infer<typeof PUINotificarResponseSchema>
export type PUIPUIActivaReporteEnInstitucionPayload = z.infer<typeof PUIPUIActivaReporteEnInstitucionPayloadSchema>
export type PUIInstitucionNotificaBusquedaFinalizadaEnPUIPayload = z.infer<typeof PUIInstitucionNotificaBusquedaFinalizadaEnPUIPayloadSchema>
export type PUIReporteActivo = z.infer<typeof PUIReporteActivoSchema>
export type PUIInstitucionConsultaReportesActivosEnPUIResponse = z.infer<typeof PUIInstitucionConsultaReportesActivosEnPUIResponseSchema>
export type PUIPUIDesactivaReporteEnInstitucionPayload = z.infer<typeof PUIPUIDesactivaReporteEnInstitucionPayloadSchema>
