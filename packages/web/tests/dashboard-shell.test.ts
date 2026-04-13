/**
 * @package web
 * @name dashboard-shell.test.ts
 * @version 0.0.1
 * @description Verifica estructura base del shell dashboard compartido por dominios autenticados.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Cobertura inicial de DashboardShell.  @antigravity
 */

import { mount } from '@vue/test-utils';
import DashboardShell from '@/components/shared/DashboardShell.vue';
import type { NavigationLink } from '@/shared/constants/navigationCatalog';

const menuItems: NavigationLink[] = [
  {
    id: 'app-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    to: '/app/XAXX010101000/dashboard',
    disabled: false
  },
  {
    id: 'app-logs',
    label: 'Logs',
    icon: 'receipt_long',
    to: '/app/XAXX010101000/logs',
    disabled: false
  }
];

function mountShell() {
  return mount(DashboardShell, {
    props: {
      menuItems,
      accentColor: '#3BB54A',
      domainTitle: 'Operación institucional',
      chipLabel: 'RFC activo',
      chipValue: 'XAXX010101000',
      accountName: 'Pepe Pecas',
      accountLabel: 'user',
      sessionLabel: 'Rol',
      sessionValue: 'INSTITUTION_ADMIN'
    },
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>'
        },
        RouterView: {
          template: '<main data-testid="router-view" />'
        },
        ThemeToggle: {
          template: '<button data-testid="theme-toggle" />'
        },
        VaAvatar: {
          template: '<span data-testid="session-avatar"><slot /></span>'
        },
        AppLogo: {
          template: '<img data-testid="app-logo" alt="PUIntegra">'
        },
        VaLayout: {
          template: '<section data-testid="va-layout"><slot name="left" /><slot name="top" /><slot /></section>'
        },
        VaSidebar: {
          template: '<aside data-testid="sidebar"><slot /></aside>'
        },
        VaSidebarItem: {
          template: '<div data-testid="sidebar-item"><slot /></div>'
        },
        VaSidebarItemContent: {
          template: '<div><slot /></div>'
        },
        VaSidebarItemTitle: {
          template: '<span><slot /></span>'
        },
        VaNavbar: {
          template: '<header :data-fixed="$attrs.fixed !== undefined ? \'true\' : undefined"><slot name="left" /><slot /><slot name="right" /></header>'
        },
        VaButton: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')"><slot /></button>'
        },
        VaChip: {
          template: '<span data-testid="context-chip"><slot /></span>'
        },
        VaIcon: {
          props: ['name'],
          template: '<span data-testid="sidebar-icon">{{ name }}</span>'
        }
      }
    }
  });
}

describe('DashboardShell', () => {
  it('renders sidebar menu items, title, context chip, and router content', () => {
    const wrapper = mountShell();

    expect(wrapper.get('[data-testid="va-layout"]').element).toBeTruthy();
    expect(wrapper.get('header').attributes('data-fixed')).toBe('true');
    expect(wrapper.get('[data-testid="app-logo"]').element).toBeTruthy();
    expect(wrapper.findAll('[data-testid="app-logo"]')).toHaveLength(1);
    expect(wrapper.text()).toContain('Dashboard');
    expect(wrapper.text()).toContain('Logs');
    expect(wrapper.get('[data-testid="session-avatar"]').element).toBeTruthy();
    expect(wrapper.text()).toContain('Pepe Pecas');
    expect(wrapper.text()).toContain('user');
    expect(wrapper.text()).toContain('Rol');
    expect(wrapper.text()).toContain('INSTITUTION_ADMIN');
    expect(wrapper.text()).toContain('RFC activo');
    expect(wrapper.text()).toContain('XAXX010101000');
    expect(wrapper.get('[data-testid="router-view"]').element).toBeTruthy();
  });

  it('keeps desktop sidebar expanded with icons and text', () => {
    const wrapper = mountShell();

    expect(wrapper.get('[data-testid="sidebar"]').attributes('data-minimized')).toBeUndefined();
    expect(wrapper.find('[data-testid="sidebar-toggle"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="sidebar"]').find('[data-testid="app-logo"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('dashboard');
    expect(wrapper.text()).toContain('receipt_long');
    expect(wrapper.text()).toContain('Dashboard');
    expect(wrapper.text()).toContain('Logs');
  });
});
