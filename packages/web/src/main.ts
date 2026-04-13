/**
 * @package web
 * @name main.ts
 * @version 0.0.1
 * @description Punto de entrada del cliente web: inicializa estilos, app, router y service worker.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import '@/styles/main.css'
// @ts-ignore - Vuestic UI no exporta tipos de CSS, pero esto es necesario para que TypeScript permita importar los estilos.
import 'vuestic-ui/css'
import { createWebApp } from '@/app/createWebApp'
import { registerServiceWorker } from '@/app/registerServiceWorker'
import { logSystemMessageError, webSystemMessages } from './bom'

const { app, router } = createWebApp()

try {
	await router.isReady()
	app.mount('#app')
	registerServiceWorker()
} catch (error) {
	logSystemMessageError(webSystemMessages.vueAppRouterInitializationFailed, error)
}
