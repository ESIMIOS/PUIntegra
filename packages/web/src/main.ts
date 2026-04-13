/**
 * @package web
 * @name main.ts
 * @version 0.0.1
 * @description Punto de entrada del cliente web: inicializa estilos, app, router y service worker.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import '@/styles/main.css';
import 'vuestic-ui/css';
import { createWebApp } from '@/app/createWebApp';
import { registerServiceWorker } from '@/app/registerServiceWorker';

const { app, router } = createWebApp();

router.isReady().then(() => {
  app.mount('#app');
  registerServiceWorker();
});
