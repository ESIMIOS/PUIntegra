/**
 * @package web
 * @name vite.config.ts
 * @version 0.0.2
 * @description Configura Vite y Vitest para desarrollo y pruebas del frontend; usa imports directos por ser bootstrap de tooling.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-14)	Added build-time env validation plugin.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

/**
 * Vite plugin that asserts required env vars are set after all .env files
 * have been merged. Runs during both dev and build — but only enforces
 * VITE_SENTRY_DSN for non-development environments.
 */
function checkEnvPlugin(): Plugin {
  return {
    name: 'check-env',
    configResolved(config) {
      const env = config.env;
      const mode = config.mode;

      // Skip validation in test mode — Vitest runs with mode='test', no .env.test needed
      if (mode === 'test') return;

      // VITE_APP_ENV must always be set (guaranteed by committed mode files)
      if (!env['VITE_APP_ENV']) {
        throw new Error(
          `[check-env] VITE_APP_ENV is not set. ` +
          `Ensure the correct mode file (.env.${mode}) is present.`
        );
      }

      // VITE_SENTRY_DSN is required for staging and production builds
      const requiresDsn = env['VITE_APP_ENV'] !== 'development';
      if (requiresDsn && !env['VITE_SENTRY_DSN']) {
        throw new Error(
          `[check-env] VITE_SENTRY_DSN is required for "${env['VITE_APP_ENV']}" builds but is not set. ` +
          `Add it to .env.${mode} or inject it as a CI environment variable.`
        );
      }
    }
  };
}

export default defineConfig({
  plugins: [vue(), checkEnvPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared/src')
    }
  },
  test: {
    globals: true,
    css: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    server: {
      deps: {
        inline: ['vuestic-ui']
      }
    }
  }
});
