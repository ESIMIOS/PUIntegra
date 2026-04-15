/**
 * @package web
 * @name mock-repositories.test.ts
 * @version 0.0.1
 * @description Valida contratos asíncronos de repositorios mock y exclusión de SYSTEM_RFC en instituciones.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { describe, expect, it } from 'vitest';
import { ROLE, SYSTEM_RFC, DEFAULT_RFC, canonicalMockSeedDataset, cloneMockDataset } from '@/bom';
import { createMockRepositories } from '@/mock/repositories/mockRepositories';

function createRepositoryHarness() {
  let dataset = cloneMockDataset(canonicalMockSeedDataset);
  const repositories = createMockRepositories({
    get: () => dataset,
    set: (next) => {
      dataset = next;
    }
  });
  return { repositories, getDataset: () => dataset };
}

describe('mock repositories', () => {
  it('lists tenant institutions and excludes SYSTEM_RFC', async () => {
    const { repositories } = createRepositoryHarness();

    const institutions = await repositories.listInstitutions();
    expect(institutions.some((institution) => institution.RFC === SYSTEM_RFC)).toBe(false);
    expect(institutions.some((institution) => institution.RFC === DEFAULT_RFC)).toBe(true);
  });

  it('returns both seeded permissions for the mock user', async () => {
    const { repositories, getDataset } = createRepositoryHarness();
    const userId = getDataset().users[0].userId;

    const permissions = await repositories.listPermissionsByUser(userId);
    expect(permissions.some((permission) => permission.RFC === SYSTEM_RFC && permission.role === ROLE.SYSTEM_ADMINISTRATOR)).toBe(true);
    expect(permissions.some((permission) => permission.RFC === DEFAULT_RFC && permission.role === ROLE.INSTITUTION_ADMIN)).toBe(true);
  });

  it('creates and updates contacts asynchronously', async () => {
    const { repositories, getDataset } = createRepositoryHarness();
    const contact = {
      ...getDataset().contacts[0],
      contactId: 'contact-new-001',
      name: 'Nuevo Contacto'
    };

    await repositories.createContact(contact);
    const persisted = getDataset().contacts.find((item) => item.contactId === 'contact-new-001');
    expect(persisted?.name).toBe('Nuevo Contacto');

    const updated = { ...contact, name: 'Contacto Actualizado' };
    await repositories.updateContact(updated);
    const persistedUpdated = getDataset().contacts.find((item) => item.contactId === 'contact-new-001');
    expect(persistedUpdated?.name).toBe('Contacto Actualizado');
  });

  it('throws not_found when requesting a missing institution', async () => {
    const { repositories } = createRepositoryHarness();
    await expect(repositories.getInstitutionByRfc('missing-rfc')).rejects.toMatchObject({ kind: 'NOT_FOUND' });
  });
});
