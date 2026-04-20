import { describe, expect, it, vi } from 'vitest';
import { createApiApp } from '../src/http/createApiApp';

describe('auth event API routes', () => {
  it('rejects auth event writes without a bearer token', async () => {
    const app = createApiApp({
      verifyBearerToken: vi.fn(),
      recordAuthEvent: vi.fn(),
      createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id')
    });

    const response = await app.request('/api/auth/events/login', {
      method: 'POST'
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: 'API-AUTH-001',
        message: 'Missing bearer token.',
        uiMessageKey: 'api.auth.missing_bearer_token'
      },
      meta: {
        originTraceId: 'generated-trace-id'
      }
    });
  });

  it('records a verified login event', async () => {
    const recordAuthEvent = vi.fn().mockResolvedValue(undefined);
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test'
      }),
      recordAuthEvent,
      createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id')
    });

    const response = await app.request('/api/auth/events/login', {
      method: 'POST',
      headers: {
        authorization: 'Bearer id-token',
        'function-execution-id': 'execution-id-login'
      }
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      data: {
        recorded: true
      },
      meta: {
        originTraceId: 'execution-id-login'
      }
    });
    expect(recordAuthEvent).toHaveBeenCalledWith({
      event: 'login',
      originTraceId: 'execution-id-login',
      userId: 'dev-user-001',
      email: 'admin@example.test'
    });
  });

  it('records a verified logout event', async () => {
    const recordAuthEvent = vi.fn().mockResolvedValue(undefined);
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test'
      }),
      recordAuthEvent,
      createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id')
    });

    const response = await app.request('/api/auth/events/logout', {
      method: 'POST',
      headers: {
        authorization: 'Bearer id-token'
      }
    });

    expect(response.status).toBe(200);
    expect(recordAuthEvent).toHaveBeenCalledWith(expect.objectContaining({
      event: 'logout',
      originTraceId: 'generated-trace-id',
      userId: 'dev-user-001'
    }));
  });

  it('returns safe JSON when auth event recording fails', async () => {
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test'
      }),
      recordAuthEvent: vi.fn().mockRejectedValue(new Error('firestore unavailable')),
      createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id')
    });

    const response = await app.request('/api/auth/events/login', {
      method: 'POST',
      headers: {
        authorization: 'Bearer id-token'
      }
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: 'API-SYS-001',
        message: 'Unexpected API failure.',
        uiMessageKey: 'api.system.unexpected_failure'
      },
      meta: {
        originTraceId: 'generated-trace-id'
      }
    });
  });
});
