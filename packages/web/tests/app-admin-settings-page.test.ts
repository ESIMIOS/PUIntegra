import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import { COMMERCIAL_PLAN, COMMERCIAL_PLAN_STATUS, DEFAULT_RFC } from '@shared';
import AppAdminSettingsPage from '@/pages/app/AppAdminSettingsPage.vue';
import { mountWithVuestic } from './utils/mount';

const routeParams = { rfc: DEFAULT_RFC };
const loadInstitutionByRfc = vi.fn();
const updateInstitutionSharedSecret = vi.fn();

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
    updateInstitutionSharedSecret,
  }),
}));

describe('app admin settings page', () => {
  beforeEach(() => {
    routeParams.rfc = DEFAULT_RFC;
    loadInstitutionByRfc.mockReset();
    updateInstitutionSharedSecret.mockReset();
    loadInstitutionByRfc.mockResolvedValue({
      RFC: DEFAULT_RFC,
      name: 'Institución Demo',
      plan: COMMERCIAL_PLAN.CLOUD,
      planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
      sharedSecret: '{"ciphertext":"abc"}',
      SHA256SharedSecret: 'deadbeef',
      planStartAt: Date.parse('2026-01-01T00:00:00.000Z'),
      planFinishAt: Date.parse('2026-12-31T00:00:00.000Z'),
      updates: [],
      createdAt: Date.parse('2026-01-01T00:00:00.000Z'),
      updatedAt: Date.parse('2026-01-02T00:00:00.000Z'),
    });
  });

  it('renders secret status/fingerprint and never exposes plaintext value', async () => {
    const wrapper = mountWithVuestic(AppAdminSettingsPage);
    await flushPromises();

    expect(loadInstitutionByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.text()).toContain('Secreto configurado:');
    expect(wrapper.text()).toContain('SHA256:');
    expect(wrapper.text()).toContain('deadbeef');
    expect(wrapper.text()).not.toContain('plaintext-secret');
  });

  it('renders secret management card and update action without exposing plaintext', async () => {
    const wrapper = mountWithVuestic(AppAdminSettingsPage);
    await flushPromises();

    expect(wrapper.find('[data-testid="app-admin-settings-open-modal"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('El valor del secreto compartido nunca se muestra en texto plano.');
    expect(updateInstitutionSharedSecret).not.toHaveBeenCalled();
  });
});
