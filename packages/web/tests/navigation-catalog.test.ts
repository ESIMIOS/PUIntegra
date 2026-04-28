/**
 * @package web
 * @name navigation-catalog.test.ts
 * @version 0.0.1
 * @description Verifica visibilidad de enlaces de navegación por dominio y rol.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Cobertura para ocultar links dependientes de RFC a SYSTEM_ADMINISTRATOR en sidebar admin.	@codex
 */

import { DOMAIN } from '@/shared/constants/domains';
import {
  buildNavigationLinks,
  defaultNavigationContext,
} from '@/shared/constants/navigationCatalog';

const adminInstitutionScopedIds = [
  'admin-institution',
  'admin-institution-requests',
  'admin-institution-request-detail',
  'admin-institution-plan',
  'admin-institution-contacts',
  'admin-tenant-permissions',
] as const;

describe('navigationCatalog', () => {
  it('hides admin RFC-scoped links for system role contexts', () => {
    const links = buildNavigationLinks(DOMAIN.ADMIN, {
      ...defaultNavigationContext,
      isSystemRole: true,
      isInstitutionRole: false,
      isInstitutionAdmin: false,
    });

    const ids = links.map((link) => link.id);

    expect(ids).toContain('admin-institutions');
    expect(ids).toContain('admin-new-institution');
    expect(ids).toContain('admin-logs');

    for (const id of adminInstitutionScopedIds) {
      expect(ids).not.toContain(id);
    }
  });

  it('shows admin RFC-scoped links for institution role contexts', () => {
    const links = buildNavigationLinks(DOMAIN.ADMIN, {
      ...defaultNavigationContext,
      isSystemRole: false,
      isInstitutionRole: true,
      isInstitutionAdmin: true,
    });

    const ids = links.map((link) => link.id);

    for (const id of adminInstitutionScopedIds) {
      expect(ids).toContain(id);
    }
  });

  it('builds canonical admin tenant route targets', () => {
    const links = buildNavigationLinks(DOMAIN.ADMIN, {
      ...defaultNavigationContext,
      adminInspectionRfc: 'AAA010101AAA',
      isSystemRole: false,
      isInstitutionRole: true,
      isInstitutionAdmin: true,
    });
    const targets = new Map(links.map((link) => [link.id, link.to]));

    expect(targets.get('admin-institution-requests')).toBe('/admin/AAA010101AAA/requests');
    expect(targets.get('admin-institution-plan')).toBe('/admin/AAA010101AAA/plan');
    expect(targets.get('admin-institution-contacts')).toBe('/admin/AAA010101AAA/contacts');
    expect(targets.get('admin-tenant-permissions')).toBe('/admin/AAA010101AAA/permissions');
  });

  it('removes institutions link from app navigation', () => {
    const links = buildNavigationLinks(DOMAIN.APP, defaultNavigationContext);
    const ids = links.map((link) => link.id);

    expect(ids).not.toContain('app-institutions');
  });

  it('adds institutions link to account navigation', () => {
    const links = buildNavigationLinks(DOMAIN.ACCOUNT, defaultNavigationContext);
    const ids = links.map((link) => link.id);

    expect(ids).toContain('account-institutions');
  });
});
