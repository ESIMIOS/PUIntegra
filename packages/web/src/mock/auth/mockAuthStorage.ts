/**
 * @package web
 * @name mockAuthStorage.ts
 * @version 0.0.1
 * @description Gestiona persistencia local del estado de autenticación mock y su política de bloqueo.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';
import { RoleSchema } from '@shared';
import { MOCK_AUTH_STORAGE_KEY } from '@/mock/constants/mockConfig';

const SessionContextSchema = z.object({
  role: RoleSchema,
  rfc: z.string().min(1)
});

export const MockAuthSessionSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  emojiIcon: z.string().min(1).nullable(),
  activeRole: RoleSchema,
  activeRfc: z.string().min(1),
  allowedInstitutionRfcs: z.array(z.string().min(1)),
  availableContexts: z.array(SessionContextSchema)
});

export const MockAuthStateSchema = z.object({
  session: MockAuthSessionSchema.nullable(),
  failedAttemptsByEmail: z.record(
    z.string().email(),
    z.object({
      attempts: z.number().int().nonnegative(),
      lockedUntil: z.number().int().nonnegative().nullable()
    })
  )
});

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type MockAuthState = z.infer<typeof MockAuthStateSchema>;

/**
 * @description Retorna estado base para sesión anónima sin intentos fallidos.
 */
function defaultAuthState(): MockAuthState {
  return {
    session: null,
    failedAttemptsByEmail: {}
  };
}

/**
 * @description Resuelve almacenamiento navegador o un storage inyectado para pruebas.
 */
function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage) {
    return storage;
  }
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }
  return globalThis.localStorage;
}

/**
 * @description Carga estado mock auth persistido con fallback seguro al estado vacío.
 */
export function loadMockAuthState(storage?: StorageLike | null): MockAuthState {
  const storageRef = resolveStorage(storage);
  if (!storageRef) {
    return defaultAuthState();
  }

  const raw = storageRef.getItem(MOCK_AUTH_STORAGE_KEY);
  if (!raw) {
    return defaultAuthState();
  }

  try {
    const parsed = JSON.parse(raw);
    const validated = MockAuthStateSchema.safeParse(parsed);
    if (!validated.success) {
      return defaultAuthState();
    }
    return validated.data;
  } catch {
    return defaultAuthState();
  }
}

/**
 * @description Valida y persiste el estado mock auth.
 */
export function saveMockAuthState(state: MockAuthState, storage?: StorageLike | null) {
  const storageRef = resolveStorage(storage);
  if (!storageRef) {
    return;
  }

  const validated = MockAuthStateSchema.safeParse(state);
  if (!validated.success) {
    throw new Error('Invalid mock auth state payload.');
  }

  storageRef.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(validated.data));
}

/**
 * @description Elimina el estado mock auth persistido.
 */
export function clearMockAuthState(storage?: StorageLike | null) {
  const storageRef = resolveStorage(storage);
  if (!storageRef) {
    return;
  }
  storageRef.removeItem(MOCK_AUTH_STORAGE_KEY);
}
