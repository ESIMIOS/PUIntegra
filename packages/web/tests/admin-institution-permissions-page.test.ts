import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_RFC, PERMISSION_STATUS, ROLE, SystemError, sharedSystemMessages } from '@shared';
import AdminInstitutionPermissionsPage from '@/pages/admin/AdminInstitutionPermissionsPage.vue';
import { getInstitutionByRfc, listPermissionsByRfc } from '@/gateways/firebaseDataGateway';
import { routePaths } from '@/shared/constants/routePaths';
import { mountWithVuestic } from './utils/mount';

const push = vi.fn();
const routeParams = { rfc: DEFAULT_RFC };

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: routeParams }),
  useRouter: () => ({ push }),
}));

vi.mock('@/gateways/firebaseDataGateway', () => ({
  getUserById: vi.fn(),
  getInstitutionByRfc: vi.fn(),
  listInstitutions: vi.fn(),
  listPermissionsByRfc: vi.fn(),
  listPermissionsByEmail: vi.fn(),
  listPermissionsByUser: vi.fn(),
  listContactsByRfc: vi.fn(),
  listRequestsByRfc: vi.fn(),
  listFindingsByRfc: vi.fn(),
  listLogs: vi.fn(),
}));

const mockedGetInstitutionByRfc = vi.mocked(getInstitutionByRfc);
const mockedListPermissionsByRfc = vi.mocked(listPermissionsByRfc);

function mountPage() {
  return mountWithVuestic(AdminInstitutionPermissionsPage, {
    global: {
      plugins: [createPinia()],
    },
  });
}

describe('admin institution permissions page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    routeParams.rfc = DEFAULT_RFC;
    push.mockReset();
    mockedGetInstitutionByRfc.mockReset();
    mockedListPermissionsByRfc.mockReset();
  });

  it('renders loading state while permissions are loading', async () => {
    mockedGetInstitutionByRfc.mockResolvedValue({
      RFC: DEFAULT_RFC,
      name: 'Institucion Demo',
      plan: 'PORTAL',
      planStatus: 'ACTIVE',
      planStartAt: 1767225600000,
      planFinishAt: 1798675200000,
      updates: [],
      createdAt: 1767225600000,
      updatedAt: 1767225600000,
    } as Awaited<ReturnType<typeof getInstitutionByRfc>>);
    mockedListPermissionsByRfc.mockReturnValue(new Promise(() => {}));

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain('Cargando permisos');
  });

  it('renders permission rows for the RFC tenant', async () => {
    mockedGetInstitutionByRfc.mockResolvedValue({
      RFC: DEFAULT_RFC,
      name: 'Institucion Demo',
      plan: 'PORTAL',
      planStatus: 'ACTIVE',
      planStartAt: 1767225600000,
      planFinishAt: 1798675200000,
      updates: [],
      createdAt: 1767225600000,
      updatedAt: 1767225600000,
    } as Awaited<ReturnType<typeof getInstitutionByRfc>>);
    mockedListPermissionsByRfc.mockResolvedValue([
      {
        permissionId: 'perm-001',
        RFC: DEFAULT_RFC,
        email: 'admin@example.test',
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
        updates: [],
        createdAt: 1767225600000,
        updatedAt: 1767225600000,
      },
    ]);

    const wrapper = mountPage();
    await flushPromises();

    expect(mockedListPermissionsByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.find('[data-testid="admin-permissions-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Institucion Demo');
    expect(wrapper.text()).toContain('admin@example.test');
    expect(wrapper.text()).toContain(ROLE.INSTITUTION_ADMIN);
    expect(wrapper.text()).toContain(PERMISSION_STATUS.GRANTED);
  });

  it('renders load errors with back action', async () => {
    mockedGetInstitutionByRfc.mockRejectedValue(new SystemError(sharedSystemMessages.data.operation.notFound));
    mockedListPermissionsByRfc.mockResolvedValue([]);

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.get('[data-testid="admin-permissions-error"]').text()).toContain(
      sharedSystemMessages.data.operation.notFound.message,
    );
    await wrapper.get('[data-testid="admin-permissions-back"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitution(DEFAULT_RFC));
  });
});
