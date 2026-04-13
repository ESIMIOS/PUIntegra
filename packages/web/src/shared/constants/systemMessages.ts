/**
 * @package web
 * @name systemMessages.ts
 * @version 0.0.1
 * @description Catálogo de mensajes de sistema para observabilidad y troubleshooting técnico.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import type { SystemMessage } from '@shared';

export const webSystemMessages = {
  guardRouteNotFound: {
    code: 'WEB-GUARD-404-001',
    key: 'web.guard.route_not_found',
    severity: 'INFO',
    package: 'web',
    message: 'La ruta no fue reconocida por el enrutador.'
  },
  guardAuthRequired: {
    code: 'WEB-GUARD-401-001',
    key: 'web.guard.auth_required',
    severity: 'INFO',
    package: 'web',
    message: 'Esta ruta requiere autenticación.'
  },
  guardSystemRoleRequiresSystemRfc: {
    code: 'WEB-GUARD-403-001',
    key: 'web.guard.system_role_requires_system_rfc',
    severity: 'WARNING',
    package: 'web',
    message: 'El rol administrador del sistema requiere contexto SYSTEM_RFC.'
  },
  guardNonSystemRoleUsingSystemRfc: {
    code: 'WEB-GUARD-403-002',
    key: 'web.guard.non_system_role_using_system_rfc',
    severity: 'WARNING',
    package: 'web',
    message: 'Un rol institucional no puede operar con contexto SYSTEM_RFC.'
  },
  guardSecuritySetupRequired: {
    code: 'WEB-GUARD-403-003',
    key: 'web.guard.security_setup_required',
    severity: 'INFO',
    package: 'web',
    message: 'La ruta requiere bootstrap de configuración de seguridad.'
  },
  guardRoleMismatch: {
    code: 'WEB-GUARD-403-004',
    key: 'web.guard.role_mismatch',
    severity: 'WARNING',
    package: 'web',
    message: 'El rol actual no está autorizado para esta ruta.'
  },
  guardInvalidInstitutionRfcParam: {
    code: 'WEB-GUARD-403-005',
    key: 'web.guard.invalid_institution_rfc_param',
    severity: 'WARNING',
    package: 'web',
    message: 'La ruta requiere un parámetro RFC institucional válido.'
  },
  guardInstitutionContextMismatch: {
    code: 'WEB-GUARD-403-006',
    key: 'web.guard.institution_context_mismatch',
    severity: 'WARNING',
    package: 'web',
    message: 'El contexto institucional activo no coincide con la ruta solicitada.'
  },
  guardUnexpectedError: {
    code: 'WEB-GUARD-500-001',
    key: 'web.guard.unexpected_error',
    severity: 'ERROR',
    package: 'web',
    message: 'Error inesperado en el pipeline de guards de rutas.'
  },
  serviceWorkerRegistrationFailed: {
    code: 'WEB-SW-500-001',
    key: 'web.service_worker.registration_failed',
    severity: 'WARNING',
    package: 'web',
    message: 'Falló el registro del service worker.'
  },
  vueAppRouterInitializationFailed: {
    code: 'WEB-APP-500-001',
    key: 'web.app.router_initialization_failed',
    severity: 'ERROR',
    package: 'web',
    message: 'Error durante la inicialización del enrutador de la aplicación.'
  }
} as const satisfies Record<string, SystemMessage>;
