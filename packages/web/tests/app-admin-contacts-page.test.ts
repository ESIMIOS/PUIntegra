import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import { DEFAULT_RFC } from '@shared';
import AppAdminContactsPage from '@/pages/app/AppAdminContactsPage.vue';
import { mountWithVuestic } from './utils/mount';

const routeParams = { rfc: DEFAULT_RFC };
const loadContactsByRfc = vi.fn();
const upsertInstitutionContact = vi.fn();

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
    loadContactsByRfc,
    upsertInstitutionContact,
  }),
}));

describe('app admin contacts page', () => {
  beforeEach(() => {
    routeParams.rfc = DEFAULT_RFC;
    loadContactsByRfc.mockReset();
    upsertInstitutionContact.mockReset();
    loadContactsByRfc.mockResolvedValue([]);
  });

  it('shows placeholders for missing canonical contact slots', async () => {
    const wrapper = mountWithVuestic(AppAdminContactsPage);
    await flushPromises();

    expect(loadContactsByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.text()).toContain('Información no proporcionada para este slot.');
    expect(wrapper.find('[data-testid="app-admin-contact-slot-LEGAL"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="app-admin-contact-slot-TECHNICAL"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="app-admin-contact-slot-IMMEDIATE_SEARCH"]').exists()).toBe(true);
    expect(upsertInstitutionContact).not.toHaveBeenCalled();
  });
});
