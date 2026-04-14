/**
 * @package web
 * @name vitest.config.ts
 * @version 0.0.1
 * @description Configura Vitest para pruebas del frontend; extiende vite.config.ts con la configuración de test y coverage.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial separada de vite.config.ts.	@tirsomartinezreyes
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
	test: {
		globals: true,
		css: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		server: {
			deps: {
				inline: ['vuestic-ui']
			}
		},
		coverage: {
			provider: 'v8',
			reporter: ['lcov', 'text-summary'],
			reportsDirectory: './coverage',
			include: ['src/**/*.{ts,vue}'],
			exclude: ['src/**/*.d.ts', 'src/main.ts']
		}
	}
}));
