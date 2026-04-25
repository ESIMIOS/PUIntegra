/**
 * @package shared
 * @name system-messages.ts
 * @version 0.0.1
 * @description Catálogo compartido de mensajes de sistema transversales entre paquetes.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-17)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  LOG_SEVERITY,
  SYSTEM_MESSAGE_ERROR_KIND,
  type SystemMessage,
  type SystemMessageErrorKind,
} from '../schemas/system-message.schema';

export const SYSTEM_PACKAGE_NAME = {
  SHARED: 'shared',
  WEB: 'web',
  API: 'api',
} as const;
export type SystemPackageName = (typeof SYSTEM_PACKAGE_NAME)[keyof typeof SYSTEM_PACKAGE_NAME];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export type SystemMessageTemplate = {
  code: string;
  severity: SystemMessage['severity'];
  message: string;
  displayMessage?: string;
  httpStatus?: HttpStatus;
  errorKind?: SystemMessageErrorKind;
};

export type MessageTree = {
  [key: string]: MessageTree | SystemMessageTemplate;
};

export type BuiltMessageTree<T extends MessageTree> = {
  [K in keyof T]: T[K] extends SystemMessageTemplate
    ? SystemMessage
    : T[K] extends MessageTree
      ? BuiltMessageTree<T[K]>
      : never;
};

type BuildSystemMessagesOptions = {
  packageName: SystemPackageName;
};

const systemMessagesByCode = new Map<SystemMessage['code'], SystemMessage>();

export const sharedSystemMessageTree = {
  data: {
    operation: {
      validationFailed: {
        code: 'DATA-OPERATION-001',
        severity: LOG_SEVERITY.WARNING,
        message: 'La operación de datos falló por validación.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_VALIDATION,
      },
      notFound: {
        code: 'DATA-OPERATION-002',
        severity: LOG_SEVERITY.WARNING,
        message: 'No se encontró la entidad solicitada.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_NOT_FOUND,
      },
      conflictDetected: {
        code: 'DATA-OPERATION-003',
        severity: LOG_SEVERITY.WARNING,
        message: 'Se detectó un conflicto de datos.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_CONFLICT,
      },
      forbiddenOperation: {
        code: 'DATA-OPERATION-004',
        severity: LOG_SEVERITY.WARNING,
        message: 'La sesión actual no puede ejecutar la operación de datos.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_FORBIDDEN,
      },
      unknownFailure: {
        code: 'DATA-OPERATION-005',
        severity: LOG_SEVERITY.ERROR,
        message: 'Falló inesperadamente en operaciones de datos.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.DATA_UNKNOWN,
      },
    },
  },
  auth: {
    login: {
      invalidCredentialsAttempt: {
        code: 'AUTH-LOGIN-003',
        severity: LOG_SEVERITY.WARNING,
        message: 'Se registró un intento de autenticación con credenciales inválidas.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.AUTH_INVALID_CREDENTIALS,
      },
      locked: {
        code: 'AUTH-LOGIN-002',
        severity: LOG_SEVERITY.WARNING,
        message: 'La cuenta se encuentra temporalmente bloqueada por intentos fallidos.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.AUTH_REQUIRED,
      },
      noPermissions: {
        code: 'AUTH-LOGIN-004',
        severity: LOG_SEVERITY.WARNING,
        message: 'El usuario no tiene permisos activos para iniciar sesión.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.AUTH_NO_PERMISSIONS,
      },
      invalidContext: {
        code: 'AUTH-LOGIN-005',
        severity: LOG_SEVERITY.WARNING,
        message: 'El contexto seleccionado no es válido para la sesión actual.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.AUTH_INVALID_CONTEXT,
      },
    },
    logout: {
      logoutFailure: {
        code: 'AUTH-LOGOUT-001',
        severity: LOG_SEVERITY.ERROR,
        message: 'Falló inesperadamente el cierre de sesión.',
        errorKind: SYSTEM_MESSAGE_ERROR_KIND.SYSTEM_UNEXPECTED,
      },
    },
  },
} as const satisfies MessageTree;

function isSystemMessageTemplate(value: MessageTree | SystemMessageTemplate): value is SystemMessageTemplate {
  return typeof value === 'object' && value !== null && 'code' in value && 'severity' in value && 'message' in value;
}

/**
 * Converts a segment to snake_case for message key composition.
 */
function toSnakeCase(input: string) {
  return input
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replaceAll('-', '_')
    .toLowerCase();
}

/**
 * Splits a message code into normalized lowercase taxonomy tokens.
 * Example: AUTH-LOGIN-002 -> ["auth", "login", "002"]
 */
function extractCodeTokens(code: string) {
  return code.split('-').map((token) => token.toLowerCase());
}

/**
 * Validates that the first two taxonomy path segments match the first two code tokens.
 */
function assertTaxonomicPathMatchesCode(path: string[], code: string) {
  const codeTokens = extractCodeTokens(code);
  const [pathLevelOne, pathLevelTwo] = path;
  const [codeTokenOne, codeTokenTwo] = codeTokens;
  if (!pathLevelOne || !pathLevelTwo || pathLevelOne !== codeTokenOne || pathLevelTwo !== codeTokenTwo) {
    throw new Error(
      `Invalid system message taxonomy for code "${code}". Expected path prefix "${codeTokenOne}.${codeTokenTwo}".`,
    );
  }
}

/**
 * Builds a SystemMessage tree from templates, injecting derived key and package fields.
 */
export function buildSystemMessagesTree(
  tree: MessageTree,
  options: BuildSystemMessagesOptions,
  path: string[] = [],
): MessageTree | SystemMessage {
  const entries = Object.entries(tree).map(([segment, value]) => {
    if (isSystemMessageTemplate(value)) {
      const basePath = [...path, segment].map(toSnakeCase);
      const codeTokens = extractCodeTokens(value.code);
      const packageToken = toSnakeCase(options.packageName);
      const shouldPrefixPackage = codeTokens[0] === packageToken;
      const pathWithPackage = shouldPrefixPackage ? [packageToken, ...basePath] : basePath;

      assertTaxonomicPathMatchesCode(pathWithPackage, value.code);
      const keyPath = pathWithPackage.join('.');
      const message: SystemMessage = {
        code: value.code,
        key: keyPath,
        severity: value.severity,
        packageName: options.packageName,
        message: value.message,
        displayMessage: value.displayMessage,
        httpStatus: value.httpStatus,
        errorKind: value.errorKind,
      };
      return [segment, message];
    }
    return [segment, buildSystemMessagesTree(value, options, [...path, segment])];
  });

  return Object.fromEntries(entries) as MessageTree;
}

/**
 * Strongly typed wrapper over buildSystemMessagesTree.
 */
export function buildTypedSystemMessagesTree<T extends MessageTree>(
  tree: T,
  options: BuildSystemMessagesOptions,
): BuiltMessageTree<T> {
  const builtTree = buildSystemMessagesTree(tree, options) as BuiltMessageTree<T>;
  registerSystemMessages(builtTree);
  return builtTree;
}

function isBuiltSystemMessage(value: unknown): value is SystemMessage {
  return typeof value === 'object' && value !== null && 'code' in value && 'key' in value && 'packageName' in value;
}

export function registerSystemMessages(tree: unknown) {
  if (isBuiltSystemMessage(tree)) {
    const existing = systemMessagesByCode.get(tree.code);
    if (existing && existing.key !== tree.key) {
      throw new Error(
        `Duplicate system message code "${tree.code}" registered for keys "${existing.key}" and "${tree.key}".`,
      );
    }
    systemMessagesByCode.set(tree.code, tree);
    return;
  }

  if (typeof tree !== 'object' || tree === null) {
    return;
  }

  for (const value of Object.values(tree)) {
    registerSystemMessages(value);
  }
}

export function resolveSystemMessage(code: SystemMessage['code']) {
  const message = systemMessagesByCode.get(code);
  if (!message) {
    throw new Error(`Unknown system message code "${code}".`);
  }
  return message;
}

/**
 * Builds a unified catalog with optional package roots.
 * If no roots are provided, returns an empty object.
 */
export function buildUnifiedSystemMessageTree<
  TWeb extends MessageTree = MessageTree,
  TShared extends MessageTree = MessageTree,
  TApi extends MessageTree = MessageTree,
>(trees: { web?: TWeb; shared?: TShared; api?: TApi } = {}) {
  const output: {
    web?: BuiltMessageTree<TWeb>;
    shared?: BuiltMessageTree<TShared>;
    api?: BuiltMessageTree<TApi>;
  } = {};

  if (trees.web) {
    output.web = buildTypedSystemMessagesTree(trees.web, { packageName: SYSTEM_PACKAGE_NAME.WEB });
  }
  if (trees.shared) {
    output.shared = buildTypedSystemMessagesTree(trees.shared, { packageName: SYSTEM_PACKAGE_NAME.SHARED });
  }
  if (trees.api) {
    output.api = buildTypedSystemMessagesTree(trees.api, { packageName: SYSTEM_PACKAGE_NAME.API });
  }

  return output;
}

export const sharedSystemMessages = buildTypedSystemMessagesTree(sharedSystemMessageTree, {
  packageName: SYSTEM_PACKAGE_NAME.SHARED,
});
