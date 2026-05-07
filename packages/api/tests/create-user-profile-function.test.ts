/**
 * @package api
 * @name create-user-profile-function.test.ts
 * @version 0.0.1
 * @description Verifica que el trigger Auth onCreate no sobrescriba perfiles ya existentes.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-06)	Cubre creación inicial de perfil y preservación de perfil existente.	@codex
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  existingUser: null as Record<string, unknown> | null,
  userWrites: [] as Record<string, unknown>[],
  logWrites: [] as Record<string, unknown>[],
  capturedHandler: null as ((authUser: any, context: any) => Promise<void>) | null,
}));

vi.mock('firebase-admin/app', () => ({
  getApps: () => [{}],
  initializeApp: () => ({}),
}));

function resolveCollection(refId: string) {
  if (refId.startsWith('users/')) {
    return 'users';
  }
  return 'logs';
}

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: (name: string) => ({
      doc: (id?: string) => {
        const docId = id ?? `${name}-generated-id`;
        return {
          id: `${name}/${docId}`,
          async get() {
            if (name === 'users') {
              return {
                exists: state.existingUser !== null,
                data: () => state.existingUser,
              };
            }
            return {
              exists: false,
              data: () => null,
            };
          },
        };
      },
    }),
    batch: () => ({
      set(ref: { id: string }, payload: Record<string, unknown>) {
        const collection = resolveCollection(ref.id);
        if (collection === 'users') {
          state.userWrites.push(payload);
          return;
        }
        state.logWrites.push(payload);
      },
      async commit() {
        return;
      },
    }),
  }),
}));

vi.mock('firebase-functions/v1', () => ({
  auth: {
    user: () => ({
      onCreate: (handler: (authUser: any, context: any) => Promise<void>) => {
        state.capturedHandler = handler;
        return handler;
      },
    }),
  },
}));

vi.mock('firebase-functions/v2', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('createUserProfile onCreate trigger', () => {
  beforeEach(async () => {
    vi.resetModules();
    state.existingUser = null;
    state.userWrites = [];
    state.logWrites = [];
    state.capturedHandler = null;
    await import('../src/functions/createUserProfileFunction');
    expect(state.capturedHandler).toBeTruthy();
  });

  it('creates user profile when user document does not exist', async () => {
    await state.capturedHandler?.(
      {
        uid: 'dev-user-001',
        email: 'owner@example.test',
        displayName: null,
        phoneNumber: null,
      },
      { eventId: 'event-001' },
    );

    expect(state.userWrites).toHaveLength(1);
    expect(state.userWrites[0]).toMatchObject({
      userId: 'dev-user-001',
      email: 'owner@example.test',
      name: 'owner@example.test',
    });
    expect(state.logWrites).toHaveLength(1);
  });

  it('does not overwrite user profile when document already exists', async () => {
    state.existingUser = {
      userId: 'dev-user-001',
      email: 'owner@example.test',
      name: 'María Operadora',
      emojiIcon: '😎',
      updates: [],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    };

    await state.capturedHandler?.(
      {
        uid: 'dev-user-001',
        email: 'owner@example.test',
        displayName: null,
        phoneNumber: null,
      },
      { eventId: 'event-002' },
    );

    expect(state.userWrites).toHaveLength(0);
    expect(state.logWrites).toHaveLength(1);
  });
});
