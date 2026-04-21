/**
 * @package web
 * @name vuestic.ts
 * @version 0.0.1
 * @description Configura Vuestic UI con los tokens visuales base de PUIntegra.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Configuración inicial de Vuestic UI.  @antigravity
 */

import {
  createIconsConfig,
  createVuestic,
  defineVuesticConfig,
  VuesticIconAliases,
  VuesticIconFonts,
} from "vuestic-ui";

export const VUESTIC_LIGHT_PRESET = "puintegraLight";
export const VUESTIC_DARK_PRESET = "puintegraDark";

export const lightThemeColors = {
  primary: "#0B1F4C",
  secondary: "#1A3A6B",
  success: "#3BB54A",
  accent: "#3BB54A",
  info: "#2C88D9",
  warning: "#F2A900",
  danger: "#D3455B",
  backgroundPrimary: "#F6F8FB",
  backgroundSecondary: "#FFFFFF",
  backgroundElement: "#FFFFFF",
  backgroundBorder: "#D9E2EF",
  backgroundCardPrimary: "#FFFFFF",
  textPrimary: "#172033",
  textInverted: "#FFFFFF",
  shadow: "rgba(11, 31, 76, 0.16)",
  focus: "#3BB54A",
  transparent: "rgba(255, 255, 255, 0)",
};

export const darkThemeColors = {
  primary: "#7EA6E0",
  secondary: "#A8C3EA",
  success: "#6FD27A",
  accent: "#6FD27A",
  info: "#6BB7F0",
  warning: "#FFD166",
  danger: "#FF7D8E",
  backgroundPrimary: "#07101F",
  backgroundSecondary: "#0F1B2D",
  backgroundElement: "#17253A",
  backgroundBorder: "#30415F",
  backgroundCardPrimary: "#121F33",
  textPrimary: "#EEF4FF",
  textInverted: "#07101F",
  shadow: "rgba(0, 0, 0, 0.42)",
  focus: "#6FD27A",
  transparent: "rgba(7, 16, 31, 0)",
};

export const breakpoint = {
  enable: true,
  bodyClass: true,
  thresholds: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};

export const appVuesticConfig = defineVuesticConfig({
  breakpoint: breakpoint,
  colors: {
    currentPresetName: VUESTIC_LIGHT_PRESET,
    variables: lightThemeColors,
    presets: {
      light: lightThemeColors,
      dark: darkThemeColors,
      [VUESTIC_LIGHT_PRESET]: lightThemeColors,
      [VUESTIC_DARK_PRESET]: darkThemeColors,
    },
  },
  icons: createIconsConfig({
    aliases: VuesticIconAliases,
    fonts: VuesticIconFonts,
  }),
  components: {
    VaButton: {
      borderColor: "primary",
      preset: "primary",
    },
    VaCard: {
      outlined: false,
    },
    VaCardTitle: {
      class: "text--bold text--uppercase",
    },
    VaInput: {},
    VaSelect: {
      color: "primary",
    },
    VaDivider: {
      class: "w-full",
    },
  },
});

/**
 * @description Crea la instancia de Vuestic UI con los presets de marca.
 */
export function createAppVuestic() {
  return createVuestic({
    config: appVuesticConfig,
  });
}
