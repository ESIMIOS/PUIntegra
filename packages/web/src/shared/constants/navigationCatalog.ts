/**
 * @package web
 * @name navigationCatalog.ts
 * @version 0.0.1
 * @description Define el catálogo único de navegación y contenido de páginas placeholder por dominio.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { DOMAIN, domainValues } from '@/shared/constants/domains';
import { DEFAULT_FUB, DEFAULT_RFC, routePaths } from '@/shared/constants/routePaths';

export type NavigationDomain = (typeof domainValues)[number];

export type NavigationContext = {
  activeRfc: string;
  adminInspectionRfc: string;
  defaultFub: string;
  isAuthenticated: boolean;
  isInstitutionRole: boolean;
  isInstitutionAdmin: boolean;
  isSystemRole: boolean;
};

type NavigationDefinition = {
  id: string;
  label: string;
  description: string;
  // eslint-disable-next-line no-unused-vars
  to: (context: NavigationContext) => string;
  // eslint-disable-next-line no-unused-vars
  disabled?: (context: NavigationContext) => boolean;
};

type NavigationCatalog = Record<NavigationDomain, readonly NavigationDefinition[]>;

export type NavigationLink = {
  id: string;
  label: string;
  to: string;
  disabled: boolean;
};

export const defaultNavigationContext: NavigationContext = {
  activeRfc: DEFAULT_RFC,
  adminInspectionRfc: DEFAULT_RFC,
  defaultFub: DEFAULT_FUB,
  isAuthenticated: true,
  isInstitutionRole: true,
  isInstitutionAdmin: true,
  isSystemRole: true
};

export const navigationCatalog = {
  [DOMAIN.SITE]: [
    {
      id: 'site-home',
      label: 'Home',
      description:
        'Página pública principal del producto con información de valor, acceso y contacto.',
      to: () => routePaths.siteHome
    }
  ],
  [DOMAIN.AUTH]: [
    {
      id: 'auth-login',
      label: 'Login',
      description: 'Ingreso a la aplicación mediante autenticación de cuenta.',
      to: () => routePaths.authLogin
    },
    {
      id: 'auth-create-account',
      label: 'Crear cuenta',
      description: 'Alta inicial de cuenta cuando existe permiso habilitante.',
      to: () => routePaths.authCreateAccount
    },
    {
      id: 'auth-verify-email',
      label: 'Verificar correo',
      description: 'Confirmación de correo desde enlaces de verificación.',
      to: () => routePaths.authVerifyEmail
    },
    {
      id: 'auth-forgot-password',
      label: 'Recuperar contraseña',
      description: 'Solicitud de recuperación de contraseña sin exponer existencia de correo.',
      to: () => routePaths.authForgotPassword
    },
    {
      id: 'auth-reset-password',
      label: 'Restablecer contraseña',
      description: 'Cambio de contraseña desde enlace válido de recuperación.',
      to: () => routePaths.authResetPassword
    },
    {
      id: 'auth-security-setup',
      label: 'Security setup',
      description: 'Bootstrap de seguridad de la cuenta previo a operación plena.',
      to: () => routePaths.authSecuritySetup,
      disabled: (context) => !context.isAuthenticated
    },
    {
      id: 'auth-logout',
      label: 'Logout',
      description: 'Salida de sesión y continuidad de navegación posterior.',
      to: () => routePaths.authLogout
    }
  ],
  [DOMAIN.APP]: [
    {
      id: 'app-institutions',
      label: 'Instituciones',
      description: 'Selección de contexto institucional para iniciar operación.',
      to: () => routePaths.appInstitutions,
      disabled: (context) => !context.isInstitutionRole
    },
    {
      id: 'app-dashboard',
      label: 'Dashboard',
      description: 'Resumen operativo de solicitudes y estado de sincronización de hallazgos.',
      to: (context) => routePaths.appDashboard(context.activeRfc),
      disabled: (context) => !context.isInstitutionRole
    },
    {
      id: 'app-admin-plan',
      label: 'Admin plan',
      description: 'Vista administrativa del plan vigente de la institución.',
      to: (context) => routePaths.appAdminPlan(context.activeRfc),
      disabled: (context) => !context.isInstitutionAdmin
    },
    {
      id: 'app-admin-contacts',
      label: 'Admin contacts',
      description: 'Listado de contactos legales, técnicos y de búsqueda inmediata.',
      to: (context) => routePaths.appAdminContacts(context.activeRfc),
      disabled: (context) => !context.isInstitutionAdmin
    },
    {
      id: 'app-admin-settings',
      label: 'Admin settings',
      description: 'Parámetros sensibles de institución sin exposición de secretos en claro.',
      to: (context) => routePaths.appAdminSettings(context.activeRfc),
      disabled: (context) => !context.isInstitutionAdmin
    },
    {
      id: 'app-admin-permissions',
      label: 'Admin permissions',
      description: 'Gestión y filtrado de permisos de acceso institucional.',
      to: (context) => routePaths.appAdminPermissions(context.activeRfc),
      disabled: (context) => !context.isInstitutionAdmin
    },
    {
      id: 'app-requests',
      label: 'Solicitudes',
      description: 'Vista de solicitudes de búsqueda de la institución activa.',
      to: (context) => routePaths.appRequests(context.activeRfc),
      disabled: (context) => !context.isInstitutionRole
    },
    {
      id: 'app-request-detail',
      label: 'Detalle solicitud',
      description: 'Detalle operativo de solicitud específica por FUB.',
      to: (context) => routePaths.appRequestDetail(context.activeRfc, context.defaultFub),
      disabled: (context) => !context.isInstitutionRole
    },
    {
      id: 'app-logs',
      label: 'Logs',
      description: 'Bitácora institucional con filtros de categoría, origen y tiempo.',
      to: (context) => routePaths.appLogs(context.activeRfc),
      disabled: (context) => !context.isInstitutionRole
    }
  ],
  [DOMAIN.ADMIN]: [
    {
      id: 'admin-institutions',
      label: 'Instituciones',
      description: 'Consulta multiinstitución para el backoffice del proveedor.',
      to: () => routePaths.adminInstitutions,
      disabled: (context) => !context.isSystemRole
    },
    {
      id: 'admin-new-institution',
      label: 'Nueva institución',
      description: 'Flujo de incorporación inicial de una institución cliente.',
      to: () => routePaths.adminNewInstitution,
      disabled: (context) => !context.isSystemRole
    },
    {
      id: 'admin-institution',
      label: 'Detalle institución',
      description: 'Vista pivote institucional desde la perspectiva del proveedor.',
      to: (context) => routePaths.adminInstitution(context.adminInspectionRfc),
      disabled: (context) => !context.isSystemRole
    },
    {
      id: 'admin-institution-requests',
      label: 'Solicitudes institución',
      description: 'Vista resumida de solicitudes institucionales en backoffice.',
      to: (context) => routePaths.adminInstitutionRequests(context.adminInspectionRfc),
      disabled: (context) => !context.isSystemRole
    },
    {
      id: 'admin-institution-request-detail',
      label: 'Detalle solicitud',
      description: 'Detalle de solicitud con foco de supervisión y trazabilidad.',
      to: (context) =>
        routePaths.adminInstitutionRequestDetail(context.adminInspectionRfc, context.defaultFub),
      disabled: (context) => !context.isSystemRole
    },
    {
      id: 'admin-institution-plan',
      label: 'Plan institución',
      description: 'Supervisión comercial y operativa del plan institucional.',
      to: (context) => routePaths.adminInstitutionPlan(context.adminInspectionRfc),
      disabled: (context) => !context.isSystemRole
    },
    {
      id: 'admin-institution-contacts',
      label: 'Contactos institución',
      description: 'Consulta transversal de contactos institucionales.',
      to: (context) => routePaths.adminInstitutionContacts(context.adminInspectionRfc),
      disabled: (context) => !context.isSystemRole
    },
    {
      id: 'admin-logs',
      label: 'Logs globales',
      description: 'Bitácora global del sistema para el administrador proveedor.',
      to: () => routePaths.adminLogs,
      disabled: (context) => !context.isSystemRole
    }
  ],
  [DOMAIN.ACCOUNT]: [
    {
      id: 'account-settings',
      label: 'Configuración',
      description: 'Perfil personal, identidad base y seguridad de cuenta autenticada.',
      to: () => routePaths.accountSettings,
      disabled: (context) => !context.isAuthenticated
    },
    {
      id: 'account-logs',
      label: 'Logs',
      description: 'Bitácora filtrada por la actividad de la cuenta personal autenticada.',
      to: () => routePaths.accountLogs,
      disabled: (context) => !context.isAuthenticated
    }
  ],
  [DOMAIN.ERROR]: [
    {
      id: 'error-403',
      label: 'Error 403',
      description: 'Acceso prohibido por incompatibilidad entre ruta, rol o contexto.',
      to: () => routePaths.error403
    },
    {
      id: 'error-404',
      label: 'Error 404',
      description: 'Ruta no encontrada o recurso inexistente.',
      to: () => routePaths.error404
    },
    {
      id: 'error-500',
      label: 'Error 500',
      description: 'Fallo interno del sistema o de infraestructura.',
      to: () => routePaths.error500
    }
  ]
} as const satisfies NavigationCatalog;

type NavigationEntry = (typeof navigationCatalog)[NavigationDomain][number];

export type PageId = NavigationEntry['id'];
export type PageContent = {
  title: NavigationEntry['label'];
  description: NavigationEntry['description'];
};

const pageContentIndex = Object.fromEntries(
  Object.values(navigationCatalog)
    .flat()
    .map((entry) => [
      entry.id,
      {
        title: entry.label,
        description: entry.description
      }
    ])
) as Record<PageId, PageContent>;

export function getPageContent(pageId: PageId): PageContent {
  return pageContentIndex[pageId];
}

export function isPageId(value: unknown): value is PageId {
  return typeof value === 'string' && value in pageContentIndex;
}

export function buildNavigationLinks(
  domain: NavigationDomain,
  context: NavigationContext
): NavigationLink[] {
  return navigationCatalog[domain].map((link) => ({
    id: link.id,
    label: link.label,
    to: link.to(context),
    disabled: 'disabled' in link ? link.disabled(context) : false
  }));
}
