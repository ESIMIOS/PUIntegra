import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import { COMMERCIAL_PLAN, COMMERCIAL_PLAN_STATUS, DEFAULT_RFC } from '@shared';
import AppAdminPlanPage from '@/pages/app/AppAdminPlanPage.vue';
import { mountWithVuestic } from './utils/mount';

const routeParams = { rfc: DEFAULT_RFC };
const loadInstitutionByRfc = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: routeParams }),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    activeRole: 'INSTITUTION_ADMIN',
  }),
}));

vi.mock('@/composables/useDataControllers', () => ({
  useAppAdminInstitutionController: () => ({
    isLoading: computed(() => false),
    isSaving: computed(() => false),
    errorMessage: ref<string | null>(null),
    loadInstitutionByRfc,
  }),
}));

describe('app admin plan page', () => {
  beforeEach(() => {
    routeParams.rfc = DEFAULT_RFC;
    loadInstitutionByRfc.mockReset();
  });

  it('renders readonly plan data for the active RFC', async () => {
    loadInstitutionByRfc.mockResolvedValue({
      RFC: DEFAULT_RFC,
      name: 'Institución Demo',
      plan: COMMERCIAL_PLAN.CLOUD,
      planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
      sharedSecret: null,
      SHA256SharedSecret: null,
      planStartAt: Date.parse('2026-01-01T00:00:00.000Z'),
      planFinishAt: Date.parse('2026-12-31T00:00:00.000Z'),
      updates: [],
      createdAt: Date.parse('2026-01-01T00:00:00.000Z'),
      updatedAt: Date.parse('2026-01-02T00:00:00.000Z'),
    });

    const wrapper = mountWithVuestic(AppAdminPlanPage);
    await flushPromises();

    expect(loadInstitutionByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.find('[data-testid="app-admin-plan-summary"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Institución Demo');
    expect(wrapper.text()).toContain(COMMERCIAL_PLAN.CLOUD);
    expect(wrapper.text()).toContain(COMMERCIAL_PLAN_STATUS.ACTIVE);
  });
});
