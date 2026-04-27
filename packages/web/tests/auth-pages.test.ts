/**
 * @package web
 * @name auth-pages.test.ts
 * @version 0.0.4
 * @description Verifica login con credenciales/contexto y logout con cuenta regresiva.
 * @author @antigravity
 * @changelog
 * - 0.0.4	(2026-04-23)	Migra montaje a mountWithVuestic y extrae helper de montaje a alcance de módulo.	@codex
 * - 0.0.3	(2026-04-19)	Cubre redirección no bloqueante para sesiones existentes en login.	@codex
 * - 0.0.2	(2026-04-15)	Se actualiza cobertura para flujo productivo de login/logout.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-15)	Versión inicial.	@antigravity
 */

import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia, getActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionStore } from '@/stores/institutionStore';
import AuthLoginPage from '@/pages/auth/AuthLoginPage.vue';
import AuthLogoutPage from '@/pages/auth/AuthLogoutPage.vue';
import { routePaths } from '@/shared/constants/routePaths';
import { DEFAULT_RFC, ROLE, SYSTEM_RFC, SystemError, sharedSystemMessages } from '@shared';
import { establishSession, hydrateSession, logout, validateCredentials } from '@/gateways/firebaseAuthGateway';
import { mountWithVuestic } from './utils/mount';

const push = vi.fn();
const replace = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/auth/login', query: {} }),
  useRouter: () => ({ push, replace }),
}));

vi.mock('@/gateways/firebaseAuthGateway', async () => {
  const actual = await vi.importActual<typeof import('@/gateways/firebaseAuthGateway')>(
    '@/gateways/firebaseAuthGateway',
  );
  return {
    ...actual,
    establishSession: vi.fn(),
    hydrateSession: vi.fn(),
    logout: vi.fn(),
    validateCredentials: vi.fn(),
  };
});

const mockedEstablishSession = vi.mocked(establishSession);
const mockedHydrateSession = vi.mocked(hydrateSession);
const mockedLogout = vi.mocked(logout);
const mockedValidateCredentials = vi.mocked(validateCredentials);

function mountWithContext(component: any) {
  return mountWithVuestic(component, {
    global: {
      plugins: [getActivePinia()!],
      stubs: {
        VaModal: {
          props: ['modelValue', 'title'],
          emits: ['update:modelValue'],
          template: `
            <div v-if="modelValue">
              <slot />
              <slot name="footer" />
            </div>
          `,
        },
        VaSelect: {
          props: ['modelValue', 'options'],
          emits: ['update:modelValue'],
          template: `
            <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
              <option v-for="option in options" :key="option.value" :value="option.value">{{ option.text }}</option>
            </select>
          `,
        },
      },
    },
  });
}

describe('Auth Pages', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    globalThis.localStorage.clear();
    push.mockClear();
    replace.mockClear();
    mockedEstablishSession.mockReset();
    mockedHydrateSession.mockReset();
    mockedLogout.mockReset();
    mockedValidateCredentials.mockReset();
    mockedHydrateSession.mockResolvedValue(null);
    mockedLogout.mockResolvedValue(undefined);
    mockedValidateCredentials.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: 'FI',
      contexts: [
        { role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC },
        { role: ROLE.SYSTEM_ADMINISTRATOR, rfc: SYSTEM_RFC },
      ],
    });
    mockedEstablishSession.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: 'FI',
      activeRole: ROLE.INSTITUTION_ADMIN,
      activeRfc: DEFAULT_RFC,
      allowedInstitutionRfcs: [DEFAULT_RFC],
      availableContexts: [
        { role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC },
        { role: ROLE.SYSTEM_ADMINISTRATOR, rfc: SYSTEM_RFC },
      ],
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders email/password form', () => {
    const wrapper = mountWithContext(AuthLoginPage);

    expect(wrapper.find('[data-testid="auth-login-email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="auth-login-password"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Iniciar Sesión');
  });

  it('renders login form before existing-session hydration resolves', () => {
    mockedHydrateSession.mockImplementation(() => new Promise(() => {}));

    const wrapper = mountWithContext(AuthLoginPage);

    expect(wrapper.find('[data-testid="auth-login-email"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Iniciar Sesión');
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects existing sessions from login after background hydration', async () => {
    globalThis.localStorage.setItem(
      'puintegra:web:active-session-context:v1',
      JSON.stringify({ role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC }),
    );
    mockedHydrateSession.mockResolvedValueOnce({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: 'FI',
      activeRole: ROLE.INSTITUTION_ADMIN,
      activeRfc: DEFAULT_RFC,
      allowedInstitutionRfcs: [DEFAULT_RFC],
      availableContexts: [{ role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC }],
    });

    mountWithContext(AuthLoginPage);
    await flushPromises();

    expect(replace).toHaveBeenCalledWith(routePaths.appDashboard(DEFAULT_RFC));
  });

  it('shows validation message when email is invalid', async () => {
    const wrapper = mountWithContext(AuthLoginPage);
    await wrapper.find('[data-testid="auth-login-email"] input').setValue('invalid-email');
    await wrapper.find('form').trigger('submit.prevent');

    expect(mockedValidateCredentials).not.toHaveBeenCalled();
  });

  it('shows context selector after valid credentials', async () => {
    const wrapper = mountWithContext(AuthLoginPage);
    await wrapper.find('[data-testid="auth-login-email"] input').setValue('admin@example.test');
    await wrapper.find('[data-testid="auth-login-password"] input').setValue('Puintegra123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('[data-testid="auth-login-context"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Selecciona el contexto');
  });

  it('auto-applies context when only one is available', async () => {
    mockedValidateCredentials.mockResolvedValueOnce({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: 'FI',
      contexts: [{ role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC }],
    });
    mockedEstablishSession.mockResolvedValueOnce({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'admin@example.test',
      emojiIcon: 'FI',
      activeRole: ROLE.INSTITUTION_ADMIN,
      activeRfc: DEFAULT_RFC,
      allowedInstitutionRfcs: [DEFAULT_RFC],
      availableContexts: [{ role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC }],
    });
    const wrapper = mountWithContext(AuthLoginPage);

    await wrapper.find('[data-testid="auth-login-email"] input').setValue('admin@example.test');
    await wrapper.find('[data-testid="auth-login-password"] input').setValue('Puintegra123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('[data-testid="auth-login-context"]').exists()).toBe(false);
    expect(push).toHaveBeenCalledWith(routePaths.appDashboard(DEFAULT_RFC));
  });

  it('shows data error when profile resolution fails after accepted credentials', async () => {
    mockedValidateCredentials.mockRejectedValue(
      new SystemError(sharedSystemMessages.data.operation.notFound.code),
    );
    const wrapper = mountWithContext(AuthLoginPage);

    await wrapper.find('[data-testid="auth-login-email"] input').setValue('admin@example.test');
    await wrapper.find('[data-testid="auth-login-password"] input').setValue('Puintegra123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('DATA-OPERATION-002');
    expect(wrapper.text()).not.toContain('AUTH-LOGIN-003');
  });

  it('shows auth error when user has no available context', async () => {
    mockedValidateCredentials.mockRejectedValue(
      new SystemError(sharedSystemMessages.auth.login.noPermissions.code, {
        displayMessage: 'El usuario no tiene permisos activos para iniciar sesión.',
      }),
    );
    const wrapper = mountWithContext(AuthLoginPage);

    await wrapper.find('[data-testid="auth-login-email"] input').setValue('admin@example.test');
    await wrapper.find('[data-testid="auth-login-password"] input').setValue('Puintegra123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(push).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('AUTH-LOGIN-004');
    expect(wrapper.text()).toContain('El usuario no tiene permisos activos para iniciar sesión.');
  });

  it('establishes session and redirects after context selection', async () => {
    const authStore = useAuthStore();
    const institutionStore = useInstitutionStore();
    const wrapper = mountWithContext(AuthLoginPage);
    await wrapper.find('[data-testid="auth-login-email"] input').setValue('admin@example.test');
    await wrapper.find('[data-testid="auth-login-password"] input').setValue('Puintegra123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const optionValue = `${ROLE.INSTITUTION_ADMIN}::${DEFAULT_RFC}`;
    const select = wrapper.get('select');
    await select.setValue(optionValue);
    const continueButton = wrapper.findAll('button').find((button) => button.text().includes('Continuar'));
    if (!continueButton) {
      throw new Error('Continue button not found.');
    }
    await continueButton.trigger('click');
    await flushPromises();

    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.activeRole).toBe(ROLE.INSTITUTION_ADMIN);
    expect(institutionStore.activeRfc).toBe(DEFAULT_RFC);
    expect(push).toHaveBeenCalledWith(routePaths.appDashboard(DEFAULT_RFC));
  });

  it('logs out on mount and redirects to login after 15 seconds', () => {
    const authStore = useAuthStore();
    authStore.setRole(ROLE.INSTITUTION_ADMIN);
    authStore.setIdentity({
      uid: 'dev-user-001',
      email: 'admin@example.test',
      name: 'Usuario Firebase',
      emojiIcon: 'FI',
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
