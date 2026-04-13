/**
 * @package web
 * @name useMockSession.ts
 * @version 0.0.1
 * @description Provee bindings reactivos para manipular sesión mock desde la UI de desarrollo.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  computed,
  z,
  RoleSchema,
  useAuthStore,
  useInstitutionStore,
  DEFAULT_RFC,
  SYSTEM_RFC,
  ROLE
} from '@/bom';

/**
 * @description Provee modelos reactivos para alternar estado de sesión mock desde el panel de desarrollo.
 */
export function useMockSession() {
  const authStore = useAuthStore();
  const institutionStore = useInstitutionStore();

  /**
   * @description Sincroniza RFC fijo por rol: anónimo vacío, sistema SYSTEM_RFC, institucional DEFAULT_RFC.
   */
  function syncRfcForRole(role: z.infer<typeof RoleSchema>) {
    if (role === ROLE.SYSTEM_ADMINISTRATOR) {
      institutionStore.setActiveRfc(SYSTEM_RFC);
      return;
    }

    if (role === ROLE.ANONYMOUS) {
      institutionStore.clearActiveRfc();
      return;
    }

    if (role === ROLE.INSTITUTION_ADMIN || role === ROLE.INSTITUTION_OPERATOR) {
      institutionStore.setActiveRfc(DEFAULT_RFC);
    }
  }

  const roleModel = computed({
    get: () => authStore.activeRole,
    set: (value: z.infer<typeof RoleSchema>) => {
      authStore.setRole(value);
      syncRfcForRole(value);
    }
  });

  const securityModel = computed({
    get: () => authStore.requiresSecuritySetup,
    set: (value) => authStore.setRequiresSecuritySetup(value)
  });

  const rfcModel = computed(() => institutionStore.activeRfc);

  /**
   * @description Restablece la sesión al rol anónimo y estado base.
   */
  function setAnonymous() {
    authStore.resetToAnonymous();
    syncRfcForRole(ROLE.ANONYMOUS);
  }

  /**
   * @description Ajusta la sesión mock al perfil administrador institucional.
   */
  function setInstitutionAdmin() {
    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setRequiresSecuritySetup(false);
    syncRfcForRole(ROLE.INSTITUTION_ADMIN);
  }

  /**
   * @description Ajusta la sesión mock al perfil operador institucional.
   */
  function setInstitutionOperator() {
    authStore.setRole(ROLE.INSTITUTION_OPERATOR);
    authStore.setRequiresSecuritySetup(false);
    syncRfcForRole(ROLE.INSTITUTION_OPERATOR);
  }

  /**
   * @description Ajusta la sesión mock al perfil administrador del proveedor.
   */
  function setSystemAdministrator() {
    authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
    authStore.setRequiresSecuritySetup(false);
    syncRfcForRole(ROLE.SYSTEM_ADMINISTRATOR);
  }

  return {
    authStore,
    institutionStore,
    roleModel,
    securityModel,
    rfcModel,
    setAnonymous,
    setInstitutionAdmin,
    setInstitutionOperator,
    setSystemAdministrator
  };
}
