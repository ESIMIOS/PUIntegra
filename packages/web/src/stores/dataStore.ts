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
import {
  PERMISSION_STATUS,
  ROLE,
  UPDATE_ORIGIN,
  type Contact,
  type ContactUpdate,
  type Institution,
  type InstitutionUpdate,
  type Permission,
  type PermissionUpdate,
  type User,
  type UserUpdate
} from '@shared';
import { nowUtcMilliseconds } from '@/shared/utils/dateUtils';
import {
  createContact,
  createPermission,
  getContactById,
  getPermissionById,
  getUserById,
  listContactsByRfc,
  listFindingsByRfc,
  listInstitutions,
  listLogs,
  listPermissionsByUser,
  listRequestsByRfc,
  updateContact,
  updateInstitution,
  updatePermission,
  updateUser
} from '@/gateways/firebaseDataGateway';
import { AppDataError, APP_DATA_ERROR_KIND, isAppDataError } from '@/shared/errors/appErrors';
import { webUiDataErrorByKind } from '@/shared/constants/systemMessages';

/**
 * @description Resuelve el mensaje seguro para un error de datos.
 */
function resolveUserErrorMessage(error: unknown) {
  if (isAppDataError(error)) {
    return webUiDataErrorByKind[error.kind].message;
  }
  return webUiDataErrorByKind[APP_DATA_ERROR_KIND.UNKNOWN].message;
}

/**
 * @description Normaliza errores desconocidos a errores de datos de aplicación.
 */
function normalizeDataError(error: unknown, fallbackMessage: string) {
  return isAppDataError(error)
    ? error
    : new AppDataError(APP_DATA_ERROR_KIND.UNKNOWN, fallbackMessage, { error });
}

export const useDataStore = defineStore('data', {
  state: () => ({
    isLoading: false,
    isSaving: false,
    error: null as AppDataError | null,
    userErrorMessage: null as string | null
  }),
  actions: {
    clearError() {
      this.error = null;
      this.userErrorMessage = null;
    },
    captureExternalError(error: unknown, fallbackMessage: string) {
      this.error = normalizeDataError(error, fallbackMessage);
      this.userErrorMessage = resolveUserErrorMessage(this.error);
    },
    async withLoading<T>(operation: () => Promise<T>, fallbackMessage: string) {
      this.isLoading = true;
      this.clearError();
      try {
        return await operation();
      } catch (error) {
        this.error = normalizeDataError(error, fallbackMessage);
        this.userErrorMessage = resolveUserErrorMessage(this.error);
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
        this.userErrorMessage = resolveUserErrorMessage(this.error);
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
    async updateAccountSettings(input: {
      userId: string;
      name?: string;
      emojiIcon?: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) {
      return this.withSaving(async () => {
        const user = await getUserById(input.userId);
        const now = nowUtcMilliseconds();
        const update: UserUpdate = {
          updateOrigin: UPDATE_ORIGIN.USER,
          updatedByUserId: user.userId,
          updatedByUserRole: input.updatedByRole,
          updatedByUserEmail: input.updatedByEmail,
          updatedAt: now,
          previousName: user.name,
          updatedName: input.name ?? user.name,
          previousEmojiIcon: user.emojiIcon ?? null,
          updatedEmojiIcon: input.emojiIcon ?? user.emojiIcon ?? null
        };
        const nextUser: User = {
          ...user,
          name: input.name ?? user.name,
          emojiIcon: input.emojiIcon ?? user.emojiIcon,
          updatedAt: now,
          updates: [...user.updates, update]
        };
        return updateUser(nextUser);
      }, 'Failed to update account settings.');
    },
    async updateInstitutionSettings(input: {
      rfc: string;
      name?: string;
      plan?: Institution['plan'];
      planStatus?: Institution['planStatus'];
      updatedByUserId: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) {
      return this.withSaving(async () => {
        const institution = (await listInstitutions()).find((candidate) => candidate.RFC === input.rfc);
        if (!institution) {
          throw new AppDataError(APP_DATA_ERROR_KIND.NOT_FOUND, 'Institution not found.', { rfc: input.rfc });
        }
        const now = nowUtcMilliseconds();
        const update: InstitutionUpdate = {
          updateOrigin: UPDATE_ORIGIN.USER,
          updatedByUserId: input.updatedByUserId,
          updatedByUserRole: input.updatedByRole,
          updatedByUserEmail: input.updatedByEmail,
          updatedAt: now,
          previousName: institution.name,
          updatedName: input.name ?? institution.name,
          previousPlan: institution.plan,
          updatedPlan: input.plan ?? institution.plan,
          previousPlanStatus: institution.planStatus,
          updatedPlanStatus: input.planStatus ?? institution.planStatus
        };
        const nextInstitution: Institution = {
          ...institution,
          name: input.name ?? institution.name,
          plan: input.plan ?? institution.plan,
          planStatus: input.planStatus ?? institution.planStatus,
          updatedAt: now,
          updates: [...institution.updates, update]
        };
        return updateInstitution(nextInstitution);
      }, 'Failed to update institution settings.');
    },
    createPermission(input: {
      RFC: string;
      email: string;
      role: Permission['role'];
      updatedByUserId: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) {
      return this.withSaving(() => {
        if (input.updatedByRole !== ROLE.SYSTEM_ADMINISTRATOR && input.updatedByRole !== ROLE.INSTITUTION_ADMIN) {
          throw new AppDataError(APP_DATA_ERROR_KIND.FORBIDDEN, 'Current role is not allowed to create permissions.');
        }
        const now = nowUtcMilliseconds();
        return createPermission({
          permissionId: `perm-${now}`,
          RFC: input.RFC,
          email: input.email,
          userId: null,
          role: input.role,
          status: PERMISSION_STATUS.GRANTED,
          updates: [],
          createdAt: now,
          updatedAt: now
        });
      }, 'Failed to create permission.');
    },
    async updatePermission(input: {
      permissionId: string;
      role?: Permission['role'];
      status?: Permission['status'];
      updatedByUserId: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) {
      return this.withSaving(async () => {
        const permission = await getPermissionById(input.permissionId);
        const now = nowUtcMilliseconds();
        const update: PermissionUpdate = {
          updateOrigin: UPDATE_ORIGIN.USER,
          updatedByUserId: input.updatedByUserId,
          updatedByUserRole: input.updatedByRole,
          updatedByUserEmail: input.updatedByEmail,
          updatedAt: now,
          previousUserId: permission.userId ?? null,
          updatedUserId: permission.userId ?? null,
          previousRole: permission.role,
          updatedRole: input.role ?? permission.role,
          previousStatus: permission.status,
          updatedStatus: input.status ?? permission.status
        };
        return updatePermission({
          ...permission,
          role: input.role ?? permission.role,
          status: input.status ?? permission.status,
          updatedAt: now,
          updates: [...permission.updates, update]
        });
      }, 'Failed to update permission.');
    },
    createContact(input: {
      rfc: string;
      type: Contact['type'];
      name: string;
      phone: string;
      contactCURP: string;
      contactRFC?: string | null;
      efirmaCertificate?: string | null;
      updatedByUserId: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) {
      return this.withSaving(() => {
        const now = nowUtcMilliseconds();
        return createContact({
          contactId: `contact-${now}`,
          type: input.type,
          RFC: input.rfc,
          name: input.name,
          phone: input.phone,
          contactCURP: input.contactCURP,
          contactRFC: input.contactRFC ?? null,
          efirmaCertificate: input.efirmaCertificate ?? null,
          updates: [],
          createdAt: now,
          updatedAt: now
        });
      }, 'Failed to create contact.');
    },
    async updateContact(input: {
      contactId: string;
      name?: string;
      phone?: string;
      type?: Contact['type'];
      contactCURP?: string;
      contactRFC?: string | null;
      efirmaCertificate?: string | null;
      updatedByUserId: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) {
      return this.withSaving(async () => {
        const contact = await getContactById(input.contactId);
        const now = nowUtcMilliseconds();
        const update: ContactUpdate = {
          updateOrigin: UPDATE_ORIGIN.USER,
          updatedByUserId: input.updatedByUserId,
          updatedByUserRole: input.updatedByRole,
          updatedByUserEmail: input.updatedByEmail,
          updatedAt: now,
          previousRFC: contact.RFC,
          updatedRFC: contact.RFC,
          previousType: contact.type,
          updatedType: input.type ?? contact.type,
          previousName: contact.name,
          updatedName: input.name ?? contact.name,
          previousPhone: contact.phone,
          updatedPhone: input.phone ?? contact.phone
        };
        return updateContact({
          ...contact,
          type: input.type ?? contact.type,
          name: input.name ?? contact.name,
          phone: input.phone ?? contact.phone,
          contactCURP: input.contactCURP ?? contact.contactCURP,
          contactRFC: input.contactRFC ?? contact.contactRFC ?? null,
          efirmaCertificate: input.efirmaCertificate ?? contact.efirmaCertificate ?? null,
          updatedAt: now,
          updates: [...contact.updates, update]
        });
      }, 'Failed to update contact.');
    }
  }
});
