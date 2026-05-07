import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import { DEFAULT_RFC, PERMISSION_STATUS, ROLE } from '@shared';
import AppAdminPermissionsPage from '@/pages/app/AppAdminPermissionsPage.vue';
import { mountWithVuestic } from './utils/mount';

const routeParams = { rfc: DEFAULT_RFC };
const loadPermissionsByRfc = vi.fn();
const createInstitutionPermission = vi.fn();
const updateInstitutionPermission = vi.fn();

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
    loadPermissionsByRfc,
    createInstitutionPermission,
    updateInstitutionPermission,
  }),
}));

describe('app admin permissions page', () => {
  beforeEach(() => {
    routeParams.rfc = DEFAULT_RFC;
    loadPermissionsByRfc.mockReset();
    createInstitutionPermission.mockReset();
    updateInstitutionPermission.mockReset();
    loadPermissionsByRfc.mockResolvedValue([
      {
        permissionId: 'perm-001',
        RFC: DEFAULT_RFC,
        email: 'admin@example.test',
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
        updates: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
  });

  it('renders permissions list with create action and default granted status context', async () => {
    const wrapper = mountWithVuestic(AppAdminPermissionsPage);
    await flushPromises();

    expect(loadPermissionsByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.find('[data-testid="app-admin-permissions-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(PERMISSION_STATUS.GRANTED);
    expect(wrapper.text()).toContain('Nuevo permiso');
    expect(createInstitutionPermission).not.toHaveBeenCalled();
  });
});
