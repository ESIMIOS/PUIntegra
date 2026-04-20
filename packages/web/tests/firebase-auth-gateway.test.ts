import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_AUTH_ERROR_KIND, APP_DATA_ERROR_KIND, AppDataError } from '@/shared/errors/appErrors';

const mocks = vi.hoisted(() => {
  const auth = { currentUser: null as null | { getIdToken: () => Promise<string> } };
  return {
    auth,
    getUserById: vi.fn(),
    listPermissionsByEmail: vi.fn(),
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn()
  };
});

vi.mock('@/plugins/firebase', () => ({
  getFirebaseRuntime: () => ({ auth: mocks.auth })
}));

vi.mock('@/gateways/firebaseDataGateway', () => ({
  getUserById: mocks.getUserById,
  listPermissionsByEmail: mocks.listPermissionsByEmail
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signOut: mocks.signOut
}));

const {
  establishSession,
  getCurrentFirebaseUser,
  hydrateSession,
  logout,
  validateCredentials
} = await import('@/gateways/firebaseAuthGateway');

describe('firebase auth gateway', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    mocks.getUserById.mockReset();
    mocks.listPermissionsByEmail.mockReset();
    mocks.onAuthStateChanged.mockReset();
    mocks.signInWithEmailAndPassword.mockReset();
    mocks.signOut.mockReset();
    mocks.auth.currentUser = null;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  });

  it('maps Firebase credential rejection to invalid credentials', async () => {
    mocks.signInWithEmailAndPassword.mockRejectedValue(new Error('Firebase rejected credentials.'));

    await expect(validateCredentials('admin@example.test', 'wrong-password')).rejects.toMatchObject({
      code: 'AUTH-LOGIN-003',
      kind: APP_AUTH_ERROR_KIND.INVALID_CREDENTIALS
    });
  });

  it('preserves profile resolution failures after Firebase accepts credentials', async () => {
    const profileError = new AppDataError(APP_DATA_ERROR_KIND.NOT_FOUND, 'User not found.', {
      userId: 'dev-user-001'
    });
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'dev-user-001' }
    });
    mocks.getUserById.mockRejectedValue(profileError);

    await expect(validateCredentials('admin@example.test', 'local-password')).rejects.toBe(profileError);
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it('signs out Firebase session when user has no granted contexts', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'dev-user-001' }
    });
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000
    });
    mocks.listPermissionsByEmail.mockResolvedValue([]);

    await expect(validateCredentials('admin@example.test', 'local-password')).rejects.toMatchObject({
      kind: APP_AUTH_ERROR_KIND.NO_PERMISSIONS,
      code: 'AUTH-LOGIN-004'
    });
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it('records login events immediately after successful credential validation', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'dev-user-001' }
    });
    mocks.auth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('id-token')
    };
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000
    });
    mocks.listPermissionsByEmail.mockResolvedValue([
      {
        RFC: 'XAXX010101000',
        email: 'admin@example.test',
        role: 'INSTITUTION_ADMIN',
        status: 'GRANTED',
        updates: []
      }
    ]);

    await validateCredentials('admin@example.test', 'local-password');
    expect(mocks.listPermissionsByEmail).toHaveBeenCalledWith('admin@example.test');

    await Promise.resolve();
    await Promise.resolve();
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/events/login', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        authorization: 'Bearer id-token'
      })
    }));
    expect(vi.mocked(globalThis.fetch).mock.calls[0]?.[1]).not.toHaveProperty('body');
  });

  it('does not emit login events when only selecting an already-authenticated context', async () => {
    mocks.auth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('id-token')
    };
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000
    });
    vi.mocked(globalThis.fetch).mockClear();

    await establishSession({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: null,
      contexts: [{ role: 'INSTITUTION_ADMIN', rfc: 'XAXX010101000' }]
    }, { role: 'INSTITUTION_ADMIN', rfc: 'XAXX010101000' });

    expect(mocks.getUserById).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).not.toHaveBeenCalledWith('/api/auth/events/login', expect.anything());
  });

  it('records logout events before clearing Firebase Auth state', async () => {
    mocks.auth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('id-token')
    };
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000
    });
    await establishSession({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: null,
      contexts: [{ role: 'SYSTEM_ADMINISTRATOR', rfc: 'IEC120914FV8' }]
    }, { role: 'SYSTEM_ADMINISTRATOR', rfc: 'IEC120914FV8' });
    vi.mocked(globalThis.fetch).mockClear();

    await logout();

    await Promise.resolve();
    await Promise.resolve();
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/events/logout', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        authorization: 'Bearer id-token'
      })
    }));
    expect(vi.mocked(globalThis.fetch).mock.calls[0]?.[1]).not.toHaveProperty('body');
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it('resolves Firebase user from first auth observer emission when currentUser is empty', async () => {
    const unsubscribe = vi.fn();
    const firebaseUser = {
      uid: 'dev-user-001'
    } as unknown as { getIdToken: () => Promise<string> };
    mocks.onAuthStateChanged.mockImplementation((_, callback) => {
      callback(firebaseUser);
      return unsubscribe;
    });

    await expect(getCurrentFirebaseUser()).resolves.toBe(firebaseUser);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('hydrates session using profile user data', async () => {
    mocks.auth.currentUser = {
      uid: 'dev-user-001'
    } as unknown as { getIdToken: () => Promise<string> };
    globalThis.localStorage.setItem(
      'puintegra:web:active-session-context:v1',
      JSON.stringify({ role: 'INSTITUTION_ADMIN', rfc: 'XAXX010101000' })
    );
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000
    });
    mocks.listPermissionsByEmail.mockResolvedValue([
      {
        RFC: 'XAXX010101000',
        email: 'admin@example.test',
        role: 'INSTITUTION_ADMIN',
        status: 'GRANTED',
        updates: []
      }
    ]);

    const session = await hydrateSession();

    expect(session?.userId).toBe('dev-user-001');
    expect(mocks.getUserById).toHaveBeenCalledTimes(2);
  });
});
