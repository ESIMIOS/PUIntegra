/**
 * @package shared
 * @name system-messages.ts
 * @version 0.0.1
 * @description Catálogo compartido de mensajes de sistema transversales entre paquetes.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-17)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { LOG_SEVERITY, type SystemMessage } from '../schemas/system-message.schema';

export type SystemMessageTemplate = {
  code: string;
  severity: SystemMessage['severity'];
  message: string;
};

export type MessageTree = {
  [key: string]: MessageTree | SystemMessageTemplate;
};

export type BuiltMessageTree<T extends MessageTree> = {
  [K in keyof T]:
    T[K] extends SystemMessageTemplate
      ? SystemMessage
      : T[K] extends MessageTree
        ? BuiltMessageTree<T[K]>
        : never;
};

type BuildSystemMessagesOptions = {
  packageName: string;
};

export const sharedSystemMessageTree = {
  data: {
    mock: {
      validationFailed: {
        code: 'DATA-MOCK-001',
        severity: LOG_SEVERITY.WARNING,
        message: 'La operación de datos mock falló por validación.'
      },
      notFound: {
        code: 'DATA-MOCK-002',
        severity: LOG_SEVERITY.WARNING,
        message: 'No se encontró la entidad solicitada en datos mock.'
      },
      conflictDetected: {
        code: 'DATA-MOCK-003',
        severity: LOG_SEVERITY.WARNING,
        message: 'Se detectó un conflicto de datos mock.'
      },
      forbiddenOperation: {
        code: 'DATA-MOCK-004',
        severity: LOG_SEVERITY.WARNING,
        message: 'La sesión actual no puede ejecutar la operación de datos mock.'
      },
      unknownFailure: {
        code: 'DATA-MOCK-005',
        severity: LOG_SEVERITY.ERROR,
        message: 'Falló inesperadamente en operaciones de datos mock.'
      }
    }
  },
  auth: {
    login: {
      invalidCredentialsAttempt: {
        code: 'AUTH-LOGIN-003',
        severity: LOG_SEVERITY.WARNING,
        message: 'Se registró un intento de autenticación con credenciales inválidas.'
      },
      locked: {
        code: 'AUTH-LOGIN-002',
        severity: LOG_SEVERITY.WARNING,
        message: 'La cuenta se encuentra temporalmente bloqueada por intentos fallidos.'
      },
      noPermissions: {
        code: 'AUTH-LOGIN-004',
        severity: LOG_SEVERITY.WARNING,
        message: 'El usuario no tiene permisos activos para iniciar sesión.'
      },
      invalidContext: {
        code: 'AUTH-LOGIN-005',
        severity: LOG_SEVERITY.WARNING,
        message: 'El contexto seleccionado no es válido para la sesión actual.'
      }
    }
  }
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
      `Invalid system message taxonomy for code "${code}". Expected path prefix "${codeTokenOne}.${codeTokenTwo}".`
    );
  }
}

/**
 * Builds a SystemMessage tree from templates, injecting derived key and package fields.
 */
export function buildSystemMessagesTree(
  tree: MessageTree,
  options: BuildSystemMessagesOptions,
  path: string[] = []
): MessageTree | SystemMessage {
  const entries = Object.entries(tree).map(([segment, value]) => {
    if (isSystemMessageTemplate(value)) {
      const basePath = [...path, segment].map(toSnakeCase);
      const codeTokens = extractCodeTokens(value.code);
      const packageToken = toSnakeCase(options.packageName);
      const shouldPrefixPackage = codeTokens[0] === packageToken;
      const pathWithPackage = shouldPrefixPackage
        ? [packageToken, ...basePath]
        : basePath;

      assertTaxonomicPathMatchesCode(pathWithPackage, value.code);
      const keyPath = pathWithPackage.join('.');
      const message: SystemMessage = {
        code: value.code,
        key: keyPath,
        severity: value.severity,
        package: options.packageName,
        message: value.message
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
  options: BuildSystemMessagesOptions
): BuiltMessageTree<T> {
  return buildSystemMessagesTree(tree, options) as BuiltMessageTree<T>;
}

/**
 * Builds a unified catalog with optional package roots.
 * If no roots are provided, returns an empty object.
 */
export function buildUnifiedSystemMessageTree<
  TWeb extends MessageTree = MessageTree,
  TShared extends MessageTree = MessageTree,
  TApi extends MessageTree = MessageTree
>(trees: { web?: TWeb; shared?: TShared; api?: TApi } = {}) {
  const output: {
    web?: BuiltMessageTree<TWeb>;
    shared?: BuiltMessageTree<TShared>;
    api?: BuiltMessageTree<TApi>;
  } = {};

  if (trees.web) {
    output.web = buildTypedSystemMessagesTree(trees.web, { packageName: 'web' });
  }
  if (trees.shared) {
    output.shared = buildTypedSystemMessagesTree(trees.shared, { packageName: 'shared' });
  }
  if (trees.api) {
    output.api = buildTypedSystemMessagesTree(trees.api, { packageName: 'api' });
  }

  return output;
}

export const sharedSystemMessages = buildTypedSystemMessagesTree(sharedSystemMessageTree, { packageName: 'shared' });
