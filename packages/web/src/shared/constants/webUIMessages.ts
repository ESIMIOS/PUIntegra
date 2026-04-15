/**
 * @package web
 * @name webUIMessages.ts
 * @version 0.0.1
 * @description Centraliza mensajes de interfaz para errores esperados en el frontend.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import type { SystemMessage } from '@shared';
import { MOCK_DATA_ERROR_KIND } from '@/mock/errors/mockDataError';

export const webUIMessages = {
  dataValidation: {
    code: 'WEB-UI-001',
    key: 'web.ui.data.validation',
    severity: 'WARNING',
    package: 'web',
    message: 'Revisa los campos marcados antes de continuar.'
  },
  dataNotFound: {
    code: 'WEB-UI-002',
    key: 'web.ui.data.not_found',
    severity: 'WARNING',
    package: 'web',
    message: 'No encontramos el registro solicitado.'
  },
  dataConflict: {
    code: 'WEB-UI-003',
    key: 'web.ui.data.conflict',
    severity: 'WARNING',
    package: 'web',
    message: 'Ya existe un registro con esos datos.'
  },
  dataForbidden: {
    code: 'WEB-UI-004',
    key: 'web.ui.data.forbidden',
    severity: 'WARNING',
    package: 'web',
    message: 'Tu sesión actual no permite realizar esta acción.'
  },
  dataStorage: {
    code: 'WEB-UI-005',
    key: 'web.ui.data.storage',
    severity: 'ERROR',
    package: 'web',
    message: 'No pudimos guardar los cambios locales. Intenta restablecer los datos mock.'
  },
  dataUnknown: {
    code: 'WEB-UI-006',
    key: 'web.ui.data.unknown',
    severity: 'ERROR',
    package: 'web',
    message: 'Ocurrió un error inesperado. Intenta de nuevo.'
  }
} as const satisfies Record<string, SystemMessage>;

export const webUiDataErrorByKind = {
  [MOCK_DATA_ERROR_KIND.VALIDATION]: webUIMessages.dataValidation,
  [MOCK_DATA_ERROR_KIND.NOT_FOUND]: webUIMessages.dataNotFound,
  [MOCK_DATA_ERROR_KIND.CONFLICT]: webUIMessages.dataConflict,
  [MOCK_DATA_ERROR_KIND.FORBIDDEN]: webUIMessages.dataForbidden,
  [MOCK_DATA_ERROR_KIND.STORAGE]: webUIMessages.dataStorage,
  [MOCK_DATA_ERROR_KIND.UNKNOWN]: webUIMessages.dataUnknown
} as const;
