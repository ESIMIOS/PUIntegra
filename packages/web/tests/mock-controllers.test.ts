/**
 * @package web
 * @name mock-controllers.test.ts
 * @version 0.0.1
 * @description Verifica retardos, estados y errores en controladores mock.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createPinia,
  ROLE,
  DEFAULT_RFC,
  MOCK_MILLISECONDS_RESPONSE_DELAY,
  useAccountSettingsController,
  useContactsController,
  useInstitutionSelectionController,
  useMockDataResetController,
  useMockDataStore
} from '@/bom';

describe('mock controllers', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('applies configured response delay on controller loads', async () => {
    vi.useFakeTimers();
    const controller = useInstitutionSelectionController();

    const promise = controller.loadInstitutions();

    await vi.advanceTimersByTimeAsync(MOCK_MILLISECONDS_RESPONSE_DELAY - 1);
    expect(controller.isLoading.value).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const institutions = await promise;

    expect(institutions.length).toBe(1);
    vi.useRealTimers();
  });

  it('applies configured response delay on controller save handlers', async () => {
    vi.useFakeTimers();
    const store = useMockDataStore();
    await store.hydrate();
    const controller = useAccountSettingsController();

    const promise = controller.save({
      userId: 'mock-user-001',
      name: 'Nombre Delay Save',
      updatedByRole: ROLE.INSTITUTION_ADMIN,
      updatedByEmail: 'admin@example.test'
    });

    await vi.advanceTimersByTimeAsync(MOCK_MILLISECONDS_RESPONSE_DELAY - 1);
    expect(controller.isSaving.value).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const user = await promise;
    expect(user.name).toBe('Nombre Delay Save');
    vi.useRealTimers();
  });

  it('applies configured response delay on reset handlers', async () => {
    vi.useFakeTimers();
    const resetController = useMockDataResetController();

    const promise = resetController.reset();

    await vi.advanceTimersByTimeAsync(MOCK_MILLISECONDS_RESPONSE_DELAY - 1);
    expect(resetController.isSaving.value).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const dataset = await promise;
    expect(dataset.institutions.length).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it('applies configured response delay on contact mutation handlers', async () => {
    vi.useFakeTimers();
    const store = useMockDataStore();
    await store.hydrate();
    const contactsController = useContactsController();

    const promise = contactsController.create({
      rfc: DEFAULT_RFC,
      type: 'TECHNICAL',
      name: 'Contacto Delay',
      phone: '+525500000077',
      contactCURP: 'CCCC000000HDFXXX02',
      updatedByUserId: 'mock-user-001',
      updatedByRole: ROLE.INSTITUTION_ADMIN,
      updatedByEmail: 'admin@example.test'
    });

    await vi.advanceTimersByTimeAsync(MOCK_MILLISECONDS_RESPONSE_DELAY - 1);
    expect(contactsController.isSaving.value).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const contact = await promise;
    expect(contact.name).toBe('Contacto Delay');
    vi.useRealTimers();
  });

  it('exposes user-safe error state in store for failing operations', async () => {
    const store = useMockDataStore();
    await store.hydrate();

    await expect(store.updatePermission({
      permissionId: 'missing-permission',
      status: 'REVOKED',
      updatedByUserId: 'mock-user-001',
      updatedByRole: 'SYSTEM_ADMINISTRATOR',
      updatedByEmail: 'admin@example.test'
    })).rejects.toBeTruthy();

    expect(store.userErrorMessage).toBeTruthy();
    expect(store.error).toBeTruthy();
  });
});
