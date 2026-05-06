/**
 * @package api
 * @name authAuditService.ts
 * @version 0.0.5
 * @description Construye perfiles de usuario y bitácoras de eventos Auth validados por esquemas compartidos.
 * @author @codex
 * @changelog
 * - 0.0.5	(2026-04-19)	Confirma login/logout sin rol por ser eventos de cuenta.	@codex
 * - 0.0.4	(2026-04-19)	Deja execution vacío en creación de cuenta por trigger backend.	@codex
 * - 0.0.3	(2026-04-19)	Recibe IDs y trazas generadas por infraestructura servidor.	@codex
 * - 0.0.2	(2026-04-19)	Omite campos opcionales ausentes para compatibilidad con Firestore.	@codex
 * - 0.0.1	(2026-04-19)	Agrega builders para perfil Auth, alta de cuenta, login y logout.	@codex
 */

import { LOG_CATEGORIES, LOG_ORIGIN, LogSchema, RoleSchema, UserSchema, type Log, type User } from "@puintegra/shared";
import { z } from "zod";

export const AuthEventNameSchema = z.enum(["login", "logout"]);
export type AuthEventName = z.infer<typeof AuthEventNameSchema>;
export const AuthLifecycleEventNameSchema = z.enum([
  "password-recovery-request",
  "password-update",
  "email-verification",
  "mfa-enroll",
  "mfa-unenroll",
]);
export type AuthLifecycleEventName = z.infer<typeof AuthLifecycleEventNameSchema>;

type AuthUserProfileInput = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
};

type AuthEventLogInput = {
  id: string;
  event: AuthEventName;
  originTraceId: string;
  userId: string;
  email?: string | null;
  role?: (typeof RoleSchema)['enum'][keyof (typeof RoleSchema)['enum']] | null;
};

type UserCreatedLogInput = {
  id: string;
  originTraceId: string;
  userId: string;
  email: string;
};

type UserAccountLifecycleLogInput = {
  id: string;
  category:
    | typeof LOG_CATEGORIES.USER_ACCOUNT_PASSWORD_RECOVERY_REQUEST
    | typeof LOG_CATEGORIES.USER_ACCOUNT_PASSWORD_UPDATE
    | typeof LOG_CATEGORIES.USER_ACCOUNT_EMAIL_VERIFICATION
    | typeof LOG_CATEGORIES.USER_ACCOUNT_MFA_ENROLL
    | typeof LOG_CATEGORIES.USER_ACCOUNT_MFA_UNENROLL;
  originTraceId: string;
  userId?: string | null;
  email?: string | null;
};

const AUTH_EVENT_CATEGORY = {
  login: LOG_CATEGORIES.USER_ACCOUNT_LOGIN,
  logout: LOG_CATEGORIES.USER_ACCOUNT_LOGOUT,
} as const satisfies Record<
  AuthEventName,
  typeof LOG_CATEGORIES.USER_ACCOUNT_LOGIN | typeof LOG_CATEGORIES.USER_ACCOUNT_LOGOUT
>;

export const AUTH_LIFECYCLE_EVENT_CATEGORY = {
  "password-recovery-request": LOG_CATEGORIES.USER_ACCOUNT_PASSWORD_RECOVERY_REQUEST,
  "password-update": LOG_CATEGORIES.USER_ACCOUNT_PASSWORD_UPDATE,
  "email-verification": LOG_CATEGORIES.USER_ACCOUNT_EMAIL_VERIFICATION,
  "mfa-enroll": LOG_CATEGORIES.USER_ACCOUNT_MFA_ENROLL,
  "mfa-unenroll": LOG_CATEGORIES.USER_ACCOUNT_MFA_UNENROLL,
} as const satisfies Record<AuthLifecycleEventName, UserAccountLifecycleLogInput["category"]>;

/**
 * @description Construye el perfil de dominio a partir del usuario creado en Firebase Auth.
 */
export function buildUserProfileFromAuthUser(authUser: AuthUserProfileInput, now: number): User {
  if (!authUser.email) {
    throw new Error("Firebase Auth user email is required to create a PUIntegra user profile.");
  }

  const profile = {
    userId: authUser.uid,
    name: authUser.displayName?.trim() || authUser.email,
    email: authUser.email,
    emojiIcon: "😎",
    updates: [],
    createdAt: now,
    updatedAt: now,
  };

  return UserSchema.parse(
    authUser.phoneNumber
      ? {
          ...profile,
          phone: authUser.phoneNumber,
        }
      : profile,
  );
}

/**
 * @description Construye bitácora de login/logout reportada por la API HTTP autenticada.
 */
export function buildAuthEventLog(input: AuthEventLogInput, now: number): Log {
  return LogSchema.parse({
    id: input.id,
    category: AUTH_EVENT_CATEGORY[input.event],
    RFC: null,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: input.originTraceId,
    userId: input.userId,
    execution: {
      executedByUserId: input.userId,
      executedByRole: input.role ?? null,
      executedByUserEmail: input.email ?? null,
    },
    impact: {},
    searchRequest: {},
    createdAt: now,
  });
}

/**
 * @description Construye bitácora de creación de cuenta producida por Auth onCreate.
 */
export function buildUserCreatedLog(input: UserCreatedLogInput, now: number): Log {
  return LogSchema.parse({
    id: input.id,
    category: LOG_CATEGORIES.USER_ACCOUNT_CREATION,
    RFC: null,
    origin: LOG_ORIGIN.SYSTEM_AUTH_TRIGGER,
    originTraceId: input.originTraceId,
    userId: input.userId,
    execution: {},
    impact: {
      impactedUserId: input.userId,
      impactedUserEmail: input.email,
    },
    searchRequest: {},
    createdAt: now,
  });
}

/**
 * @description Construye bitácora sanitizada de eventos del ciclo de vida de cuenta.
 */
export function buildUserAccountLifecycleLog(input: UserAccountLifecycleLogInput, now: number): Log {
  return LogSchema.parse({
    id: input.id,
    category: input.category,
    RFC: null,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: input.originTraceId,
    userId: input.userId ?? null,
    execution: {},
    impact: {
      impactedUserId: input.userId ?? null,
      impactedUserEmail: input.email ?? null,
    },
    searchRequest: {},
    createdAt: now,
  });
}
