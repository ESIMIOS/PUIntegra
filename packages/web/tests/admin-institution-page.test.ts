import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  SystemError,
  UPDATE_ORIGIN,
  sharedSystemMessages,
} from '@shared';
import AdminInstitutionPage from '@/pages/admin/AdminInstitutionPage.vue';
import { getInstitutionByRfc } from '@/gateways/firebaseDataGateway';
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
  listPermissionsByUser: vi.fn(),
  listContactsByRfc: vi.fn(),
  listRequestsByRfc: vi.fn(),
  listFindingsByRfc: vi.fn(),
  listLogs: vi.fn(),
}));

const mockedGetInstitutionByRfc = vi.mocked(getInstitutionByRfc);

function institution() {
  return {
    RFC: DEFAULT_RFC,
    name: 'Institucion Demo',
    plan: COMMERCIAL_PLAN.CLOUD,
    planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
    sharedSecret: null,
    planStartAt: 1767225600000,
    planFinishAt: 1798675200000,
    updates: [{ updateOrigin: UPDATE_ORIGIN.USER, updatedAt: 1767312000000 }],
    createdAt: 1767225600000,
    updatedAt: 1767312000000,
  };
}

function mountPage() {
  return mountWithVuestic(AdminInstitutionPage, {
    global: {
      plugins: [createPinia()],
    },
  });
}

describe('admin institution page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    routeParams.rfc = DEFAULT_RFC;
    push.mockReset();
    mockedGetInstitutionByRfc.mockReset();
  });

  it('renders loading state while institution detail loads', async () => {
    mockedGetInstitutionByRfc.mockReturnValue(new Promise(() => {}));

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain('Cargando institución');
  });

  it('loads institution detail from route RFC and renders read-only fields', async () => {
    mockedGetInstitutionByRfc.mockResolvedValue(institution());
    const wrapper = mountPage();
    await flushPromises();

    expect(mockedGetInstitutionByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.text()).toContain('Institucion Demo');
    expect(wrapper.text()).toContain(DEFAULT_RFC);
    expect(wrapper.text()).toContain(COMMERCIAL_PLAN.CLOUD);
    expect(wrapper.text()).toContain(COMMERCIAL_PLAN_STATUS.WARNING);
    expect(wrapper.text()).toContain('Secreto pendiente');
    expect(wrapper.text()).toContain('1 actualización');
    expect(wrapper.find('[data-testid="admin-institution-update-history"]').exists()).toBe(true);
  });

  it('renders recoverable error state when institution cannot be loaded', async () => {
    mockedGetInstitutionByRfc.mockRejectedValue(new SystemError(sharedSystemMessages.data.operation.notFound));
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.get('[data-testid="admin-institution-error"]').text()).toContain(
      sharedSystemMessages.data.operation.notFound.message,
    );

    await wrapper.get('[data-testid="admin-institution-back"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitutions);
  });

  it('navigates to related admin routes without mutating data', async () => {
    mockedGetInstitutionByRfc.mockResolvedValue(institution());
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get('[data-testid="admin-institution-requests"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitutionRequests(DEFAULT_RFC));

    await wrapper.get('[data-testid="admin-institution-plan"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitutionPlan(DEFAULT_RFC));

    await wrapper.get('[data-testid="admin-institution-contacts"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitutionContacts(DEFAULT_RFC));

    await wrapper.get('[data-testid="admin-institution-permissions"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminTenantPermissions(DEFAULT_RFC));
  });
});
