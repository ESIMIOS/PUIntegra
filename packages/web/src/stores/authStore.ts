/**
 * @package web
 * @name authStore.ts
 * @version 0.0.1
 * @description Gestiona estado mock de autenticación, rol activo y requisitos de seguridad.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { defineStore, AuthenticatedRoleSchema, RoleSchema, ROLE, z } from '@/bom';

const DEFAULT_RFCS = ['XAXX010101000', 'BBB010101BBB'];
type Role = z.infer<typeof RoleSchema>;

/**
 * @description Store de sesión mock para autenticación, rol activo y estado de bootstrap de seguridad.
 */
export const useAuthStore = defineStore('auth', {
  state: (): {
    isAuthenticated: boolean;
    activeRole: Role;
    requiresSecuritySetup: boolean;
    allowedInstitutionRfcs: string[];
    uid: string | null;
    email: string | null;
  } => ({
    isAuthenticated: false,
    activeRole: ROLE.ANONYMOUS,
    requiresSecuritySetup: false,
    allowedInstitutionRfcs: DEFAULT_RFCS,
    uid: null,
    email: null
  }),
  actions: {
    setAuthenticated(value: boolean) {
      this.isAuthenticated = value;
      if (!value) {
        this.activeRole = ROLE.ANONYMOUS;
      }
    },
    setRole(role: Role) {
      this.activeRole = role;
      this.isAuthenticated = role !== ROLE.ANONYMOUS;
    },
    setRequiresSecuritySetup(value: boolean) {
      this.requiresSecuritySetup = value;
    },
    setAllowedInstitutionRfcs(rfcs: string[]) {
      this.allowedInstitutionRfcs = rfcs;
    },
    ensureAuthenticatedRole() {
      const parsed = AuthenticatedRoleSchema.safeParse(this.activeRole);
      if (!parsed.success) {
        this.activeRole = ROLE.INSTITUTION_ADMIN;
      }
      this.isAuthenticated = true;
    },
    resetToAnonymous() {
      this.isAuthenticated = false;
      this.activeRole = ROLE.ANONYMOUS;
      this.requiresSecuritySetup = false;
      this.uid = null;
      this.email = null;
    }
  }
});
