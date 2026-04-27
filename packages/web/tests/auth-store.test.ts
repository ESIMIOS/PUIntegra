/**
 * @package web
 * @name auth-store.test.ts
 * @version 0.0.1
 * @description Verifica precondiciones y normalización de errores en el store de autenticación.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-26)	Cubre establishSession sin login pendiente con SystemError estándar.	@codex
 */

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_RFC, ROLE, SystemError, sharedSystemMessages } from '@shared';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/gateways/firebaseAuthGateway', async () => {
  const actual = await vi.importActual<typeof import('@/gateways/firebaseAuthGateway')>(
    '@/gateways/firebaseAuthGateway',
  );
  return {
    ...actual,
    establishSession: vi.fn(),
  };
});

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('throws SystemError when establishing a session without pending login', async () => {
    const authStore = useAuthStore();

    await expect(authStore.establishSession({ role: ROLE.INSTITUTION_ADMIN, rfc: DEFAULT_RFC })).rejects.toMatchObject({
      code: sharedSystemMessages.auth.login.invalidContext.code,
      displayMessage: sharedSystemMessages.auth.login.invalidContext.message,
    } satisfies Partial<SystemError>);
  });
});
