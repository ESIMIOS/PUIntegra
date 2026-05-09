import { describe, expect, it, vi } from 'vitest';
import { createApiApp } from '../src/http/createApiApp';
import {
  API_THROTTLE_DIMENSION,
  API_THROTTLE_ENDPOINT,
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  HTTP_STATUS,
  ROLE,
} from '@puintegra/shared';

function createDependencies(overrides: Partial<Parameters<typeof createApiApp>[0]> = {}) {
  return {
    enforceThrottle: vi.fn().mockResolvedValue(undefined),
    verifyBearerToken: vi.fn().mockResolvedValue({
      userId: 'actor-user-001',
      email: 'admin@example.test',
      role: ROLE.SYSTEM_ADMINISTRATOR,
    }),
    recordAuthEvent: vi.fn().mockResolvedValue(undefined),
    checkAccountCreationPolicy: vi.fn().mockResolvedValue({ eligible: true }),
    requestPasswordRecovery: vi.fn().mockResolvedValue({ accepted: true }),
    recordAuthLifecycleEvent: vi.fn().mockResolvedValue({ recorded: true }),
    resetUserMfa: vi.fn().mockResolvedValue({ reset: true }),
    createInstitutionOnboarding: vi.fn().mockResolvedValue({ institution: { RFC: 'AAA010101AAA' } }),
    updateInstitutionPlan: vi.fn().mockResolvedValue({ institution: { RFC: 'AAA010101AAA' } }),
    upsertInstitutionContact: vi.fn().mockResolvedValue({ contact: { contactId: 'contact-001' } }),
    updateInstitutionSharedSecret: vi.fn().mockResolvedValue({ updatedAt: 1710000000000 }),
    createInstitutionPermission: vi.fn().mockResolvedValue({ permission: { permissionId: 'perm-001' } }),
    updateInstitutionPermission: vi.fn().mockResolvedValue({ permission: { permissionId: 'perm-001' } }),
    updateAccountProfile: vi.fn().mockResolvedValue({ userId: 'actor-user-001' }),
    createOriginTraceId: vi.fn().mockReturnValue('trace-id'),
    ...overrides,
  } as Parameters<typeof createApiApp>[0];
}

describe('api throttle route wiring', () => {
  it('maps login subjects to simple ip and user dimensions', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/auth/events/login', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'x-forwarded-for': '203.0.113.5',
      },
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGIN,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=203.0.113.5',
          subject: { ip: '203.0.113.5' },
        },
        [API_THROTTLE_DIMENSION.USER]: {
          subjectKey: 'user=actor-user-001',
          subject: { user: 'actor-user-001' },
        },
      },
    });
  });

  it('maps password recovery subjects to simple ip and email dimensions', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/auth/lifecycle/password-recovery', {
      method: 'POST',
      headers: { 'x-real-ip': '10.0.0.25' }, //NOSONAR - No es una revelación de credenciales, es solo un valor para pruebas.
      body: JSON.stringify({ email: 'Owner@Example.TEST' }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=10.0.0.25',
          subject: { ip: '10.0.0.25' }, //NOSONAR - No es una revelación de credenciales, es solo un valor para pruebas.
        },
        [API_THROTTLE_DIMENSION.EMAIL]: {
          subjectKey: 'email=owner_at_example.test',
          subject: { email: 'owner@example.test' },
        },
      },
    });
  });

  it('applies only the simple lifecycle subjects present on the request', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/auth/lifecycle/password-reset-completed', {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.40' },
      body: JSON.stringify({ email: 'owner@example.test' }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RESET_COMPLETED,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=198.51.100.40',
          subject: { ip: '198.51.100.40' },
        },
        [API_THROTTLE_DIMENSION.EMAIL]: {
          subjectKey: 'email=owner_at_example.test',
          subject: { email: 'owner@example.test' },
        },
      },
    });
  });

  it('reads client ip from the Forwarded header when proxy-specific headers are absent', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/auth/lifecycle/account-creation-policy', {
      method: 'POST',
      headers: { forwarded: 'for=198.51.100.44;proto=https' },
      body: JSON.stringify({ email: 'owner@example.test' }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_ACCOUNT_CREATION_POLICY,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=198.51.100.44',
          subject: { ip: '198.51.100.44' },
        },
        [API_THROTTLE_DIMENSION.EMAIL]: {
          subjectKey: 'email=owner_at_example.test',
          subject: { email: 'owner@example.test' },
        },
      },
    });
  });

  it('preserves plain IPv6 addresses from proxy headers', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/auth/lifecycle/password-recovery', {
      method: 'POST',
      headers: { 'x-real-ip': '2001:db8::1' },
      body: JSON.stringify({ email: 'owner@example.test' }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=2001:db8::1',
          subject: { ip: '2001:db8::1' },
        },
        [API_THROTTLE_DIMENSION.EMAIL]: {
          subjectKey: 'email=owner_at_example.test',
          subject: { email: 'owner@example.test' },
        },
      },
    });
  });

  it('preserves bracketed IPv6 addresses from the Forwarded header without the port', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/auth/lifecycle/account-creation-policy', {
      method: 'POST',
      headers: { forwarded: 'for="[2001:db8::1]:443";proto=https' },
      body: JSON.stringify({ email: 'owner@example.test' }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_ACCOUNT_CREATION_POLICY,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=2001:db8::1',
          subject: { ip: '2001:db8::1' },
        },
        [API_THROTTLE_DIMENSION.EMAIL]: {
          subjectKey: 'email=owner_at_example.test',
          subject: { email: 'owner@example.test' },
        },
      },
    });
  });

  it('falls back to localhost when no client address headers are available in local app requests', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/auth/lifecycle/account-creation-policy', {
      method: 'POST',
      body: JSON.stringify({ email: 'owner@example.test' }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_ACCOUNT_CREATION_POLICY,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=127.0.0.1',
          subject: { ip: '127.0.0.1' },
        },
        [API_THROTTLE_DIMENSION.EMAIL]: {
          subjectKey: 'email=owner_at_example.test',
          subject: { email: 'owner@example.test' },
        },
      },
    });
  });

  it('maps MFA reset subjects to simple actor and target dimensions', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/admin/users/dev-user-009/mfa-reset', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'x-forwarded-for': '203.0.113.44',
      },
      body: JSON.stringify({
        verificationNote: 'Identity confirmed by support desk.',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_ADMIN_MFA_RESET,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=203.0.113.44',
          subject: { ip: '203.0.113.44' },
        },
        [API_THROTTLE_DIMENSION.USER]: {
          subjectKey: 'user=actor-user-001',
          subject: { user: 'actor-user-001' },
        },
        [API_THROTTLE_DIMENSION.TARGET_USER]: {
          subjectKey: 'targetUser=dev-user-009',
          subject: { targetUser: 'dev-user-009' },
        },
      },
    });
  });

  it('maps institution plan update subjects to simple actor and rfc dimensions', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/admin/institutions/aaa010101aaa/plan', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer token',
        'x-real-ip': '203.0.113.9',
      },
      body: JSON.stringify({
        plan: COMMERCIAL_PLAN.CLOUD,
        planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
        planStartAt: 1710000000200,
        planFinishAt: 1710000000300,
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.ADMIN_INSTITUTIONS_PLAN_UPDATE,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=203.0.113.9',
          subject: { ip: '203.0.113.9' },
        },
        [API_THROTTLE_DIMENSION.USER]: {
          subjectKey: 'user=actor-user-001',
          subject: { user: 'actor-user-001' },
        },
        [API_THROTTLE_DIMENSION.RFC]: {
          subjectKey: 'rfc=aaa010101aaa',
          subject: { rfc: 'aaa010101aaa' },
        },
      },
    });
  });

  it('maps app contact upsert subjects to simple actor, rfc, and contact type dimensions', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/app/institutions/aaa010101aaa/contacts/legal', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer token',
        'x-real-ip': '203.0.113.77',
      },
      body: JSON.stringify({ name: 'Legal', phone: '+525500000001', contactCURP: 'AAAA000000HDFXXX00' }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.APP_INSTITUTIONS_CONTACTS_UPSERT,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=203.0.113.77',
          subject: { ip: '203.0.113.77' },
        },
        [API_THROTTLE_DIMENSION.USER]: {
          subjectKey: 'user=actor-user-001',
          subject: { user: 'actor-user-001' },
        },
        [API_THROTTLE_DIMENSION.RFC]: {
          subjectKey: 'rfc=aaa010101aaa',
          subject: { rfc: 'aaa010101aaa' },
        },
        [API_THROTTLE_DIMENSION.CONTACT_TYPE]: {
          subjectKey: 'contactType=LEGAL',
          subject: { contactType: 'LEGAL' },
        },
      },
    });
  });

  it('maps permission create subjects with normalized target email', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/app/institutions/aaa010101aaa/permissions', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'x-real-ip': '198.51.100.14',
      },
      body: JSON.stringify({
        email: ' NewUser@Example.TEST ',
        role: ROLE.INSTITUTION_OPERATOR,
        status: 'GRANTED',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.APP_INSTITUTIONS_PERMISSIONS_CREATE,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=198.51.100.14',
          subject: { ip: '198.51.100.14' },
        },
        [API_THROTTLE_DIMENSION.USER]: {
          subjectKey: 'user=actor-user-001',
          subject: { user: 'actor-user-001' },
        },
        [API_THROTTLE_DIMENSION.RFC]: {
          subjectKey: 'rfc=aaa010101aaa',
          subject: { rfc: 'aaa010101aaa' },
        },
        [API_THROTTLE_DIMENSION.TARGET_EMAIL]: {
          subjectKey: 'targetEmail=newuser_at_example.test',
          subject: { targetEmail: 'newuser@example.test' },
        },
      },
    });
  });

  it('maps permission update subjects with permissionId', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/app/institutions/aaa010101aaa/permissions/perm-777', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer token',
        'x-forwarded-for': '198.51.100.15',
      },
      body: JSON.stringify({
        role: ROLE.INSTITUTION_ADMIN,
        status: 'GRANTED',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.APP_INSTITUTIONS_PERMISSIONS_UPDATE,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=198.51.100.15',
          subject: { ip: '198.51.100.15' },
        },
        [API_THROTTLE_DIMENSION.USER]: {
          subjectKey: 'user=actor-user-001',
          subject: { user: 'actor-user-001' },
        },
        [API_THROTTLE_DIMENSION.RFC]: {
          subjectKey: 'rfc=aaa010101aaa',
          subject: { rfc: 'aaa010101aaa' },
        },
        [API_THROTTLE_DIMENSION.PERMISSION]: {
          subjectKey: 'permissionId=perm-777',
          subject: { permissionId: 'perm-777' },
        },
      },
    });
  });

  it('maps account profile update subjects to simple ip and user dimensions', async () => {
    const dependencies = createDependencies();
    const app = createApiApp(dependencies);

    const response = await app.request('/api/account/profile', {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer token',
        'x-real-ip': '192.0.2.80',
      },
      body: JSON.stringify({
        name: 'Ana Operadora',
        emojiIcon: ':)',
        phone: '+525500000002',
      }),
    });

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(dependencies.enforceThrottle).toHaveBeenCalledWith({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_ACCOUNT_PROFILE_UPDATE,
      originTraceId: 'trace-id',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: {
          subjectKey: 'ip=192.0.2.80',
          subject: { ip: '192.0.2.80' },
        },
        [API_THROTTLE_DIMENSION.USER]: {
          subjectKey: 'user=actor-user-001',
          subject: { user: 'actor-user-001' },
        },
      },
    });
  });
});
