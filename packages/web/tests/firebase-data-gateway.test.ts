import { beforeEach, describe, expect, it, vi } from 'vitest';
import { where } from 'firebase/firestore';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  PERMISSION_STATUS,
  ROLE,
  SYSTEM_MESSAGE_ERROR_KIND,
  SYSTEM_RFC,
} from '@shared';

let collectionDocs: Array<{ data: () => unknown }> = [];

vi.mock('@/plugins/firebase', () => ({
  getFirebaseRuntime: () => ({ firestore: {} }),
}));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn((_, name: string) => ({ name })),
  doc: vi.fn((_, name: string, id: string) => ({ name, id })),
  getDoc: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: collectionDocs })),
  orderBy: vi.fn(),
  query: vi.fn((value) => value),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
}));

const { listInstitutions, listPermissionsByEmail } = await import('@/gateways/firebaseDataGateway');

function institution(RFC: string) {
  return {
    RFC,
    name: `Institucion ${RFC}`,
    plan: COMMERCIAL_PLAN.PORTAL,
    planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
    sharedSecret: 'test-only-shared-secret',
    planStartAt: 1710000000000,
    planFinishAt: 1710000000000,
    updates: [],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  };
}

describe('firebase data gateway', () => {
  beforeEach(() => {
    collectionDocs = [];
  });

  it('filters reserved system RFC from institution reads', async () => {
    collectionDocs = [{ data: () => institution(DEFAULT_RFC) }, { data: () => institution(SYSTEM_RFC) }];

    await expect(listInstitutions()).resolves.toEqual([institution(DEFAULT_RFC)]);
  });

  it('rejects invalid Firestore payloads before returning data', async () => {
    collectionDocs = [{ data: () => ({ RFC: DEFAULT_RFC }) }];

    await expect(listInstitutions()).rejects.toMatchObject({
      errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_VALIDATION,
    });
  });

  it('queries permissions by normalized email to support pre-account grants', async () => {
    collectionDocs = [
      {
        data: () => ({
          permissionId: 'perm-institution-admin-001',
          RFC: DEFAULT_RFC,
          email: 'admin@example.test',
          role: ROLE.INSTITUTION_ADMIN,
          status: PERMISSION_STATUS.GRANTED,
          updates: [],
          createdAt: 1710000000000,
          updatedAt: 1710000000000,
        }),
      },
    ];

    await expect(listPermissionsByEmail(' Admin@Example.Test ')).resolves.toHaveLength(1);
    expect(vi.mocked(where)).toHaveBeenCalledWith('email', '==', 'admin@example.test');
  });
});
