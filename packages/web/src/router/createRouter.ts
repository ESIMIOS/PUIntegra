/**
 * @package web
 * @name createRouter.ts
 * @version 0.0.1
 * @description Crea el router principal y aplica el pipeline de guards.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { createRouter, createWebHistory, type Pinia } from '@/bom';
import { appRoutes } from './routes';
import { registerRouteGuards } from './guards';

/**
 * @description Construye el router principal y registra el pipeline de guards.
 */
export function createAppRouter(pinia: Pinia) {
  const router = createRouter({
    history: createWebHistory(),
    routes: appRoutes
  });

  registerRouteGuards(router, pinia);

  return router;
}
