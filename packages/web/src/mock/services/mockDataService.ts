/**
 * @package web
 * @name mockDataService.ts
 * @version 0.0.1
 * @description Orquesta casos de uso mock con mutaciones atómicas y persistencia local.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  LOG_CATEGORIES,
  LOG_ORIGIN,
  PERMISSION_STATUS,
  UPDATE_ORIGIN,
  type Contact,
  type ContactUpdate,
  ROLE,
  type Institution,
  type InstitutionUpdate,
  type Permission,
  type PermissionUpdate,
  type SearchRequestPhase,
  type SearchRequestPhaseStatus,
  type SearchRequestStatus,
  RoleSchema,
  type User,
  type UserUpdate
} from '@shared';
import { z } from 'zod';
import { nowUtcMilliseconds } from '@/shared/utils/dateUtils';
import { deepClone } from '@/shared/utils/objectUtils';
import { createMockRepositories } from '../repositories/mockRepositories';
import type { MockDataset } from '../types/mockData';
import { MockDataError, MOCK_DATA_ERROR_KIND, isMockDataError } from '../errors/mockDataError';
import { loadMockDataset, resetMockDataset, saveMockDataset } from '../storage/mockStorage';

export type MockDataService = ReturnType<typeof createMockDataService>;

/**
 * @description Creates the mock data service and mutation boundary over the current dataset.
 */
export function createMockDataService(initialDataset?: MockDataset) {
  let dataset = initialDataset ?? loadMockDataset();
  const nowTimestamp = () => nowUtcMilliseconds();

  const repositories = createMockRepositories({
    get: () => dataset,
    set: (next) => {
      dataset = next;
    }
  });

  /**
   * @description Returns the current in-memory mock dataset snapshot.
   */
  function getDataset() {
    return dataset;
  }

  /**
   * @description Appends a standardized system-data log entry.
   */
  async function appendSystemDataLog(input: {
    category: (typeof LOG_CATEGORIES)[keyof typeof LOG_CATEGORIES];
    RFC: string | null;
    userId: string;
    role: Permission['role'];
    email: string;
    searchRequest?: {
      FUB?: string | null;
      CURP?: string | null;
      searchRequestStatus?: SearchRequestStatus | null;
      searchRequestPhase?: SearchRequestPhase | null;
      searchRequestPhaseStatus?: SearchRequestPhaseStatus | null;
    };
    impact?: Record<string, unknown>;
    createdAt: number;
  }) {
    await repositories.appendLog({
      id: `log-${Date.now()}`,
      category: input.category,
      RFC: input.RFC,
      origin: LOG_ORIGIN.SYSTEM_DATA_TRIGGER,
      originTraceId: null,
      userId: input.userId,
      execution: {
        executedByUserId: input.userId,
        executedByRole: input.role,
        executedByUserEmail: input.email
      },
      impact: input.impact ?? {},
      searchRequest: input.searchRequest ?? {},
      createdAt: input.createdAt
    });
  }

  /**
   * @description Runs a mutation and persists atomically; reverts on failure.
   */
  async function withAtomicMutation<T>(mutation: () => Promise<T>) {
    const previous = deepClone(dataset);
    try {
      const result = await mutation();
      saveMockDataset(dataset);
      return result;
    } catch (error) {
      dataset = previous;
      if (isMockDataError(error)) {
        throw error;
      }
      throw new MockDataError(MOCK_DATA_ERROR_KIND.UNKNOWN, 'Unexpected mock mutation failure.', { error });
    }
  }

  return {
    getDataset,
    hydrate() {
      dataset = loadMockDataset();
      return dataset;
    },
    reset() {
      dataset = resetMockDataset();
      return dataset;
    },
    listInstitutions: async () => repositories.listInstitutions(),
    listPermissionsByUser: async (userId: string) => repositories.listPermissionsByUser(userId),
    listContactsByRfc: async (rfc: string) => repositories.listContactsByRfc(rfc),
    listRequestsByRfc: async (rfc: string) => repositories.listRequestsByRfc(rfc),
    listFindingsByRfc: async (rfc: string) => repositories.listFindingsByRfc(rfc),
    listLogs: async (filters: { RFC?: string; userId?: string } = {}) => repositories.listLogs(filters),
    resolveSessionProfileByRole: async (role: z.infer<typeof RoleSchema>) =>
      repositories.resolveSessionProfileByRole(role),
    updateAccountSettings: (input: {
      userId: string;
      name?: string;
      emojiIcon?: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) => withAtomicMutation(async () => {
      const user = await repositories.getUserById(input.userId);
      const now = nowTimestamp();
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
      await repositories.updateUser(nextUser);
      const userPermissions = await repositories.listPermissionsByUser(user.userId);
      await appendSystemDataLog({
        category: LOG_CATEGORIES.USER_ACCOUNT_SETTINGS_UPDATE,
        RFC: input.updatedByRole === ROLE.SYSTEM_ADMINISTRATOR ? null : userPermissions[0]?.RFC ?? null,
        userId: user.userId,
        role: input.updatedByRole,
        email: input.updatedByEmail,
        impact: {
          impactedUserId: user.userId,
          impactedUserRole: input.updatedByRole,
          impactedUserEmail: input.updatedByEmail
        },
        createdAt: now
      });
      return nextUser;
    }),
    updateInstitutionSettings: (input: {
      rfc: string;
      name?: string;
      plan?: Institution['plan'];
      planStatus?: Institution['planStatus'];
      updatedByUserId: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) => withAtomicMutation(async () => {
      const institution = await repositories.getInstitutionByRfc(input.rfc);
      const now = nowTimestamp();
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
        updatedPlanStatus: input.planStatus ?? institution.planStatus,
        previousPlanStartAt: institution.planStartAt,
        updatedPlanStartAt: institution.planStartAt,
        previousPlanFinishAt: institution.planFinishAt,
        updatedPlanFinishAt: institution.planFinishAt,
        previousSHA256SharedSecret: institution.sharedSecret,
        updatedSHA256SharedSecret: institution.sharedSecret
      };
      const nextInstitution: Institution = {
        ...institution,
        name: input.name ?? institution.name,
        plan: input.plan ?? institution.plan,
        planStatus: input.planStatus ?? institution.planStatus,
        updatedAt: now,
        updates: [...institution.updates, update]
      };
      await repositories.updateInstitution(nextInstitution);
      await appendSystemDataLog({
        category: LOG_CATEGORIES.INSTITUTION_PLAN_UPDATE,
        RFC: input.rfc,
        userId: input.updatedByUserId,
        role: input.updatedByRole,
        email: input.updatedByEmail,
        createdAt: now
      });
      return nextInstitution;
    }),
    createPermission: (input: {
      RFC: string;
      email: string;
      role: Permission['role'];
      updatedByUserId: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) => withAtomicMutation(async () => {
      if (input.updatedByRole !== ROLE.SYSTEM_ADMINISTRATOR && input.updatedByRole !== ROLE.INSTITUTION_ADMIN) {
        throw new MockDataError(MOCK_DATA_ERROR_KIND.FORBIDDEN, 'Current role is not allowed to create permissions.', {
          role: input.updatedByRole
        });
      }
      const now = nowTimestamp();
      const permission: Permission = {
        permissionId: `perm-${Date.now()}`,
        RFC: input.RFC,
        email: input.email,
        userId: null,
        role: input.role,
        status: PERMISSION_STATUS.GRANTED,
        updates: [],
        createdAt: now,
        updatedAt: now
      };
      return repositories.createPermission(permission);
    }),
    updatePermission: (input: {
      permissionId: string;
      role?: Permission['role'];
      status?: Permission['status'];
      updatedByUserId: string;
      updatedByRole: Permission['role'];
      updatedByEmail: string;
    }) => withAtomicMutation(async () => {
      const permission = await repositories.getPermissionById(input.permissionId);
      const now = nowTimestamp();
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
      const nextPermission: Permission = {
        ...permission,
        role: input.role ?? permission.role,
        status: input.status ?? permission.status,
        updatedAt: now,
        updates: [...permission.updates, update]
      };
      return repositories.updatePermission(nextPermission);
    }),
    createContact: (input: {
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
    }) => withAtomicMutation(async () => {
      const institution = await repositories.getInstitutionByRfc(input.rfc);
      const now = nowTimestamp();
      const nextContact: Contact = {
        contactId: `contact-${Date.now()}`,
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
      };
      await repositories.createContact(nextContact);
      await appendSystemDataLog({
        category: LOG_CATEGORIES.INSTITUTION_CONTACT_CREATION,
        RFC: institution.RFC,
        userId: input.updatedByUserId,
        role: input.updatedByRole,
        email: input.updatedByEmail,
        createdAt: now
      });
      return nextContact;
    }),
    updateContact: (input: {
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
    }) => withAtomicMutation(async () => {
      const contact = await repositories.getContactById(input.contactId);
      const now = nowTimestamp();
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
        updatedPhone: input.phone ?? contact.phone,
        previousContactCURP: contact.contactCURP,
        updatedContactCURP: input.contactCURP ?? contact.contactCURP,
        previousContactRFC: contact.contactRFC ?? null,
        updatedContactRFC: input.contactRFC ?? contact.contactRFC ?? null,
        previousEfirmaCertificate: contact.efirmaCertificate ?? null,
        updatedEfirmaCertificate: input.efirmaCertificate ?? contact.efirmaCertificate ?? null
      };
      const nextContact: Contact = {
        ...contact,
        type: input.type ?? contact.type,
        name: input.name ?? contact.name,
        phone: input.phone ?? contact.phone,
        contactCURP: input.contactCURP ?? contact.contactCURP,
        contactRFC: input.contactRFC ?? contact.contactRFC ?? null,
        efirmaCertificate: input.efirmaCertificate ?? contact.efirmaCertificate ?? null,
        updatedAt: now,
        updates: [...contact.updates, update]
      };
      await repositories.updateContact(nextContact);
      await appendSystemDataLog({
        category: LOG_CATEGORIES.INSTITUTION_CONTACT_UPDATE,
        RFC: contact.RFC,
        userId: input.updatedByUserId,
        role: input.updatedByRole,
        email: input.updatedByEmail,
        createdAt: now
      });
      return nextContact;
    })
  };
}
