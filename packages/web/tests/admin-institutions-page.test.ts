import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { COMMERCIAL_PLAN, COMMERCIAL_PLAN_STATUS, DEFAULT_RFC, SYSTEM_RFC, SystemError, sharedSystemMessages } from '@shared';
import AdminInstitutionsPage from '@/pages/admin/AdminInstitutionsPage.vue';
import { listInstitutions } from '@/gateways/firebaseDataGateway';
import { routePaths } from '@/shared/constants/routePaths';
import { mountWithVuestic } from './utils/mount';

const push = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/gateways/firebaseDataGateway', () => ({
  getUserById: vi.fn(),
  getInstitutionByRfc: vi.fn(),
  listInstitutions: vi.fn(),
  listPermissionsByUser: vi.fn(),
  listContactsByRfc: vi.fn(),
  listRequestsByRfc: vi.fn(),
  listFindingsByRfc: vi.fn(),
  listLogs: vi.fn(),
}));

const mockedListInstitutions = vi.mocked(listInstitutions);

function institution(RFC: string, name = `Institucion ${RFC}`) {
  return {
    RFC,
    name,
    plan: COMMERCIAL_PLAN.PORTAL,
    planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
    planStartAt: 1767225600000,
    planFinishAt: 1798675200000,
    updates: [],
    createdAt: 1767225600000,
    updatedAt: 1767225600000,
  };
}

function mountPage() {
  return mountWithVuestic(AdminInstitutionsPage, {
    global: {
      plugins: [createPinia()],
    },
  });
}

describe('admin institutions page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockReset();
    mockedListInstitutions.mockReset();
  });

  it('renders loading state while institutions load', async () => {
    mockedListInstitutions.mockReturnValue(new Promise(() => {}));

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain('Cargando instituciones');
  });

  it('renders institution rows and navigates to detail', async () => {
    mockedListInstitutions.mockResolvedValue([
      institution(DEFAULT_RFC, 'Institucion Demo'),
      institution('AAA010101AAA', 'Banco Prueba'),
    ]);
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain(DEFAULT_RFC);
    expect(wrapper.text()).toContain('Banco Prueba');
    expect(wrapper.text()).toContain(COMMERCIAL_PLAN.PORTAL);
    expect(wrapper.text()).toContain(COMMERCIAL_PLAN_STATUS.ACTIVE);

    await wrapper.get('[data-testid="admin-institution-detail-AAA010101AAA"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitution('AAA010101AAA'));
  });

  it('renders empty state when no institutions exist', async () => {
    mockedListInstitutions.mockResolvedValue([]);
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain('No hay instituciones registradas');
  });

  it('renders load errors with retry action', async () => {
    mockedListInstitutions.mockRejectedValue(new SystemError(sharedSystemMessages.data.operation.unknownFailure));
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.get('[data-testid="admin-institutions-error"]').text()).toContain(
      sharedSystemMessages.data.operation.unknownFailure.message,
    );
    expect(wrapper.find('[data-testid="admin-institutions-retry"]').exists()).toBe(true);
  });

  it('filters institutions by search term', async () => {
    mockedListInstitutions.mockResolvedValue([
      institution(DEFAULT_RFC, 'Institucion Demo'),
      institution('AAA010101AAA', 'Banco Prueba'),
    ]);
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.find('[data-testid="admin-institutions-search"] input').setValue('banco');

    expect(wrapper.text()).toContain('Banco Prueba');
    expect(wrapper.text()).not.toContain('Institucion Demo');
  });

  it('navigates to the institution onboarding page', async () => {
    mockedListInstitutions.mockResolvedValue([institution(DEFAULT_RFC)]);
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get('[data-testid="admin-institutions-new"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminNewInstitution);
  });

  it('does not render reserved system RFC as a tenant row', async () => {
    mockedListInstitutions.mockResolvedValue([institution(SYSTEM_RFC), institution(DEFAULT_RFC)]);
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).not.toContain(SYSTEM_RFC);
    expect(wrapper.text()).toContain(DEFAULT_RFC);
  });
});
