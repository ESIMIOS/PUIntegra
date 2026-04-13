/**
 * @package web
 * @name vite.config.ts
 * @version 0.0.1
 * @description Configura Vite y Vitest para desarrollo y pruebas del frontend; usa imports directos por ser bootstrap de tooling.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
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
