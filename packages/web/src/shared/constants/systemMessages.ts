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
  LOG_SEVERITY,
  buildUnifiedSystemMessageTree,
  sharedSystemMessageTree,
  type MessageTree,
  type BuiltMessageTree,
} from '@shared';

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
      appAdminContactUpsertFailed: {
        code: 'WEB-UI-013',
        severity: LOG_SEVERITY.ERROR,
        message: 'No fue posible guardar el contacto institucional. Intenta de nuevo.',
      },
      appAdminSharedSecretUpdateFailed: {
        code: 'WEB-UI-014',
        severity: LOG_SEVERITY.ERROR,
        message: 'No fue posible actualizar el secreto compartido institucional. Intenta de nuevo.',
      },
      appAdminPermissionCreateFailed: {
        code: 'WEB-UI-015',
        severity: LOG_SEVERITY.ERROR,
        message: 'No fue posible crear el permiso institucional. Verifica los datos e intenta de nuevo.',
      },
      appAdminPermissionUpdateFailed: {
        code: 'WEB-UI-016',
        severity: LOG_SEVERITY.ERROR,
        message: 'No fue posible actualizar el permiso institucional. Intenta de nuevo.',
      },
    },
    institutions: {
      created: {
        code: 'WEB-UI-012',
        severity: LOG_SEVERITY.SUCCESS,
        message: 'Institución creada correctamente.',
      },
    },
  },
  auth: {
    logout: {
      logoutFailure: {
        code: 'WEB-AUTH-001',
        severity: LOG_SEVERITY.ERROR,
        message: 'Fallo inesperado en el cierre de sesión.',
      },
    },
  },
} as const satisfies MessageTree;

export const systemMessageTree = buildUnifiedSystemMessageTree({
  web: webSystemMessageTree,
  shared: sharedSystemMessageTree,
}) as BuiltMessageTree<{
  web: typeof webSystemMessageTree;
  shared: typeof sharedSystemMessageTree;
}>;
