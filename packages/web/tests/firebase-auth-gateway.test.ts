import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_RFC,
  PERMISSION_STATUS,
  ROLE,
  SYSTEM_RFC,
  SystemError,
  sharedSystemMessages,
} from '@shared';

const mocks = vi.hoisted(() => {
  const auth = { currentUser: null as null | { getIdToken: () => Promise<string> } };
  return {
    auth,
    applyActionCode: vi.fn(),
    confirmPasswordReset: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    getUserById: vi.fn(),
    listPermissionsByEmail: vi.fn(),
    multiFactor: vi.fn(),
    onAuthStateChanged: vi.fn(),
    sendEmailVerification: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    verifyPasswordResetCode: vi.fn(),
  };
});

vi.mock('@/plugins/firebase', () => ({
  getFirebaseRuntime: () => ({ auth: mocks.auth }),
}));

vi.mock('@/gateways/firebaseDataGateway', () => ({
  getUserById: mocks.getUserById,
  listPermissionsByEmail: mocks.listPermissionsByEmail,
}));

vi.mock('firebase/auth', () => ({
  applyActionCode: mocks.applyActionCode,
  confirmPasswordReset: mocks.confirmPasswordReset,
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  multiFactor: mocks.multiFactor,
  onAuthStateChanged: mocks.onAuthStateChanged,
  sendEmailVerification: mocks.sendEmailVerification,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signOut: mocks.signOut,
  updateProfile: mocks.updateProfile,
  verifyPasswordResetCode: mocks.verifyPasswordResetCode,
}));

const {
  applyEmailVerificationCode,
  confirmPasswordResetWithCode,
  createAccount,
  establishSession,
  getCurrentFirebaseUser,
  getTotpSetupState,
  hydrateSession,
  logout,
  requestPasswordRecovery,
  resendEmailVerification,
  validateCredentials,
  verifyPasswordResetCodeForEmail,
} =
  await import('@/gateways/firebaseAuthGateway');

describe('firebase auth gateway', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    mocks.getUserById.mockReset();
    mocks.listPermissionsByEmail.mockReset();
    mocks.applyActionCode.mockReset();
    mocks.confirmPasswordReset.mockReset();
    mocks.createUserWithEmailAndPassword.mockReset();
    mocks.multiFactor.mockReset();
    mocks.onAuthStateChanged.mockReset();
    mocks.sendEmailVerification.mockReset();
    mocks.sendPasswordResetEmail.mockReset();
    mocks.signInWithEmailAndPassword.mockReset();
    mocks.signOut.mockReset();
    mocks.updateProfile.mockReset();
    mocks.verifyPasswordResetCode.mockReset();
    mocks.auth.currentUser = null;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          ok: true,
          data: { accepted: true },
        }),
      ),
    );
  });

  it('maps Firebase credential rejection to invalid credentials', async () => {
    mocks.signInWithEmailAndPassword.mockRejectedValue(new Error('Firebase rejected credentials.'));

    await expect(validateCredentials('admin@example.test', 'wrong-password')).rejects.toMatchObject({
      code: 'AUTH-LOGIN-003',
    });
  });

  it('blocks unverified Firebase users before resolving PUIntegra contexts', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'dev-user-001', emailVerified: false },
    });

    await expect(validateCredentials('admin@example.test', 'local-password')).rejects.toMatchObject({
      code: 'AUTH-LOGIN-006',
    });
    expect(mocks.getUserById).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it('preserves profile resolution failures after Firebase accepts credentials', async () => {
    const profileError = new SystemError(sharedSystemMessages.data.operation.notFound.code, {
      details: {
        userId: 'dev-user-001',
      },
    });
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'dev-user-001' },
    });
    mocks.getUserById.mockRejectedValue(profileError);

    await expect(validateCredentials('admin@example.test', 'local-password')).rejects.toBe(profileError);
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it('signs out Firebase session when user has no granted contexts', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'dev-user-001' },
    });
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    });
    mocks.listPermissionsByEmail.mockResolvedValue([]);

    await expect(validateCredentials('admin@example.test', 'local-password')).rejects.toMatchObject({
      code: 'AUTH-LOGIN-004',
    });
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it('records login events immediately after successful credential validation', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'dev-user-001', emailVerified: true },
    });
    mocks.auth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('id-token'),
    };
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    });
    mocks.listPermissionsByEmail.mockResolvedValue([
      {
        RFC: DEFAULT_RFC,
        email: 'admin@example.test',
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
        updates: [],
      },
    ]);

    await validateCredentials('admin@example.test', 'local-password');
    expect(mocks.listPermissionsByEmail).toHaveBeenCalledWith('admin@example.test');

    await Promise.resolve();
    await Promise.resolve();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/events/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer id-token',
        }),
      }),
    );
    expect(vi.mocked(globalThis.fetch).mock.calls[0]?.[1]).not.toHaveProperty('body');
  });

  it('creates accounts after API policy approval and sends verification email', async () => {
    const firebaseUser = {
      uid: 'new-user-001',
      email: 'owner@example.test',
    };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });

    await createAccount({
      displayName: 'María Operadora',
      email: ' Owner@Example.TEST ',
      password: 'StrongPass1',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/lifecycle/account-creation-policy',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'owner@example.test' }),
      }),
    );
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(mocks.auth, 'owner@example.test', 'StrongPass1');
    expect(mocks.updateProfile).toHaveBeenCalledWith(firebaseUser, { displayName: 'María Operadora' });
    expect(mocks.sendEmailVerification).toHaveBeenCalledWith(firebaseUser, expect.objectContaining({
      url: expect.stringContaining('/auth/verify-email'),
    }));
  });

  it('resends email verification only for the current unverified user', async () => {
    const firebaseUser = {
      emailVerified: false,
    };
    mocks.auth.currentUser = firebaseUser as unknown as { getIdToken: () => Promise<string> };

    await resendEmailVerification();

    expect(mocks.sendEmailVerification).toHaveBeenCalledWith(firebaseUser, expect.any(Object));
  });

  it('applies email verification codes', async () => {
    await applyEmailVerificationCode('verification-code');

    expect(mocks.applyActionCode).toHaveBeenCalledWith(mocks.auth, 'verification-code');
  });

  it('does not fail email verification when lifecycle audit API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('api unavailable')));

    await expect(applyEmailVerificationCode('verification-code')).resolves.toBeUndefined();
    expect(mocks.applyActionCode).toHaveBeenCalledWith(mocks.auth, 'verification-code');
  });

  it('requests password recovery through API policy and Firebase reset email with neutral handling', async () => {
    mocks.sendPasswordResetEmail.mockRejectedValue(new Error('account not found'));

    await expect(requestPasswordRecovery(' Owner@Example.TEST ')).resolves.toEqual({ accepted: true });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/lifecycle/password-recovery',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'owner@example.test' }),
      }),
    );
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(mocks.auth, 'owner@example.test', expect.objectContaining({
      url: expect.stringContaining('/auth/reset-password'),
    }));
  });

  it('validates and confirms password reset codes', async () => {
    mocks.verifyPasswordResetCode.mockResolvedValue('owner@example.test');

    await expect(verifyPasswordResetCodeForEmail('reset-code')).resolves.toBe('owner@example.test');
    await confirmPasswordResetWithCode('reset-code', 'StrongPass1', 'owner@example.test');

    expect(mocks.verifyPasswordResetCode).toHaveBeenCalledWith(mocks.auth, 'reset-code');
    expect(mocks.confirmPasswordReset).toHaveBeenCalledWith(mocks.auth, 'reset-code', 'StrongPass1');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/lifecycle/password-reset-completed',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'owner@example.test' }),
      }),
    );
  });

  it('does not fail password reset when lifecycle audit API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('api unavailable')));

    await expect(confirmPasswordResetWithCode('reset-code', 'StrongPass1', 'owner@example.test')).resolves.toBeUndefined();
    expect(mocks.confirmPasswordReset).toHaveBeenCalledWith(mocks.auth, 'reset-code', 'StrongPass1');
  });

  it('reports one-factor TOTP state and admin-assisted recovery guidance', async () => {
    mocks.auth.currentUser = {
      emailVerified: true,
    } as unknown as { getIdToken: () => Promise<string> };
    mocks.multiFactor.mockReturnValue({
      enrolledFactors: [{ factorId: 'totp', displayName: 'Autenticador' }],
    });

    await expect(getTotpSetupState()).resolves.toEqual({
      available: false,
      hasTotpFactor: true,
      requiresAdminReset: true,
      reason: 'already-enrolled',
    });
  });

  it('does not emit login events when only selecting an already-authenticated context', async () => {
    mocks.auth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('id-token'),
    };
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    });
    vi.mocked(globalThis.fetch).mockClear();

    await establishSession(
      {
        userId: 'dev-user-001',
        name: 'Usuario Firebase',
        email: 'admin@example.test',
        emojiIcon: null,
        contexts: [{ role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC }],
      },
      { role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC },
    );

    expect(mocks.getUserById).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).not.toHaveBeenCalledWith('/api/auth/events/login', expect.anything());
  });

  it('records logout events before clearing Firebase Auth state', async () => {
    mocks.auth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue('id-token'),
    };
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    });
    await establishSession(
      {
        userId: 'dev-user-001',
        name: 'Usuario Firebase',
        email: 'admin@example.test',
        emojiIcon: null,
        contexts: [{ role: ROLE.SYSTEM_ADMINISTRATOR, rfc: SYSTEM_RFC }],
      },
      { role: ROLE.SYSTEM_ADMINISTRATOR, rfc: SYSTEM_RFC },
    );
    vi.mocked(globalThis.fetch).mockClear();

    await logout();

    await Promise.resolve();
    await Promise.resolve();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/events/logout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer id-token',
        }),
      }),
    );
    expect(vi.mocked(globalThis.fetch).mock.calls[0]?.[1]).not.toHaveProperty('body');
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });

  it('resolves Firebase user from first auth observer emission when currentUser is empty', async () => {
    const unsubscribe = vi.fn();
    const firebaseUser = {
      uid: 'dev-user-001',
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
      uid: 'dev-user-001',
    } as unknown as { getIdToken: () => Promise<string> };
    globalThis.localStorage.setItem(
      'puintegra:web:active-session-context:v1',
      JSON.stringify({ role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC }),
    );
    mocks.getUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    });
    mocks.listPermissionsByEmail.mockResolvedValue([
      {
        RFC: DEFAULT_RFC,
        email: 'admin@example.test',
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
        updates: [],
      },
    ]);

    const session = await hydrateSession();

    expect(session?.userId).toBe('dev-user-001');
    expect(mocks.getUserById).toHaveBeenCalledTimes(2);
  });
});
