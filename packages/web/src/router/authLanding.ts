/**
 * @package web
 * @name authLanding.ts
 * @version 0.0.1
 * @description Centralizes redirect rules for public authentication routes.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-17)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { ROLE } from '@shared';
import { routePaths } from '@/shared/constants/routePaths';

const publicAuthEntryPaths = new Set<string>([
  routePaths.authLogin,
  routePaths.authCreateAccount,
  routePaths.authVerifyEmail,
  routePaths.authForgotPassword,
  routePaths.authResetPassword
]);

/**
 * @description Identifies public auth routes that must redirect when a session already exists.
 */
export function isPublicAuthEntryPath(path: string) {
  return publicAuthEntryPaths.has(path);
}

/**
 * @description Resolves default path for an authenticated session based on role and active context.
 */
export function resolveAuthenticatedDefaultPath(input: {
  activeRole: string;
  requiresSecuritySetup: boolean;
  activeRfc: string;
}) {
  if (input.requiresSecuritySetup) {
    return routePaths.authSecuritySetup;
  }

  if (input.activeRole === ROLE.SYSTEM_ADMINISTRATOR) {
    return routePaths.adminInstitutions;
  }

  if (input.activeRfc) {
    return routePaths.appDashboard(input.activeRfc);
  }

  return routePaths.appInstitutions;
}

/**
 * @description Validates and normalizes an internal redirect target to prevent open redirects.
 */
export function resolveSafeRedirectTarget(target: unknown) {
  if (typeof target !== 'string') {
    return null;
  }

  const trimmed = target.trim();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }

  const pathOnly = trimmed.split(/[?#]/, 1)[0];
  if (isPublicAuthEntryPath(pathOnly)) {
    return null;
  }

  return trimmed;
}

/**
 * @description Prioritizes query-requested redirect when valid; otherwise falls back to default landing.
 */
export function resolvePreferredAuthenticatedPath(input: {
  activeRole: string;
  requiresSecuritySetup: boolean;
  activeRfc: string;
  redirectTarget?: unknown;
}) {
  const safeRedirectTarget = resolveSafeRedirectTarget(input.redirectTarget);
  if (safeRedirectTarget) {
    return safeRedirectTarget;
  }

  return resolveAuthenticatedDefaultPath({
    activeRole: input.activeRole,
    requiresSecuritySetup: input.requiresSecuritySetup,
    activeRfc: input.activeRfc
  });
}
