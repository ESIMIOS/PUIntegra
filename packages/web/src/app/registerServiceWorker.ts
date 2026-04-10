/**
 * @package web
 * @name registerServiceWorker.ts
 * @version 0.0.1
 * @description Registra el service worker de forma segura para el entorno web.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

/**
 * @description Registra el service worker al cargar la página cuando el navegador lo soporta.
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      console.warn('No se pudo registrar el service worker', error);
    }
  });
}
