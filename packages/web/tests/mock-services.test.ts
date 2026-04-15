/**
 * @package web
 * @name mock-services.test.ts
 * @version 0.0.1
 * @description Valida casos de uso mock con escenarios de éxito, error y atomicidad.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { describe, expect, it } from 'vitest';
import {
  ROLE,
  SYSTEM_RFC,
  canonicalMockSeedDataset,
  cloneMockDataset,
  createMockDataService,
  DEFAULT_RFC
} from '@/bom';

describe('mock data service', () => {
  it('lists only tenant institutions (excluding SYSTEM_RFC)', async () => {
    const service = createMockDataService(cloneMockDataset(canonicalMockSeedDataset));
    const institutions = await service.listInstitutions();

    expect(institutions.some((institution) => institution.RFC === SYSTEM_RFC)).toBe(false);
    expect(institutions.some((institution) => institution.RFC === DEFAULT_RFC)).toBe(true);
  });

  it('exposes both system and tenant permissions for mock user', async () => {
    const service = createMockDataService(cloneMockDataset(canonicalMockSeedDataset));
    const user = service.getDataset().users[0];
    const permissions = await service.listPermissionsByUser(user.userId);

    expect(permissions.some((permission) => permission.RFC === SYSTEM_RFC && permission.role === ROLE.SYSTEM_ADMINISTRATOR)).toBe(true);
    expect(permissions.some((permission) => permission.RFC === DEFAULT_RFC && permission.role === ROLE.INSTITUTION_ADMIN)).toBe(true);
  });

  it('updates account settings successfully and appends history/log', async () => {
    const service = createMockDataService(cloneMockDataset(canonicalMockSeedDataset));
    const user = service.getDataset().users[0];
    const beforeLogs = service.getDataset().logs.length;

    const updated = await service.updateAccountSettings({
      userId: user.userId,
      name: 'Nuevo Nombre',
      updatedByRole: ROLE.INSTITUTION_ADMIN,
      updatedByEmail: user.email
    });

    expect(updated.name).toBe('Nuevo Nombre');
    expect(updated.updates.length).toBeGreaterThan(0);
    expect(service.getDataset().logs.length).toBeGreaterThan(beforeLogs);
  });

  it('keeps dataset intact when permission update fails (atomic failure)', async () => {
    const service = createMockDataService(cloneMockDataset(canonicalMockSeedDataset));
    const beforeSnapshot = JSON.stringify(service.getDataset());

    await expect(service.updatePermission({
      permissionId: 'missing-permission',
      status: 'REVOKED',
      updatedByUserId: 'mock-user-001',
      updatedByRole: ROLE.SYSTEM_ADMINISTRATOR,
      updatedByEmail: 'admin@example.test'
    })).rejects.toBeTruthy();

    expect(JSON.stringify(service.getDataset())).toBe(beforeSnapshot);
  });

  it('creates and updates contacts with history and logs', async () => {
    const service = createMockDataService(cloneMockDataset(canonicalMockSeedDataset));
    const beforeLogs = service.getDataset().logs.length;

    const created = await service.createContact({
      rfc: DEFAULT_RFC,
      type: 'LEGAL',
      name: 'Contacto Legal',
      phone: '+525500000101',
      contactCURP: 'BBBB000000HDFXXX01',
      contactRFC: 'XEXX010101000',
      updatedByUserId: 'mock-user-001',
      updatedByRole: ROLE.INSTITUTION_ADMIN,
      updatedByEmail: 'admin@example.test'
    });
    expect(created.contactId).toContain('contact-');

    const updated = await service.updateContact({
      contactId: created.contactId,
      name: 'Contacto Legal Actualizado',
      updatedByUserId: 'mock-user-001',
      updatedByRole: ROLE.INSTITUTION_ADMIN,
      updatedByEmail: 'admin@example.test'
    });
    expect(updated.name).toBe('Contacto Legal Actualizado');
    expect(updated.updates.length).toBeGreaterThan(0);
    expect(service.getDataset().logs.length).toBeGreaterThan(beforeLogs);
  });

  it('rejects permission creation for forbidden role', async () => {
    const service = createMockDataService(cloneMockDataset(canonicalMockSeedDataset));
    await expect(service.createPermission({
      RFC: DEFAULT_RFC,
      email: 'operator@example.test',
      role: ROLE.INSTITUTION_OPERATOR,
      updatedByUserId: 'mock-user-001',
      updatedByRole: ROLE.INSTITUTION_OPERATOR,
      updatedByEmail: 'operator@example.test'
    })).rejects.toMatchObject({ kind: 'FORBIDDEN' });
  });

  it('rejects duplicated permission combinations', async () => {
    const service = createMockDataService(cloneMockDataset(canonicalMockSeedDataset));
    await expect(service.createPermission({
      RFC: DEFAULT_RFC,
      email: 'admin@example.test',
      role: ROLE.INSTITUTION_ADMIN,
      updatedByUserId: 'mock-user-001',
      updatedByRole: ROLE.SYSTEM_ADMINISTRATOR,
      updatedByEmail: 'admin@example.test'
    })).rejects.toMatchObject({ kind: 'CONFLICT' });
  });

  it('keeps dataset intact when contact update fails (atomic failure)', async () => {
    const service = createMockDataService(cloneMockDataset(canonicalMockSeedDataset));
    const beforeSnapshot = JSON.stringify(service.getDataset());

    await expect(service.updateContact({
      contactId: 'missing-contact',
      name: 'Should not persist',
      updatedByUserId: 'mock-user-001',
      updatedByRole: ROLE.INSTITUTION_ADMIN,
      updatedByEmail: 'admin@example.test'
    })).rejects.toMatchObject({ kind: 'NOT_FOUND' });

    expect(JSON.stringify(service.getDataset())).toBe(beforeSnapshot);
  });
});
