import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { COMMERCIAL_PLAN, COMMERCIAL_PLAN_STATUS, DEFAULT_RFC } from '@shared';
import AdminInstitutionPlanPage from '@/pages/admin/AdminInstitutionPlanPage.vue';
import { getInstitutionByRfc } from '@/gateways/firebaseDataGateway';
import { updateInstitutionPlan } from '@/gateways/institutionPlanGateway';
import { mountWithVuestic } from './utils/mount';

const routeParams = { rfc: DEFAULT_RFC };

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: routeParams }),
  useRouter: () => ({ push: vi.fn() }),
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

vi.mock('@/gateways/institutionPlanGateway', () => ({
  updateInstitutionPlan: vi.fn(),
}));

const mockedGetInstitutionByRfc = vi.mocked(getInstitutionByRfc);
const mockedUpdateInstitutionPlan = vi.mocked(updateInstitutionPlan);

function institution() {
  return {
    RFC: DEFAULT_RFC,
    name: 'Institucion Demo',
    plan: COMMERCIAL_PLAN.PORTAL,
    planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
    sharedSecret: null,
    planStartAt: Date.parse('2026-01-01T00:00:00.000Z'),
    planFinishAt: Date.parse('2026-12-31T00:00:00.000Z'),
    updates: [],
    createdAt: Date.parse('2026-01-01T00:00:00.000Z'),
    updatedAt: Date.parse('2026-01-01T00:00:00.000Z'),
  };
}

function mountPage() {
  return mountWithVuestic(AdminInstitutionPlanPage, {
    global: {
      plugins: [createPinia()],
    },
  });
}

describe('admin institution plan page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    routeParams.rfc = DEFAULT_RFC;
    mockedGetInstitutionByRfc.mockReset();
    mockedUpdateInstitutionPlan.mockReset();
  });

  it('submits edited plan fields to the API gateway', async () => {
    mockedGetInstitutionByRfc.mockResolvedValue(institution());
    mockedUpdateInstitutionPlan.mockResolvedValue({
      institution: {
        ...institution(),
        plan: COMMERCIAL_PLAN.CLOUD,
        planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
      },
    });
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.find('[data-testid="admin-plan-start-at"] input').setValue('2026-02-01');
    await wrapper.find('[data-testid="admin-plan-finish-at"] input').setValue('2026-11-30');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockedUpdateInstitutionPlan).toHaveBeenCalledWith(DEFAULT_RFC, {
      plan: COMMERCIAL_PLAN.PORTAL,
      planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
      planStartAt: Date.parse('2026-02-01T00:00:00.000Z'),
      planFinishAt: Date.parse('2026-11-30T00:00:00.000Z'),
    });
    expect(wrapper.find('[data-testid="admin-plan-success"]').exists()).toBe(true);
  });
});
