/**
 * @package web
 * @name setup.ts
 * @version 0.0.1
 * @description Configura el entorno de pruebas Vitest con mocks de APIs de navegador.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

class ResizeObserverMock {
	observe() {
		/* no-op: ResizeObserver API must exist for Vue component tests */
	}
	unobserve() {
		/* no-op: ResizeObserver API must exist for Vue component tests */
	}
	disconnect() {
		/* no-op: ResizeObserver API must exist for Vue component tests */
	}
}

if (!globalThis.ResizeObserver) {
	globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver
}

if (!globalThis.matchMedia) {
	globalThis.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false
		}) as MediaQueryList
}

beforeEach(() => {
	document.body.innerHTML = ''
})
