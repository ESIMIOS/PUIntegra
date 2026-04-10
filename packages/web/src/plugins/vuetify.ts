/**
 * @package web
 * @name vuetify.ts
 * @version 0.0.1
 * @description Configura y exporta la instancia base de Vuetify para la aplicación.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { createVuetify, vuetifyComponents, vuetifyDirectives } from '@/bom';

/**
 * @description Crea la instancia de Vuetify con componentes, directivas y tema base del esqueleto web.
 */
export function createAppVuetify() {
  return createVuetify({
    components: vuetifyComponents,
    directives: vuetifyDirectives,
    theme: {
      defaultTheme: 'light'
    }
  });
}
