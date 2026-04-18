/**
 * @package web
 * @name useMockSession.ts
 * @version 0.0.1
 * @description Provee bindings reactivos para manipular sesión mock desde la UI de desarrollo.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { computed, onMounted } from 'vue';
import { z } from 'zod';
import { ROLE, RoleSchema } from '@shared';
import { useAuthStore } from '@/stores/authStore';
import { useMockDataStore } from '@/stores/mockDataStore';
import { useInstitutionStore } from '@/stores/institutionStore';
import { withMockControllerDelay } from '@/mock/controllers/controllerDelay';
import { logSystemMessage } from '@/shared/logging/systemLogger';
import { systemMessageTree } from '@/shared/constants/systemMessages';

/**
 * @description Provee modelos reactivos para alternar estado de sesión mock desde el panel de desarrollo.
 */
export function useMockSession() {
  const authStore = useAuthStore();
  const institutionStore = useInstitutionStore();
  const mockDataStore = useMockDataStore();
  let latestRoleSyncRequestId = 0;

  /**
   * @description Sincroniza RFC fijo por rol: anónimo vacío, sistema SYSTEM_RFC, institucional DEFAULT_RFC.
   */
  async function syncSessionForRole(role: z.infer<typeof RoleSchema>, requestId: number) {
    if (requestId !== latestRoleSyncRequestId) {
      return;
    }

    if (role === ROLE.ANONYMOUS) {
      authStore.setAllowedInstitutionRfcs([]);
      authStore.setIdentity({ uid: null, email: null });
      institutionStore.clearActiveRfc();
      return;
    }

    const profile = await mockDataStore.resolveSessionProfileByRole(role);
    if (requestId !== latestRoleSyncRequestId) {
      return;
    }

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

  /**
   * @description Captura fallos de sesión mock para evitar promesas no manejadas.
   */
  function handleSessionFailure(error: unknown, operation: string, role?: z.infer<typeof RoleSchema>) {
    mockDataStore.captureExternalError(error, 'Failed to sync mock session.');
    logSystemMessage(systemMessageTree.shared.data.mock.unknownFailure, {
      operation,
      errorKind: mockDataStore.error?.kind ?? 'UNKNOWN',
      activeRole: role ?? authStore.activeRole
    });
  }

  /**
   * @description Aplica cambio de rol y sincroniza sesión sin propagar rechazo.
   */
  async function applyRoleChange(role: z.infer<typeof RoleSchema>) {
    const requestId = ++latestRoleSyncRequestId;
    authStore.setRole(role);
    try {
      await withMockControllerDelay(() => syncSessionForRole(role, requestId));
    } catch (error) {
      handleSessionFailure(error, 'useMockSession.applyRoleChange', role);
    }
  }

  const roleModel = computed({
    get: () => authStore.activeRole,
    set: (value: z.infer<typeof RoleSchema>) => {
      void applyRoleChange(value);
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
    authStore.setRequiresSecuritySetup(false);
    await applyRoleChange(ROLE.INSTITUTION_ADMIN);
  }

  /**
   * @description Ajusta la sesión mock al perfil operador institucional.
   */
  async function setInstitutionOperator() {
    authStore.setRequiresSecuritySetup(false);
    await applyRoleChange(ROLE.INSTITUTION_OPERATOR);
  }

  /**
   * @description Ajusta la sesión mock al perfil administrador del proveedor.
   */
  async function setSystemAdministrator() {
    authStore.setRequiresSecuritySetup(false);
    await applyRoleChange(ROLE.SYSTEM_ADMINISTRATOR);
  }

  onMounted(() => {
    const requestId = ++latestRoleSyncRequestId;
    void (async () => {
      try {
        if (authStore.activeRole !== ROLE.ANONYMOUS) {
          await mockDataStore.hydrate();
        }
        await syncSessionForRole(authStore.activeRole, requestId);
      } catch (error) {
        handleSessionFailure(error, 'useMockSession.onMounted');
      }
    })();
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
