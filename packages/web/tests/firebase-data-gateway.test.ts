import { beforeEach, describe, expect, it, vi } from 'vitest';
import { where } from 'firebase/firestore';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  SYSTEM_RFC
} from '@shared';
import { APP_DATA_ERROR_KIND } from '@/shared/errors/appErrors';

let collectionDocs: Array<{ data: () => unknown }> = [];

vi.mock('@/plugins/firebase', () => ({
  getFirebaseRuntime: () => ({ firestore: {} })
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
  where: vi.fn()
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
    updatedAt: 1710000000000
  };
}

describe('firebase data gateway', () => {
  beforeEach(() => {
    collectionDocs = [];
  });

  it('filters reserved system RFC from institution reads', async () => {
    collectionDocs = [
      { data: () => institution('XAXX010101000') },
      { data: () => institution(SYSTEM_RFC) }
    ];

    await expect(listInstitutions()).resolves.toEqual([institution('XAXX010101000')]);
  });

  it('rejects invalid Firestore payloads before returning data', async () => {
    collectionDocs = [{ data: () => ({ RFC: 'XAXX010101000' }) }];

    await expect(listInstitutions()).rejects.toMatchObject({
      kind: APP_DATA_ERROR_KIND.VALIDATION
    });
  });

  it('queries permissions by normalized email to support pre-account grants', async () => {
    collectionDocs = [{
      data: () => ({
        permissionId: 'perm-institution-admin-001',
        RFC: 'XAXX010101000',
        email: 'admin@example.test',
        role: 'INSTITUTION_ADMIN',
        status: 'GRANTED',
        updates: [],
        createdAt: 1710000000000,
        updatedAt: 1710000000000
      })
    }];

    await expect(listPermissionsByEmail(' Admin@Example.Test ')).resolves.toHaveLength(1);
    expect(vi.mocked(where)).toHaveBeenCalledWith('email', '==', 'admin@example.test');
  });
});
