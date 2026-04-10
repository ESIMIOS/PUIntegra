/**
 * @package web
 * @name routes.ts
 * @version 0.0.1
 * @description Declara el árbol completo de rutas y redirecciones del esqueleto navegable.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { createRouteMeta } from './metaSchema';
import { routePaths } from '@/shared/constants/routePaths';
import SiteLayout from '@/layouts/SiteLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import AccountLayout from '@/layouts/AccountLayout.vue';
import ErrorLayout from '@/layouts/ErrorLayout.vue';
import SiteHomePage from '@/pages/site/SiteHomePage.vue';
import AuthLoginPage from '@/pages/auth/AuthLoginPage.vue';
import AuthCreateAccountPage from '@/pages/auth/AuthCreateAccountPage.vue';
import AuthVerifyEmailPage from '@/pages/auth/AuthVerifyEmailPage.vue';
import AuthForgotPasswordPage from '@/pages/auth/AuthForgotPasswordPage.vue';
import AuthResetPasswordPage from '@/pages/auth/AuthResetPasswordPage.vue';
import AuthSecuritySetupPage from '@/pages/auth/AuthSecuritySetupPage.vue';
import AuthLogoutPage from '@/pages/auth/AuthLogoutPage.vue';
import AppInstitutionsPage from '@/pages/app/AppInstitutionsPage.vue';
import AppDashboardPage from '@/pages/app/AppDashboardPage.vue';
import AppAdminPlanPage from '@/pages/app/AppAdminPlanPage.vue';
import AppAdminContactsPage from '@/pages/app/AppAdminContactsPage.vue';
import AppAdminSettingsPage from '@/pages/app/AppAdminSettingsPage.vue';
import AppAdminPermissionsPage from '@/pages/app/AppAdminPermissionsPage.vue';
import AppRequestsPage from '@/pages/app/AppRequestsPage.vue';
import AppRequestDetailPage from '@/pages/app/AppRequestDetailPage.vue';
import AppLogsPage from '@/pages/app/AppLogsPage.vue';
import AdminInstitutionsPage from '@/pages/admin/AdminInstitutionsPage.vue';
import AdminNewInstitutionPage from '@/pages/admin/AdminNewInstitutionPage.vue';
import AdminInstitutionPage from '@/pages/admin/AdminInstitutionPage.vue';
import AdminInstitutionRequestsPage from '@/pages/admin/AdminInstitutionRequestsPage.vue';
import AdminInstitutionRequestDetailPage from '@/pages/admin/AdminInstitutionRequestDetailPage.vue';
import AdminInstitutionPlanPage from '@/pages/admin/AdminInstitutionPlanPage.vue';
import AdminInstitutionContactsPage from '@/pages/admin/AdminInstitutionContactsPage.vue';
import AdminLogsPage from '@/pages/admin/AdminLogsPage.vue';
import AccountSettingsPage from '@/pages/account/AccountSettingsPage.vue';
import AccountLogsPage from '@/pages/account/AccountLogsPage.vue';
import Error403Page from '@/pages/error/Error403Page.vue';
import Error404Page from '@/pages/error/Error404Page.vue';
import Error500Page from '@/pages/error/Error500Page.vue';
import { getPageContent } from '@/shared/constants/navigationCatalog';
import type { PageId } from '@/shared/constants/navigationCatalog';
import {
  ROLE,
  institutionRoleValues,
  systemRoleValues,
  authenticatedRoleValues
} from '@shared';
import { DOMAIN } from '@/shared/constants/domains';

const institutionRoles = [...institutionRoleValues];
const systemRoles = [...systemRoleValues];
const authenticatedRoles = [...authenticatedRoleValues];

/**
 * @description Construye metadata de ruta enriquecida con título y descripción del catálogo de navegación.
 */
function createPageRouteMeta(pageId: PageId, meta: Record<string, unknown>) {
  const pageContent = getPageContent(pageId);
  return createRouteMeta({
    ...meta,
    pageId,
    title: pageContent.title,
    description: pageContent.description
  });
}

export const appRoutes = [
  {
    path: '/',
    redirect: routePaths.siteHome
  },
  {
    path: '/site',
    component: SiteLayout,
    meta: createRouteMeta({
      layout: DOMAIN.SITE,
      defaultChildRedirect: '/site/home'
    }),
    children: [
      { path: '', redirect: routePaths.siteHome },
      {
        path: 'home',
        name: 'site-home',
        component: SiteHomePage,
        meta: createPageRouteMeta('site-home', { layout: DOMAIN.SITE })
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: createRouteMeta({
      layout: DOMAIN.AUTH,
      defaultChildRedirect: '/auth/login'
    }),
    children: [
      { path: '', redirect: routePaths.authLogin },
      {
        path: 'login',
        name: 'auth-login',
        component: AuthLoginPage,
        meta: createPageRouteMeta('auth-login', { layout: DOMAIN.AUTH })
      },
      {
        path: 'create-account',
        name: 'auth-create-account',
        component: AuthCreateAccountPage,
        meta: createPageRouteMeta('auth-create-account', { layout: DOMAIN.AUTH })
      },
      {
        path: 'verify-email',
        name: 'auth-verify-email',
        component: AuthVerifyEmailPage,
        meta: createPageRouteMeta('auth-verify-email', { layout: DOMAIN.AUTH })
      },
      {
        path: 'forgot-password',
        name: 'auth-forgot-password',
        component: AuthForgotPasswordPage,
        meta: createPageRouteMeta('auth-forgot-password', { layout: DOMAIN.AUTH })
      },
      {
        path: 'reset-password',
        name: 'auth-reset-password',
        component: AuthResetPasswordPage,
        meta: createPageRouteMeta('auth-reset-password', { layout: DOMAIN.AUTH })
      },
      {
        path: 'security-setup',
        name: 'auth-security-setup',
        component: AuthSecuritySetupPage,
        meta: createPageRouteMeta('auth-security-setup', {
          layout: DOMAIN.AUTH,
          requiresAuth: true,
          allowedRoles: authenticatedRoles
        })
      },
      {
        path: 'logout',
        name: 'auth-logout',
        component: AuthLogoutPage,
        meta: createPageRouteMeta('auth-logout', { layout: DOMAIN.AUTH })
      }
    ]
  },
  {
    path: '/app',
    component: AppLayout,
    meta: createRouteMeta({
      layout: DOMAIN.APP,
      requiresAuth: true,
      requiresSecuritySetup: true,
      allowedRoles: institutionRoles
    }),
    children: [
      {
        path: 'institutions',
        name: 'app-institutions',
        component: AppInstitutionsPage,
        meta: createPageRouteMeta('app-institutions', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: institutionRoles
        })
      },
      {
        path: ':rfc',
        redirect: (to: { params: { rfc?: string } }) => `/app/${to.params.rfc}/dashboard`,
        meta: createRouteMeta({
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: institutionRoles,
          defaultChildRedirect: '/app/:rfc/dashboard'
        })
      },
      {
        path: ':rfc/dashboard',
        name: 'app-dashboard',
        component: AppDashboardPage,
        meta: createPageRouteMeta('app-dashboard', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: institutionRoles
        })
      },
      {
        path: ':rfc/admin',
        redirect: (to: { params: { rfc?: string } }) => `/app/${to.params.rfc}/admin/plan`,
        meta: createRouteMeta({
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: [ROLE.INSTITUTION_ADMIN],
          defaultChildRedirect: '/app/:rfc/admin/plan'
        })
      },
      {
        path: ':rfc/admin/plan',
        name: 'app-admin-plan',
        component: AppAdminPlanPage,
        meta: createPageRouteMeta('app-admin-plan', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: [ROLE.INSTITUTION_ADMIN]
        })
      },
      {
        path: ':rfc/admin/contacts',
        name: 'app-admin-contacts',
        component: AppAdminContactsPage,
        meta: createPageRouteMeta('app-admin-contacts', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: [ROLE.INSTITUTION_ADMIN]
        })
      },
      {
        path: ':rfc/admin/settings',
        name: 'app-admin-settings',
        component: AppAdminSettingsPage,
        meta: createPageRouteMeta('app-admin-settings', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: [ROLE.INSTITUTION_ADMIN]
        })
      },
      {
        path: ':rfc/admin/permissions',
        name: 'app-admin-permissions',
        component: AppAdminPermissionsPage,
        meta: createPageRouteMeta('app-admin-permissions', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: [ROLE.INSTITUTION_ADMIN]
        })
      },
      {
        path: ':rfc/requests',
        name: 'app-requests',
        component: AppRequestsPage,
        meta: createPageRouteMeta('app-requests', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: institutionRoles
        })
      },
      {
        path: ':rfc/requests/:fub',
        name: 'app-request-detail',
        component: AppRequestDetailPage,
        meta: createPageRouteMeta('app-request-detail', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: institutionRoles
        })
      },
      {
        path: ':rfc/logs',
        name: 'app-logs',
        component: AppLogsPage,
        meta: createPageRouteMeta('app-logs', {
          layout: DOMAIN.APP,
          requiresAuth: true,
          requiresInstitutionContext: true,
          requiresSecuritySetup: true,
          allowedRoles: institutionRoles
        })
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: createRouteMeta({
      layout: DOMAIN.ADMIN,
      requiresAuth: true,
      requiresSecuritySetup: true,
      allowedRoles: systemRoles
    }),
    children: [
      { path: '', redirect: routePaths.adminInstitutions },
      {
        path: 'institutions',
        name: 'admin-institutions',
        component: AdminInstitutionsPage,
        meta: createPageRouteMeta('admin-institutions', {
          layout: DOMAIN.ADMIN,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: systemRoles
        })
      },
      {
        path: 'new-institution',
        name: 'admin-new-institution',
        component: AdminNewInstitutionPage,
        meta: createPageRouteMeta('admin-new-institution', {
          layout: DOMAIN.ADMIN,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: systemRoles
        })
      },
      {
        path: 'institutions/:rfc',
        name: 'admin-institution',
        component: AdminInstitutionPage,
        meta: createPageRouteMeta('admin-institution', {
          layout: DOMAIN.ADMIN,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: systemRoles
        })
      },
      {
        path: 'institutions/:rfc/requests',
        name: 'admin-institution-requests',
        component: AdminInstitutionRequestsPage,
        meta: createPageRouteMeta('admin-institution-requests', {
          layout: DOMAIN.ADMIN,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: systemRoles
        })
      },
      {
        path: 'institutions/:rfc/requests/:fub',
        name: 'admin-institution-request-detail',
        component: AdminInstitutionRequestDetailPage,
        meta: createPageRouteMeta('admin-institution-request-detail', {
          layout: DOMAIN.ADMIN,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: systemRoles
        })
      },
      {
        path: 'institutions/:rfc/plan',
        name: 'admin-institution-plan',
        component: AdminInstitutionPlanPage,
        meta: createPageRouteMeta('admin-institution-plan', {
          layout: DOMAIN.ADMIN,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: systemRoles
        })
      },
      {
        path: 'institutions/:rfc/contacts',
        name: 'admin-institution-contacts',
        component: AdminInstitutionContactsPage,
        meta: createPageRouteMeta('admin-institution-contacts', {
          layout: DOMAIN.ADMIN,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: systemRoles
        })
      },
      {
        path: 'logs',
        name: 'admin-logs',
        component: AdminLogsPage,
        meta: createPageRouteMeta('admin-logs', {
          layout: DOMAIN.ADMIN,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: systemRoles
        })
      }
    ]
  },
  {
    path: '/account',
    component: AccountLayout,
    meta: createRouteMeta({
      layout: DOMAIN.ACCOUNT,
      requiresAuth: true,
      requiresSecuritySetup: true,
      allowedRoles: authenticatedRoles,
      defaultChildRedirect: '/account/settings'
    }),
    children: [
      { path: '', redirect: routePaths.accountSettings },
      {
        path: 'settings',
        name: 'account-settings',
        component: AccountSettingsPage,
        meta: createPageRouteMeta('account-settings', {
          layout: DOMAIN.ACCOUNT,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: authenticatedRoles
        })
      },
      {
        path: 'logs',
        name: 'account-logs',
        component: AccountLogsPage,
        meta: createPageRouteMeta('account-logs', {
          layout: DOMAIN.ACCOUNT,
          requiresAuth: true,
          requiresSecuritySetup: true,
          allowedRoles: authenticatedRoles
        })
      }
    ]
  },
  {
    path: '/error',
    component: ErrorLayout,
    meta: createRouteMeta({
      layout: DOMAIN.ERROR
    }),
    children: [
      { path: '', redirect: routePaths.error404 },
      {
        path: '403',
        name: 'error-403',
        component: Error403Page,
        meta: createPageRouteMeta('error-403', { layout: DOMAIN.ERROR })
      },
      {
        path: '404',
        name: 'error-404',
        component: Error404Page,
        meta: createPageRouteMeta('error-404', { layout: DOMAIN.ERROR })
      },
      {
        path: '500',
        name: 'error-500',
        component: Error500Page,
        meta: createPageRouteMeta('error-500', { layout: DOMAIN.ERROR })
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: routePaths.error404
  }
];
