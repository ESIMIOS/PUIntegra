import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLE, UPDATE_ORIGIN } from '@shared';
import AccountSettingsPage from '@/pages/account/AccountSettingsPage.vue';
import { useAuthStore } from '@/stores/authStore';
import { getUserById } from '@/gateways/firebaseDataGateway';
import { updateAccountProfile } from '@/gateways/accountProfileGateway';
import { mountWithVuestic } from './utils/mount';

vi.mock('@/gateways/firebaseDataGateway', () => ({
  getUserById: vi.fn(),
  getInstitutionByRfc: vi.fn(),
  listInstitutions: vi.fn(),
  listPermissionsByEmail: vi.fn(),
  listPermissionsByUser: vi.fn(),
  listPermissionsByRfc: vi.fn(),
  listContactsByRfc: vi.fn(),
  listRequestsByRfc: vi.fn(),
  listFindingsByRfc: vi.fn(),
  listLogs: vi.fn(),
}));

vi.mock('@/gateways/accountProfileGateway', () => ({
  updateAccountProfile: vi.fn(),
}));

const mockedGetUserById = vi.mocked(getUserById);
const mockedUpdateAccountProfile = vi.mocked(updateAccountProfile);

function mountPage(pinia: Pinia) {
  return mountWithVuestic(AccountSettingsPage, {
    global: {
      plugins: [pinia],
      stubs: {
        VaModal: {
          props: ['modelValue', 'title'],
          emits: ['update:modelValue'],
          template: '<div v-if="modelValue"><slot /><slot name="footer" /></div>',
        },
      },
    },
  });
}

describe('account settings page', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    mockedGetUserById.mockReset();
    mockedUpdateAccountProfile.mockReset();
    const authStore = useAuthStore();
    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setIdentity({
      uid: 'dev-user-001',
      email: 'owner@example.test',
      name: 'Nombre Inicial',
      emojiIcon: '😀',
    });
    mockedGetUserById.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Nombre Inicial',
      email: 'owner@example.test',
      phone: '+525500000000',
      emojiIcon: '😀',
      updates: [
        {
          previousName: 'Nombre Viejo',
          updatedName: 'Nombre Inicial',
          updateOrigin: UPDATE_ORIGIN.USER,
          updatedAt: 1710000000000,
        },
      ],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    });
    mockedUpdateAccountProfile.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Nombre Actualizado',
      email: 'owner@example.test',
      phone: '+525500000001',
      emojiIcon: '😎',
      updatedAt: 1710000000001,
    });
  });

  it('loads current account profile values', async () => {
    const wrapper = mountPage(pinia);
    await flushPromises();

    expect(mockedGetUserById).toHaveBeenCalledWith('dev-user-001');
    expect(wrapper.find('[data-testid="account-settings-email"]').exists()).toBe(true);
    expect((wrapper.find('[data-testid="account-settings-name"] input').element as HTMLInputElement).value).toBe('Nombre Inicial');
    expect((wrapper.find('[data-testid="account-settings-phone"] input').element as HTMLInputElement).value).toBe('+525500000000');
    expect(wrapper.find('[data-testid="account-settings-update-history"]').exists()).toBe(true);
  });

  it('updates profile values and refreshes visible auth identity', async () => {
    const wrapper = mountPage(pinia);
    await flushPromises();

    await wrapper.find('[data-testid="account-settings-name"] input').setValue('Nombre Actualizado');
    await wrapper.find('[data-testid="account-settings-phone"] input').setValue('+52 55 0000 0001');
    await wrapper.find('[data-testid="account-settings-open-emoji"]').trigger('click');
    await wrapper.find('[data-testid="account-settings-emoji-😎"]').trigger('click');
    await wrapper.find('[data-testid="account-settings-form"]').trigger('submit.prevent');
    await flushPromises();

    expect(mockedUpdateAccountProfile).toHaveBeenCalledWith({
      name: 'Nombre Actualizado',
      emojiIcon: '😎',
      phone: '+525500000001',
    });
    const authStore = useAuthStore();
    expect(authStore.name).toBe('Nombre Actualizado');
    expect(authStore.emojiIcon).toBe('😎');
    expect(wrapper.find('[data-testid="account-settings-success"]').exists()).toBe(true);
  });
});
