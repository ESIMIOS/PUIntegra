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
export {
  computed,
  createApp,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect
} from 'vue';
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
export { default as InactivityWarningModal } from '@/components/auth/InactivityWarningModal.vue';
export { default as MockSessionSwitcher } from '@/components/dev/MockSessionSwitcher.vue';
export { default as PagePlaceholder } from '@/components/shared/PagePlaceholder.vue';

export { useAuthStore } from '@/stores/authStore';
export { useInstitutionStore } from '@/stores/institutionStore';
export { useMockSession } from '@/composables/useMockSession';
export { useRouteNavigation } from '@/composables/useRouteNavigation';
export { useSessionInactivity } from '@/composables/useSessionInactivity';

export {
  logSystemMessage,
  logSystemMessageError,
  logSystemMessageVerbose,
  logSystemMessageWarning
} from '@/shared/logging/systemLogger';

export { createAppVuetify } from '@/plugins/vuetify';
export { createAppRouter } from '@/router/createRouter';

export { createRouteMeta, mergeRouteMeta } from '@/router/metaSchema';

export {
  AuthenticatedRoleSchema,
  ROLE,
  RoleSchema,
  authenticatedRoleValues,
  institutionRoleValues,
  roleValues,
  systemRoleValues,
  SYSTEM_RFC,
  SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY,
  SECONDS_TO_SHOW_INACTIVITY_ALERT
} from '@shared';

export {
  DOMAIN,
  DomainSchema,
  domainLabels,
  domainOptions,
  domainShell,
  domainValues
} from '@/shared/constants/domains';

export {
  DEFAULT_FUB,
  DEFAULT_RFC,
  allDocumentedPaths,
  routePaths
} from '@/shared/constants/routePaths';

export {
  buildNavigationLinks,
  defaultNavigationContext,
  getPageContent,
  isPageId,
  navigationCatalog
} from '@/shared/constants/navigationCatalog';
export type {
  NavigationContext,
  NavigationDomain,
  NavigationLink,
  PageContent,
  PageId
} from '@/shared/constants/navigationCatalog';
