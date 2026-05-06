/**
 * @package web
 * @name dataStore.ts
 * @version 0.0.3
 * @description Gestiona estado reactivo de datos respaldados por Firestore.
 * @author @codex
 * @changelog
 * - 0.0.3	(2026-05-01)	Agrega guardado de perfil de cuenta autenticada mediante API HTTP.	@codex
 * - 0.0.2	(2026-04-27)	Expone filtros extendidos para bitácora de dominios.	@codex
 * - 0.0.1	(2026-04-18)	Agrega store de datos respaldado por gateway Firestore.	@codex
 */

import { defineStore } from 'pinia';
import { isSystemError, SystemError, formatUiErrorString, type Institution, type UpdateInstitutionPlan } from '@shared';
import {
  getInstitutionByRfc,
  getUserById,
  listContactsByRfc,
  listFindingsByRfc,
  listInstitutions,
  listLogs,
  listPermissionsByEmail,
  listPermissionsByRfc,
  listPermissionsByUser,
  listRequestsByRfc,
  type ListLogsFilters,
} from '@/gateways/firebaseDataGateway';
import { createInstitutionOnboarding } from '@/gateways/institutionOnboardingGateway';
import { updateInstitutionPlan } from '@/gateways/institutionPlanGateway';
import { updateAccountProfile } from '@/gateways/accountProfileGateway';
import {
  createInstitutionPermission,
  updateInstitutionPermission,
  updateInstitutionSharedSecret,
  upsertInstitutionContact,
} from '@/gateways/appAdminInstitutionGateway';
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
    listPermissionsByEmail(email: string) {
      return this.withLoading(() => listPermissionsByEmail(email), 'Failed to list permissions by email.');
    },
    listPermissionsByRfc(rfc: string) {
      return this.withLoading(() => listPermissionsByRfc(rfc), 'Failed to list permissions by rfc.');
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
    listLogs(filters: ListLogsFilters = {}) {
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
    updateInstitutionPlan(rfc: string, input: UpdateInstitutionPlan) {
      return this.withSaving(() => updateInstitutionPlan(rfc, input), 'Failed to update institution plan.');
    },
    updateAccountProfile(input: { name: string; emojiIcon: string; phone?: string | null }) {
      return this.withSaving(() => updateAccountProfile(input), 'Failed to update account profile.');
    },
    upsertInstitutionContact(rfc: string, contactType: string, input: Parameters<typeof upsertInstitutionContact>[2]) {
      return this.withSaving(
        () => upsertInstitutionContact(rfc, contactType, input),
        'Failed to upsert institution contact.',
      );
    },
    updateInstitutionSharedSecret(rfc: string, input: { sharedSecret: string }) {
      return this.withSaving(
        () => updateInstitutionSharedSecret(rfc, input),
        'Failed to update institution shared secret.',
      );
    },
    createInstitutionPermission(rfc: string, input: Parameters<typeof createInstitutionPermission>[1]) {
      return this.withSaving(
        () => createInstitutionPermission(rfc, input),
        'Failed to create institution permission.',
      );
    },
    updateInstitutionPermission(
      rfc: string,
      permissionId: string,
      input: Parameters<typeof updateInstitutionPermission>[2],
    ) {
      return this.withSaving(
        () => updateInstitutionPermission(rfc, permissionId, input),
        'Failed to update institution permission.',
      );
    },
  },
});
