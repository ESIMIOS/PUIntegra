import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  PERMISSION_STATUS,
  ROLE,
  SYSTEM_RFC,
  SystemError,
  UPDATE_ORIGIN,
  sharedSystemMessages,
} from '@shared';
import AccountInstitutionsPage from '@/pages/account/AccountInstitutionsPage.vue';
import { useAuthStore } from '@/stores/authStore';
import { getInstitutionByRfc, listInstitutions, listPermissionsByEmail } from '@/gateways/firebaseDataGateway';
import { mountWithVuestic } from './utils/mount';

vi.mock('@/gateways/firebaseDataGateway', () => ({
  getUserById: vi.fn(),
  getInstitutionByRfc: vi.fn(),
  listInstitutions: vi.fn(),
  listPermissionsByEmail: vi.fn(),
  listPermissionsByUser: vi.fn(),
  listContactsByRfc: vi.fn(),
  listRequestsByRfc: vi.fn(),
  listFindingsByRfc: vi.fn(),
  listLogs: vi.fn(),
}));

const mockedListInstitutions = vi.mocked(listInstitutions);
const mockedGetInstitutionByRfc = vi.mocked(getInstitutionByRfc);
const mockedListPermissionsByEmail = vi.mocked(listPermissionsByEmail);

function institution(RFC: string, name = `Institucion ${RFC}`) {
  return {
    RFC,
    name,
    plan: COMMERCIAL_PLAN.PORTAL,
    planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
    planStartAt: 1767225600000,
    planFinishAt: 1798675200000,
    updates: [
      {
        previousPlanStatus: COMMERCIAL_PLAN_STATUS.WARNING,
        updatedPlanStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
        updateOrigin: UPDATE_ORIGIN.SYSTEM,
        updatedAt: 1767225601000,
      },
    ],
    createdAt: 1767225600000,
    updatedAt: 1767225600000,
  };
}

function permission({
  id,
  RFC,
  role,
  status,
  email = 'admin@example.test',
}: {
  id: string;
  RFC: string;
  role: (typeof ROLE)[keyof typeof ROLE];
  status: (typeof PERMISSION_STATUS)[keyof typeof PERMISSION_STATUS];
  email?: string;
}) {
  return {
    permissionId: id,
    RFC,
    email,
    userId: 'dev-user-001',
    role,
    status,
    updates: [
      {
        previousStatus: PERMISSION_STATUS.DENIED,
        updatedStatus: status,
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedAt: 1767225601000,
      },
    ],
    createdAt: 1767225600000,
    updatedAt: 1767225600000,
  };
}

function mountPage(pinia: Pinia) {
  return mountWithVuestic(AccountInstitutionsPage, {
    global: {
      plugins: [pinia],
    },
  });
}

describe('account institutions page', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    mockedListInstitutions.mockReset();
    mockedGetInstitutionByRfc.mockReset();
    mockedListPermissionsByEmail.mockReset();

    const authStore = useAuthStore();
    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setIdentity({
      uid: 'dev-user-001',
      email: 'admin@example.test',
    });
  });

  it('renders loading state while data is being read', async () => {
    mockedListPermissionsByEmail.mockReturnValue(new Promise(() => {}));

    const wrapper = mountPage(pinia);
    await flushPromises();

    expect(wrapper.text()).toContain('Cargando instituciones');
  });

  it('renders institutions table with permission data', async () => {
    mockedListPermissionsByEmail.mockResolvedValue([
      permission({
        id: 'perm-001',
        RFC: DEFAULT_RFC,
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
      }),
    ]);
    mockedGetInstitutionByRfc.mockResolvedValue(institution(DEFAULT_RFC, 'Institucion Demo'));

    const wrapper = mountPage(pinia);
    await flushPromises();

    expect(mockedListInstitutions).not.toHaveBeenCalled();
    expect(mockedGetInstitutionByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.find('[data-testid="account-institutions-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(DEFAULT_RFC);
    expect(wrapper.text()).toContain('Institucion Demo');
    expect(wrapper.text()).toContain(ROLE.INSTITUTION_ADMIN);
    expect(wrapper.text()).toContain('admin@example.test');
    expect(wrapper.text()).toContain(PERMISSION_STATUS.GRANTED);
    expect(wrapper.find(`[data-testid="account-institution-history-${DEFAULT_RFC}"]`).exists()).toBe(true);
    expect(wrapper.find('[data-testid="account-permission-history-perm-001"]').exists()).toBe(true);
  });

  it('filters out reserved SYSTEM_RFC permissions from rows', async () => {
    mockedListPermissionsByEmail.mockResolvedValue([
      permission({
        id: 'perm-001',
        RFC: SYSTEM_RFC,
        role: ROLE.SYSTEM_ADMINISTRATOR,
        status: PERMISSION_STATUS.GRANTED,
      }),
      permission({
        id: 'perm-002',
        RFC: DEFAULT_RFC,
        role: ROLE.INSTITUTION_OPERATOR,
        status: PERMISSION_STATUS.DENIED,
      }),
    ]);
    mockedGetInstitutionByRfc.mockResolvedValue(institution(DEFAULT_RFC, 'Institucion Demo'));

    const wrapper = mountPage(pinia);
    await flushPromises();

    expect(wrapper.text()).toContain(DEFAULT_RFC);
    expect(wrapper.text()).not.toContain(SYSTEM_RFC);
    expect(mockedGetInstitutionByRfc).toHaveBeenCalledTimes(1);
    expect(mockedGetInstitutionByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
  });

  it('renders empty state when there are no permissions', async () => {
    mockedListPermissionsByEmail.mockResolvedValue([]);

    const wrapper = mountPage(pinia);
    await flushPromises();

    expect(wrapper.text()).toContain('No hay instituciones con permisos visibles para esta cuenta');
  });

  it('renders load errors with retry action', async () => {
    mockedListPermissionsByEmail.mockRejectedValue(
      new SystemError(sharedSystemMessages.data.operation.unknownFailure),
    );

    const wrapper = mountPage(pinia);
    await flushPromises();

    expect(wrapper.get('[data-testid="account-institutions-error"]').text()).toContain(
      sharedSystemMessages.data.operation.unknownFailure.message,
    );
    expect(wrapper.find('[data-testid="account-institutions-retry"]').exists()).toBe(true);
  });
});
