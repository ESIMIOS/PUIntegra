/**
 * @package web
 * @name authStore.ts
 * @version 0.0.2
 * @description Gestiona estado mock de autenticación, rol activo y requisitos de seguridad.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2(2026-04-14)Extracted anonymousState factory; resetToAnonymous delegates to $reset().@tirsomartinezreyes
 * - 0.0.1(2026-04-10)Versión inicial del archivo.@tirsomartinezreyes
 */

import { defineStore, AuthenticatedRoleSchema, RoleSchema, ROLE, z } from '@/bom'

/** Mock RFCs used only as seed data for development. */
const DEV_MOCK_RFCS = ['XAXX010101000', 'BBB010101BBB']
type Role = z.infer<typeof RoleSchema>

/** Single source of truth for the unauthenticated state shape. */
function anonymousState() {
	return {
		isAuthenticated: false,
		activeRole: ROLE.ANONYMOUS as Role,
		requiresSecuritySetup: false,
		allowedInstitutionRfcs: [] as string[],
		uid: null as string | null,
		email: null as string | null
	}
}

/**
 * @description Store de sesión mock para autenticación, rol activo y estado de bootstrap de seguridad.
 */
export const useAuthStore = defineStore('auth', {
	state: () => ({
		...anonymousState()
	}),
	actions: {
		setAuthenticated(value: boolean) {
			this.isAuthenticated = value
			if (!value) {
				this.activeRole = ROLE.ANONYMOUS
			}
		},
		setRole(role: Role) {
			this.activeRole = role
			this.isAuthenticated = role !== ROLE.ANONYMOUS
			// Seed mock RFCs for development when transitioning to an authenticated role
			if (role !== ROLE.ANONYMOUS && this.allowedInstitutionRfcs.length === 0) {
				this.allowedInstitutionRfcs = DEV_MOCK_RFCS
			}
		},
		setRequiresSecuritySetup(value: boolean) {
			this.requiresSecuritySetup = value
		},
		setAllowedInstitutionRfcs(rfcs: string[]) {
			this.allowedInstitutionRfcs = rfcs
		},
		ensureAuthenticatedRole() {
			const parsed = AuthenticatedRoleSchema.safeParse(this.activeRole)
			if (!parsed.success) {
				this.activeRole = ROLE.INSTITUTION_ADMIN
			}
			this.isAuthenticated = true
		},
		resetToAnonymous() {
			this.$reset()
		}
	}
})
