/**
 * @package web
 * @name theme-toggle.test.ts
 * @version 0.0.2
 * @description Verifica el botón reutilizable para alternar tema visual.
 * @author @antigravity
 * @changelog
 * - 0.0.2	(2026-04-23)	Migra pruebas a mountWithVuestic y centraliza helper de montaje.	@codex
 * - 0.0.1  (2026-04-12)  Cobertura inicial de ThemeToggle.  @antigravity
 */

import { computed, ref } from 'vue';
import { vi } from 'vitest';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';
import { mountWithVuestic } from './utils/mount';

const currentTheme = ref<'light' | 'dark'>('light');
const toggleTheme = vi.fn();

vi.mock('@/composables/useThemePreference', () => ({
  useThemePreference: () => ({
    currentTheme,
    isDark: computed(() => currentTheme.value === 'dark'),
    toggleTheme
  })
}));

function mountThemeToggle(stubIconAsTrue = false) {
  return mountWithVuestic(ThemeToggle, {
    global: {
      stubs: {
        VaButton: {
          emits: ['click'],
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        },
        VaIcon: stubIconAsTrue
          ? true
          : {
            props: ['name'],
            template: '<span data-testid="theme-icon">{{ name }}</span>'
          }
      }
    }
  });
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    currentTheme.value = 'light';
    toggleTheme.mockClear();
  });

  it('renders moon icon when the current theme is light', () => {
    const wrapper = mountThemeToggle();

    expect(wrapper.get('[data-testid="theme-icon"]').text()).toBe('dark_mode');
    expect(wrapper.text()).not.toContain('Oscuro');
    expect(wrapper.get('button').attributes('aria-label')).toBe('Cambiar a tema oscuro');
  });

  it('renders sun icon when the current theme is dark', () => {
    currentTheme.value = 'dark';

    const wrapper = mountThemeToggle();

    expect(wrapper.get('[data-testid="theme-icon"]').text()).toBe('light_mode');
    expect(wrapper.text()).not.toContain('Claro');
    expect(wrapper.get('button').attributes('aria-label')).toBe('Cambiar a tema claro');
  });

  it('calls toggleTheme on click', async () => {
    const wrapper = mountThemeToggle(true);

    await wrapper.get('button').trigger('click');

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
