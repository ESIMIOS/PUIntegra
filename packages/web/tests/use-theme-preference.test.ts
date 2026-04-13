/**
 * @package web
 * @name use-theme-preference.test.ts
 * @version 0.0.1
 * @description Verifica la preferencia de tema, persistencia, detección del sistema y patrón singleton.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Cobertura inicial del composable de tema.  @antigravity
 */

import { nextTick } from 'vue';
import { vi } from 'vitest';

const applyPreset = vi.fn();

vi.mock('vuestic-ui', async () => {
  const actual = await vi.importActual<typeof import('vuestic-ui')>('vuestic-ui');
  return {
    ...actual,
    useColors: () => ({
      applyPreset
    })
  };
});

function mockSystemTheme(isDark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: isDark,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  }));
}

async function loadComposable() {
  const module = await import('@/composables/useThemePreference');
  return module.useThemePreference();
}

describe('useThemePreference', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    localStorage.clear();
    applyPreset.mockClear();
  });

  it('uses dark system preference when no saved preference exists', async () => {
    mockSystemTheme(true);

    const { currentTheme, isDark } = await loadComposable();

    expect(currentTheme.value).toBe('dark');
    expect(isDark.value).toBe(true);
    expect(applyPreset).toHaveBeenCalledWith('puintegraDark');
  });

  it('uses light system preference when no saved preference exists', async () => {
    mockSystemTheme(false);

    const { currentTheme, isDark } = await loadComposable();

    expect(currentTheme.value).toBe('light');
    expect(isDark.value).toBe(false);
    expect(applyPreset).toHaveBeenCalledWith('puintegraLight');
  });

  it('restores saved preference before checking system theme', async () => {
    localStorage.setItem('puintegra-theme-preference', 'dark');
    mockSystemTheme(false);

    const { currentTheme } = await loadComposable();

    expect(currentTheme.value).toBe('dark');
    expect(applyPreset).toHaveBeenCalledWith('puintegraDark');
  });

  it('toggles theme and persists the user preference', async () => {
    mockSystemTheme(false);
    const { currentTheme, toggleTheme } = await loadComposable();

    toggleTheme();
    await nextTick();

    expect(currentTheme.value).toBe('dark');
    expect(localStorage.getItem('puintegra-theme-preference')).toBe('dark');
    expect(applyPreset).toHaveBeenLastCalledWith('puintegraDark');
  });

  it('returns the same reactive references across consumers', async () => {
    mockSystemTheme(false);
    const first = await loadComposable();
    const second = await loadComposable();

    first.toggleTheme();

    expect(second.currentTheme.value).toBe('dark');
    expect(first.currentTheme).toBe(second.currentTheme);
  });
});
