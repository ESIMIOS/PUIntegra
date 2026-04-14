/**
 * @package web
 * @name main.ts
 * @version 0.0.2
 * @description Punto de entrada del cliente web: inicializa estilos, app, router y service worker.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.2	(2026-04-14)	Replaced top-level await with promise chain (es2020 target compatibility).	@tirsomartinezreyes
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import '@/styles/main.css'
// @ts-ignore - Vuestic UI no exporta tipos de CSS, pero esto es necesario para que TypeScript permita importar los estilos.
import 'vuestic-ui/css'
import { createWebApp } from '@/app/createWebApp'
import { registerServiceWorker } from '@/app/registerServiceWorker'
import { logSystemMessageError, webSystemMessages } from './bom'

const { app, router } = createWebApp()

router.isReady()
	.then(() => {
		app.mount('#app')
		registerServiceWorker()
	})
	.catch((error) => { //NOSONAR - async no top-level await valid for built
		logSystemMessageError(webSystemMessages.vueAppRouterInitializationFailed, error)
	})
