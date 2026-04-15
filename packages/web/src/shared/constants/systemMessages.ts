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
    code: 'WEB-GUARD-001',
    key: 'web.guard.route_not_found',
    severity: 'INFO',
    package: 'web',
    message: 'La ruta no fue reconocida por el enrutador.'
  },
  guardAuthRequired: {
    code: 'WEB-GUARD-002',
    key: 'web.guard.auth_required',
    severity: 'INFO',
    package: 'web',
    message: 'Esta ruta requiere autenticación.'
  },
  guardSystemRoleRequiresSystemRfc: {
    code: 'WEB-GUARD-003',
    key: 'web.guard.system_role_requires_system_rfc',
    severity: 'WARNING',
    package: 'web',
    message: 'El rol administrador del sistema requiere contexto SYSTEM_RFC.'
  },
  guardNonSystemRoleUsingSystemRfc: {
    code: 'WEB-GUARD-004',
    key: 'web.guard.non_system_role_using_system_rfc',
    severity: 'WARNING',
    package: 'web',
    message: 'Un rol institucional no puede operar con contexto SYSTEM_RFC.'
  },
  guardSecuritySetupRequired: {
    code: 'WEB-GUARD-005',
    key: 'web.guard.security_setup_required',
    severity: 'INFO',
    package: 'web',
    message: 'La ruta requiere bootstrap de configuración de seguridad.'
  },
  guardRoleMismatch: {
    code: 'WEB-GUARD-006',
    key: 'web.guard.role_mismatch',
    severity: 'WARNING',
    package: 'web',
    message: 'El rol actual no está autorizado para esta ruta.'
  },
  guardInvalidInstitutionRfcParam: {
    code: 'WEB-GUARD-007',
    key: 'web.guard.invalid_institution_rfc_param',
    severity: 'WARNING',
    package: 'web',
    message: 'La ruta requiere un parámetro RFC institucional válido.'
  },
  guardInstitutionContextMismatch: {
    code: 'WEB-GUARD-008',
    key: 'web.guard.institution_context_mismatch',
    severity: 'WARNING',
    package: 'web',
    message: 'El contexto institucional activo no coincide con la ruta solicitada.'
  },
  guardUnexpectedError: {
    code: 'WEB-GUARD-009',
    key: 'web.guard.unexpected_error',
    severity: 'ERROR',
    package: 'web',
    message: 'Error inesperado en el pipeline de guards de rutas.'
  },
  serviceWorkerRegistrationFailed: {
    code: 'WEB-SW-001',
    key: 'web.service_worker.registration_failed',
    severity: 'WARNING',
    package: 'web',
    message: 'Falló el registro del service worker.'
  },
  vueAppRouterInitializationFailed: {
    code: 'WEB-APP-001',
    key: 'web.app.router_initialization_failed',
    severity: 'ERROR',
    package: 'web',
    message: 'Error durante la inicialización del enrutador de la aplicación.'
  },
  mockHydrationFailed: {
    code: 'WEB-MOCK-001',
    key: 'web.mock.hydration_failed',
    severity: 'ERROR',
    package: 'web',
    message: 'No fue posible hidratar el estado mock persistido.'
  },
  mockPersistenceFailed: {
    code: 'WEB-MOCK-002',
    key: 'web.mock.persistence_failed',
    severity: 'ERROR',
    package: 'web',
    message: 'No fue posible persistir el estado mock.'
  },
  mockResetFailed: {
    code: 'WEB-MOCK-003',
    key: 'web.mock.reset_failed',
    severity: 'ERROR',
    package: 'web',
    message: 'No fue posible restablecer el estado mock.'
  },
  mockDataValidationFailed: {
    code: 'WEB-DATA-001',
    key: 'web.data.validation_failed',
    severity: 'WARNING',
    package: 'web',
    message: 'La operacion de datos mock fallo por validacion.'
  },
  mockDataNotFound: {
    code: 'WEB-DATA-002',
    key: 'web.data.not_found',
    severity: 'WARNING',
    package: 'web',
    message: 'No se encontro la entidad solicitada en datos mock.'
  },
  mockDataConflictDetected: {
    code: 'WEB-DATA-003',
    key: 'web.data.conflict_detected',
    severity: 'WARNING',
    package: 'web',
    message: 'Se detecto un conflicto de datos mock.'
  },
  mockDataForbiddenOperation: {
    code: 'WEB-DATA-004',
    key: 'web.data.forbidden_operation',
    severity: 'WARNING',
    package: 'web',
    message: 'La sesion actual no puede ejecutar la operacion de datos mock.'
  },
  mockDataUnknownFailure: {
    code: 'WEB-DATA-005',
    key: 'web.data.unknown_failure',
    severity: 'ERROR',
    package: 'web',
    message: 'Fallo inesperado en operaciones de datos mock.'
  }
} as const satisfies Record<string, SystemMessage>;
