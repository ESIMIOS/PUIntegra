/**
 * @package web
 * @name mockAuthService.ts
 * @version 0.0.1
 * @description Provee operaciones mock de autenticación con persistencia local, lockout y trazabilidad de login/logout.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  LOG_CATEGORIES,
  LOG_ORIGIN,
  LogSchema,
  PermissionSchema,
  PERMISSION_STATUS,
  ROLE,
  RoleSchema,
  UserSchema
} from '@shared';
import { z } from 'zod';
import { nowUtcMilliseconds } from '@/shared/utils/dateUtils';
import { systemMessageTree } from '@/shared/constants/systemMessages';
import { logSystemMessage } from '@/shared/logging/systemLogger';
import { loadMockDataset, saveMockDataset } from '@/mock/storage/mockStorage';
import { mockAuthCredentials } from './mockAuthCredentials';
import { loadMockAuthState, saveMockAuthState, MockAuthSessionSchema } from './mockAuthStorage';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

const SessionContextSchema = z.object({
  role: RoleSchema,
  rfc: z.string().min(1)
});

const LoginResultSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  emojiIcon: z.string().min(1).nullable(),
  contexts: z.array(SessionContextSchema).min(1)
});

export const MOCK_AUTH_ERROR_KIND = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  THROTHLED: 'THROTHLED',
  NO_PERMISSIONS: 'NO_PERMISSIONS',
  INVALID_CONTEXT: 'INVALID_CONTEXT'
} as const;

export const MockAuthErrorSchema = z.object({
  kind: z.enum([
    MOCK_AUTH_ERROR_KIND.INVALID_CREDENTIALS,
    MOCK_AUTH_ERROR_KIND.THROTHLED,
    MOCK_AUTH_ERROR_KIND.NO_PERMISSIONS,
    MOCK_AUTH_ERROR_KIND.INVALID_CONTEXT
  ]),
  code: z.string().min(1),
  message: z.string().min(1),
  uiMessage: z.string().min(1).optional(),
  remainingSeconds: z.number().int().nonnegative().optional()
});

export type MockAuthError = z.infer<typeof MockAuthErrorSchema>;
export type LoginResult = z.infer<typeof LoginResultSchema>;
type MockAuthErrorKind = z.infer<typeof MockAuthErrorSchema.shape.kind>;
type SessionContext = z.infer<typeof SessionContextSchema>;
type PersistedSession = z.infer<typeof MockAuthSessionSchema>;

/**
 * @description Normaliza errores de autenticación bajo un contrato validado.
 */
function createAuthError(input: MockAuthError): MockAuthError {
  return MockAuthErrorSchema.parse(input);
}

/**
 * @description Construye errores de autenticación desde el catálogo canónico de mensajes de sistema.
 */
function createAuthErrorFromSystemMessage(
  kind: MockAuthErrorKind,
  systemMessage: { code: string; message: string },
  options: { remainingSeconds?: number; uiMessage?: string } = {}
) {
  return createAuthError({
    kind,
    code: systemMessage.code,
    message: systemMessage.message,
    uiMessage: options.uiMessage,
    remainingSeconds: options.remainingSeconds
  });
}

function buildThrottledUiMessage(remainingSeconds: number) {
  return `Demasiados intentos fallidos. Intenta de nuevo en ${remainingSeconds} segundos.`;
}

/**
 * @description Construye un log de autenticación validado contra contrato compartido.
 */
function buildAuthLog(input: {
  category: (typeof LOG_CATEGORIES)[keyof typeof LOG_CATEGORIES];
  userId: string;
  role: z.infer<typeof RoleSchema>;
  email: string;
  RFC: string;
  createdAt: number;
}) {
  return LogSchema.parse({
    id: `auth-log-${input.category}-${Date.now()}`,
    category: input.category,
    RFC: input.RFC,
    origin: LOG_ORIGIN.SYSTEM_AUTH_TRIGGER,
    originTraceId: null,
    userId: input.userId,
    execution: {
      executedByUserId: input.userId,
      executedByRole: input.role,
      executedByUserEmail: input.email
    },
    impact: {
      impactedUserId: input.userId,
      impactedUserRole: input.role,
      impactedUserEmail: input.email
    },
    searchRequest: {},
    createdAt: input.createdAt
  });
}

/**
 * @description Obtiene contextos activos por permisos concedidos para un usuario.
 */
function resolveGrantedContexts(userId: string) {
  const dataset = loadMockDataset();
  const contexts = dataset.permissions
    .map((permission) => PermissionSchema.parse(permission))
    .filter((permission) => permission.userId === userId)
    .filter((permission) => permission.status === PERMISSION_STATUS.GRANTED)
    .map((permission) => SessionContextSchema.parse({
      role: permission.role,
      rfc: permission.RFC
    }));

  return contexts;
}

/**
 * @description Deriva RFC institucionales permitidos excluyendo el contexto del proveedor.
 */
function toAllowedInstitutionRfcs(contexts: SessionContext[]) {
  return contexts
    .filter((context) => context.role !== ROLE.SYSTEM_ADMINISTRATOR)
    .map((context) => context.rfc);
}

/**
 * @description Persiste evento de login exitoso.
 */
function saveLoginLog(session: PersistedSession) {
  const dataset = loadMockDataset();
  const logEntry = buildAuthLog({
    category: LOG_CATEGORIES.USER_ACCOUNT_LOGIN,
    userId: session.userId,
    role: session.activeRole,
    email: session.email,
    RFC: session.activeRfc,
    createdAt: nowUtcMilliseconds()
  });
  saveMockDataset({
    ...dataset,
    logs: [...dataset.logs, logEntry]
  });
}

/**
 * @description Persiste evento de logout exitoso cuando había sesión activa.
 */
function saveLogoutLog(session: PersistedSession | null) {
  if (!session) {
    return;
  }

  const dataset = loadMockDataset();
  const logEntry = buildAuthLog({
    category: LOG_CATEGORIES.USER_ACCOUNT_LOGOUT,
    userId: session.userId,
    role: session.activeRole,
    email: session.email,
    RFC: session.activeRfc,
    createdAt: nowUtcMilliseconds()
  });
  saveMockDataset({
    ...dataset,
    logs: [...dataset.logs, logEntry]
  });
}

/**
 * @description Resuelve credencial mock por correo normalizado.
 */
function findCredential(email: string) {
  return mockAuthCredentials.find((credential) => credential.email.toLowerCase() === email.toLowerCase());
}

/**
 * @description Construye sesión persistible con contexto seleccionado.
 */
function buildSession(login: LoginResult, selectedContext: SessionContext): PersistedSession {
  const allowedInstitutionRfcs = toAllowedInstitutionRfcs(login.contexts);
  return {
    userId: login.userId,
    name: login.name,
    email: login.email,
    emojiIcon: login.emojiIcon,
    activeRole: selectedContext.role,
    activeRfc: selectedContext.rfc,
    allowedInstitutionRfcs,
    availableContexts: login.contexts
  };
}

/**
 * @description Crea el servicio mock de autenticación local.
 */
export function createMockAuthService() {
  return {
    getLockoutRemaining(email: string) {
      const state = loadMockAuthState();
      const failedRecord = state.failedAttemptsByEmail[email.toLowerCase()];
      if (!failedRecord || !failedRecord.lockedUntil) {
        return 0;
      }
      const remainingSeconds = Math.max(0, Math.ceil((failedRecord.lockedUntil - nowUtcMilliseconds()) / 1000));
      return remainingSeconds;
    },
    validateCredentials(email: string, password: string): LoginResult {
      const normalizedEmail = email.trim().toLowerCase();
      const state = loadMockAuthState();
      const now = nowUtcMilliseconds();
      const failedRecord = state.failedAttemptsByEmail[normalizedEmail];

      if (failedRecord?.lockedUntil && failedRecord.lockedUntil > now) {
        const remainingSeconds = Math.ceil((failedRecord.lockedUntil - now) / 1000);
        logSystemMessage(systemMessageTree.shared.auth.login.locked, {
          operation: 'mockAuth.validateCredentials.locked',
          email: normalizedEmail,
          remainingSeconds
        });
        throw createAuthErrorFromSystemMessage(
          MOCK_AUTH_ERROR_KIND.THROTHLED,
          systemMessageTree.shared.auth.login.locked,
          {
            remainingSeconds,
            uiMessage: buildThrottledUiMessage(remainingSeconds)
          }
        );
      }

      const credential = findCredential(normalizedEmail);
      if (!credential || credential.password !== password) {
        const attempts = (failedRecord?.attempts ?? 0) + 1;
        const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_SECONDS * 1000 : null;
        saveMockAuthState({
          ...state,
          failedAttemptsByEmail: {
            ...state.failedAttemptsByEmail,
            [normalizedEmail]: {
              attempts,
              lockedUntil
            }
          }
        });

        logSystemMessage(systemMessageTree.shared.auth.login.invalidCredentialsAttempt, {
          operation: 'mockAuth.validateCredentials.invalid_credentials',
          email: normalizedEmail,
          attempts
        });
        throw createAuthErrorFromSystemMessage(
          lockedUntil ? MOCK_AUTH_ERROR_KIND.THROTHLED : MOCK_AUTH_ERROR_KIND.INVALID_CREDENTIALS,
          lockedUntil ? systemMessageTree.shared.auth.login.locked : systemMessageTree.shared.auth.login.invalidCredentialsAttempt,
          lockedUntil ? {
            remainingSeconds: LOCKOUT_SECONDS,
            uiMessage: buildThrottledUiMessage(LOCKOUT_SECONDS)
          } : undefined
        );
      }

      const dataset = loadMockDataset();
      const user = dataset.users
        .map((candidate) => UserSchema.parse(candidate))
        .find((candidate) => candidate.email.toLowerCase() === normalizedEmail);

      if (!user) {
        throw createAuthErrorFromSystemMessage(
          MOCK_AUTH_ERROR_KIND.INVALID_CREDENTIALS,
          systemMessageTree.shared.auth.login.invalidCredentialsAttempt
        );
      }

      const contexts = resolveGrantedContexts(user.userId);
      if (contexts.length === 0) {
        throw createAuthErrorFromSystemMessage(
          MOCK_AUTH_ERROR_KIND.NO_PERMISSIONS,
          systemMessageTree.shared.auth.login.noPermissions
        );
      }

      const nextFailedAttempts = { ...state.failedAttemptsByEmail };
      delete nextFailedAttempts[normalizedEmail];
      saveMockAuthState({
        ...state,
        failedAttemptsByEmail: nextFailedAttempts
      });

      return LoginResultSchema.parse({
        userId: user.userId,
        name: user.name,
        email: user.email,
        emojiIcon: user.emojiIcon ?? null,
        contexts
      });
    },
    establishSession(login: LoginResult, context: SessionContext) {
      const exists = login.contexts.some((candidate) => (
        candidate.role === context.role && candidate.rfc === context.rfc
      ));
      if (!exists) {
        throw createAuthErrorFromSystemMessage(
          MOCK_AUTH_ERROR_KIND.INVALID_CONTEXT,
          systemMessageTree.shared.auth.login.invalidContext
        );
      }

      const nextSession = buildSession(login, context);
      const state = loadMockAuthState();
      saveMockAuthState({
        ...state,
        session: nextSession
      });
      saveLoginLog(nextSession);
      return nextSession;
    },
    hydrateSession() {
      const state = loadMockAuthState();
      if (!state.session) {
        return null;
      }

      const dataset = loadMockDataset();
      const userExists = dataset.users.some((user) => user.userId === state.session?.userId);
      if (!userExists) {
        saveMockAuthState({
          ...state,
          session: null
        });
        return null;
      }

      const contexts = resolveGrantedContexts(state.session.userId);
      const activeContextStillValid = contexts.some((context) => (
        context.role === state.session?.activeRole && context.rfc === state.session?.activeRfc
      ));

      if (!activeContextStillValid) {
        saveMockAuthState({
          ...state,
          session: null
        });
        return null;
      }

      const hydratedSession = {
        ...state.session,
        availableContexts: contexts,
        allowedInstitutionRfcs: toAllowedInstitutionRfcs(contexts)
      };

      saveMockAuthState({
        ...state,
        session: hydratedSession
      });
      return hydratedSession;
    },
    switchContext(context: SessionContext) {
      const state = loadMockAuthState();
      if (!state.session) {
        throw createAuthErrorFromSystemMessage(
          MOCK_AUTH_ERROR_KIND.INVALID_CONTEXT,
          systemMessageTree.shared.auth.login.invalidContext
        );
      }

      const contexts = resolveGrantedContexts(state.session.userId);
      const match = contexts.find((candidate) => (
        candidate.role === context.role && candidate.rfc === context.rfc
      ));
      if (!match) {
        throw createAuthErrorFromSystemMessage(
          MOCK_AUTH_ERROR_KIND.INVALID_CONTEXT,
          systemMessageTree.shared.auth.login.invalidContext
        );
      }

      const nextSession = {
        ...state.session,
        activeRole: match.role,
        activeRfc: match.rfc,
        availableContexts: contexts,
        allowedInstitutionRfcs: toAllowedInstitutionRfcs(contexts)
      };

      saveMockAuthState({
        ...state,
        session: nextSession
      });
      return nextSession;
    },
    logout() {
      const state = loadMockAuthState();
      saveLogoutLog(state.session);
      saveMockAuthState({
        ...state,
        session: null
      });
    }
  };
}
