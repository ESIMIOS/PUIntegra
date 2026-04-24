/**
 * @package web
 * @name systemMessages.ts
 * @version 0.0.1
 * @description Catálogo de mensajes de sistema para observabilidad y troubleshooting técnico.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { LOG_SEVERITY, buildUnifiedSystemMessageTree, sharedSystemMessageTree, type MessageTree } from '@shared';
import { APP_DATA_ERROR_KIND } from '@/shared/errors/appErrors';

const webSystemMessageTree = {
  guard: {
    routeNotFound: {
      code: 'WEB-GUARD-001',
      severity: LOG_SEVERITY.INFO,
      message: 'La ruta no fue reconocida por el enrutador.',
    },
    authRequired: {
      code: 'WEB-GUARD-002',
      severity: LOG_SEVERITY.INFO,
      message: 'Esta ruta requiere autenticación.',
    },
    systemRoleRequiresSystemRfc: {
      code: 'WEB-GUARD-003',
      severity: LOG_SEVERITY.WARNING,
      message: 'El rol administrador del sistema requiere contexto SYSTEM_RFC.',
    },
    nonSystemRoleUsingSystemRfc: {
      code: 'WEB-GUARD-004',
      severity: LOG_SEVERITY.WARNING,
      message: 'Un rol institucional no puede operar con contexto SYSTEM_RFC.',
    },
    securitySetupRequired: {
      code: 'WEB-GUARD-005',
      severity: LOG_SEVERITY.INFO,
      message: 'La ruta requiere bootstrap de configuración de seguridad.',
    },
    roleMismatch: {
      code: 'WEB-GUARD-006',
      severity: LOG_SEVERITY.WARNING,
      message: 'El rol actual no está autorizado para esta ruta.',
    },
    invalidInstitutionRfcParam: {
      code: 'WEB-GUARD-007',
      severity: LOG_SEVERITY.WARNING,
      message: 'La ruta requiere un parámetro RFC institucional válido.',
    },
    institutionContextMismatch: {
      code: 'WEB-GUARD-008',
      severity: LOG_SEVERITY.WARNING,
      message: 'El contexto institucional activo no coincide con la ruta solicitada.',
    },
    unexpectedError: {
      code: 'WEB-GUARD-009',
      severity: LOG_SEVERITY.ERROR,
      message: 'Error inesperado en el pipeline de guards de rutas.',
    },
  },
  sw: {
    registrationFailed: {
      code: 'WEB-SW-001',
      severity: LOG_SEVERITY.WARNING,
      message: 'Falló el registro del service worker.',
    },
  },
  app: {
    routerInitializationFailed: {
      code: 'WEB-APP-001',
      severity: LOG_SEVERITY.ERROR,
      message: 'Error durante la inicialización del enrutador de la aplicación.',
    },
    sessionHydrationFailed: {
      code: 'WEB-APP-002',
      severity: LOG_SEVERITY.ERROR,
      message: 'No fue posible hidratar la sesión de Firebase.',
    },
  },
  data: {
    firebaseReadFailed: {
      code: 'WEB-DATA-001',
      severity: LOG_SEVERITY.ERROR,
      message: 'No fue posible leer datos desde Firebase.',
    },
    firebaseWriteFailed: {
      code: 'WEB-DATA-002',
      severity: LOG_SEVERITY.ERROR,
      message: 'No fue posible guardar datos en Firebase.',
    },
    firebaseValidationFailed: {
      code: 'WEB-DATA-003',
      severity: LOG_SEVERITY.WARNING,
      message: 'La respuesta de Firebase no cumple el contrato esperado.',
    },
  },
  ui: {
    auth: {
      contextRequired: {
        code: 'WEB-UI-010',
        severity: LOG_SEVERITY.WARNING,
        message: 'Selecciona un contexto para continuar.',
      },
    },
    data: {
      validation: {
        code: 'WEB-UI-001',
        severity: LOG_SEVERITY.WARNING,
        message: 'Revisa los campos marcados antes de continuar.',
      },
      notFound: {
        code: 'WEB-UI-002',
        severity: LOG_SEVERITY.WARNING,
        message: 'No encontramos el registro solicitado.',
      },
      conflict: {
        code: 'WEB-UI-003',
        severity: LOG_SEVERITY.WARNING,
        message: 'Ya existe un registro con esos datos.',
      },
      forbidden: {
        code: 'WEB-UI-004',
        severity: LOG_SEVERITY.WARNING,
        message: 'Tu sesión actual no permite realizar esta acción.',
      },
      storage: {
        code: 'WEB-UI-005',
        severity: LOG_SEVERITY.ERROR,
        message: 'No pudimos guardar los cambios locales. Intenta de nuevo.',
      },
      unknown: {
        code: 'WEB-UI-006',
        severity: LOG_SEVERITY.ERROR,
        message: 'Ocurrió un error inesperado. Intenta de nuevo.',
      },
      serverError: {
        code: 'WEB-UI-011',
        severity: LOG_SEVERITY.ERROR,
        message: 'Error de comunicación con el servicio. Intenta de nuevo.',
      },
    },
  },
  auth: {
    logout: {
      logoutFailure: {
        code: 'WEB-AUTH-001',
        severity: LOG_SEVERITY.ERROR,
        message: 'Falló inesperadamente el cierre de sesión.',
      },
    },
  },
} as const satisfies MessageTree;

const unifiedSystemMessageTree = buildUnifiedSystemMessageTree({
  web: webSystemMessageTree,
  shared: sharedSystemMessageTree,
});

if (!unifiedSystemMessageTree.web || !unifiedSystemMessageTree.shared) {
  throw new Error('Unified system message tree is missing required web or shared roots.');
}

export const systemMessageTree = {
  web: unifiedSystemMessageTree.web,
  shared: unifiedSystemMessageTree.shared,
} as const;

export const webUiDataErrorByKind = {
  [APP_DATA_ERROR_KIND.VALIDATION]: webSystemMessageTree.ui.data.validation,
  [APP_DATA_ERROR_KIND.NOT_FOUND]: webSystemMessageTree.ui.data.notFound,
  [APP_DATA_ERROR_KIND.CONFLICT]: webSystemMessageTree.ui.data.conflict,
  [APP_DATA_ERROR_KIND.FORBIDDEN]: webSystemMessageTree.ui.data.forbidden,
  [APP_DATA_ERROR_KIND.STORAGE]: webSystemMessageTree.ui.data.storage,
  [APP_DATA_ERROR_KIND.SERVER_ERROR]: webSystemMessageTree.ui.data.serverError,
  [APP_DATA_ERROR_KIND.UNKNOWN]: webSystemMessageTree.ui.data.unknown,
} as const;
