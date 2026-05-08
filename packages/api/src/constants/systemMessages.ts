/**
 * @package api
 * @name systemMessages.ts
 * @version 0.0.1
 * @description Catálogo API de mensajes de sistema tipados con taxonomía validada.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-24)	Agrega árbol de mensajes API para errores HTTP y trazabilidad consistente.	@codex
 */

import {
  HTTP_STATUS,
  LOG_SEVERITY,
  SYSTEM_PACKAGE_NAME,
  buildTypedSystemMessagesTree,
  type MessageTree,
} from '@puintegra/shared';

export const apiSystemMessageTree = {
  auth: {
    missingBearerToken: {
      code: 'API-AUTH-001',
      severity: LOG_SEVERITY.WARNING,
      message: 'Missing bearer token.',
      displayMessage: 'Tu sesión no está autenticada. Inicia sesión y vuelve a intentarlo.',
      httpStatus: HTTP_STATUS.UNAUTHORIZED,
    },
    lifecycle: {
      invalidPayload: {
        code: 'API-AUTH-009',
        severity: LOG_SEVERITY.WARNING,
        message: 'Invalid auth lifecycle payload.',
        displayMessage: 'Revisa los datos enviados antes de continuar.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
      },
      accountCreationUnavailable: {
        code: 'API-AUTH-010',
        severity: LOG_SEVERITY.WARNING,
        message: 'Account creation is not available for this email.',
        displayMessage: 'No pudimos crear la cuenta con esos datos. Revisa la invitación institucional o solicita apoyo.',
        httpStatus: HTTP_STATUS.CONFLICT,
      },
      forbiddenMfaReset: {
        code: 'API-AUTH-012',
        severity: LOG_SEVERITY.WARNING,
        message: 'Role is not allowed to reset MFA.',
        displayMessage: 'Tu rol actual no tiene permisos para restablecer MFA.',
        httpStatus: HTTP_STATUS.FORBIDDEN,
      },
    },
  },
  throttle: {
    overQuota: {
      code: 'API-THROTTLE-001',
      severity: LOG_SEVERITY.WARNING,
      message: 'API throttle quota exceeded.',
      displayMessage: 'Recibimos demasiados intentos. Espera unos minutos antes de volver a intentar.',
      httpStatus: HTTP_STATUS.UNPROCESSABLE_CONTENT,
    },
  },
  admin: {
    institutions: {
      invalidPayload: {
        code: 'API-ADMIN-001',
        severity: LOG_SEVERITY.WARNING,
        message: 'Invalid institution onboarding payload.',
        displayMessage: 'La solicitud de alta institucional contiene campos inválidos.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
      },
      forbiddenRole: {
        code: 'API-ADMIN-003',
        severity: LOG_SEVERITY.WARNING,
        message: 'Role is not allowed to create institutions.',
        displayMessage: 'Tu rol actual no tiene permisos para crear instituciones.',
        httpStatus: HTTP_STATUS.FORBIDDEN,
      },
      invalidSystemRfc: {
        code: 'API-ADMIN-004',
        severity: LOG_SEVERITY.WARNING,
        message: 'SYSTEM_RFC cannot be used as a tenant institution RFC.',
        displayMessage: 'SYSTEM_RFC es un RFC reservado y no puede usarse para una institución.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
      },
      invalidDefaultRfc: {
        code: 'API-ADMIN-005',
        severity: LOG_SEVERITY.WARNING,
        message: 'DEFAULT_RFC cannot be reused for tenant institution onboarding.',
        displayMessage: 'DEFAULT_RFC es un RFC reservado y no puede usarse para una institución.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
      },
      invalidPlanDates: {
        code: 'API-ADMIN-006',
        severity: LOG_SEVERITY.WARNING,
        message: 'planStartAt must be less than or equal to planFinishAt.',
        displayMessage: 'La fecha de inicio del plan debe ser menor o igual a la fecha de fin.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
      },
      duplicateRfc: {
        code: 'API-ADMIN-007',
        severity: LOG_SEVERITY.WARNING,
        message: 'Institution already exists.',
        httpStatus: HTTP_STATUS.CONFLICT,
      },
      duplicateBootstrapPermission: {
        code: 'API-ADMIN-008',
        severity: LOG_SEVERITY.WARNING,
        message: 'Bootstrap permission already exists.',
        httpStatus: HTTP_STATUS.CONFLICT,
      },
      institutionNotFound: {
        code: 'API-ADMIN-009',
        severity: LOG_SEVERITY.WARNING,
        message: 'Institution was not found.',
        displayMessage: 'No se encontró la institución solicitada.',
        httpStatus: HTTP_STATUS.NOT_FOUND,
      },
      forbiddenOperationOnDefaultRfc: {
        code: 'API-ADMIN-010',
        severity: LOG_SEVERITY.WARNING,
        message: 'Operations on DEFAULT_RFC institution are not allowed.',
        displayMessage: 'No se permiten operaciones sobre la institución DEFAULT_RFC.',
        httpStatus: HTTP_STATUS.FORBIDDEN,
      },
      forbiddenOperationOnSystemRfc: {
        code: 'API-ADMIN-011',
        severity: LOG_SEVERITY.WARNING,
        message: 'Operations on SYSTEM_RFC institution are not allowed.',
        displayMessage: 'No se permiten operaciones sobre la institución SYSTEM_RFC.',
        httpStatus: HTTP_STATUS.FORBIDDEN,
      },
    },
  },
  app: {
    institutions: {
      invalidActorContext: {
        code: 'API-APP-001',
        severity: LOG_SEVERITY.WARNING,
        message: 'Invalid authenticated actor context for app institution administration.',
        displayMessage: 'No fue posible validar tu contexto de sesión para administrar la institución.',
        httpStatus: HTTP_STATUS.FORBIDDEN,
      },
      missingInstitutionAdminPermission: {
        code: 'API-APP-002',
        severity: LOG_SEVERITY.WARNING,
        message: 'Missing RFC-scoped granted institution admin permission.',
        displayMessage: 'No tienes un permiso administrador otorgado para la institución seleccionada.',
        httpStatus: HTTP_STATUS.FORBIDDEN,
      },
      forbiddenRfcContext: {
        code: 'API-APP-003',
        severity: LOG_SEVERITY.WARNING,
        message: 'Permission does not belong to requested RFC context.',
        displayMessage: 'El permiso no pertenece al RFC seleccionado.',
        httpStatus: HTTP_STATUS.FORBIDDEN,
      },
    },
  },
  sys: {
    unexpectedFailure: {
      code: 'API-SYS-001',
      severity: LOG_SEVERITY.ERROR,
      message: 'Unexpected API failure.',
      httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    },
  },
} as const satisfies MessageTree;

export const apiSystemMessages = buildTypedSystemMessagesTree(apiSystemMessageTree, {
  packageName: SYSTEM_PACKAGE_NAME.API,
});
