import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LOG_CATEGORIES, ROLE, UPDATE_ORIGIN } from '@puintegra/shared';
import { createApiDependencies } from '../src/functions/apiDependencies';

const state = vi.hoisted(() => ({
  userDoc: {
    userId: 'dev-user-001',
    name: 'Nombre Inicial',
    email: 'owner@example.test',
    phone: '+525500000000',
    emojiIcon: '😀',
    updates: [],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  } as Record<string, unknown>,
  logs: [] as Record<string, unknown>[],
  updateUser: vi.fn(),
  batchCommitError: null as Error | null,
}));

vi.mock('firebase-admin/app', () => ({
  getApps: () => [{}],
  initializeApp: () => ({}),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    updateUser: state.updateUser,
    verifyIdToken: vi.fn(),
    getUserByEmail: vi.fn(),
  }),
}));

function createDocSnapshot(name: string) {
  if (name === 'users') {
    return {
      exists: !!state.userDoc,
      data: () => state.userDoc,
    };
  }
  return {
    exists: false,
    data: () => null,
  };
}

function persistDoc(name: string, payload: Record<string, unknown>) {
  if (name === 'users') {
    state.userDoc = payload;
    return Promise.resolve();
  }
  if (name === 'logs') {
    state.logs.push(payload);
    return Promise.resolve();
  }
  return Promise.resolve();
}

function createFirestoreDoc(name: string, id?: string) {
  const docId = id ?? `${name}-generated-id`;
  return {
    id: docId,
    async get() {
      return createDocSnapshot(name);
    },
    set(payload: Record<string, unknown>) {
      return persistDoc(name, payload);
    },
  };
}

function createWhereChain() {
  return {
    where: () => ({
      limit: () => ({
        async get() {
          return { empty: true, docs: [] };
        },
      }),
    }),
  };
}

function resolveBatchTargetName(refId: string) {
  return refId.includes('logs') || refId === 'logs-generated-id' ? 'logs' : 'users';
}

function createBatchMock() {
  const operations: Array<{ name: string; payload: Record<string, unknown> }> = [];
  return {
    set(ref: { id: string }, payload: Record<string, unknown>) {
      operations.push({ name: resolveBatchTargetName(ref.id), payload });
    },
    async commit() {
      if (state.batchCommitError) {
        throw state.batchCommitError;
      }
      for (const operation of operations) {
        if (operation.name === 'users') {
          state.userDoc = operation.payload;
        } else {
          state.logs.push(operation.payload);
        }
      }
    },
  };
}

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: (name: string) => ({
      doc: (id?: string) => createFirestoreDoc(name, id),
      where: () => createWhereChain(),
    }),
    batch: () => createBatchMock(),
  }),
}));

describe('account profile update dependency', () => {
  beforeEach(() => {
    state.userDoc = {
      userId: 'dev-user-001',
      name: 'Nombre Inicial',
      email: 'owner@example.test',
      phone: '+525500000000',
      emojiIcon: '😀',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    };
    state.logs = [];
    state.updateUser.mockReset();
    state.batchCommitError = null;
  });

  it('updates profile, appends phone-aware delta history, and writes account settings log', async () => {
    const dependencies = createApiDependencies();
    const result = await dependencies.updateAccountProfile({
      actor: {
        userId: 'dev-user-001',
        email: 'owner@example.test',
        role: ROLE.INSTITUTION_OPERATOR,
      },
      originTraceId: 'trace-001',
      payload: {
        name: 'Nombre Actualizado',
        emojiIcon: '😎',
        phone: '+52 55 0000 0001',
      },
    });

    expect(result).toMatchObject({
      userId: 'dev-user-001',
      name: 'Nombre Actualizado',
      emojiIcon: '😎',
      phone: '+525500000001',
    });
    expect(state.updateUser).toHaveBeenCalledWith('dev-user-001', {
      displayName: 'Nombre Actualizado',
    });
    const updates = state.userDoc.updates as Array<Record<string, unknown>>;
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({
      updateOrigin: UPDATE_ORIGIN.USER,
      previousName: 'Nombre Inicial',
      updatedName: 'Nombre Actualizado',
      previousEmojiIcon: '😀',
      updatedEmojiIcon: '😎',
      previousPhone: '+525500000000',
      updatedPhone: '+525500000001',
    });
    expect(state.logs[0]).toMatchObject({
      category: LOG_CATEGORIES.USER_ACCOUNT_SETTINGS_UPDATE,
      userId: 'dev-user-001',
      originTraceId: 'trace-001',
    });
  });

  it('rolls back firebase displayName when firestore persistence fails after auth sync', async () => {
    state.batchCommitError = new Error('firestore write failed');
    const dependencies = createApiDependencies();

    await expect(
      dependencies.updateAccountProfile({
        actor: {
          userId: 'dev-user-001',
          email: 'owner@example.test',
          role: ROLE.INSTITUTION_OPERATOR,
        },
        originTraceId: 'trace-rollback',
        payload: {
          name: 'Nombre Actualizado',
          emojiIcon: '😀',
          phone: '+525500000000',
        },
      }),
    ).rejects.toThrow('firestore write failed');

    expect(state.updateUser).toHaveBeenNthCalledWith(1, 'dev-user-001', {
      displayName: 'Nombre Actualizado',
    });
    expect(state.updateUser).toHaveBeenNthCalledWith(2, 'dev-user-001', {
      displayName: 'Nombre Inicial',
    });
  });
});
