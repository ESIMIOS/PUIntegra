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
  SYSTEM_MESSAGE_ERROR_KIND,
  SYSTEM_PACKAGE_NAME,
  buildTypedSystemMessagesTree,
  type MessageTree
} from '@puintegra/shared';

export const apiSystemMessageTree = {
  auth: {
    missingBearerToken: {
      code: 'API-AUTH-001',
      severity: LOG_SEVERITY.WARNING,
      message: 'Missing bearer token.',
      displayMessage: 'Tu sesión no está autenticada. Inicia sesión y vuelve a intentarlo.',
      httpStatus: HTTP_STATUS.UNAUTHORIZED,
      errorKind: SYSTEM_MESSAGE_ERROR_KIND.AUTH_REQUIRED
    }
  },
  admin: {
    institutions: {
      invalidPayload: {
        code: 'API-ADMIN-001',
        severity: LOG_SEVERITY.WARNING,
        message: 'Invalid institution onboarding payload.',
        displayMessage: 'La solicitud de alta institucional contiene campos inválidos.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_VALIDATION
      },
      forbiddenRole: {
        code: 'API-ADMIN-003',
        severity: LOG_SEVERITY.WARNING,
        message: 'Role is not allowed to create institutions.',
        displayMessage: 'Tu rol actual no tiene permisos para crear instituciones.',
        httpStatus: HTTP_STATUS.FORBIDDEN,
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_FORBIDDEN
      },
      invalidSystemRfc: {
        code: 'API-ADMIN-004',
        severity: LOG_SEVERITY.WARNING,
        message: 'SYSTEM_RFC cannot be used as a tenant institution RFC.',
        displayMessage: 'SYSTEM_RFC es un RFC reservado y no puede usarse para una institución.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_VALIDATION
      },
      invalidDefaultRfc: {
        code: 'API-ADMIN-005',
        severity: LOG_SEVERITY.WARNING,
        message: 'DEFAULT_RFC cannot be reused for tenant institution onboarding.',
        displayMessage: 'DEFAULT_RFC es un RFC reservado y no puede usarse para una institución.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_VALIDATION
      },
      invalidPlanDates: {
        code: 'API-ADMIN-006',
        severity: LOG_SEVERITY.WARNING,
        message: 'planStartAt must be less than or equal to planFinishAt.',
        displayMessage: 'La fecha de inicio del plan debe ser menor o igual a la fecha de fin.',
        httpStatus: HTTP_STATUS.BAD_REQUEST,
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_VALIDATION
      },
      duplicateRfc: {
        code: 'API-ADMIN-007',
        severity: LOG_SEVERITY.WARNING,
        message: 'Institution already exists.',
        httpStatus: HTTP_STATUS.CONFLICT,
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_CONFLICT
      },
      duplicateBootstrapPermission: {
        code: 'API-ADMIN-008',
        severity: LOG_SEVERITY.WARNING,
        message: 'Bootstrap permission already exists.',
        httpStatus: HTTP_STATUS.CONFLICT,
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_CONFLICT
      }
    }
  },
  sys: {
    unexpectedFailure: {
      code: 'API-SYS-001',
      severity: LOG_SEVERITY.ERROR,
      message: 'Unexpected API failure.',
      httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorKind: SYSTEM_MESSAGE_ERROR_KIND.SYSTEM_UNEXPECTED
    }
  }
} as const satisfies MessageTree;

export const apiSystemMessages = buildTypedSystemMessagesTree(apiSystemMessageTree, { packageName: SYSTEM_PACKAGE_NAME.API });
