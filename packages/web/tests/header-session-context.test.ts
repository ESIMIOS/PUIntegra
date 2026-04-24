/**
 * @package web
 * @name header-session-context.test.ts
 * @version 0.0.2
 * @description Cubre render de identidad, menú de cuenta, confirmación de logout y selector de contexto usando montaje con Vuestic.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-23)	Refactoriza pruebas para usar mountWithVuestic y reducir stubs a los estrictamente necesarios.	@codex
 * - 0.0.1	(2026-04-15)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_RFC, ROLE, SYSTEM_RFC } from '@shared';
import HeaderSessionContext from '@/components/shared/HeaderSessionContext.vue';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionStore } from '@/stores/institutionStore';
import { routePaths } from '@/shared/constants/routePaths';
import { switchContext } from '@/gateways/firebaseAuthGateway';
import { mountWithVuestic } from './utils/mount';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}));

vi.mock('@/gateways/firebaseAuthGateway', async () => {
  const actual = await vi.importActual<typeof import('@/gateways/firebaseAuthGateway')>('@/gateways/firebaseAuthGateway');
  return {
    ...actual,
    switchContext: vi.fn()
  };
});

const mockedSwitchContext = vi.mocked(switchContext);

function mountComponent() {
  return mountWithVuestic(HeaderSessionContext, {
    global: {
      stubs: {
        VaDropdown: { template: '<div><slot name="anchor" /><slot /></div>' },
        VaDropdownContent: { template: '<div><slot /></div>' },
        VaList: { template: '<ul><slot /></ul>' },
        VaListLabel: { template: '<li><slot /></li>' },
        VaListItem: {
          emits: ['click'],
          template: '<li><button type="button" @click="$emit(\'click\')"><slot /></button></li>'
        },
        VaListItemSection: { template: '<span><slot /></span>' },
        VaListItemLabel: { template: '<span><slot /></span>' },
        VaListSeparator: { template: '<hr />' },
        VaModal: {
          props: ['modelValue', 'title'],
          emits: ['update:modelValue'],
          template: `
            <div v-if="modelValue">
              <slot />
              <slot name="footer" />
            </div>
          `
        },
        SessionContextModal: {
          props: ['modelValue'],
          emits: ['confirm', 'update:modelValue'],
          template: `
            <div v-if="modelValue">
                <button
                  type="button"
                @click="$emit('confirm', { role: '${ROLE.SYSTEM_ADMINISTRATOR}', rfc: '${SYSTEM_RFC}' })"
                >
                  Aplicar contexto
                </button>
            </div>
          `
        }
      }
    }
  });
}

describe('HeaderSessionContext', () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    push.mockClear();
    mockedSwitchContext.mockReset();
    mockedSwitchContext.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: 'FI',
      activeRole: ROLE.SYSTEM_ADMINISTRATOR,
      activeRfc: SYSTEM_RFC,
      allowedInstitutionRfcs: [DEFAULT_RFC],
      availableContexts: [
        { role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC },
        { role: ROLE.SYSTEM_ADMINISTRATOR, rfc: SYSTEM_RFC }
      ]
    });
    const authStore = useAuthStore();
    const institutionStore = useInstitutionStore();
    authStore.applyEstablishedSession({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: 'FI',
      activeRole: ROLE.INSTITUTION_ADMIN,
      activeRfc: DEFAULT_RFC,
      allowedInstitutionRfcs: [DEFAULT_RFC],
      availableContexts: [
        { role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC },
        { role: ROLE.SYSTEM_ADMINISTRATOR, rfc: SYSTEM_RFC }
      ]
    });
    institutionStore.setActiveRfc(DEFAULT_RFC);
  });

  it('renders current user identity and context', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Usuario Firebase');
    expect(wrapper.text()).toContain('admin@example.test');
    expect(wrapper.text()).toContain(ROLE.INSTITUTION_ADMIN);
    expect(wrapper.text()).toContain(DEFAULT_RFC);
  });

  it('opens account links actions', async () => {
    const wrapper = mountComponent();
    const settingsButton = wrapper.findAll('button').find((button) => button.text().includes('Configuración'));
    if (!settingsButton) {
      throw new Error('Settings action not found.');
    }
    await settingsButton.trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.accountSettings);
  });

  it('routes to logout after confirmation', async () => {
    const wrapper = mountComponent();
    const logoutAction = wrapper.findAll('button').find((button) => button.text().includes('Cerrar sesión'));
    if (!logoutAction) {
      throw new Error('Logout action not found.');
    }
    await logoutAction.trigger('click');

    const confirmButton = wrapper.findAll('button').findLast((button) => button.text() === 'Cerrar sesión');
    if (!confirmButton) {
      throw new Error('Confirm button not found.');
    }
    await confirmButton.trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.authLogout);
  });

  it('switches context and routes to safe landing page', async () => {
    const wrapper = mountComponent();
    const contextTrigger = wrapper.findAll('button').find((button) =>
      button.attributes('aria-label') === 'Cambiar contexto de rol y RFC'
    );
    if (!contextTrigger) {
      throw new Error('Context trigger not found.');
    }
    await contextTrigger.trigger('click');

    const applyButton = wrapper.findAll('button').find((button) => button.text().includes('Aplicar contexto'));
    if (!applyButton) {
      throw new Error('Apply context button not found.');
    }
    await applyButton.trigger('click');
    await flushPromises();
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitutions);
  });
});
