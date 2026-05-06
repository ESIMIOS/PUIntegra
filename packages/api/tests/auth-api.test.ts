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
  SystemError,
} from '@puintegra/shared';
import { apiSystemMessages } from '../src/constants/systemMessages';

vi.mock('firebase-functions/v2', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createDefaultDependencies(overrides: Partial<Parameters<typeof createApiApp>[0]> = {}) {
  return {
    verifyBearerToken: vi.fn(),
    recordAuthEvent: vi.fn(),
    createInstitutionOnboarding: vi.fn(),
    createOriginTraceId: vi.fn().mockReturnValue('generated-trace-id'),
    ...overrides,
  } as Parameters<typeof createApiApp>[0];
}

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
      role: ROLE.SYSTEM_ADMINISTRATOR,
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
        role: ROLE.SYSTEM_ADMINISTRATOR,
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

    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: 'API-ADMIN-011',
        message: 'Operations on SYSTEM_RFC institution are not allowed.',
        uiMessageKey: 'api.admin.institutions.forbidden_operation_on_system_rfc',
        displayMessage: 'No se permiten operaciones sobre la institución SYSTEM_RFC.',
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

    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await response.json()).toEqual({
      ok: false,
      error: {
        code: 'API-ADMIN-010',
        message: 'Operations on DEFAULT_RFC institution are not allowed.',
        uiMessageKey: 'api.admin.institutions.forbidden_operation_on_default_rfc',
        displayMessage: 'No se permiten operaciones sobre la institución DEFAULT_RFC.',
      },
      meta: {
        originTraceId: 'trace-reserved-default',
      },
    });
  });
});

describe('admin institution plan API route', () => {
  const validPayload = {
    plan: COMMERCIAL_PLAN.CLOUD,
    planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
    planStartAt: 1710000000200,
    planFinishAt: 1710000000300,
  };

  it('accepts plan updates only for SYSTEM_ADMINISTRATOR', async () => {
    const updateInstitutionPlan = vi.fn().mockResolvedValue({
      institution: { RFC: 'AAA010101AAA' },
    });

    for (const role of roleValues) {
      const app = createApiApp({
        verifyBearerToken: vi.fn().mockResolvedValue({
          userId: 'dev-user-001',
          email: 'admin@example.test',
          role,
        }),
        recordAuthEvent: vi.fn(),
        createInstitutionOnboarding: vi.fn(),
        updateInstitutionPlan,
        createOriginTraceId: vi.fn().mockReturnValue('trace-plan-role-check'),
      });

      const response = await app.request('/api/admin/institutions/AAA010101AAA/plan', {
        method: 'PATCH',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify(validPayload),
      });

      if (role === ROLE.SYSTEM_ADMINISTRATOR) {
        expect(response.status).toBe(HTTP_STATUS.OK);
      } else {
        expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
      }
    }
  });

  it('rejects invalid plan update payloads', async () => {
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent: vi.fn(),
      createInstitutionOnboarding: vi.fn(),
      updateInstitutionPlan: vi.fn(),
      createOriginTraceId: vi.fn().mockReturnValue('trace-invalid-plan'),
    });

    const response = await app.request('/api/admin/institutions/AAA010101AAA/plan', {
      method: 'PATCH',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({
        ...validPayload,
        planStartAt: 1710000000300,
        planFinishAt: 1710000000200,
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: 'API-ADMIN-001',
        uiMessageKey: 'api.admin.institutions.invalid_payload',
      },
    });
  });

  it('passes normalized plan update input to the write dependency', async () => {
    const updateInstitutionPlan = vi.fn().mockResolvedValue({
      institution: { RFC: 'AAA010101AAA' },
    });
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent: vi.fn(),
      createInstitutionOnboarding: vi.fn(),
      updateInstitutionPlan,
      createOriginTraceId: vi.fn().mockReturnValue('trace-plan-success'),
    });

    const response = await app.request('/api/admin/institutions/aaa010101aaa/plan', {
      method: 'PATCH',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify(validPayload),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(updateInstitutionPlan).toHaveBeenCalledWith({
      rfc: 'AAA010101AAA',
      payload: validPayload,
      actor: {
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      },
      originTraceId: 'trace-plan-success',
    });
  });

  it('returns not found when the tenant institution does not exist', async () => {
    const app = createApiApp({
      verifyBearerToken: vi.fn().mockResolvedValue({
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      }),
      recordAuthEvent: vi.fn(),
      createInstitutionOnboarding: vi.fn(),
      updateInstitutionPlan: vi
        .fn()
        .mockRejectedValue(new SystemError(apiSystemMessages.admin.institutions.institutionNotFound)),
      createOriginTraceId: vi.fn().mockReturnValue('trace-plan-missing'),
    });

    const response = await app.request('/api/admin/institutions/AAA010101AAA/plan', {
      method: 'PATCH',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify(validPayload),
    });

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: 'API-ADMIN-009',
        uiMessageKey: 'api.admin.institutions.institution_not_found',
      },
    });
  });
});

describe('auth lifecycle API routes', () => {
  it('checks account creation eligibility with normalized email', async () => {
    const checkAccountCreationPolicy = vi.fn().mockResolvedValue({ eligible: true });
    const app = createApiApp(createDefaultDependencies({ checkAccountCreationPolicy }));

    const response = await app.request('/api/auth/lifecycle/account-creation-policy', {
      method: 'POST',
      body: JSON.stringify({ email: ' Owner@Example.TEST ' }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(await response.json()).toMatchObject({
      ok: true,
      data: { eligible: true },
    });
    expect(checkAccountCreationPolicy).toHaveBeenCalledWith({
      email: 'owner@example.test',
      originTraceId: 'generated-trace-id',
      requestKey: expect.any(String),
    });
  });

  it('returns safe conflict responses for ineligible account creation', async () => {
    const app = createApiApp(
      createDefaultDependencies({
        checkAccountCreationPolicy: vi
          .fn()
          .mockRejectedValue(new SystemError(apiSystemMessages.auth.lifecycle.accountCreationUnavailable)),
      }),
    );

    const response = await app.request('/api/auth/lifecycle/account-creation-policy', {
      method: 'POST',
      body: JSON.stringify({ email: 'missing@example.test' }),
    });

    expect(response.status).toBe(HTTP_STATUS.CONFLICT);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: 'API-AUTH-010',
        uiMessageKey: 'api.auth.lifecycle.account_creation_unavailable',
      },
    });
  });

  it('accepts password recovery with neutral copy and sanitized payload', async () => {
    const requestPasswordRecovery = vi.fn().mockResolvedValue({ accepted: true });
    const app = createApiApp(createDefaultDependencies({ requestPasswordRecovery }));

    const response = await app.request('/api/auth/lifecycle/password-recovery', {
      method: 'POST',
      body: JSON.stringify({
        email: 'Owner@Example.TEST',
        password: 'Never log this',
        oobCode: 'secret-code',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(await response.json()).toEqual({
      ok: true,
      data: {
        accepted: true,
        message: 'Si la cuenta existe, enviaremos instrucciones al correo indicado.',
      },
      meta: {
        originTraceId: 'generated-trace-id',
      },
    });
    expect(requestPasswordRecovery).toHaveBeenCalledWith({
      email: 'owner@example.test',
      originTraceId: 'generated-trace-id',
      requestKey: expect.any(String),
    });
    expect(JSON.stringify(requestPasswordRecovery.mock.calls)).not.toContain('Never log this');
    expect(JSON.stringify(requestPasswordRecovery.mock.calls)).not.toContain('secret-code');
  });

  it('rate-limits password recovery safely', async () => {
    const app = createApiApp(
      createDefaultDependencies({
        requestPasswordRecovery: vi
          .fn()
          .mockRejectedValue(new SystemError(apiSystemMessages.auth.lifecycle.rateLimited)),
      }),
    );

    const response = await app.request('/api/auth/lifecycle/password-recovery', {
      method: 'POST',
      body: JSON.stringify({ email: 'owner@example.test' }),
    });

    expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_CONTENT);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: 'API-AUTH-011',
        displayMessage: 'Recibimos demasiados intentos. Espera unos minutos antes de volver a intentar.',
      },
    });
  });

  it('records completed password, email, and MFA lifecycle events without secrets', async () => {
    const recordAuthLifecycleEvent = vi.fn().mockResolvedValue({ recorded: true });
    const app = createApiApp(createDefaultDependencies({ recordAuthLifecycleEvent }));

    const response = await app.request('/api/auth/lifecycle/password-reset-completed', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'dev-user-001',
        email: 'owner@example.test',
        password: 'Do not log',
        actionUrl: 'https://example.test/action?oobCode=secret',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(recordAuthLifecycleEvent).toHaveBeenCalledWith({
      event: 'password-update',
      originTraceId: 'generated-trace-id',
      userId: 'dev-user-001',
      email: 'owner@example.test',
    });
    expect(JSON.stringify(recordAuthLifecycleEvent.mock.calls)).not.toContain('Do not log');
    expect(JSON.stringify(recordAuthLifecycleEvent.mock.calls)).not.toContain('oobCode');
  });

  it('allows only system administrators to reset lost MFA access', async () => {
    const resetUserMfa = vi.fn().mockResolvedValue({ reset: true });

    for (const role of roleValues) {
      const app = createApiApp(
        createDefaultDependencies({
          verifyBearerToken: vi.fn().mockResolvedValue({
            userId: 'admin-user-001',
            email: 'admin@example.test',
            role,
          }),
          resetUserMfa,
        }),
      );

      const response = await app.request('/api/admin/users/dev-user-001/mfa-reset', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({
          verificationNote: 'Identidad verificada por mesa de ayuda.',
        }),
      });

      if (role === ROLE.SYSTEM_ADMINISTRATOR) {
        expect(response.status).toBe(HTTP_STATUS.OK);
      } else {
        expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
      }
    }
    expect(resetUserMfa).toHaveBeenCalledWith({
      userId: 'dev-user-001',
      verificationNote: 'Identidad verificada por mesa de ayuda.',
      actor: {
        userId: 'admin-user-001',
        email: 'admin@example.test',
        role: ROLE.SYSTEM_ADMINISTRATOR,
      },
      originTraceId: 'generated-trace-id',
    });
  });
});

describe('app admin institution API routes', () => {
  it('requires bearer token for app-admin write routes', async () => {
    const app = createApiApp(createDefaultDependencies());

    const response = await app.request('/api/app/institutions/AAA010101AAA/shared-secret', {
      method: 'PUT',
      body: JSON.stringify({ sharedSecret: 'top-secret' }),
    });

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: 'API-AUTH-001',
      },
    });
  });

  it('rejects reserved RFC values in app-admin write routes', async () => {
    const app = createApiApp(
      createDefaultDependencies({
        verifyBearerToken: vi.fn().mockResolvedValue({
          userId: 'dev-user-001',
          email: 'admin@example.test',
          role: ROLE.INSTITUTION_ADMIN,
        }),
        updateInstitutionSharedSecret: vi.fn(),
      }),
    );

    const response = await app.request(`/api/app/institutions/${DEFAULT_RFC}/shared-secret`, {
      method: 'PUT',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({ sharedSecret: 'top-secret' }),
    });

    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: 'API-ADMIN-010',
      },
    });
  });

  it('submits contact upsert using normalized route params and actor context', async () => {
    const upsertInstitutionContact = vi.fn().mockResolvedValue({
      contact: { type: 'LEGAL' },
    });
    const app = createApiApp(
      createDefaultDependencies({
        verifyBearerToken: vi.fn().mockResolvedValue({
          userId: 'dev-user-001',
          email: 'admin@example.test',
          role: ROLE.INSTITUTION_ADMIN,
        }),
        upsertInstitutionContact,
      }),
    );

    const payload = {
      name: 'Contacto Legal',
      phone: '+525533748806',
      contactCURP: 'MART810609HDFRYR03',
      efirmaCertificate: 'CERT',
    };
    const response = await app.request('/api/app/institutions/aaa010101aaa/contacts/legal', {
      method: 'PUT',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(upsertInstitutionContact).toHaveBeenCalledWith({
      rfc: 'AAA010101AAA',
      contactType: 'LEGAL',
      payload,
      actor: {
        userId: 'dev-user-001',
        email: 'admin@example.test',
        role: ROLE.INSTITUTION_ADMIN,
      },
      originTraceId: 'generated-trace-id',
    });
  });

  it('supports permissions create/update and shared-secret writes through the API boundary', async () => {
    const createInstitutionPermission = vi.fn().mockResolvedValue({ permission: { permissionId: 'perm-001' } });
    const updateInstitutionPermission = vi.fn().mockResolvedValue({ permission: { permissionId: 'perm-001' } });
    const updateInstitutionSharedSecret = vi.fn().mockResolvedValue({
      sharedSecretConfigured: true,
      SHA256SharedSecret: 'deadbeef',
    });
    const app = createApiApp(
      createDefaultDependencies({
        verifyBearerToken: vi.fn().mockResolvedValue({
          userId: 'dev-user-001',
          email: 'admin@example.test',
          role: ROLE.INSTITUTION_ADMIN,
        }),
        createInstitutionPermission,
        updateInstitutionPermission,
        updateInstitutionSharedSecret,
      }),
    );

    const createResponse = await app.request('/api/app/institutions/AAA010101AAA/permissions', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({
        email: 'new-user@example.test',
        role: ROLE.INSTITUTION_OPERATOR,
        status: 'GRANTED',
      }),
    });
    expect(createResponse.status).toBe(HTTP_STATUS.OK);

    const updateResponse = await app.request('/api/app/institutions/AAA010101AAA/permissions/perm-001', {
      method: 'PATCH',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({
        role: ROLE.INSTITUTION_ADMIN,
        status: 'DENIED',
      }),
    });
    expect(updateResponse.status).toBe(HTTP_STATUS.OK);

    const secretResponse = await app.request('/api/app/institutions/AAA010101AAA/shared-secret', {
      method: 'PUT',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({
        sharedSecret: 'top-secret',
      }),
    });
    expect(secretResponse.status).toBe(HTTP_STATUS.OK);

    expect(createInstitutionPermission).toHaveBeenCalledOnce();
    expect(updateInstitutionPermission).toHaveBeenCalledOnce();
    expect(updateInstitutionSharedSecret).toHaveBeenCalledOnce();
  });

  it('returns dedicated app-admin forbidden code when RFC-scoped admin permission is missing', async () => {
    const app = createApiApp(
      createDefaultDependencies({
        verifyBearerToken: vi.fn().mockResolvedValue({
          userId: 'dev-user-001',
          email: 'admin@example.test',
          role: ROLE.SYSTEM_ADMINISTRATOR,
        }),
        upsertInstitutionContact: vi
          .fn()
          .mockRejectedValue(new SystemError(apiSystemMessages.app.institutions.missingInstitutionAdminPermission)),
      }),
    );

    const response = await app.request('/api/app/institutions/AAA010101AAA/contacts/LEGAL', {
      method: 'PUT',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({
        name: 'Contacto Legal',
        phone: '+525533748806',
        contactCURP: 'MART810609HDFRYR03',
        efirmaCertificate: 'CERT',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: 'API-APP-002',
      },
    });
  });
});

describe('account profile API route', () => {
  it('requires bearer token for self profile updates', async () => {
    const app = createApiApp(createDefaultDependencies());

    const response = await app.request('/api/account/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Nombre Nuevo',
        emojiIcon: '😀',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: 'API-AUTH-001',
      },
    });
  });

  it('validates payload before calling account profile update dependency', async () => {
    const updateAccountProfile = vi.fn();
    const app = createApiApp(
      createDefaultDependencies({
        verifyBearerToken: vi.fn().mockResolvedValue({
          userId: 'dev-user-001',
          email: 'owner@example.test',
          role: ROLE.INSTITUTION_ADMIN,
        }),
        updateAccountProfile,
      }),
    );

    const response = await app.request('/api/account/profile', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer token',
      },
      body: JSON.stringify({
        name: ' ',
        emojiIcon: '',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(updateAccountProfile).not.toHaveBeenCalled();
  });

  it('passes normalized actor and payload to account profile update dependency', async () => {
    const updateAccountProfile = vi.fn().mockResolvedValue({
      userId: 'dev-user-001',
      email: 'owner@example.test',
      name: 'Nombre Nuevo',
      emojiIcon: '😎',
      phone: '+525500000001',
      updatedAt: 1710000000000,
    });
    const app = createApiApp(
      createDefaultDependencies({
        verifyBearerToken: vi.fn().mockResolvedValue({
          userId: 'dev-user-001',
          email: 'owner@example.test',
          role: ROLE.INSTITUTION_OPERATOR,
        }),
        updateAccountProfile,
      }),
    );

    const response = await app.request('/api/account/profile', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer token',
      },
      body: JSON.stringify({
        name: '  Nombre Nuevo  ',
        emojiIcon: '😎',
        phone: ' +52 55 0000 0001 ',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(updateAccountProfile).toHaveBeenCalledWith({
      actor: {
        userId: 'dev-user-001',
        email: 'owner@example.test',
        role: ROLE.INSTITUTION_OPERATOR,
      },
      originTraceId: 'generated-trace-id',
      payload: {
        name: 'Nombre Nuevo',
        emojiIcon: '😎',
        phone: '+52 55 0000 0001',
      },
    });
    expect(await response.json()).toMatchObject({
      ok: true,
      data: {
        name: 'Nombre Nuevo',
      },
    });
  });
});
