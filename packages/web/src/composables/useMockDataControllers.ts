/**
 * @package web
 * @name useMockDataControllers.ts
 * @version 0.0.1
 * @description Provee controladores de datos mock orientados a consumo de vistas futuras.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { computed } from '@/bom';
import { withMockControllerDelay } from '@/mock/controllers/controllerDelay';
import { useMockDataStore } from '@/stores/mockDataStore';

/**
 * @description Controller for institution selection use cases.
 */
export function useInstitutionSelectionController() {
  const store = useMockDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadInstitutions: () => withMockControllerDelay(() => store.listInstitutions())
  };
}

/**
 * @description Controller for account settings mutations.
 */
export function useAccountSettingsController() {
  const store = useMockDataStore();
  return {
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    save: (input: Parameters<typeof store.updateAccountSettings>[0]) =>
      withMockControllerDelay(() => store.updateAccountSettings(input)),
    retry: () => store.clearError()
  };
}

/**
 * @description Controller for institution settings mutations.
 */
export function useInstitutionSettingsController() {
  const store = useMockDataStore();
  return {
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    save: (input: Parameters<typeof store.updateInstitutionSettings>[0]) =>
      withMockControllerDelay(() => store.updateInstitutionSettings(input)),
    retry: () => store.clearError()
  };
}

/**
 * @description Controller for permission list and mutation operations.
 */
export function usePermissionsController() {
  const store = useMockDataStore();
  return {
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    listByUser: (userId: string) => withMockControllerDelay(() => store.listPermissionsByUser(userId)),
    create: (input: Parameters<typeof store.createPermission>[0]) =>
      withMockControllerDelay(() => store.createPermission(input)),
    update: (input: Parameters<typeof store.updatePermission>[0]) =>
      withMockControllerDelay(() => store.updatePermission(input)),
    retry: () => store.clearError()
  };
}

/**
 * @description Controller for contact list reads by tenant.
 */
export function useContactsController() {
  const store = useMockDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    loadByRfc: (rfc: string) => withMockControllerDelay(() => store.listContactsByRfc(rfc)),
    create: (input: Parameters<typeof store.createContact>[0]) =>
      withMockControllerDelay(() => store.createContact(input)),
    update: (input: Parameters<typeof store.updateContact>[0]) =>
      withMockControllerDelay(() => store.updateContact(input)),
    retry: () => store.clearError()
  };
}

/**
 * @description Controller for dashboard read models based on requests and findings.
 */
export function useDashboardController() {
  const store = useMockDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadRequests: (rfc: string) => withMockControllerDelay(() => store.listRequestsByRfc(rfc)),
    loadFindings: (rfc: string) => withMockControllerDelay(() => store.listFindingsByRfc(rfc))
  };
}

/**
 * @description Controller for request read operations by tenant.
 */
export function useRequestsController() {
  const store = useMockDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadByRfc: (rfc: string) => withMockControllerDelay(() => store.listRequestsByRfc(rfc))
  };
}

/**
 * @description Controller for finding read operations by tenant.
 */
export function useFindingsController() {
  const store = useMockDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    loadByRfc: (rfc: string) => withMockControllerDelay(() => store.listFindingsByRfc(rfc))
  };
}

/**
 * @description Controller for logs read operations.
 */
export function useLogsController() {
  const store = useMockDataStore();
  return {
    isLoading: computed(() => store.isLoading),
    errorMessage: computed(() => store.userErrorMessage),
    load: (filters: { RFC?: string; userId?: string } = {}) =>
      withMockControllerDelay(() => store.listLogs(filters))
  };
}

/**
 * @description Controller for reset operations over persisted mock dataset.
 */
export function useMockDataResetController() {
  const store = useMockDataStore();
  return {
    isSaving: computed(() => store.isSaving),
    errorMessage: computed(() => store.userErrorMessage),
    reset: () => withMockControllerDelay(() => store.reset())
  };
}
