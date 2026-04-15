/**
 * @package web
 * @name error-pages.test.ts
 * @version 0.0.1
 * @description Verifica contenido, acciones contextuales y redirección automática del dominio de errores.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-15)	Cobertura inicial de páginas de error.	@codex
 */

import { mount } from '@vue/test-utils';
import { createPinia, getActivePinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ROLE } from '@shared';
import { DEFAULT_RFC, routePaths } from '@/shared/constants/routePaths';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionStore } from '@/stores/institutionStore';
import Error403Page from '@/pages/error/Error403Page.vue';
import Error404Page from '@/pages/error/Error404Page.vue';
import Error500Page from '@/pages/error/Error500Page.vue';

const push = vi.fn();

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();

  return {
    ...actual,
    useRouter: () => ({
      push
    })
  };
});

const globalStubs = {
  VaButton: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>'
  },
  VaIcon: {
    props: ['name'],
    template: '<i :data-icon="name"><slot /></i>'
  },
  VaProgressBar: {
    props: ['modelValue'],
    template: '<div data-testid="progressbar" :data-value="String(modelValue)" />'
  }
};

function mountErrorPage(component: typeof Error403Page) {
  return mount(component, {
    global: {
      plugins: [getActivePinia() ?? createPinia()],
      stubs: globalStubs
    }
  });
}

function setAnonymousSession() {
  const authStore = useAuthStore();
  const institutionStore = useInstitutionStore();

  authStore.resetToAnonymous();
  institutionStore.clearActiveRfc();
}

function setInstitutionSession() {
  const authStore = useAuthStore();
  const institutionStore = useInstitutionStore();

  authStore.setRole(ROLE.INSTITUTION_ADMIN);
  authStore.setAllowedInstitutionRfcs([DEFAULT_RFC]);
  authStore.setRequiresSecuritySetup(false);
  institutionStore.setActiveRfc(DEFAULT_RFC);
}

function setSystemSession() {
  const authStore = useAuthStore();
  const institutionStore = useInstitutionStore();

  authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
  authStore.setRequiresSecuritySetup(false);
  institutionStore.clearActiveRfc();
}

describe('error pages', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    push.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders specific Spanish copy and absurd icons for each documented error', () => {
    setInstitutionSession();

    const expectations = [
      [Error403Page, '403', 'El guardia se puso intenso', 'shield_lock'],
      [Error404Page, '404', 'Esta página se fue a buscar el café', 'travel_explore'],
      [Error500Page, '500', 'El sistema tropezó con sus propios cables', 'smart_toy']
    ] as const;

    for (const [component, status, title, icon] of expectations) {
      const wrapper = mountErrorPage(component);

      expect(wrapper.text()).toContain(status);
      expect(wrapper.text()).toContain(title);
      expect(wrapper.find(`[data-icon="${icon}"]`).exists()).toBe(true);
    }
  });

  it('always renders the public home action', () => {
    setInstitutionSession();

    const wrapper = mountErrorPage(Error404Page);

    expect(wrapper.get(`a[href="${routePaths.siteHome}"]`).text()).toContain('Ir a la página de inicio');
  });

  it('redirects anonymous users to login after 15 seconds with a visible countdown', async () => {
    setAnonymousSession();

    const wrapper = mountErrorPage(Error403Page);

    expect(wrapper.get(`a[href="${routePaths.authLogin}"]`).text()).toContain('Ir a iniciar sesión');
    expect(wrapper.get('[data-testid="progressbar"]').attributes('data-value')).toBe('100');

    vi.advanceTimersByTime(5000);
    await nextTick();

    expect(wrapper.get('[data-testid="progressbar"]').attributes('data-value')).toBe('67');
    expect(push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10000);

    expect(push).toHaveBeenCalledWith(routePaths.authLogin);
  });

  it('renders an institutional dashboard action without automatic redirect', () => {
    setInstitutionSession();

    const wrapper = mountErrorPage(Error500Page);

    expect(wrapper.get(`a[href="${routePaths.appDashboard(DEFAULT_RFC)}"]`).text()).toContain(
      'Volver al dashboard'
    );

    vi.advanceTimersByTime(15000);

    expect(wrapper.find('[data-testid="progressbar"]').exists()).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  it('keeps 404 anonymous behavior without login action or countdown', () => {
    setAnonymousSession();

    const wrapper = mountErrorPage(Error404Page);

    expect(wrapper.find(`a[href="${routePaths.authLogin}"]`).exists()).toBe(false);
    expect(wrapper.find('[data-testid="progressbar"]').exists()).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  it('keeps 500 anonymous behavior without login action or countdown', () => {
    setAnonymousSession();

    const wrapper = mountErrorPage(Error500Page);

    expect(wrapper.find(`a[href="${routePaths.authLogin}"]`).exists()).toBe(false);
    expect(wrapper.find('[data-testid="progressbar"]').exists()).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  it('renders a system administrator action without automatic redirect', () => {
    setSystemSession();

    const wrapper = mountErrorPage(Error404Page);

    expect(wrapper.get(`a[href="${routePaths.adminInstitutions}"]`).text()).toContain(
      'Volver al backoffice'
    );

    vi.advanceTimersByTime(15000);

    expect(push).not.toHaveBeenCalled();
  });

  it('falls back to account settings for authenticated users without operational context', () => {
    const authStore = useAuthStore();
    const institutionStore = useInstitutionStore();
    authStore.setRole(ROLE.INSTITUTION_OPERATOR);
    institutionStore.clearActiveRfc();

    const wrapper = mountErrorPage(Error403Page);

    expect(wrapper.get(`a[href="${routePaths.accountSettings}"]`).text()).toContain(
      'Revisar mi cuenta'
    );
  });

  it('cancels the login countdown when session state changes to an operational target', async () => {
    setAnonymousSession();
    const wrapper = mountErrorPage(Error403Page);

    expect(wrapper.find('[data-testid="progressbar"]').exists()).toBe(true);

    setInstitutionSession();
    await nextTick();

    vi.advanceTimersByTime(15000);

    expect(wrapper.find('[data-testid="progressbar"]').exists()).toBe(false);
    expect(wrapper.find(`a[href="${routePaths.appDashboard(DEFAULT_RFC)}"]`).exists()).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });
});
