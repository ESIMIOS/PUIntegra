/**
 * @package web
 * @name useThemePreference.ts
 * @version 0.0.1
 * @description Gestiona preferencia de tema visual con detección del sistema, Vuestic UI y persistencia local.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Composable singleton de tema claro/oscuro.  @antigravity
 */

import { computed, ref, watch } from 'vue';
import { useColors } from 'vuestic-ui';
import { z } from 'zod';
import { VUESTIC_DARK_PRESET, VUESTIC_LIGHT_PRESET } from '@/plugins/vuestic';

const ThemePreferenceSchema = z.enum(['light', 'dark']);
type ThemePreference = z.infer<typeof ThemePreferenceSchema>;

const THEME_STORAGE_KEY = 'puintegra-theme-preference';

const currentTheme = ref<ThemePreference>(readInitialTheme());
let isVuesticPresetApplied = false;

/**
 * @description Lee la preferencia de tema del sistema operativo cuando no existe override local.
 */
function readSystemTheme(): ThemePreference {
  if (globalThis.window === undefined || typeof globalThis.matchMedia !== 'function') {
    return 'light';
  }

  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * @description Resuelve la preferencia inicial priorizando localStorage y usando el sistema como fallback.
 */
function readInitialTheme(): ThemePreference {
  if (typeof localStorage === 'undefined') {
    return readSystemTheme();
  }

  const savedPreference = ThemePreferenceSchema.safeParse(
    localStorage.getItem(THEME_STORAGE_KEY)
  );

  return savedPreference.success ? savedPreference.data : readSystemTheme();
}

/**
 * @description Traduce el tema de producto al nombre de preset registrado en Vuestic.
 */
function themeToPreset(theme: ThemePreference) {
  return theme === 'dark' ? VUESTIC_DARK_PRESET : VUESTIC_LIGHT_PRESET;
}

/**
 * @description Retorna el estado singleton de tema visual y sincroniza el preset activo de Vuestic.
 */
export function useThemePreference() {
  const colors = useColors();
  const isDark = computed(() => currentTheme.value === 'dark');

  /**
   * @description Aplica el preset visual activo en Vuestic y etiqueta el documento para CSS global.
   */
  function applyTheme(theme: ThemePreference) {
    colors.applyPreset(themeToPreset(theme));
    document.documentElement.dataset.theme = theme;
  }

  if (!isVuesticPresetApplied) {
    applyTheme(currentTheme.value);
    isVuesticPresetApplied = true;
  }

  watch(
    currentTheme,
    (theme) => {
      applyTheme(theme);
    },
    { flush: 'sync' }
  );

  /**
   * @description Alterna entre tema claro y oscuro y persiste la preferencia seleccionada.
   */
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme.value);
  }

  return {
    currentTheme,
    isDark,
    toggleTheme
  };
}
