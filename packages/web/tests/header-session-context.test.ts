/**
 * @package web
 * @name header-session-context.test.ts
 * @version 0.0.1
 * @description Cubre render de identidad, menú de cuenta, confirmación de logout y selector de contexto.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLE } from '@shared';
import HeaderSessionContext from '@/components/shared/HeaderSessionContext.vue';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionStore } from '@/stores/institutionStore';
import { routePaths } from '@/shared/constants/routePaths';
import { switchContext } from '@/gateways/firebaseAuthGateway';

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
      activeRfc: 'IEC120914FV8',
      allowedInstitutionRfcs: ['XAXX010101000'],
      availableContexts: [
        { role: ROLE.INSTITUTION_ADMIN, rfc: 'XAXX010101000' },
        { role: ROLE.SYSTEM_ADMINISTRATOR, rfc: 'IEC120914FV8' }
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
      activeRfc: 'XAXX010101000',
      allowedInstitutionRfcs: ['XAXX010101000'],
      availableContexts: [
        { role: ROLE.INSTITUTION_ADMIN, rfc: 'XAXX010101000' },
        { role: ROLE.SYSTEM_ADMINISTRATOR, rfc: 'IEC120914FV8' }
      ]
    });
    institutionStore.setActiveRfc('XAXX010101000');
  });

  function mountComponent() {
    return mount(HeaderSessionContext, {
      global: {
        stubs: {
          VaMenu: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<div><slot name="anchor" /><slot /></div>'
          },
          VaList: { template: '<ul><slot /></ul>' },
          VaListItem: {
            emits: ['click'],
            template: '<li><button type="button" @click="$emit(\'click\')"><slot /></button></li>'
          },
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
          VaSelect: {
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option v-for="option in options" :key="option.value" :value="option.value">{{ option.text }}</option>
              </select>
            `
          },
          VaButton: {
            emits: ['click'],
            template: '<button type="button" @click="$emit(\'click\')"><slot /></button>'
          },
          VaAvatar: { template: '<span><slot /></span>' },
          VaIcon: { props: ['name'], template: '<span>{{ name }}</span>' }
        }
      }
    });
  }

  it('renders current user identity and context', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Usuario Firebase');
    expect(wrapper.text()).toContain('admin@example.test');
    expect(wrapper.text()).toContain('INSTITUTION_ADMIN');
    expect(wrapper.text()).toContain('XAXX010101000');
  });

  it('opens account links actions', async () => {
    const wrapper = mountComponent();
    const settingsButton = wrapper.findAll('button').find((button) => button.text().includes('Cuenta: ajustes'));
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

    const select = wrapper.get('select');
    await select.setValue(`${ROLE.SYSTEM_ADMINISTRATOR}::IEC120914FV8`);
    const applyButton = wrapper.findAll('button').find((button) => button.text().includes('Aplicar contexto'));
    if (!applyButton) {
      throw new Error('Apply context button not found.');
    }
    await applyButton.trigger('click');
    await flushPromises();
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitutions);
  });
});
