/**
 * @package web
 * @name use-mock-session.test.ts
 * @version 0.0.2
 * @description Cubre flujos de sesión mock por rol, limpieza anónima y manejo de errores asincrónicos.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-14)	Se agrega cobertura de flujos adicionales y carrera de cambios de rol.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { createPinia, getActivePinia, setActivePinia } from 'pinia';
import { createApp } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLE, SYSTEM_RFC } from '@shared';
import { DEFAULT_RFC } from '@/shared/constants/routePaths';
import { useMockSession } from '@/composables/useMockSession';
import { useAuthStore } from '@/stores/authStore';
import { useMockDataStore } from '@/stores/mockDataStore';
import { logSystemMessage } from '@/shared/logging/systemLogger';
import { systemMessageTree } from '@/shared/constants/systemMessages';

vi.mock('@/mock/controllers/controllerDelay', () => ({
  withMockControllerDelay: async <T>(task: () => Promise<T>) => task()
}));

vi.mock('@/shared/logging/systemLogger', () => ({
  logSystemMessage: vi.fn()
}));

function withSetup<T>(composable: () => T) {
  let result: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => null;
    }
  });
  const activePinia = getActivePinia();
  if (!activePinia) {
    throw new Error('Active Pinia instance is required for composable tests.');
  }
  app.use(activePinia);
  const host = document.createElement('div');
  app.mount(host);
  return [result!, app] as const;
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('useMockSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('does not hydrate dataset on mounted when role is anonymous and keeps identity cleared', async () => {
    const mockDataStore = useMockDataStore();
    const hydrateSpy = vi.spyOn(mockDataStore, 'hydrate');
    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    expect(hydrateSpy).not.toHaveBeenCalled();
    expect(session.authStore.activeRole).toBe(ROLE.ANONYMOUS);
    expect(session.authStore.isAuthenticated).toBe(false);
    expect(session.authStore.uid).toBeNull();
    expect(session.authStore.email).toBeNull();
    expect(session.authStore.allowedInstitutionRfcs).toEqual([]);
    expect(session.institutionStore.activeRfc).toBe('');

    app.unmount();
  });

  it('sets institutional admin session profile', async () => {
    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    await session.setInstitutionAdmin();
    await flushAsyncWork();

    expect(session.roleModel.value).toBe(ROLE.INSTITUTION_ADMIN);
    expect(session.authStore.isAuthenticated).toBe(true);
    expect(session.authStore.uid).toBe('mock-user-001');
    expect(session.authStore.email).toBe('admin@example.test');
    expect(session.authStore.allowedInstitutionRfcs).toContain(DEFAULT_RFC);
    expect(session.rfcModel.value).toBe(DEFAULT_RFC);

    app.unmount();
  });

  it('sets system administrator profile with SYSTEM_RFC context', async () => {
    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    await session.setSystemAdministrator();
    await flushAsyncWork();

    expect(session.roleModel.value).toBe(ROLE.SYSTEM_ADMINISTRATOR);
    expect(session.authStore.isAuthenticated).toBe(true);
    expect(session.authStore.allowedInstitutionRfcs).toEqual([SYSTEM_RFC]);
    expect(session.rfcModel.value).toBe(SYSTEM_RFC);

    app.unmount();
  });

  it('sets institutional operator session profile', async () => {
    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    await session.setInstitutionOperator();
    await flushAsyncWork();

    expect(session.roleModel.value).toBe(ROLE.INSTITUTION_OPERATOR);
    expect(session.authStore.isAuthenticated).toBe(true);
    expect(session.authStore.uid).toBe('mock-user-001');
    expect(session.authStore.email).toBe('admin@example.test');
    expect(session.authStore.allowedInstitutionRfcs).toContain(DEFAULT_RFC);
    expect(session.rfcModel.value).toBe(DEFAULT_RFC);

    app.unmount();
  });

  it('forces requiresSecuritySetup to false when switching to authenticated role helpers', async () => {
    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    session.authStore.setRequiresSecuritySetup(true);
    await session.setInstitutionAdmin();
    expect(session.securityModel.value).toBe(false);

    session.authStore.setRequiresSecuritySetup(true);
    await session.setInstitutionOperator();
    expect(session.securityModel.value).toBe(false);

    session.authStore.setRequiresSecuritySetup(true);
    await session.setSystemAdministrator();
    expect(session.securityModel.value).toBe(false);

    app.unmount();
  });

  it('clears identity and context when role model switches to anonymous', async () => {
    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    await session.setInstitutionOperator();
    await flushAsyncWork();
    expect(session.authStore.uid).toBe('mock-user-001');
    expect(session.rfcModel.value).toBe(DEFAULT_RFC);

    session.roleModel.value = ROLE.ANONYMOUS;
    await flushAsyncWork();

    expect(session.authStore.activeRole).toBe(ROLE.ANONYMOUS);
    expect(session.authStore.isAuthenticated).toBe(false);
    expect(session.authStore.uid).toBeNull();
    expect(session.authStore.email).toBeNull();
    expect(session.authStore.allowedInstitutionRfcs).toEqual([]);
    expect(session.rfcModel.value).toBe('');

    app.unmount();
  });

  it('captures store error and logs when mounted hydration fails for authenticated role', async () => {
    const authStore = useAuthStore();
    authStore.setRole(ROLE.INSTITUTION_ADMIN);

    const mockDataStore = useMockDataStore();
    vi.spyOn(mockDataStore, 'hydrate').mockRejectedValueOnce(new Error('hydrate failed'));

    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    expect(session.authStore.activeRole).toBe(ROLE.INSTITUTION_ADMIN);
    expect(mockDataStore.error).toBeTruthy();
    expect(mockDataStore.userErrorMessage).toBeTruthy();
    expect(logSystemMessage).toHaveBeenCalledWith(
      systemMessageTree.shared.data.mock.unknownFailure,
      expect.objectContaining({
        operation: 'useMockSession.onMounted'
      })
    );

    app.unmount();
  });

  it('captures store error and logs when role sync fails from roleModel setter', async () => {
    const mockDataStore = useMockDataStore();
    vi.spyOn(mockDataStore, 'resolveSessionProfileByRole').mockRejectedValueOnce(new Error('resolve failed'));

    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    session.roleModel.value = ROLE.INSTITUTION_ADMIN;
    await vi.waitFor(() => {
      expect(mockDataStore.error).toBeTruthy();
    });

    expect(session.authStore.activeRole).toBe(ROLE.INSTITUTION_ADMIN);
    expect(mockDataStore.userErrorMessage).toBeTruthy();
    expect(logSystemMessage).toHaveBeenCalledWith(
      systemMessageTree.shared.data.mock.unknownFailure,
      expect.objectContaining({
        operation: 'useMockSession.applyRoleChange',
        activeRole: ROLE.INSTITUTION_ADMIN
      })
    );

    app.unmount();
  });

  it('keeps equivalent anonymous state via setAnonymous and roleModel anonymous', async () => {
    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();
    await session.setInstitutionAdmin();
    await flushAsyncWork();

    session.setAnonymous();
    const snapshotFromMethod = {
      role: session.authStore.activeRole,
      isAuthenticated: session.authStore.isAuthenticated,
      uid: session.authStore.uid,
      email: session.authStore.email,
      rfcs: [...session.authStore.allowedInstitutionRfcs],
      activeRfc: session.institutionStore.activeRfc
    };

    await session.setInstitutionOperator();
    await flushAsyncWork();
    session.roleModel.value = ROLE.ANONYMOUS;
    await flushAsyncWork();

    const snapshotFromModel = {
      role: session.authStore.activeRole,
      isAuthenticated: session.authStore.isAuthenticated,
      uid: session.authStore.uid,
      email: session.authStore.email,
      rfcs: [...session.authStore.allowedInstitutionRfcs],
      activeRfc: session.institutionStore.activeRfc
    };

    expect(snapshotFromModel).toEqual(snapshotFromMethod);

    app.unmount();
  });

  it('applies the last requested role when multiple role changes race', async () => {
    const mockDataStore = useMockDataStore();
    const baseResolver = mockDataStore.resolveSessionProfileByRole.bind(mockDataStore);
    vi.spyOn(mockDataStore, 'resolveSessionProfileByRole').mockImplementation(async (role) => {
      if (role === ROLE.SYSTEM_ADMINISTRATOR) {
        await new Promise<void>((resolve) => {
          globalThis.setTimeout(resolve, 10);
        });
      }
      return baseResolver(role);
    });

    const [session, app] = withSetup(() => useMockSession());
    await flushAsyncWork();

    session.roleModel.value = ROLE.SYSTEM_ADMINISTRATOR;
    session.roleModel.value = ROLE.INSTITUTION_ADMIN;

    await vi.waitFor(() => {
      expect(session.roleModel.value).toBe(ROLE.INSTITUTION_ADMIN);
      expect(session.rfcModel.value).toBe(DEFAULT_RFC);
    });

    app.unmount();
  });
});
