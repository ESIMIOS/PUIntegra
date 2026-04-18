/**
 * @package web
 * @name account-layout.test.ts
 * @version 0.0.1
 * @description Verifica estructura base del layout de cuenta autenticada.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Cobertura inicial de contexto de sesión en AccountLayout.  @antigravity
 */

import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AccountLayout from '@/layouts/AccountLayout.vue';
import { ROLE } from '@shared';
import { useAuthStore } from '@/stores/authStore';

describe('AccountLayout', () => {
  it('renders account session context in the fixed header', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore();
    authStore.setRole(ROLE.INSTITUTION_OPERATOR);

    const wrapper = mount(AccountLayout, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
          },
          RouterView: {
            template: '<main data-testid="router-view" />'
          },
          AppLogo: {
            template: '<img data-testid="app-logo" alt="PUIntegra">'
          },
          ThemeToggle: {
            template: '<button data-testid="theme-toggle" />'
          },
          HeaderSessionContext: {
            template: '<aside data-testid="session-context">Session context</aside>'
          },
          VaLayout: {
            template: '<section data-testid="va-layout"><slot name="top" /><slot name="left" /><slot /></section>'
          },
          VaNavbar: {
            template: `
              <header data-testid="account-navbar" :data-fixed="$attrs.fixed !== undefined ? 'true' : undefined">
                <slot name="left" />
                <slot name="right" />
              </header>
            `
          },
          VaSidebar: {
            template: '<aside><slot /></aside>'
          },
          VaSidebarItem: {
            template: '<div><slot /></div>'
          },
          VaSidebarItemContent: {
            template: '<div><slot /></div>'
          },
          VaSidebarItemTitle: {
            template: '<span><slot /></span>'
          },
          VaDivider: {
            template: '<hr>'
          },
          VaIcon: {
            props: ['name'],
            template: '<span>{{ name }}</span>'
          }
        }
      }
    });

    expect(wrapper.get('[data-testid="account-navbar"]').attributes('data-fixed')).toBe('true');
    expect(wrapper.get('[data-testid="session-context"]').element).toBeTruthy();
    expect(wrapper.get('[data-testid="theme-toggle"]').element).toBeTruthy();
  });
});
