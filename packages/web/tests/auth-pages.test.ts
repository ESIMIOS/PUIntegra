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
import AuthCreateAccountPage from '@/pages/auth/AuthCreateAccountPage.vue';
import AuthVerifyEmailPage from '@/pages/auth/AuthVerifyEmailPage.vue';
import AuthForgotPasswordPage from '@/pages/auth/AuthForgotPasswordPage.vue';
import AuthResetPasswordPage from '@/pages/auth/AuthResetPasswordPage.vue';
import AuthSecuritySetupPage from '@/pages/auth/AuthSecuritySetupPage.vue';
import { routePaths } from '@/shared/constants/routePaths';
import { DEFAULT_RFC, ROLE, SYSTEM_RFC, SystemError, sharedSystemMessages } from '@shared';
import {
  applyEmailVerificationCode,
  canResendEmailVerification,
  confirmPasswordResetWithCode,
  createAccount,
  establishSession,
  getTotpSetupState,
  hydrateSession,
  logout,
  requestPasswordRecovery,
  resendEmailVerification,
  validateCurrentFirebaseUser,
  validateCredentials,
  verifyPasswordResetCodeForEmail,
} from '@/gateways/firebaseAuthGateway';
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
    applyEmailVerificationCode: vi.fn(),
    canResendEmailVerification: vi.fn(),
    confirmPasswordResetWithCode: vi.fn(),
    createAccount: vi.fn(),
    getTotpSetupState: vi.fn(),
    hydrateSession: vi.fn(),
    logout: vi.fn(),
    requestPasswordRecovery: vi.fn(),
    resendEmailVerification: vi.fn(),
    validateCurrentFirebaseUser: vi.fn(),
    validateCredentials: vi.fn(),
    verifyPasswordResetCodeForEmail: vi.fn(),
  };
});

const mockedApplyEmailVerificationCode = vi.mocked(applyEmailVerificationCode);
const mockedCanResendEmailVerification = vi.mocked(canResendEmailVerification);
const mockedConfirmPasswordResetWithCode = vi.mocked(confirmPasswordResetWithCode);
const mockedCreateAccount = vi.mocked(createAccount);
const mockedEstablishSession = vi.mocked(establishSession);
const mockedGetTotpSetupState = vi.mocked(getTotpSetupState);
const mockedHydrateSession = vi.mocked(hydrateSession);
const mockedLogout = vi.mocked(logout);
const mockedRequestPasswordRecovery = vi.mocked(requestPasswordRecovery);
const mockedResendEmailVerification = vi.mocked(resendEmailVerification);
const mockedValidateCurrentFirebaseUser = vi.mocked(validateCurrentFirebaseUser);
const mockedValidateCredentials = vi.mocked(validateCredentials);
const mockedVerifyPasswordResetCodeForEmail = vi.mocked(verifyPasswordResetCodeForEmail);

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
    mockedApplyEmailVerificationCode.mockReset();
    mockedCanResendEmailVerification.mockReset();
    mockedConfirmPasswordResetWithCode.mockReset();
    mockedCreateAccount.mockReset();
    mockedGetTotpSetupState.mockReset();
    mockedHydrateSession.mockReset();
    mockedLogout.mockReset();
    mockedRequestPasswordRecovery.mockReset();
    mockedResendEmailVerification.mockReset();
    mockedValidateCurrentFirebaseUser.mockReset();
    mockedValidateCredentials.mockReset();
    mockedVerifyPasswordResetCodeForEmail.mockReset();
    mockedApplyEmailVerificationCode.mockResolvedValue(undefined);
    mockedCanResendEmailVerification.mockReturnValue(true);
    mockedConfirmPasswordResetWithCode.mockResolvedValue(undefined);
    mockedCreateAccount.mockResolvedValue({ email: 'owner@example.test' });
    mockedGetTotpSetupState.mockResolvedValue({
      available: false,
      hasTotpFactor: false,
      requiresAdminReset: false,
      reason: 'provider-unavailable',
    });
    mockedHydrateSession.mockResolvedValue(null);
    mockedLogout.mockResolvedValue(undefined);
    mockedRequestPasswordRecovery.mockResolvedValue({ accepted: true });
    mockedResendEmailVerification.mockResolvedValue(undefined);
    mockedValidateCurrentFirebaseUser.mockResolvedValue({
      userId: 'dev-user-001',
      name: 'Usuario Firebase',
      email: 'owner@example.test',
      emojiIcon: 'FI',
      contexts: [{ role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC }],
    });
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
      emailVerified: true,
      allowedInstitutionRfcs: [DEFAULT_RFC],
      availableContexts: [
        { role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC },
        { role: ROLE.SYSTEM_ADMINISTRATOR, rfc: SYSTEM_RFC },
      ],
    });
    mockedVerifyPasswordResetCodeForEmail.mockResolvedValue('owner@example.test');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders email/password form with account creation and recovery links', () => {
    const wrapper = mountWithContext(AuthLoginPage);

    expect(wrapper.find('[data-testid="auth-login-email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="auth-login-password"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Iniciar Sesión');
    expect(wrapper.text()).toContain('Crear cuenta');
    expect(wrapper.text()).toContain('Olvidé mi contraseña');
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
      emailVerified: true,
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
      emailVerified: true,
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

  it('redirects unverified successful credentials to email verification', async () => {
    mockedValidateCredentials.mockRejectedValueOnce(Object.assign(new Error('unverified email'), { code: 'AUTH-LOGIN-006' }));
    const wrapper = mountWithContext(AuthLoginPage);

    await wrapper.find('[data-testid="auth-login-email"] input').setValue('owner@example.test');
    await wrapper.find('[data-testid="auth-login-password"] input').setValue('StrongPass1');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(push).toHaveBeenCalledWith(routePaths.authVerifyEmail);
    expect(wrapper.text()).not.toContain('AUTH-LOGIN-006');
  });

  it('creates account with friendly permission and verification guidance', async () => {
    const wrapper = mountWithContext(AuthCreateAccountPage);

    expect(wrapper.text()).toContain('Crea tu cuenta');
    expect(wrapper.text()).toContain('permiso institucional');
    expect(wrapper.get('[data-testid="auth-create-submit"]').attributes('disabled')).toBeDefined();
    await wrapper.find('[data-testid="auth-create-email"] input').setValue('owner@example.test');
    await wrapper.find('[data-testid="auth-create-name"] input').setValue('María Operadora');
    await wrapper.find('[data-testid="auth-create-password"] input').setValue('12345678');
    await wrapper.find('[data-testid="auth-create-confirm"] input').setValue('12345678');

    expect(wrapper.text()).toContain('Una mayúscula');
    expect(wrapper.get('[data-testid="auth-create-submit"]').attributes('disabled')).toBeDefined();

    await wrapper.find('[data-testid="auth-create-password"] input').setValue('StrongPass1');
    await wrapper.find('[data-testid="auth-create-confirm"] input').setValue('StrongPass1');
    expect(wrapper.get('[data-testid="auth-create-submit"]').attributes('disabled')).toBeUndefined();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockedCreateAccount).toHaveBeenCalledWith({
      displayName: 'María Operadora',
      email: 'owner@example.test',
      password: 'StrongPass1',
    });
    expect(wrapper.text()).toContain('Revisa tu correo');
    expect(wrapper.text()).toContain('Reenviar verificación (60s)');
    expect(wrapper.text()).not.toContain('Ir a iniciar sesión');
    expect(wrapper.text()).not.toContain('Ir a verificar correo');

    const resendButton = wrapper.findAll('button').find((button) => button.text().includes('Reenviar verificación'));
    expect(resendButton?.attributes('disabled')).toBeDefined();
    vi.advanceTimersByTime(60000);
    await flushPromises();
    expect(wrapper.text()).toContain('Reenviar verificación');
    expect(wrapper.text()).not.toContain('Reenviar verificación (');
  });

  it('does not submit create-account until email, name, policy, and confirmation are valid', async () => {
    const wrapper = mountWithContext(AuthCreateAccountPage);

    await wrapper.find('[data-testid="auth-create-email"] input').setValue('owner@example.test');
    await wrapper.find('[data-testid="auth-create-name"] input').setValue('María Operadora');
    await wrapper.find('[data-testid="auth-create-password"] input').setValue('StrongPass1');
    await wrapper.find('[data-testid="auth-create-confirm"] input').setValue('StrongPass2');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockedCreateAccount).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Las contraseñas deben ser iguales.');
    expect(wrapper.text()).not.toContain('Las contraseñas coinciden');
  });

  it('handles verify-email manual action codes and session-aware resend guidance', async () => {
    const wrapper = mountWithContext(AuthVerifyEmailPage);

    expect(wrapper.text()).toContain('Verifica tu correo');
    expect(wrapper.text()).toContain('Código de verificación');
    await wrapper.find('[data-testid="auth-verify-code"] input').setValue('manual-oob-code');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockedApplyEmailVerificationCode).toHaveBeenCalledWith('manual-oob-code');
    expect(wrapper.text()).toContain('Tu correo fue verificado');
    expect(wrapper.find('[data-testid="auth-verify-code"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Reenviar correo');
    expect(wrapper.text()).not.toContain('Ir a iniciar sesión');
    expect(wrapper.text()).toContain('Continuar');
    expect(wrapper.text()).toContain('Cerrar sesión');

    const continueButton = wrapper.findAll('button').find((button) => button.text().includes('Continuar'));
    if (!continueButton) {
      throw new Error('Continue button not found.');
    }
    await continueButton.trigger('click');
    await flushPromises();

    expect(mockedValidateCurrentFirebaseUser).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith(routePaths.appDashboard(DEFAULT_RFC));
  });

  it('shows explicit verify-email code errors for invalid Firebase action codes', async () => {
    mockedApplyEmailVerificationCode.mockRejectedValueOnce(Object.assign(new Error('bad code'), { code: 'auth/invalid-action-code' }));
    const wrapper = mountWithContext(AuthVerifyEmailPage);

    await wrapper.find('[data-testid="auth-verify-code"] input').setValue('wrong-oob-code');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Código: auth/invalid-action-code');
    expect(wrapper.text()).not.toContain('UNKNOWN-ERROR-001');
  });

  it('requests password recovery with neutral friendly copy', async () => {
    const wrapper = mountWithContext(AuthForgotPasswordPage);

    expect(wrapper.text()).toContain('Recupera tu contraseña');
    expect(wrapper.get('[data-testid="auth-forgot-submit"]').attributes('disabled')).toBeDefined();
    await wrapper.find('[data-testid="auth-forgot-email"] input').setValue('owner@example.test');
    expect(wrapper.get('[data-testid="auth-forgot-submit"]').attributes('disabled')).toBeUndefined();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockedRequestPasswordRecovery).toHaveBeenCalledWith('owner@example.test');
    expect(wrapper.text()).toContain('Si la cuenta existe');
    expect(wrapper.text()).toContain('owner@example.test');
    expect(wrapper.text()).toContain('Ir a iniciar sesión');
    expect(wrapper.text()).toContain('Enviar de nuevo (60s)');
    const resendButton = wrapper.findAll('button').find((button) => button.text().includes('Enviar de nuevo'));
    expect(resendButton?.attributes('disabled')).toBeDefined();
    vi.advanceTimersByTime(60000);
    await flushPromises();
    expect(wrapper.text()).toContain('Enviar de nuevo');
    expect(wrapper.text()).not.toContain('Enviar de nuevo (');
  });

  it('confirms password reset after manually validating the action code', async () => {
    const wrapper = mountWithContext(AuthResetPasswordPage);
    await flushPromises();

    expect(wrapper.text()).toContain('Nueva contraseña');
    expect(wrapper.text()).toContain('Código de restablecimiento');
    expect(mockedVerifyPasswordResetCodeForEmail).not.toHaveBeenCalled();
    await wrapper.find('[data-testid="auth-reset-code"] input').setValue('manual-reset-code');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockedVerifyPasswordResetCodeForEmail).toHaveBeenCalledWith('manual-reset-code');
    expect(wrapper.get('[data-testid="auth-reset-submit"]').attributes('disabled')).toBeDefined();
    await wrapper.find('[data-testid="auth-reset-password"] input').setValue('12345678');
    await wrapper.find('[data-testid="auth-reset-confirm"] input').setValue('12345678');
    expect(wrapper.text()).toContain('Una mayúscula');
    expect(wrapper.get('[data-testid="auth-reset-submit"]').attributes('disabled')).toBeDefined();
    await wrapper.find('[data-testid="auth-reset-password"] input').setValue('StrongPass1');
    await wrapper.find('[data-testid="auth-reset-confirm"] input').setValue('StrongPass1');
    expect(wrapper.get('[data-testid="auth-reset-submit"]').attributes('disabled')).toBeUndefined();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockedConfirmPasswordResetWithCode).toHaveBeenCalledWith('manual-reset-code', 'StrongPass1');
    expect(wrapper.text()).toContain('Tu contraseña fue actualizada correctamente');
    expect(wrapper.text()).toContain('Ir a iniciar sesión');
    expect(push).not.toHaveBeenCalledWith(routePaths.authLogin);
    await wrapper.get('[data-testid="auth-reset-login"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.authLogin);
  });

  it('shows TOTP setup guidance and admin-assisted recovery instructions', async () => {
    const wrapper = mountWithContext(AuthSecuritySetupPage);
    await flushPromises();

    expect(wrapper.text()).toContain('Configura tu autenticador');
    expect(wrapper.text()).toContain('una sola app de autenticación');
    expect(wrapper.text()).toContain('contacta a un administrador');
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
