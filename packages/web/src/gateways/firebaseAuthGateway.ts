/**
 * @package web
 * @name firebaseAuthGateway.ts
 * @version 0.0.4
 * @description Coordina Firebase Auth con contexto de sesión de PUIntegra.
 * @author @codex
 * @changelog
 * - 0.0.4	(2026-04-19)	Registra evento login al validar credenciales y no al seleccionar contexto.	@codex
 * - 0.0.3	(2026-04-19)	Reporta login/logout como eventos de cuenta sin contexto RFC/rol.	@codex
 * - 0.0.2	(2026-04-19)	Reporta eventos login/logout al API autenticado para bitácora.	@codex
 * - 0.0.1	(2026-04-18)	Agrega gateway de autenticación con Firebase Auth Emulator.	@codex
 */

import { ROLE, RoleSchema, PERMISSION_STATUS, SystemError, sharedSystemMessages, type Permission, type User } from '@shared';
import { z } from 'zod';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { getFirebaseRuntime } from '@/plugins/firebase';
import { executeHttpApi, resolveApiUrl } from '@/gateways/httpApiGateway';
import { getUserById, listPermissionsByEmail } from '@/gateways/firebaseDataGateway';

const ACTIVE_CONTEXT_STORAGE_KEY = 'puintegra:web:active-session-context:v1';
const AUTH_EVENT_API_PATH = '/api/auth/events';

export const SessionContextSchema = z.object({
  role: RoleSchema,
  rfc: z.string().min(1)
});

export const LoginResultSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  emojiIcon: z.string().min(1).nullable(),
  contexts: z.array(SessionContextSchema).min(1)
});

export const AppSessionSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  emojiIcon: z.string().min(1).nullable(),
  activeRole: RoleSchema,
  activeRfc: z.string().min(1),
  allowedInstitutionRfcs: z.array(z.string().min(1)),
  availableContexts: z.array(SessionContextSchema)
});

export type SessionContext = z.infer<typeof SessionContextSchema>;
export type LoginResult = z.infer<typeof LoginResultSchema>;
export type AppSession = z.infer<typeof AppSessionSchema>;

/**
 * @description Resuelve almacenamiento local disponible para el contexto activo.
 */
function resolveStorage(): Storage | null {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }
  return globalThis.localStorage;
}

/**
 * @description Lee y valida el contexto activo guardado.
 */
function loadSavedContext(): SessionContext | null {
  const storage = resolveStorage();
  const raw = storage?.getItem(ACTIVE_CONTEXT_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = SessionContextSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * @description Persiste el contexto activo seleccionado por el usuario.
 */
function saveContext(context: SessionContext) {
  resolveStorage()?.setItem(ACTIVE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
}

/**
 * @description Elimina el contexto activo guardado.
 */
export function clearSavedContext() {
  resolveStorage()?.removeItem(ACTIVE_CONTEXT_STORAGE_KEY);
}

/**
 * @description Indica si existe un contexto de sesión guardado y válido.
 */
export function hasSavedContext(): boolean {
  return loadSavedContext() !== null;
}

/**
 * @description Devuelve RFC institucionales permitidos excluyendo el contexto de sistema.
 */
function toAllowedInstitutionRfcs(contexts: SessionContext[]) {
  return contexts
    .filter((context) => context.role !== ROLE.SYSTEM_ADMINISTRATOR)
    .map((context) => context.rfc);
}

/**
 * @description Convierte un permiso concedido en contexto seleccionable.
 */
function toContext(permission: Permission): SessionContext {
  return SessionContextSchema.parse({
    role: permission.role,
    rfc: permission.RFC
  });
}

/**
 * @description Garantiza que exista usuario Firebase autenticado.
 */
function assertFirebaseUser(value: FirebaseUser | null): FirebaseUser {
  if (!value) {
    throw new SystemError(sharedSystemMessages.data.operation.unknownFailure);
  }
  return value;
}

/**
 * @description Reporta evento Auth al API sin romper el flujo si el emulador API no está disponible.
 */
async function recordAuthEvent(event: 'login' | 'logout') {
  const firebaseUser = getFirebaseRuntime().auth.currentUser;
  if (!firebaseUser) {
    return;
  }

  try {
    const token = await firebaseUser.getIdToken();
    await executeHttpApi({
      url: resolveApiUrl(`${AUTH_EVENT_API_PATH}/${event}`),
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`
      },
      transportMessage: `Auth ${event} event API request failed.`
    });
  } catch {
    // Audit event submission must not block local sign-in or sign-out UX.
  }
}

/**
 * @description Resuelve perfil de dominio y contextos concedidos para un usuario Firebase.
 */
async function resolveProfile(firebaseUser: FirebaseUser): Promise<LoginResult> {
  const user = await getUserById(firebaseUser.uid);
  const permissions = await listPermissionsByEmail(user.email);
  const contexts = permissions
    .filter((permission) => permission.status === PERMISSION_STATUS.GRANTED)
    .map(toContext);

  if (contexts.length === 0) {
    throw new SystemError(sharedSystemMessages.auth.login.noPermissions);
  }

  const loginResult = LoginResultSchema.parse({
    userId: user.userId,
    name: user.name,
    email: user.email,
    emojiIcon: user.emojiIcon ?? null,
    contexts
  });
  return loginResult;
}

/**
 * @description Construye la sesión de aplicación validada para el contexto seleccionado.
 */
function buildSession(user: User, contexts: SessionContext[], selectedContext: SessionContext): AppSession {
  return AppSessionSchema.parse({
    userId: user.userId,
    name: user.name,
    email: user.email,
    emojiIcon: user.emojiIcon ?? null,
    activeRole: selectedContext.role,
    activeRfc: selectedContext.rfc,
    allowedInstitutionRfcs: toAllowedInstitutionRfcs(contexts),
    availableContexts: contexts
  });
}

/**
 * @description Inicia sesión en Firebase Auth y resuelve contextos de dominio disponibles.
 */
export async function validateCredentials(email: string, password: string): Promise<LoginResult> {
  let credential: Awaited<ReturnType<typeof signInWithEmailAndPassword>>;
  try {
    credential = await signInWithEmailAndPassword(getFirebaseRuntime().auth, email, password);
  } catch {
    throw new SystemError(sharedSystemMessages.auth.login.invalidCredentialsAttempt);
  }

  try {
    const profile = await resolveProfile(credential.user);
    await recordAuthEvent('login');
    return profile;
  } catch (error) {
    await signOut(getFirebaseRuntime().auth);
    throw error;
  }
}

/**
 * @description Establece sesión de aplicación con un contexto válido del login actual.
 */
export async function establishSession(login: LoginResult, context: SessionContext): Promise<AppSession> {
  const selected = login.contexts.find((candidate) => candidate.role === context.role && candidate.rfc === context.rfc);
  if (!selected) {
    throw new SystemError(sharedSystemMessages.auth.login.invalidContext);
  }
  const user = await getUserById(login.userId);
  saveContext(selected);
  return buildSession(user, login.contexts, selected);
}

/**
 * @description Hidrata sesión desde Firebase Auth y contexto activo persistido.
 */
export async function hydrateSession(): Promise<AppSession | null> {
  const firebaseUser = await getCurrentFirebaseUser();
  if (!firebaseUser) {
    clearSavedContext();
    return null;
  }

  const login = await resolveProfile(firebaseUser);
  const savedContext = loadSavedContext();
  const selected = savedContext
    ? login.contexts.find((candidate) => candidate.role === savedContext.role && candidate.rfc === savedContext.rfc)
    : null;
  if (!selected) {
    clearSavedContext();
    return null;
  }
  const user = await getUserById(login.userId);
  return buildSession(user, login.contexts, selected);
}

/**
 * @description Cambia el contexto activo usando la identidad Firebase actual.
 */
export async function switchContext(context: SessionContext): Promise<AppSession> {
  const firebaseUser = assertFirebaseUser(getFirebaseRuntime().auth.currentUser);
  const login = await resolveProfile(firebaseUser);
  return establishSession(login, context);
}

/**
 * @description Cierra sesión Firebase y limpia contexto activo local.
 */
export async function logout() {
  await recordAuthEvent('logout');
  clearSavedContext();
  await signOut(getFirebaseRuntime().auth);
}

/**
 * @description Espera el primer estado de Firebase Auth cuando aún no hay usuario actual.
 */
export function getCurrentFirebaseUser(): Promise<FirebaseUser | null> {
  const auth = getFirebaseRuntime().auth;
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }
  return new Promise((resolve) => {
    let unsubscribe: () => void = () => {};
    let observerReady = false;
    let pendingUser: FirebaseUser | null | undefined;

    const complete = (user: FirebaseUser | null) => {
      unsubscribe();
      resolve(user);
    };

    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!observerReady) {
        pendingUser = user;
        return;
      }
      complete(user);
    });
    observerReady = true;

    if (pendingUser !== undefined) {
      complete(pendingUser);
    }
  });
}
