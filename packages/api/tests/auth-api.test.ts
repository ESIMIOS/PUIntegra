import { describe, expect, it, vi } from 'vitest';
import { createApiApp } from '../src/http/createApiApp';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  ROLE,
  SYSTEM_RFC,
  roleValues,
  HTTP_STATUS,
} from '@puintegra/shared';

describe('auth event API routes', () => {
  it('rejects auth event writes without a bearer token', async () => {
    const app = createApiApp({
      verifyBearerToken: vi.fn(),
      recordAuthEvent: vi.fn(),
      createInstitutionOnboarding: vi.fn(),
      createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id'),
    });

    const response = await app.request('/api/auth/events/login', {
      method: 'POST',
    });

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: 'API-AUTH-001',
        message: 'Missing bearer token.',
        uiMessageKey: 'api.auth.missing_bearer_token',
        displayMessage: 'Tu sesión no está autenticada. Inicia sesión y vuelve a intentarlo.',
      },
      meta: {
        originTraceId: 'generated-trace-id',
      },
    });
  });

  it('records a verified login event', async () => {
    const recordAuthEvent = vi.fn().mockResolvedValue(undefined);
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent,
      createInstitutionOnboarding: vi.fn(),
      createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id'),
    });

    const response = await app.request('/api/auth/events/login', {
      method: 'POST',
      headers: {
        authorization: 'Bearer id-token',
        'function-execution-id': 'execution-id-login',
      },
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(await response.json()).toEqual({
      ok: true,
      data: {
        recorded: true,
      },
      meta: {
        originTraceId: 'execution-id-login',
      },
    });
    expect(recordAuthEvent).toHaveBeenCalledWith({
      event: 'login',
      originTraceId: 'execution-id-login',
      userId: 'dev-user-001',
      email: 'admin@example.test',
    });
  });

  it('records a verified logout event', async () => {
    const recordAuthEvent = vi.fn().mockResolvedValue(undefined);
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent,
      createInstitutionOnboarding: vi.fn(),
      createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id'),
    });

    const response = await app.request('/api/auth/events/logout', {
      method: 'POST',
      headers: {
        authorization: 'Bearer id-token',
      },
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'logout',
        originTraceId: 'generated-trace-id',
        userId: 'dev-user-001',
      }),
    );
  });

  it('returns safe JSON when auth event recording fails', async () => {
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent: vi.fn().mockRejectedValue(new Error('firestore unavailable')),
      createInstitutionOnboarding: vi.fn(),
      createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id'),
    });

    const response = await app.request('/api/auth/events/login', {
      method: 'POST',
      headers: {
        authorization: 'Bearer id-token',
      },
    });

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: 'API-SYS-001',
        message: 'Unexpected API failure.',
        uiMessageKey: 'api.sys.unexpected_failure',
      },
      meta: {
        originTraceId: 'generated-trace-id',
      },
    });
  });
});

describe('admin institution onboarding API route', () => {
  const validPayload = {
    RFC: 'AAA010101AAA',
    name: 'Institucion Uno',
    plan: COMMERCIAL_PLAN.PORTAL,
    planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
    planStartAt: 1710000000000,
    planFinishAt: 1710000000100,
    adminEmail: 'owner@example.test',
  };

  it('accepts onboarding only for SYSTEM_ADMINISTRATOR', async () => {
    const createInstitutionOnboarding = vi.fn().mockResolvedValue({
      institution: { RFC: 'AAA010101AAA' },
      permission: { permissionId: 'perm-001' },
    });

    for (const role of roleValues) {
      const app = createApiApp({
        verifyBearerToken: vi.fn().mockResolvedValue({
          userId: 'dev-user-001',
          email: 'admin@example.test',
          role,
        }),
        recordAuthEvent: vi.fn(),
        createInstitutionOnboarding,
        createOriginTraceId: vi.fn().mockReturnValue('trace-role-check'),
      });

      const response = await app.request('/api/admin/institutions', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify(validPayload),
      });

      if (role === ROLE.SYSTEM_ADMINISTRATOR) {
        expect(response.status).toBe(HTTP_STATUS.CREATED);
      } else {
        expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
      }
    }
  });

  it('accepts onboarding route without /api prefix for functions-mounted path', async () => {
    const createInstitutionOnboarding = vi.fn().mockResolvedValue({
      institution: { RFC: 'AAA010101AAA' },
      permission: { permissionId: 'perm-001' },
    });
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent: vi.fn(),
      createInstitutionOnboarding,
      createOriginTraceId: vi.fn().mockReturnValue('trace-no-api-prefix'),
    });

    const response = await app.request('/admin/institutions', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify(validPayload),
    });

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(createInstitutionOnboarding).toHaveBeenCalledOnce();
  });

  it('rejects SYSTEM_RFC payload', async () => {
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent: vi.fn(),
      createInstitutionOnboarding: vi.fn(),
      createOriginTraceId: vi.fn().mockReturnValue('trace-reserved-system'),
    });

    const response = await app.request('/api/admin/institutions', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({
        ...validPayload,
        RFC: SYSTEM_RFC,
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: 'API-ADMIN-004',
        message: 'SYSTEM_RFC cannot be used as a tenant institution RFC.',
        uiMessageKey: 'api.admin.institutions.invalid_system_rfc',
        displayMessage: 'SYSTEM_RFC es un RFC reservado y no puede usarse para una institución.',
      },
      meta: {
        originTraceId: 'trace-reserved-system',
      },
    });
  });

  it('rejects DEFAULT_RFC payload', async () => {
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent: vi.fn(),
      createInstitutionOnboarding: vi.fn(),
      createOriginTraceId: vi.fn().mockReturnValue('trace-reserved-default'),
    });

    const response = await app.request('/api/admin/institutions', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({
        ...validPayload,
        RFC: DEFAULT_RFC,
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: 'API-ADMIN-005',
        message: 'DEFAULT_RFC cannot be reused for tenant institution onboarding.',
        uiMessageKey: 'api.admin.institutions.invalid_default_rfc',
        displayMessage: 'DEFAULT_RFC es un RFC reservado y no puede usarse para una institución.',
      },
      meta: {
        originTraceId: 'trace-reserved-default',
      },
    });
  });
});
