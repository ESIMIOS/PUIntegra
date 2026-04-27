import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDoc, where } from 'firebase/firestore';
import { COMMERCIAL_PLAN, COMMERCIAL_PLAN_STATUS, DEFAULT_RFC, PERMISSION_STATUS, ROLE, SYSTEM_RFC } from '@shared';

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

const { getInstitutionByRfc, listInstitutions, listPermissionsByEmail } = await import('@/gateways/firebaseDataGateway');

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
    vi.mocked(getDoc).mockReset();
  });

  it('filters reserved system RFC from institution reads', async () => {
    collectionDocs = [{ data: () => institution(DEFAULT_RFC) }, { data: () => institution(SYSTEM_RFC) }];

    await expect(listInstitutions()).resolves.toEqual([institution(DEFAULT_RFC)]);
  });

  it('rejects invalid Firestore payloads before returning data', async () => {
    collectionDocs = [{ data: () => ({ RFC: DEFAULT_RFC }) }];

    await expect(listInstitutions()).rejects.toMatchObject({});
  });

  it('loads one institution by RFC', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => institution(DEFAULT_RFC),
    } as Awaited<ReturnType<typeof getDoc>>);

    await expect(getInstitutionByRfc(DEFAULT_RFC)).resolves.toEqual(institution(DEFAULT_RFC));
  });

  it('rejects missing institution documents', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
      data: () => undefined,
    } as Awaited<ReturnType<typeof getDoc>>);

    await expect(getInstitutionByRfc('AAA010101AAA')).rejects.toMatchObject({
      code: 'DATA-OPERATION-002',
    });
  });

  it('rejects invalid institution detail payloads before returning data', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ RFC: DEFAULT_RFC }),
    } as Awaited<ReturnType<typeof getDoc>>);

    await expect(getInstitutionByRfc(DEFAULT_RFC)).rejects.toMatchObject({
      code: 'DATA-OPERATION-001',
    });
  });

  it('rejects reserved system RFC for tenant institution detail reads', async () => {
    await expect(getInstitutionByRfc(SYSTEM_RFC)).rejects.toMatchObject({
      code: 'DATA-OPERATION-004',
    });
    expect(vi.mocked(getDoc)).not.toHaveBeenCalled();
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
