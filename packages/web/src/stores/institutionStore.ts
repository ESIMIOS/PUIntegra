/**
 * @package web
 * @name institutionStore.ts
 * @version 0.0.1
 * @description Gestiona el RFC activo para navegación protegida y contexto mock.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { defineStore, DEFAULT_RFC } from '@/bom';

/**
 * @description Store del RFC activo con soporte de limpieza para sesión anónima.
 */
export const useInstitutionStore = defineStore('institution', {
  state: () => ({
    activeRfc: DEFAULT_RFC
  }),
  actions: {
    setActiveRfc(rfc: string) {
      if (!rfc) {
        return;
      }
      this.activeRfc = rfc;
    },
    clearActiveRfc() {
      this.activeRfc = '';
    }
  }
});
