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
  onMounted,
  ROLE,
  RoleSchema,
  z,
  useAuthStore,
  useMockDataStore,
  useInstitutionStore,
  withMockControllerDelay
} from '@/bom';

/**
 * @description Provee modelos reactivos para alternar estado de sesión mock desde el panel de desarrollo.
 */
export function useMockSession() {
  const authStore = useAuthStore();
  const institutionStore = useInstitutionStore();
  const mockDataStore = useMockDataStore();

  /**
   * @description Sincroniza RFC fijo por rol: anónimo vacío, sistema SYSTEM_RFC, institucional DEFAULT_RFC.
   */
  async function syncSessionForRole(role: z.infer<typeof RoleSchema>) {
    const profile = await mockDataStore.resolveSessionProfileByRole(role);
    authStore.setAllowedInstitutionRfcs(profile.allowedInstitutionRfcs);
    authStore.setIdentity({
      uid: profile.user.userId,
      email: profile.user.email
    });
    if (!profile.activeRfc) {
      institutionStore.clearActiveRfc();
      return;
    }
    institutionStore.setActiveRfc(profile.activeRfc);
  }

  const roleModel = computed({
    get: () => authStore.activeRole,
    set: async (value: z.infer<typeof RoleSchema>) => {
      authStore.setRole(value);
      await withMockControllerDelay(() => syncSessionForRole(value));
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
    institutionStore.clearActiveRfc();
  }

  /**
   * @description Ajusta la sesión mock al perfil administrador institucional.
   */
  async function setInstitutionAdmin() {
    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setRequiresSecuritySetup(false);
    await withMockControllerDelay(() => syncSessionForRole(ROLE.INSTITUTION_ADMIN));
  }

  /**
   * @description Ajusta la sesión mock al perfil operador institucional.
   */
  async function setInstitutionOperator() {
    authStore.setRole(ROLE.INSTITUTION_OPERATOR);
    authStore.setRequiresSecuritySetup(false);
    await withMockControllerDelay(() => syncSessionForRole(ROLE.INSTITUTION_OPERATOR));
  }

  /**
   * @description Ajusta la sesión mock al perfil administrador del proveedor.
   */
  async function setSystemAdministrator() {
    authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
    authStore.setRequiresSecuritySetup(false);
    await withMockControllerDelay(() => syncSessionForRole(ROLE.SYSTEM_ADMINISTRATOR));
  }

  onMounted(async () => {
    await mockDataStore.hydrate();
    await syncSessionForRole(authStore.activeRole);
  });

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
