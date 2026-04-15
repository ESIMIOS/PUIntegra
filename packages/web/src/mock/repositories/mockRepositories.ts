/**
 * @package web
 * @name mockRepositories.ts
 * @version 0.0.1
 * @description Expone operaciones asíncronas de lectura/escritura sobre el dataset mock en memoria.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { ROLE, type Log, type Permission, type User } from '@shared';
import { MockDataError, MOCK_DATA_ERROR_KIND } from '../errors/mockDataError';
import type { MockDataset } from '../types/mockData';
import { SYSTEM_RFC } from '@shared';

export interface DatasetRef {
  get(): MockDataset;
  // eslint-disable-next-line no-unused-vars
  set(...args: [MockDataset]): void;
}

function replaceById<T extends Record<string, unknown>>(
  items: T[],
  idKey: keyof T,
  next: T
): T[] {
  const nextId = next[idKey];
  let found = false;
  const mapped = items.map((item) => {
    if (item[idKey] === nextId) {
      found = true;
      return next;
    }
    return item;
  });
  if (!found) {
    throw new MockDataError(MOCK_DATA_ERROR_KIND.NOT_FOUND, 'Entity not found for replacement.', {
      idKey: String(idKey),
      id: nextId
    });
  }
  return mapped;
}

/**
 * @description Builds repository operations over an in-memory mock dataset reference.
 */
export function createMockRepositories(ref: DatasetRef) {
  const getDataset = () => ref.get();
  const saveDataset = (next: MockDataset) => ref.set(next);

  return {
    async listInstitutions() {
      return getDataset().institutions.filter((institution) => institution.RFC !== SYSTEM_RFC);
    },
    async getInstitutionByRfc(rfc: string) {
      const found = getDataset().institutions.find((institution) => institution.RFC === rfc);
      if (!found) {
        throw new MockDataError(MOCK_DATA_ERROR_KIND.NOT_FOUND, 'Institution not found.', { rfc });
      }
      return found;
    },
    async listPermissionsByUser(userId: string) {
      return getDataset().permissions.filter((permission) => permission.userId === userId);
    },
    async getUserById(userId: string) {
      const found = getDataset().users.find((user) => user.userId === userId);
      if (!found) {
        throw new MockDataError(MOCK_DATA_ERROR_KIND.NOT_FOUND, 'User not found.', { userId });
      }
      return found;
    },
    async updateUser(nextUser: User) {
      const current = getDataset();
      saveDataset({
        ...current,
        users: replaceById(current.users, 'userId', nextUser)
      });
      return nextUser;
    },
    async updateInstitution(nextInstitution: MockDataset['institutions'][number]) {
      const current = getDataset();
      saveDataset({
        ...current,
        institutions: replaceById(current.institutions, 'RFC', nextInstitution)
      });
      return nextInstitution;
    },
    async createPermission(nextPermission: Permission) {
      const current = getDataset();
      const duplicated = current.permissions.some((permission) => (
        permission.RFC === nextPermission.RFC &&
        permission.email === nextPermission.email &&
        permission.role === nextPermission.role
      ));
      if (duplicated) {
        throw new MockDataError(MOCK_DATA_ERROR_KIND.CONFLICT, 'Permission combination already exists.', {
          RFC: nextPermission.RFC,
          email: nextPermission.email,
          role: nextPermission.role
        });
      }
      saveDataset({
        ...current,
        permissions: [...current.permissions, nextPermission]
      });
      return nextPermission;
    },
    async getPermissionById(permissionId: string) {
      const found = getDataset().permissions.find((permission) => permission.permissionId === permissionId);
      if (!found) {
        throw new MockDataError(MOCK_DATA_ERROR_KIND.NOT_FOUND, 'Permission was not found.', { permissionId });
      }
      return found;
    },
    async updatePermission(nextPermission: Permission) {
      const current = getDataset();
      saveDataset({
        ...current,
        permissions: replaceById(current.permissions, 'permissionId', nextPermission)
      });
      return nextPermission;
    },
    async listContactsByRfc(rfc: string) {
      return getDataset().contacts.filter((contact) => contact.RFC === rfc);
    },
    async createContact(nextContact: MockDataset['contacts'][number]) {
      const current = getDataset();
      const duplicated = current.contacts.some((contact) => contact.contactId === nextContact.contactId);
      if (duplicated) {
        throw new MockDataError(MOCK_DATA_ERROR_KIND.CONFLICT, 'Contact id already exists.', {
          contactId: nextContact.contactId
        });
      }
      saveDataset({
        ...current,
        contacts: [...current.contacts, nextContact]
      });
      return nextContact;
    },
    async getContactById(contactId: string) {
      const found = getDataset().contacts.find((contact) => contact.contactId === contactId);
      if (!found) {
        throw new MockDataError(MOCK_DATA_ERROR_KIND.NOT_FOUND, 'Contact was not found.', { contactId });
      }
      return found;
    },
    async updateContact(nextContact: MockDataset['contacts'][number]) {
      const current = getDataset();
      saveDataset({
        ...current,
        contacts: replaceById(current.contacts, 'contactId', nextContact)
      });
      return nextContact;
    },
    async listRequestsByRfc(rfc: string) {
      return getDataset().requests.filter((request) => request.RFC === rfc);
    },
    async listFindingsByRfc(rfc: string) {
      return getDataset().findings.filter((finding) => finding.RFC === rfc);
    },
    async listLogs(filters: { RFC?: string; userId?: string } = {}) {
      return getDataset().logs.filter((log) => {
        if (filters.RFC && log.RFC !== filters.RFC) {
          return false;
        }
        if (filters.userId && log.userId !== filters.userId) {
          return false;
        }
        return true;
      });
    },
    async appendLog(entry: Log) {
      const current = getDataset();
      saveDataset({
        ...current,
        logs: [...current.logs, entry]
      });
      return entry;
    },
    async resolveSessionProfileByRole(role: Permission['role']) {
      const user = getDataset().users[0];
      if (!user) {
        throw new MockDataError(MOCK_DATA_ERROR_KIND.NOT_FOUND, 'Mock user is not available.');
      }

      if (role === ROLE.ANONYMOUS) {
        return {
          user,
          allowedInstitutionRfcs: [],
          activeRfc: ''
        };
      }

      if (role === ROLE.SYSTEM_ADMINISTRATOR) {
        return {
          user,
          allowedInstitutionRfcs: [SYSTEM_RFC],
          activeRfc: SYSTEM_RFC
        };
      }

      const allowedInstitutionRfcs = getDataset().permissions
        .filter((permission) => permission.role !== ROLE.SYSTEM_ADMINISTRATOR)
        .filter((permission) => permission.userId === user.userId)
        .map((permission) => permission.RFC);

      return {
        user,
        allowedInstitutionRfcs,
        activeRfc: allowedInstitutionRfcs[0] ?? ''
      };
    }
  };
}
