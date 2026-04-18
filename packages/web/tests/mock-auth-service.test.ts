/**
 * @package web
 * @name mock-auth-service.test.ts
 * @version 0.0.1
 * @description Verifica autenticación mock, lockout, persistencia de sesión e inserción de logs de login/logout.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  ROLE,
  clearMockAuthState,
  createMockAuthService,
  loadMockAuthState,
  loadMockDataset,
  MOCK_AUTH_ERROR_KIND,
  MOCK_AUTH_STORAGE_KEY,
  MOCK_STORAGE_KEY,
  saveMockDataset,
  canonicalMockSeedDataset,
  cloneMockDataset
} from '@/bom';
import { LOG_CATEGORIES } from '@shared';

describe('mock auth service', () => {
  beforeEach(() => {
    globalThis.localStorage.removeItem(MOCK_STORAGE_KEY);
    globalThis.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
    clearMockAuthState();
    saveMockDataset(cloneMockDataset(canonicalMockSeedDataset));
  });

  it('validates known credentials and returns available contexts', () => {
    const service = createMockAuthService();
    const result = service.validateCredentials('admin@example.test', 'Puintegra123!');

    expect(result.email).toBe('admin@example.test');
    expect(result.contexts.length).toBeGreaterThan(1);
  });

  it('rejects unknown emails', () => {
    const service = createMockAuthService();

    expect(() => service.validateCredentials('unknown@example.test', 'Puintegra123!')).toThrowError(/inválidos/i);
  });

  it('rejects missing granted permissions', () => {
    const service = createMockAuthService();
    const dataset = loadMockDataset();
    saveMockDataset({
      ...dataset,
      permissions: []
    });

    expect(() => service.validateCredentials('admin@example.test', 'Puintegra123!')).toThrowError(/permisos activos/i);
  });

  it('locks login after repeated failures', () => {
    const service = createMockAuthService();

    for (let index = 0; index < 4; index += 1) {
      expect(() => service.validateCredentials('admin@example.test', 'bad-password')).toThrow();
    }
    try {
      service.validateCredentials('admin@example.test', 'bad-password');
    } catch (error) {
      const payload = error as { kind?: string; remainingSeconds?: number };
      expect(payload.kind).toBe(MOCK_AUTH_ERROR_KIND.THROTHLED);
      expect(payload.remainingSeconds).toBeGreaterThan(0);
    }

    const lockedFor = service.getLockoutRemaining('admin@example.test');
    expect(lockedFor).toBeGreaterThan(0);
  });

  it('persists and hydrates selected session context', () => {
    const service = createMockAuthService();
    const login = service.validateCredentials('admin@example.test', 'Puintegra123!');
    const selected = login.contexts.find((context) => context.role === ROLE.INSTITUTION_ADMIN);
    if (!selected) {
      throw new Error('Expected institution admin context in seed data.');
    }

    service.establishSession(login, selected);
    const persisted = loadMockAuthState();
    expect(persisted.session?.activeRole).toBe(ROLE.INSTITUTION_ADMIN);

    const hydrated = service.hydrateSession();
    expect(hydrated?.activeRole).toBe(ROLE.INSTITUTION_ADMIN);
  });

  it('writes login and logout logs', () => {
    const service = createMockAuthService();
    const login = service.validateCredentials('admin@example.test', 'Puintegra123!');
    const selected = login.contexts[0];
    const beforeCount = loadMockDataset().logs.length;

    service.establishSession(login, selected);
    expect(loadMockDataset().logs.length).toBe(beforeCount + 1);
    expect(loadMockDataset().logs.at(-1)?.category).toBe(LOG_CATEGORIES.USER_ACCOUNT_LOGIN);

    service.logout();
    expect(loadMockDataset().logs.length).toBe(beforeCount + 2);
    expect(loadMockDataset().logs.at(-1)?.category).toBe(LOG_CATEGORIES.USER_ACCOUNT_LOGOUT);
    expect(loadMockAuthState().session).toBeNull();
  });
});
