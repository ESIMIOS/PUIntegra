/**
 * @package web
 * @name mockDataStore.ts
 * @version 0.0.1
 * @description Gestiona estado reactivo mock para hidratación, mutaciones y errores de datos.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { defineStore } from 'pinia';
import { createMockDataService } from '@/mock/services/mockDataService';
import { canonicalMockSeedDataset, cloneMockDataset } from '@/mock/seed/mockSeed';
import { withMockControllerDelay } from '@/mock/controllers/controllerDelay';
import { isMockDataError, MockDataError, MOCK_DATA_ERROR_KIND } from '@/mock/errors/mockDataError';
import { systemMessageTree, webUiDataErrorByKind } from '@/shared/constants/systemMessages';
import { logSystemMessage } from '@/shared/logging/systemLogger';

const mockDataService = createMockDataService();

/**
 * @description Maps technical error kinds to user-safe messages.
 */
function resolveUserErrorMessage(error: unknown) {
  if (isMockDataError(error)) {
    return webUiDataErrorByKind[error.kind].message;
  }
  return webUiDataErrorByKind[MOCK_DATA_ERROR_KIND.UNKNOWN].message;
}

// waitMockReadDelay is replaced by withMockControllerDelay

export const useMockDataStore = defineStore('mock-data', {
  state: () => ({
    dataset: cloneMockDataset(canonicalMockSeedDataset),
    isLoading: false,
    isSaving: false,
    error: null as MockDataError | null,
    userErrorMessage: null as string | null
  }),
  actions: {
    clearError() {
      this.error = null;
      this.userErrorMessage = null;
    },
    /**
     * @description Captura errores externos al store para exponer estado seguro en UI.
     */
    captureExternalError(error: unknown, fallbackMessage: string) {
      this.error = isMockDataError(error)
        ? error
        : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, fallbackMessage, { error });
      this.userErrorMessage = resolveUserErrorMessage(this.error);
    },
    async hydrate() {
      this.isLoading = true;
      this.clearError();
      try {
        this.dataset = await withMockControllerDelay(async () => mockDataService.hydrate());
        return this.dataset;
      } catch (error) {
        this.error = new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to hydrate mock dataset.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.web.mock.hydrationFailed, {
          operation: 'hydrate',
          errorKind: this.error.kind
        });
        throw this.error;
      } finally {
        this.isLoading = false;
      }
    },
    async reset() {
      this.isSaving = true;
      this.clearError();
      try {
        this.dataset = await withMockControllerDelay(async () => mockDataService.reset());
        return this.dataset;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to reset mock dataset.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.web.mock.resetFailed, {
          operation: 'reset',
          errorKind: this.error.kind
        });
        throw this.error;
      } finally {
        this.isSaving = false;
      }
    },
    async listInstitutions() {
      this.isLoading = true;
      this.clearError();
      try {
        const institutions = await withMockControllerDelay(async () => mockDataService.listInstitutions());
        return institutions;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list institutions.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.unknownFailure, {
          operation: 'listInstitutions',
          errorKind: this.error.kind
        });
        throw this.error;
      } finally {
        this.isLoading = false;
      }
    },
    async listPermissionsByUser(userId: string) {
      this.isLoading = true;
      this.clearError();
      try {
        const permissions = await withMockControllerDelay(async () => mockDataService.listPermissionsByUser(userId));
        return permissions;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list permissions.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.unknownFailure, {
          operation: 'listPermissionsByUser',
          errorKind: this.error.kind,
          entityType: 'permission',
          entityId: userId
        });
        throw this.error;
      } finally {
        this.isLoading = false;
      }
    },
    async resolveSessionProfileByRole(role: 'ANONYMOUS' | 'INSTITUTION_ADMIN' | 'INSTITUTION_OPERATOR' | 'SYSTEM_ADMINISTRATOR') {
      return mockDataService.resolveSessionProfileByRole(role);
    },
    async updateAccountSettings(input: Parameters<typeof mockDataService.updateAccountSettings>[0]) {
      this.isSaving = true;
      this.clearError();
      try {
        const user = await withMockControllerDelay(async () => mockDataService.updateAccountSettings(input));
        this.dataset = mockDataService.getDataset();
        return user;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to update account settings.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.validationFailed, {
          operation: 'updateAccountSettings',
          errorKind: this.error.kind,
          activeRole: input.updatedByRole,
          entityType: 'user',
          entityId: input.userId
        });
        throw this.error;
      } finally {
        this.isSaving = false;
      }
    },
    async updateInstitutionSettings(input: Parameters<typeof mockDataService.updateInstitutionSettings>[0]) {
      this.isSaving = true;
      this.clearError();
      try {
        const institution = await withMockControllerDelay(async () => mockDataService.updateInstitutionSettings(input));
        this.dataset = mockDataService.getDataset();
        return institution;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to update institution settings.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.validationFailed, {
          operation: 'updateInstitutionSettings',
          errorKind: this.error.kind,
          activeRole: input.updatedByRole,
          RFC: input.rfc,
          entityType: 'institution',
          entityId: input.rfc
        });
        throw this.error;
      } finally {
        this.isSaving = false;
      }
    },
    async createPermission(input: Parameters<typeof mockDataService.createPermission>[0]) {
      this.isSaving = true;
      this.clearError();
      try {
        const permission = await withMockControllerDelay(async () => mockDataService.createPermission(input));
        this.dataset = mockDataService.getDataset();
        return permission;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to create permission.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.conflictDetected, {
          operation: 'createPermission',
          errorKind: this.error.kind,
          activeRole: input.updatedByRole,
          RFC: input.RFC,
          entityType: 'permission'
        });
        throw this.error;
      } finally {
        this.isSaving = false;
      }
    },
    async updatePermission(input: Parameters<typeof mockDataService.updatePermission>[0]) {
      this.isSaving = true;
      this.clearError();
      try {
        const permission = await withMockControllerDelay(async () => mockDataService.updatePermission(input));
        this.dataset = mockDataService.getDataset();
        return permission;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to update permission.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.notFound, {
          operation: 'updatePermission',
          errorKind: this.error.kind,
          activeRole: input.updatedByRole,
          entityType: 'permission',
          entityId: input.permissionId
        });
        throw this.error;
      } finally {
        this.isSaving = false;
      }
    },
    async listContactsByRfc(rfc: string) {
      this.isLoading = true;
      this.clearError();
      try {
        const contacts = await withMockControllerDelay(async () => mockDataService.listContactsByRfc(rfc));
        return contacts;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list contacts.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.unknownFailure, {
          operation: 'listContactsByRfc',
          errorKind: this.error.kind,
          RFC: rfc,
          entityType: 'contact'
        });
        throw this.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createContact(input: Parameters<typeof mockDataService.createContact>[0]) {
      this.isSaving = true;
      this.clearError();
      try {
        const contact = await withMockControllerDelay(async () => mockDataService.createContact(input));
        this.dataset = mockDataService.getDataset();
        return contact;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to create contact.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.validationFailed, {
          operation: 'createContact',
          errorKind: this.error.kind,
          activeRole: input.updatedByRole,
          RFC: input.rfc,
          entityType: 'contact'
        });
        throw this.error;
      } finally {
        this.isSaving = false;
      }
    },
    async updateContact(input: Parameters<typeof mockDataService.updateContact>[0]) {
      this.isSaving = true;
      this.clearError();
      try {
        const contact = await withMockControllerDelay(async () => mockDataService.updateContact(input));
        this.dataset = mockDataService.getDataset();
        return contact;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to update contact.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.notFound, {
          operation: 'updateContact',
          errorKind: this.error.kind,
          activeRole: input.updatedByRole,
          entityType: 'contact',
          entityId: input.contactId
        });
        throw this.error;
      } finally {
        this.isSaving = false;
      }
    },
    async listRequestsByRfc(rfc: string) {
      this.isLoading = true;
      this.clearError();
      try {
        const requests = await withMockControllerDelay(async () => mockDataService.listRequestsByRfc(rfc));
        return requests;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list requests.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.unknownFailure, {
          operation: 'listRequestsByRfc',
          errorKind: this.error.kind,
          RFC: rfc,
          entityType: 'request'
        });
        throw this.error;
      } finally {
        this.isLoading = false;
      }
    },
    async listFindingsByRfc(rfc: string) {
      this.isLoading = true;
      this.clearError();
      try {
        const findings = await withMockControllerDelay(async () => mockDataService.listFindingsByRfc(rfc));
        return findings;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list findings.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.unknownFailure, {
          operation: 'listFindingsByRfc',
          errorKind: this.error.kind,
          RFC: rfc,
          entityType: 'finding'
        });
        throw this.error;
      } finally {
        this.isLoading = false;
      }
    },
    async listLogs(filters: { RFC?: string; userId?: string } = {}) {
      this.isLoading = true;
      this.clearError();
      try {
        const logs = await withMockControllerDelay(async () => mockDataService.listLogs(filters));
        return logs;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list logs.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(systemMessageTree.shared.data.mock.unknownFailure, {
          operation: 'listLogs',
          errorKind: this.error.kind,
          ...filters,
          entityType: 'log'
        });
        throw this.error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
