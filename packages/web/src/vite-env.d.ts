/**
 * @package web
 * @name vite-env.d.ts
 * @version 0.0.1
 * @description Declara tipos de entorno y módulos Vue requeridos por Vite y TypeScript.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from '@/bom';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
