/**
 * @package web
 * @name site-layout.test.ts
 * @version 0.0.1
 * @description Verifica la estructura de encabezado del layout público.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Cobertura inicial del header de SiteLayout.  @antigravity
 */

import { mount } from '@vue/test-utils';
import SiteLayout from '@/layouts/SiteLayout.vue';

describe('SiteLayout', () => {
  it('renders graphic identity, center navigation, and right actions in VaNavbar slots', () => {
    const wrapper = mount(SiteLayout, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a v-bind="$attrs" :href="to" class="router-link-active"><slot /></a>'
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
          VaLayout: {
            template: '<section data-testid="va-layout"><slot name="top" /><slot /><slot name="bottom" /></section>'
          },
          VaNavbar: {
            template: `
              <header data-testid="site-navbar" :data-fixed="$attrs.fixed !== undefined ? 'true' : undefined">
                <div data-testid="navbar-left"><slot name="left" /></div>
                <div data-testid="navbar-center"><slot name="center" /></div>
                <div data-testid="navbar-right"><slot name="right" /></div>
              </header>
            `
          },
          VaButton: {
            template: '<a><slot /></a>'
          }
        }
      }
    });

    expect(wrapper.get('[data-testid="navbar-left"]').find('[data-testid="app-logo"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="navbar-center"]').text()).toContain('Inicio');
    expect(wrapper.get('[data-testid="navbar-center"]').text()).toContain('Demo');
    const homeNavigationLink = wrapper.get('[data-testid="navbar-center"]').get('[href="/site/home"]');
    expect(homeNavigationLink.classes()).toContain('site-layout__link');
    expect(homeNavigationLink.classes()).toContain('router-link-active');
    expect(wrapper.get('[data-testid="navbar-right"]').text()).toContain('Ingresar');
    expect(wrapper.get('[data-testid="navbar-right"]').find('[data-testid="theme-toggle"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="site-navbar"]').attributes('data-fixed')).toBe('true');
  });
});
