/**
 * @package web
 * @name dataStore.ts
 * @version 0.0.1
 * @description Gestiona estado reactivo de datos respaldados por Firestore.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-18)	Agrega store de datos respaldado por gateway Firestore.	@codex
 */

import { defineStore } from 'pinia';
import { isSystemError, SystemError, formatUiErrorString, type Institution } from '@shared';
import {
  getInstitutionByRfc,
  getUserById,
  listContactsByRfc,
  listFindingsByRfc,
  listInstitutions,
  listLogs,
  listPermissionsByUser,
  listRequestsByRfc,
} from '@/gateways/firebaseDataGateway';
import { createInstitutionOnboarding } from '@/gateways/institutionOnboardingGateway';
import { systemMessageTree } from '@/shared/constants/systemMessages';

/**
 * @description Normaliza errores desconocidos a errores de datos de aplicación.
 */
function normalizeDataError(error: unknown, fallbackMessage: string) {
  return isSystemError(error)
    ? error
    : new SystemError(systemMessageTree.shared.data.operation.unknownFailure, {
        displayMessage: fallbackMessage,
        details: { error },
      });
}

export const useDataStore = defineStore('data', {
  state: () => ({
    isLoading: false,
    isSaving: false,
    error: null as SystemError | null,
    userErrorMessage: null as string | null,
  }),
  actions: {
    clearError() {
      this.error = null;
      this.userErrorMessage = null;
    },
    captureExternalError(error: unknown, fallbackMessage: string) {
      this.error = normalizeDataError(error, fallbackMessage);
      this.userErrorMessage = formatUiErrorString(this.error);
    },
    async withLoading<T>(operation: () => Promise<T>, fallbackMessage: string) {
      this.isLoading = true;
      this.clearError();
      try {
        return await operation();
      } catch (error) {
        this.error = normalizeDataError(error, fallbackMessage);
        this.userErrorMessage = formatUiErrorString(this.error);
        throw this.error;
      } finally {
        this.isLoading = false;
      }
    },
    async withSaving<T>(operation: () => Promise<T>, fallbackMessage: string) {
      this.isSaving = true;
      this.clearError();
      try {
        return await operation();
      } catch (error) {
        this.error = normalizeDataError(error, fallbackMessage);
        this.userErrorMessage = formatUiErrorString(this.error);
        throw this.error;
      } finally {
        this.isSaving = false;
      }
    },
    getUserById(userId: string) {
      return this.withLoading(() => getUserById(userId), 'Failed to load user.');
    },
    listInstitutions() {
      return this.withLoading(() => listInstitutions(), 'Failed to list institutions.');
    },
    getInstitutionByRfc(rfc: string) {
      return this.withLoading(() => getInstitutionByRfc(rfc), 'Failed to load institution.');
    },
    listPermissionsByUser(userId: string) {
      return this.withLoading(() => listPermissionsByUser(userId), 'Failed to list permissions.');
    },
    listContactsByRfc(rfc: string) {
      return this.withLoading(() => listContactsByRfc(rfc), 'Failed to list contacts.');
    },
    listRequestsByRfc(rfc: string) {
      return this.withLoading(() => listRequestsByRfc(rfc), 'Failed to list requests.');
    },
    listFindingsByRfc(rfc: string) {
      return this.withLoading(() => listFindingsByRfc(rfc), 'Failed to list findings.');
    },
    listLogs(filters: { RFC?: string; userId?: string } = {}) {
      return this.withLoading(() => listLogs(filters), 'Failed to list logs.');
    },
    createInstitutionOnboarding(input: {
      RFC: string;
      name: string;
      plan: Institution['plan'];
      planStatus: Institution['planStatus'];
      planStartAt: number;
      planFinishAt: number;
      adminEmail: string;
    }) {
      return this.withSaving(() => createInstitutionOnboarding(input), 'Failed to create institution onboarding.');
    },
  },
});
