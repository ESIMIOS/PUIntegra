/**
 * @package web
 * @name domains.ts
 * @version 0.0.1
 * @description Centraliza los dominios de layout usados por rutas, guards y utilidades de desarrollo.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod'

export const DOMAIN = {
	SITE: 'site',
	AUTH: 'auth',
	APP: 'app',
	ADMIN: 'admin',
	ACCOUNT: 'account',
	ERROR: 'error'
} as const

export const domainValues = [DOMAIN.SITE, DOMAIN.AUTH, DOMAIN.APP, DOMAIN.ADMIN, DOMAIN.ACCOUNT, DOMAIN.ERROR] as const

export const domainLabels = {
	[DOMAIN.SITE]: 'Site',
	[DOMAIN.AUTH]: 'Auth',
	[DOMAIN.APP]: 'App',
	[DOMAIN.ADMIN]: 'Admin',
	[DOMAIN.ACCOUNT]: 'Account',
	[DOMAIN.ERROR]: 'Error'
} as const

export const domainOptions = domainValues.map((key) => ({
	key,
	label: domainLabels[key]
})) as ReadonlyArray<{
	key: (typeof domainValues)[number]
	label: (typeof domainLabels)[(typeof domainValues)[number]]
}>

export const domainShell = {
	[DOMAIN.SITE]: {
		title: 'PUIntegra - Sitio público',
		accentColor: '#0B1F4C',
		structure: 'navbar + footer'
	},
	[DOMAIN.AUTH]: {
		title: 'PUIntegra - Autenticación',
		accentColor: '#1A3A6B',
		structure: 'centered auth surface'
	},
	[DOMAIN.APP]: {
		title: 'Operación institucional',
		accentColor: '#3BB54A',
		structure: 'sidebar + top bar',
		chipLabel: 'RFC Institución'
	},
	[DOMAIN.ADMIN]: {
		title: 'Backoffice del proveedor',
		accentColor: '#7E57C2',
		structure: 'sidebar + top bar',
		chipLabel: 'RFC Institución'
	},
	[DOMAIN.ACCOUNT]: {
		title: 'Cuenta personal',
		accentColor: '#2C88D9',
		structure: 'top bar + subnavigation'
	},
	[DOMAIN.ERROR]: {
		title: 'Dominio de errores',
		accentColor: '#D3455B',
		structure: 'centered error display'
	}
} as const

export const DomainSchema = z.enum(domainValues)
