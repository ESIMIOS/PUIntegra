/**
 * @package web
 * @name useDataControllers.ts
 * @version 0.0.1
 * @description Provee controladores de datos respaldados por Firestore.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-18)	Agrega controladores neutrales respaldados por gateways de datos.	@codex
 */

import { computed } from 'vue';
import { useDataStore } from '@/stores/dataStore';

/**
 * @description Expone carga de instituciones para selección de contexto institucional.
 */
export function useInstitutionSelectionController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadInstitutions: () => store.listInstitutions()
  };
}

/**
 * @description Expone acciones de guardado para ajustes de cuenta.
 */
export function useAccountSettingsController() {
  const store = useDataStore();
  return {
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    save: (input: Parameters<typeof store.updateAccountSettings>[0]) => store.updateAccountSettings(input),
    retry: () => store.clearError()
  };
}

/**
 * @description Expone acciones de guardado para ajustes institucionales.
 */
export function useInstitutionSettingsController() {
  const store = useDataStore();
  return {
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    save: (input: Parameters<typeof store.updateInstitutionSettings>[0]) => store.updateInstitutionSettings(input),
    retry: () => store.clearError()
  };
}

/**
 * @description Expone operaciones de permisos institucionales y de sistema.
 */
export function usePermissionsController() {
  const store = useDataStore();
  return {
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    listByUser: (userId: string) => store.listPermissionsByUser(userId),
    create: (input: Parameters<typeof store.createPermission>[0]) => store.createPermission(input),
    update: (input: Parameters<typeof store.updatePermission>[0]) => store.updatePermission(input),
    retry: () => store.clearError()
  };
}

/**
 * @description Expone operaciones de contactos institucionales.
 */
export function useContactsController() {
  const store = useDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    loadByRfc: (rfc: string) => store.listContactsByRfc(rfc),
    create: (input: Parameters<typeof store.createContact>[0]) => store.createContact(input),
    update: (input: Parameters<typeof store.updateContact>[0]) => store.updateContact(input),
    retry: () => store.clearError()
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
    loadFindings: (rfc: string) => store.listFindingsByRfc(rfc)
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
    loadByRfc: (rfc: string) => store.listRequestsByRfc(rfc)
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
    loadByRfc: (rfc: string) => store.listFindingsByRfc(rfc)
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
    load: (filters: { RFC?: string; userId?: string } = {}) => store.listLogs(filters)
  };
}
