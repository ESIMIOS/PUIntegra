/**
 * @package web
 * @name systemMessages.ts
 * @version 0.0.1
 * @description Catálogo de mensajes de sistema para observabilidad y troubleshooting técnico.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  buildUnifiedSystemMessageTree,
  sharedSystemMessageTree,
  type MessageTree
} from '@shared';
import { MOCK_DATA_ERROR_KIND } from '@/mock/errors/mockDataError';

const webSystemMessageTree = {
  guard: {
    routeNotFound: {
      code: 'WEB-GUARD-001',
      severity: 'INFO',
      message: 'La ruta no fue reconocida por el enrutador.'
    },
    authRequired: {
      code: 'WEB-GUARD-002',
      severity: 'INFO',
      message: 'Esta ruta requiere autenticación.'
    },
    systemRoleRequiresSystemRfc: {
      code: 'WEB-GUARD-003',
      severity: 'WARNING',
      message: 'El rol administrador del sistema requiere contexto SYSTEM_RFC.'
    },
    nonSystemRoleUsingSystemRfc: {
      code: 'WEB-GUARD-004',
      severity: 'WARNING',
      message: 'Un rol institucional no puede operar con contexto SYSTEM_RFC.'
    },
    securitySetupRequired: {
      code: 'WEB-GUARD-005',
      severity: 'INFO',
      message: 'La ruta requiere bootstrap de configuración de seguridad.'
    },
    roleMismatch: {
      code: 'WEB-GUARD-006',
      severity: 'WARNING',
      message: 'El rol actual no está autorizado para esta ruta.'
    },
    invalidInstitutionRfcParam: {
      code: 'WEB-GUARD-007',
      severity: 'WARNING',
      message: 'La ruta requiere un parámetro RFC institucional válido.'
    },
    institutionContextMismatch: {
      code: 'WEB-GUARD-008',
      severity: 'WARNING',
      message: 'El contexto institucional activo no coincide con la ruta solicitada.'
    },
    unexpectedError: {
      code: 'WEB-GUARD-009',
      severity: 'ERROR',
      message: 'Error inesperado en el pipeline de guards de rutas.'
    }
  },
  sw: {
    registrationFailed: {
      code: 'WEB-SW-001',
      severity: 'WARNING',
      message: 'Falló el registro del service worker.'
    }
  },
  app: {
    routerInitializationFailed: {
      code: 'WEB-APP-001',
      severity: 'ERROR',
      message: 'Error durante la inicialización del enrutador de la aplicación.'
    }
  },
  mock: {
    hydrationFailed: {
      code: 'WEB-MOCK-001',
      severity: 'ERROR',
      message: 'No fue posible hidratar el estado mock persistido.'
    },
    persistenceFailed: {
      code: 'WEB-MOCK-002',
      severity: 'ERROR',
      message: 'No fue posible persistir el estado mock.'
    },
    resetFailed: {
      code: 'WEB-MOCK-003',
      severity: 'ERROR',
      message: 'No fue posible restablecer el estado mock.'
    }
  },
  ui: {
    auth: {
      contextRequired: {
        code: 'WEB-UI-010',
        severity: 'WARNING',
        message: 'Selecciona un contexto para continuar.'
      }
    },
    data: {
      validation: {
        code: 'WEB-UI-001',
        severity: 'WARNING',
        message: 'Revisa los campos marcados antes de continuar.'
      },
      notFound: {
        code: 'WEB-UI-002',
        severity: 'WARNING',
        message: 'No encontramos el registro solicitado.'
      },
      conflict: {
        code: 'WEB-UI-003',
        severity: 'WARNING',
        message: 'Ya existe un registro con esos datos.'
      },
      forbidden: {
        code: 'WEB-UI-004',
        severity: 'WARNING',
        message: 'Tu sesión actual no permite realizar esta acción.'
      },
      storage: {
        code: 'WEB-UI-005',
        severity: 'ERROR',
        message: 'No pudimos guardar los cambios locales. Intenta restablecer los datos mock.'
      },
      unknown: {
        code: 'WEB-UI-006',
        severity: 'ERROR',
        message: 'Ocurrió un error inesperado. Intenta de nuevo.'
      },
      serverError: {
        code: 'WEB-UI-011',
        severity: 'ERROR',
        message: 'Error de comunicación con el servicio. Intenta de nuevo.'
      }
    }
  }
} as const satisfies MessageTree;

export const systemMessageTree = buildUnifiedSystemMessageTree({
  web: webSystemMessageTree,
  shared: sharedSystemMessageTree
});

export const webUiDataErrorByKind = {
  [MOCK_DATA_ERROR_KIND.VALIDATION]: systemMessageTree.web!.ui.data.validation,
  [MOCK_DATA_ERROR_KIND.NOT_FOUND]: systemMessageTree.web!.ui.data.notFound,
  [MOCK_DATA_ERROR_KIND.CONFLICT]: systemMessageTree.web!.ui.data.conflict,
  [MOCK_DATA_ERROR_KIND.FORBIDDEN]: systemMessageTree.web!.ui.data.forbidden,
  [MOCK_DATA_ERROR_KIND.STORAGE]: systemMessageTree.web!.ui.data.storage,
  [MOCK_DATA_ERROR_KIND.SERVER_ERROR]: systemMessageTree.web!.ui.data.serverError,
  [MOCK_DATA_ERROR_KIND.UNKNOWN]: systemMessageTree.web!.ui.data.unknown
} as const;
