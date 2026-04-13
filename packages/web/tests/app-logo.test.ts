/**
 * @package web
 * @name app-logo.test.ts
 * @version 0.0.1
 * @description Verifica variantes visuales del logotipo de aplicación.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Cobertura inicial de AppLogo.  @antigravity
 */

import { computed, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import AppLogo from '@/components/shared/AppLogo.vue';

const currentTheme = ref<'light' | 'dark'>('light');

vi.mock('@/composables/useThemePreference', () => ({
  useThemePreference: () => ({
    currentTheme,
    isDark: computed(() => currentTheme.value === 'dark'),
    toggleTheme: vi.fn()
  })
}));

describe('AppLogo', () => {
  beforeEach(() => {
    currentTheme.value = 'light';
  });

  it('renders the light full logo by default', () => {
    const wrapper = mount(AppLogo);
    const image = wrapper.get('img');

    expect(image.attributes('src')).toContain('/img/puintegra-logo-light.svg');
    expect(image.attributes('alt')).toBe('PUIntegra');
    expect(wrapper.text()).toBe('');
  });

  it('renders the dark logo when dark theme is active', () => {
    currentTheme.value = 'dark';

    const wrapper = mount(AppLogo);

    expect(wrapper.get('img').attributes('src')).toContain('/img/puintegra-logo-dark.svg');
  });

  it('renders icon-only mode without the wordmark text', () => {
    const wrapper = mount(AppLogo, {
      props: {
        mode: 'icon'
      }
    });

    expect(wrapper.get('img').attributes('src')).toContain('/img/puintegra-icon-light.svg');
    expect(wrapper.text()).not.toContain('PUIntegra');
  });

  it('supports prominent full-logo sizing for minimal layouts', () => {
    const wrapper = mount(AppLogo, {
      props: {
        size: 'prominent'
      }
    });

    expect(wrapper.classes()).toContain('app-logo--full');
    expect(wrapper.classes()).toContain('app-logo--prominent');
    expect(wrapper.get('img').attributes('src')).toContain('/img/puintegra-logo-light.svg');
  });
});
