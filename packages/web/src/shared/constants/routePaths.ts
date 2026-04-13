/**
 * @package web
 * @name routePaths.ts
 * @version 0.0.1
 * @description Centraliza rutas, parámetros por defecto y listado de paths documentados.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

export const DEFAULT_RFC = 'XAXX010101000';
export const DEFAULT_FUB = 'FUB-0001';

export const routePaths = {
  siteHome: '/site/home',
  siteDemo: '/site/demo',
  authLogin: '/auth/login',
  authCreateAccount: '/auth/create-account',
  authVerifyEmail: '/auth/verify-email',
  authForgotPassword: '/auth/forgot-password', //NOSONAR
  authResetPassword: '/auth/reset-password', //NOSONAR
  authSecuritySetup: '/auth/security-setup',
  authLogout: '/auth/logout',
  appInstitutions: '/app/institutions',
  appInstitution: (rfc: string) => `/app/${rfc}`,
  appDashboard: (rfc: string) => `/app/${rfc}/dashboard`,
  appAdmin: (rfc: string) => `/app/${rfc}/admin`,
  appAdminPlan: (rfc: string) => `/app/${rfc}/admin/plan`,
  appAdminContacts: (rfc: string) => `/app/${rfc}/admin/contacts`,
  appAdminSettings: (rfc: string) => `/app/${rfc}/admin/settings`,
  appAdminPermissions: (rfc: string) => `/app/${rfc}/admin/permissions`,
  appRequests: (rfc: string) => `/app/${rfc}/requests`,
  appRequestDetail: (rfc: string, fub: string) => `/app/${rfc}/requests/${fub}`,
  appLogs: (rfc: string) => `/app/${rfc}/logs`,
  adminInstitutions: '/admin/institutions',
  adminNewInstitution: '/admin/new-institution',
  adminInstitution: (rfc: string) => `/admin/institutions/${rfc}`,
  adminInstitutionRequests: (rfc: string) => `/admin/institutions/${rfc}/requests`,
  adminInstitutionRequestDetail: (rfc: string, fub: string) =>
    `/admin/institutions/${rfc}/requests/${fub}`,
  adminInstitutionPlan: (rfc: string) => `/admin/institutions/${rfc}/plan`,
  adminInstitutionContacts: (rfc: string) => `/admin/institutions/${rfc}/contacts`,
  adminLogs: '/admin/logs',
  accountSettings: '/account/settings',
  accountLogs: '/account/logs',
  error403: '/error/403',
  error404: '/error/404',
  error500: '/error/500'
} as const;

export const allDocumentedPaths = [
  routePaths.siteHome,
  routePaths.siteDemo,
  routePaths.authLogin,
  routePaths.authCreateAccount,
  routePaths.authVerifyEmail,
  routePaths.authForgotPassword,
  routePaths.authResetPassword,
  routePaths.authSecuritySetup,
  routePaths.authLogout,
  routePaths.appInstitutions,
  routePaths.appInstitution(DEFAULT_RFC),
  routePaths.appDashboard(DEFAULT_RFC),
  routePaths.appAdmin(DEFAULT_RFC),
  routePaths.appAdminPlan(DEFAULT_RFC),
  routePaths.appAdminContacts(DEFAULT_RFC),
  routePaths.appAdminSettings(DEFAULT_RFC),
  routePaths.appAdminPermissions(DEFAULT_RFC),
  routePaths.appRequests(DEFAULT_RFC),
  routePaths.appRequestDetail(DEFAULT_RFC, DEFAULT_FUB),
  routePaths.appLogs(DEFAULT_RFC),
  routePaths.adminInstitutions,
  routePaths.adminNewInstitution,
  routePaths.adminInstitution(DEFAULT_RFC),
  routePaths.adminInstitutionRequests(DEFAULT_RFC),
  routePaths.adminInstitutionRequestDetail(DEFAULT_RFC, DEFAULT_FUB),
  routePaths.adminInstitutionPlan(DEFAULT_RFC),
  routePaths.adminInstitutionContacts(DEFAULT_RFC),
  routePaths.adminLogs,
  routePaths.accountSettings,
  routePaths.accountLogs,
  routePaths.error404,
  routePaths.error403,
  routePaths.error500
] as const;
