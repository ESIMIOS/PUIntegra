/**
 * @package web
 * @name vite.config.ts
 * @version 0.0.3
 * @description Configura Vite para desarrollo y build del frontend. El config de Vitest está en vitest.config.ts.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.3	(2026-04-14)	Separated Vitest config to vitest.config.ts to avoid Plugin type conflicts.	@tirsomartinezreyes
 * - 0.0.2	(2026-04-14)	Added build-time env validation plugin.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

/**
 * Vite plugin that asserts required env vars are set after all .env files
 * have been merged. Runs during both dev and build — but only enforces
 * VITE_SENTRY_DSN for non-development environments.
 */
function checkEnvPlugin() {
	return {
		name: 'check-env',
		configResolved(config: { env: Record<string, string>; mode: string }) {
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
	}
});
