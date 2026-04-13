/**
 * @package web
 * @name createWebApp.ts
 * @version 0.0.1
 * @description Ensambla la instancia principal de Vue con Pinia, router y Vuestic UI.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { createApp, createPinia, createAppRouter, createAppVuestic } from '@/bom';
import AppRoot from '@/app/AppRoot.vue';

/**
 * @description Crea la instancia principal de la WebApp con sus plugins base.
 */
export function createWebApp() {
  const app = createApp(AppRoot);
  const pinia = createPinia();
  const router = createAppRouter(pinia);
  const vuestic = createAppVuestic();

  app.use(pinia);
  app.use(router);
  app.use(vuestic);

  return {
    app,
    pinia,
    router,
    vuestic
  };
}
