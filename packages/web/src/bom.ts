/**
 * @package web
 * @name bom.ts
 * @version 0.0.1
 * @description Centraliza las dependencias compartidas del frontend mediante el patrón BoM.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

/**
 * OPENSOURCE
 * Dependencias de terceros usadas por el producto.
 */
export { computed, createApp, ref, watchEffect } from 'vue';
export type { DefineComponent } from 'vue';

export { createPinia, defineStore } from 'pinia';
export type { Pinia } from 'pinia';

export { createRouter, createWebHistory, useRoute } from 'vue-router';
export type { Router } from 'vue-router';

export { z } from 'zod';

export { createVuetify } from 'vuetify';
export * as vuetifyComponents from 'vuetify/components';
export * as vuetifyDirectives from 'vuetify/directives';

/**
 * PRODUCT
 * Dependencias compartidas internas del producto web.
 */
export { default as MockSessionSwitcher } from '@/components/dev/MockSessionSwitcher.vue';
export { default as PagePlaceholder } from '@/components/shared/PagePlaceholder.vue';

export { useMockSession } from '@/composables/useMockSession';
export { useRouteNavigation } from '@/composables/useRouteNavigation';

export { createAppVuetify } from '@/plugins/vuetify';
export { createAppRouter } from '@/router/createRouter';

export { createRouteMeta, mergeRouteMeta } from '@/router/metaSchema';

export {
  SYSTEM_RFC,
  ROLE,
  roleValues,
  authenticatedRoleValues,
  institutionRoleValues,
  systemRoleValues,
  RoleSchema,
  AuthenticatedRoleSchema
} from '@shared';

export {
  DOMAIN,
  domainValues,
  domainLabels,
  domainOptions,
  domainShell,
  DomainSchema
} from '@/shared/constants/domains';

export {
  DEFAULT_RFC,
  DEFAULT_FUB,
  routePaths,
  allDocumentedPaths
} from '@/shared/constants/routePaths';

export {
  defaultNavigationContext,
  navigationCatalog,
  buildNavigationLinks,
  isPageId,
  getPageContent
} from '@/shared/constants/navigationCatalog';
export type {
  NavigationDomain,
  NavigationContext,
  NavigationLink,
  PageId,
  PageContent
} from '@/shared/constants/navigationCatalog';

export { useAuthStore } from '@/stores/authStore';
export { useInstitutionStore } from '@/stores/institutionStore';
