/**
 * @package web
 * @name useDataControllers.ts
 * @version 0.0.3
 * @description Provee controladores de datos respaldados por Firestore.
 * @author @codex
 * @changelog
 * - 0.0.3	(2026-05-01)	Agrega controlador de configuración de cuenta autenticada.	@codex
 * - 0.0.2	(2026-04-27)	Expone filtros extendidos para consultas de logs.	@codex
 * - 0.0.1	(2026-04-18)	Agrega controladores neutrales respaldados por gateways de datos.	@codex
 */

import { computed } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import type { ListLogsFilters } from '@/gateways/firebaseDataGateway';

/**
 * @description Expone carga de instituciones para selección de contexto institucional.
 */
export function useInstitutionSelectionController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadInstitutions: () => store.listInstitutions(),
    loadInstitutionByRfc: (rfc: string) => store.getInstitutionByRfc(rfc),
    loadPermissionsByEmail: (email: string) => store.listPermissionsByEmail(email),
    retry: () => store.clearError(),
  };
}

/**
 * @description Expone lectura de instituciones para inspección de backoffice.
 */
export function useAdminInstitutionsController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadInstitutions: () => store.listInstitutions(),
    loadInstitutionByRfc: (rfc: string) => store.getInstitutionByRfc(rfc),
    retry: () => store.clearError(),
  };
}

/**
 * @description Expone permisos institucionales para inspección por RFC tenant.
 */
export function useAdminTenantPermissionsController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadInstitutionByRfc: (rfc: string) => store.getInstitutionByRfc(rfc),
    loadPermissionsByRfc: (rfc: string) => store.listPermissionsByRfc(rfc),
    retry: () => store.clearError(),
  };
}

/**
 * @description Expone lecturas tenant de backoffice por RFC.
 */
export function useAdminTenantInspectionController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    loadInstitutionByRfc: (rfc: string) => store.getInstitutionByRfc(rfc),
    loadContactsByRfc: (rfc: string) => store.listContactsByRfc(rfc),
    loadRequestsByRfc: (rfc: string) => store.listRequestsByRfc(rfc),
    updateInstitutionPlan: (rfc: string, input: Parameters<typeof store.updateInstitutionPlan>[1]) =>
      store.updateInstitutionPlan(rfc, input),
    retry: () => store.clearError(),
  };
}

/**
 * @description Expone lectura y mutaciones administrativas para la institucion activa del dominio app.
 */
export function useAppAdminInstitutionController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    loadInstitutionByRfc: (rfc: string) => store.getInstitutionByRfc(rfc),
    loadContactsByRfc: (rfc: string) => store.listContactsByRfc(rfc),
    loadPermissionsByRfc: (rfc: string) => store.listPermissionsByRfc(rfc),
    upsertInstitutionContact: (
      rfc: string,
      contactType: string,
      input: Parameters<typeof store.upsertInstitutionContact>[2],
    ) => store.upsertInstitutionContact(rfc, contactType, input),
    updateInstitutionSharedSecret: (rfc: string, input: { sharedSecret: string }) =>
      store.updateInstitutionSharedSecret(rfc, input),
    createInstitutionPermission: (rfc: string, input: Parameters<typeof store.createInstitutionPermission>[1]) =>
      store.createInstitutionPermission(rfc, input),
    updateInstitutionPermission: (
      rfc: string,
      permissionId: string,
      input: Parameters<typeof store.updateInstitutionPermission>[2],
    ) => store.updateInstitutionPermission(rfc, permissionId, input),
    retry: () => store.clearError(),
  };
}

/**
 * @description Expone alta institucional de backoffice mediante API HTTP.
 */
export function useInstitutionOnboardingController() {
  const store = useDataStore();
  return {
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    create: (input: Parameters<typeof store.createInstitutionOnboarding>[0]) =>
      store.createInstitutionOnboarding(input),
    retry: () => store.clearError(),
  };
}

/**
 * @description Expone lecturas resumidas para dashboard institucional.
 */
export function useDashboardController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadRequests: (rfc: string) => store.listRequestsByRfc(rfc),
    loadFindings: (rfc: string) => store.listFindingsByRfc(rfc),
  };
}

/**
 * @description Expone lecturas de solicitudes por RFC.
 */
export function useRequestsController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadByRfc: (rfc: string) => store.listRequestsByRfc(rfc),
  };
}

/**
 * @description Expone lecturas de hallazgos por RFC.
 */
export function useFindingsController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadByRfc: (rfc: string) => store.listFindingsByRfc(rfc),
  };
}

/**
 * @description Expone lecturas de logs con filtros opcionales.
 */
export function useLogsController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    load: (filters: ListLogsFilters = {}) => store.listLogs(filters),
    loadInstitutions: () => store.listInstitutions(),
    retry: () => store.clearError(),
  };
}

/**
 * @description Expone lectura y escritura de perfil para configuración de cuenta autenticada.
 */
export function useAccountSettingsController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    loadUserById: (userId: string) => store.getUserById(userId),
    updateAccountProfile: (input: Parameters<typeof store.updateAccountProfile>[0]) => store.updateAccountProfile(input),
    retry: () => store.clearError(),
  };
}
