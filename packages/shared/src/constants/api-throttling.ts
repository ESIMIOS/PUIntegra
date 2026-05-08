/**
 * @package shared
 * @name api-throttling.ts
 * @version 0.0.1
 * @description Define constantes compartidas para endpoint keys, dimensiones y políticas fallback de throttling API.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-07)	Agrega vocabulario compartido para throttling distribuido del API.	@codex
 */

export const API_THROTTLE_ENDPOINT = {
  AUTH_EVENTS_LOGIN: 'auth.events.login',
  AUTH_EVENTS_LOGOUT: 'auth.events.logout',
  AUTH_LIFECYCLE_ACCOUNT_CREATION_POLICY: 'auth.lifecycle.account-creation-policy',
  AUTH_LIFECYCLE_PASSWORD_RECOVERY: 'auth.lifecycle.password-recovery',//NOSONAR - No es una revelación de credenciales, es solo un identificador de endpoint para throttling.
  AUTH_LIFECYCLE_PASSWORD_RESET_COMPLETED: 'auth.lifecycle.password-reset-completed',//NOSONAR - No es una revelación de credenciales, es solo un identificador de endpoint para throttling.
  AUTH_LIFECYCLE_EMAIL_VERIFICATION_COMPLETED: 'auth.lifecycle.email-verification-completed',
  AUTH_LIFECYCLE_MFA_ENROLLMENT_COMPLETED: 'auth.lifecycle.mfa-enrollment-completed',
  AUTH_ADMIN_MFA_RESET: 'auth.admin.mfa-reset',
  AUTH_ACCOUNT_PROFILE_UPDATE: 'auth.account.profile-update',
  ADMIN_INSTITUTIONS_PLAN_UPDATE: 'admin.institutions.plan-update',
  APP_INSTITUTIONS_CONTACTS_UPSERT: 'app.institutions.contacts.upsert',
  APP_INSTITUTIONS_SHARED_SECRET_UPDATE: 'app.institutions.shared-secret.update',
  APP_INSTITUTIONS_PERMISSIONS_CREATE: 'app.institutions.permissions.create',
  APP_INSTITUTIONS_PERMISSIONS_UPDATE: 'app.institutions.permissions.update',
} as const;

export const apiThrottleEndpointValues = [
  API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGIN,
  API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGOUT,
  API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_ACCOUNT_CREATION_POLICY,
  API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
  API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RESET_COMPLETED,
  API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_EMAIL_VERIFICATION_COMPLETED,
  API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_MFA_ENROLLMENT_COMPLETED,
  API_THROTTLE_ENDPOINT.AUTH_ADMIN_MFA_RESET,
  API_THROTTLE_ENDPOINT.AUTH_ACCOUNT_PROFILE_UPDATE,
  API_THROTTLE_ENDPOINT.ADMIN_INSTITUTIONS_PLAN_UPDATE,
  API_THROTTLE_ENDPOINT.APP_INSTITUTIONS_CONTACTS_UPSERT,
  API_THROTTLE_ENDPOINT.APP_INSTITUTIONS_SHARED_SECRET_UPDATE,
  API_THROTTLE_ENDPOINT.APP_INSTITUTIONS_PERMISSIONS_CREATE,
  API_THROTTLE_ENDPOINT.APP_INSTITUTIONS_PERMISSIONS_UPDATE,
] as const;

export const API_THROTTLE_DIMENSION = {
  IP: 'ip',
  EMAIL: 'email',
  USER: 'user',
  TARGET_USER: 'target_user',
  RFC: 'rfc',
  TARGET_EMAIL: 'target_email',
  PERMISSION: 'permission',
  CONTACT_TYPE: 'contact_type',
} as const;

export const apiThrottleDimensionValues = [
  API_THROTTLE_DIMENSION.IP,
  API_THROTTLE_DIMENSION.EMAIL,
  API_THROTTLE_DIMENSION.USER,
  API_THROTTLE_DIMENSION.TARGET_USER,
  API_THROTTLE_DIMENSION.RFC,
  API_THROTTLE_DIMENSION.TARGET_EMAIL,
  API_THROTTLE_DIMENSION.PERMISSION,
  API_THROTTLE_DIMENSION.CONTACT_TYPE,
] as const;

export const API_THROTTLE_DEFAULT_MAX_REQUESTS = 5;
export const API_THROTTLE_DEFAULT_WINDOW_MS = 5 * 60 * 1000;
export const API_THROTTLE_COUNTER_TTL_BUFFER_MS = 24 * 60 * 60 * 1000;

export const API_THROTTLE_DEFAULT_DIMENSIONS = [
  {
    dimensionKey: API_THROTTLE_DIMENSION.IP,
    maxRequests: API_THROTTLE_DEFAULT_MAX_REQUESTS,
    windowMs: API_THROTTLE_DEFAULT_WINDOW_MS,
  },
] as const;
