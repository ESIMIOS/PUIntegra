/**
 * @package web
 * @name auth-pages.test.ts
 * @version 0.0.2
 * @description Verifica login con credenciales/contexto y logout con cuenta regresiva.
 * @author @antigravity
 * @changelog
 * - 0.0.2	(2026-04-15)	Se actualiza cobertura para flujo productivo mock de login/logout.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-15)	Versión inicial.	@antigravity
 */

import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia, getActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppVuestic } from '@/plugins/vuestic';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionStore } from '@/stores/institutionStore';
import AuthLoginPage from '@/pages/auth/AuthLoginPage.vue';
import AuthLogoutPage from '@/pages/auth/AuthLogoutPage.vue';
import { ROLE } from '@shared';
import { routePaths } from '@/shared/constants/routePaths';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}));

describe('Auth Pages', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function mountWithContext(component: any) {
    return mount(component, {
      global: {
        plugins: [getActivePinia()!, createAppVuestic()],
        stubs: {
          VaSelect: {
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option v-for="option in options" :key="option.value" :value="option.value">{{ option.text }}</option>
              </select>
            `
          }
        }
      }
    });
  }

  it('renders email/password form', () => {
    const wrapper = mountWithContext(AuthLoginPage);

    expect(wrapper.find('[data-testid="auth-login-email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="auth-login-password"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Validar credenciales');
  });

  it('shows validation message when password is missing', async () => {
    const wrapper = mountWithContext(AuthLoginPage);
    await wrapper.find('[data-testid="auth-login-email"] input').setValue('admin@example.test');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Revisa los campos marcados');
  });

  it('shows context selector after valid credentials', async () => {
    const wrapper = mountWithContext(AuthLoginPage);
    await wrapper.find('[data-testid="auth-login-email"] input').setValue('admin@example.test');
    await wrapper.find('[data-testid="auth-login-password"] input').setValue('Puintegra123!');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.find('[data-testid="auth-login-context"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Selecciona el contexto');
  });

  it('establishes session and redirects after context selection', async () => {
    const authStore = useAuthStore();
    const institutionStore = useInstitutionStore();
    const wrapper = mountWithContext(AuthLoginPage);
    await wrapper.find('[data-testid="auth-login-email"] input').setValue('admin@example.test');
    await wrapper.find('[data-testid="auth-login-password"] input').setValue('Puintegra123!');
    await wrapper.find('form').trigger('submit.prevent');

    const optionValue = `${ROLE.INSTITUTION_ADMIN}::XAXX010101000`;
    const select = wrapper.get('select');
    await select.setValue(optionValue);
    await wrapper.find('form').trigger('submit.prevent');

    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.activeRole).toBe(ROLE.INSTITUTION_ADMIN);
    expect(institutionStore.activeRfc).toBe('XAXX010101000');
    expect(push).toHaveBeenCalledWith(routePaths.appDashboard('XAXX010101000'));
  });

  it('logs out on mount and redirects to login after 15 seconds', () => {
    const authStore = useAuthStore();
    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setIdentity({
      uid: 'mock-user-001',
      email: 'admin@example.test',
      name: 'Usuario Mock',
      emojiIcon: '🧩'
    });

    const wrapper = mountWithContext(AuthLogoutPage);
    expect(wrapper.text()).toContain('Sesión cerrada');
    expect(authStore.isAuthenticated).toBe(false);

    vi.advanceTimersByTime(15000);
    expect(push).toHaveBeenCalledWith(routePaths.authLogin);
  });

  it('allows immediate redirect button from logout page', async () => {
    const wrapper = mountWithContext(AuthLogoutPage);
    await wrapper.find('button').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.authLogin);
  });
});
