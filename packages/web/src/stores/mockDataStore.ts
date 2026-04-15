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
import { MOCK_MILLISECONDS_RESPONSE_DELAY } from '@/mock/constants/mockConfig';
import { isMockDataError, MockDataError, MOCK_DATA_ERROR_KIND } from '@/mock/errors/mockDataError';
import { webUiDataErrorByKind } from '@/shared/constants/webUIMessages';
import { webSystemMessages } from '@/shared/constants/systemMessages';
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

async function waitMockReadDelay() {
  await new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, MOCK_MILLISECONDS_RESPONSE_DELAY);
  });
}

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
        this.dataset = mockDataService.hydrate();
        return this.dataset;
      } catch (error) {
        this.error = new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to hydrate mock dataset.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockHydrationFailed, {
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
        this.dataset = mockDataService.reset();
        return this.dataset;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to reset mock dataset.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockResetFailed, {
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
        const [institutions] = await Promise.all([
          Promise.resolve(mockDataService.listInstitutions()),
          waitMockReadDelay()
        ]);
        return institutions;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list institutions.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataUnknownFailure, {
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
        const [permissions] = await Promise.all([
          Promise.resolve(mockDataService.listPermissionsByUser(userId)),
          waitMockReadDelay()
        ]);
        return permissions;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list permissions.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataUnknownFailure, {
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
        const user = await mockDataService.updateAccountSettings(input);
        this.dataset = mockDataService.getDataset();
        return user;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to update account settings.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataValidationFailed, {
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
        const institution = await mockDataService.updateInstitutionSettings(input);
        this.dataset = mockDataService.getDataset();
        return institution;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to update institution settings.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataValidationFailed, {
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
        const permission = await mockDataService.createPermission(input);
        this.dataset = mockDataService.getDataset();
        return permission;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to create permission.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataConflictDetected, {
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
        const permission = await mockDataService.updatePermission(input);
        this.dataset = mockDataService.getDataset();
        return permission;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to update permission.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataNotFound, {
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
        const [contacts] = await Promise.all([
          Promise.resolve(mockDataService.listContactsByRfc(rfc)),
          waitMockReadDelay()
        ]);
        return contacts;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list contacts.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataUnknownFailure, {
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
        const contact = await mockDataService.createContact(input);
        this.dataset = mockDataService.getDataset();
        return contact;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to create contact.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataValidationFailed, {
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
        const contact = await mockDataService.updateContact(input);
        this.dataset = mockDataService.getDataset();
        return contact;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to update contact.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataNotFound, {
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
        const [requests] = await Promise.all([
          Promise.resolve(mockDataService.listRequestsByRfc(rfc)),
          waitMockReadDelay()
        ]);
        return requests;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list requests.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataUnknownFailure, {
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
        const [findings] = await Promise.all([
          Promise.resolve(mockDataService.listFindingsByRfc(rfc)),
          waitMockReadDelay()
        ]);
        return findings;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list findings.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataUnknownFailure, {
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
        const [logs] = await Promise.all([
          Promise.resolve(mockDataService.listLogs(filters)),
          waitMockReadDelay()
        ]);
        return logs;
      } catch (error) {
        this.error = isMockDataError(error)
          ? error
          : new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Failed to list logs.', { error });
        this.userErrorMessage = resolveUserErrorMessage(this.error);
        logSystemMessage(webSystemMessages.mockDataUnknownFailure, {
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
