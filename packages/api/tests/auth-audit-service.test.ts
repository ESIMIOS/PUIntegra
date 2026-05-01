import {
  LOG_CATEGORIES,
  LOG_ORIGIN,
  LogSchema,
  UserSchema
} from '@puintegra/shared';
import { describe, expect, it } from 'vitest';
import {
  buildAuthEventLog,
  buildUserAccountLifecycleLog,
  buildUserCreatedLog,
  buildUserProfileFromAuthUser
} from '../src/services/authAuditService';

describe('auth audit service', () => {
  it('builds the Firestore user profile from a Firebase Auth user', () => {
    const profile = buildUserProfileFromAuthUser({
      uid: 'dev-user-001',
      email: 'admin@example.test',
      displayName: 'Usuario Firebase',
      phoneNumber: '+525500000000'
    }, 1710000000000);

    expect(UserSchema.parse(profile)).toMatchObject({
      userId: 'dev-user-001',
      email: 'admin@example.test',
      name: 'Usuario Firebase',
      phone: '+525500000000',
      createdAt: 1710000000000,
      updatedAt: 1710000000000
    });
  });

  it('omits optional Firestore fields when Firebase Auth does not provide them', () => {
    const profile = buildUserProfileFromAuthUser({
      uid: 'dev-user-001',
      email: 'admin@example.test',
      displayName: 'Usuario Firebase'
    }, 1710000000000);

    expect(UserSchema.parse(profile)).toMatchObject({
      userId: 'dev-user-001',
      email: 'admin@example.test'
    });
    expect(Object.hasOwn(profile, 'phone')).toBe(false);
  });

  it('rejects Firebase Auth users without email because the shared user contract requires it', () => {
    expect(() => buildUserProfileFromAuthUser({
      uid: 'dev-user-001',
      displayName: 'Usuario Firebase'
    }, 1710000000000)).toThrow('email');
  });

  it('builds login and logout audit logs from authenticated HTTP API events', () => {
    const loginLog = buildAuthEventLog({
      id: 'server-log-id-login',
      event: 'login',
      originTraceId: 'execution-id-login',
      userId: 'dev-user-001',
      email: 'admin@example.test'
    }, 1710000000000);
    const logoutLog = buildAuthEventLog({
      id: 'server-log-id-logout',
      event: 'logout',
      originTraceId: 'execution-id-logout',
      userId: 'dev-user-001',
      email: 'admin@example.test'
    }, 1710000000001);

    expect(LogSchema.parse(loginLog)).toMatchObject({
      id: 'server-log-id-login',
      category: LOG_CATEGORIES.USER_ACCOUNT_LOGIN,
      origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
      originTraceId: 'execution-id-login',
      RFC: null,
      userId: 'dev-user-001'
    });
    expect(LogSchema.parse(logoutLog)).toMatchObject({
      id: 'server-log-id-logout',
      category: LOG_CATEGORIES.USER_ACCOUNT_LOGOUT,
      origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
      originTraceId: 'execution-id-logout',
      RFC: null,
      userId: 'dev-user-001'
    });
  });

  it('builds account creation audit logs from Auth onCreate events', () => {
    const log = buildUserCreatedLog({
      id: 'server-log-id-create',
      originTraceId: 'auth-event-id',
      userId: 'dev-user-001',
      email: 'admin@example.test'
    }, 1710000000000);

    expect(LogSchema.parse(log)).toMatchObject({
      id: 'server-log-id-create',
      category: LOG_CATEGORIES.USER_ACCOUNT_CREATION,
      origin: LOG_ORIGIN.SYSTEM_AUTH_TRIGGER,
      originTraceId: 'auth-event-id',
      userId: 'dev-user-001',
      execution: {},
      impact: {
        impactedUserId: 'dev-user-001',
        impactedUserEmail: 'admin@example.test'
      }
    });
    expect(Object.hasOwn(log.execution, 'executedByUserId')).toBe(false);
    expect(Object.hasOwn(log.execution, 'executedByUserEmail')).toBe(false);
  });

  it('builds sanitized auth lifecycle logs without secret-bearing fields', () => {
    const log = buildUserAccountLifecycleLog({
      id: 'server-log-id-reset',
      category: LOG_CATEGORIES.USER_ACCOUNT_PASSWORD_UPDATE,
      originTraceId: 'reset-trace-id',
      userId: 'dev-user-001',
      email: 'owner@example.test'
    }, 1710000000000);

    expect(LogSchema.parse(log)).toMatchObject({
      id: 'server-log-id-reset',
      category: LOG_CATEGORIES.USER_ACCOUNT_PASSWORD_UPDATE,
      origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
      originTraceId: 'reset-trace-id',
      RFC: null,
      userId: 'dev-user-001',
      execution: {},
      impact: {
        impactedUserId: 'dev-user-001',
        impactedUserEmail: 'owner@example.test'
      },
      searchRequest: {}
    });
    expect(JSON.stringify(log)).not.toContain('oobCode');
    expect(JSON.stringify(log)).not.toContain('password');
    expect(JSON.stringify(log)).not.toContain('totp');
    expect(JSON.stringify(log)).not.toContain('secret');
  });
});
