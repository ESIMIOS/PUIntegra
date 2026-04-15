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

export {
  createVuestic,
  defineVuesticConfig,
  useBreakpoint,
  useColors
} from 'vuestic-ui';

/**
 * PRODUCT
 * Dependencias compartidas internas del producto web.
 */
export { default as InactivityWarningModal } from '@/components/auth/InactivityWarningModal.vue';
export { default as MockSessionSwitcher } from '@/components/dev/MockSessionSwitcher.vue';
export { default as AppLogo } from '@/components/shared/AppLogo.vue';
export { default as DashboardShell } from '@/components/shared/DashboardShell.vue';
export { default as PagePlaceholder } from '@/components/shared/PagePlaceholder.vue';
export { default as ThemeToggle } from '@/components/shared/ThemeToggle.vue';

export { useAuthStore } from '@/stores/authStore';
export { useInstitutionStore } from '@/stores/institutionStore';
export { useMockSession } from '@/composables/useMockSession';
export {
  useAccountSettingsController,
  useContactsController,
  useDashboardController,
  useFindingsController,
  useInstitutionSelectionController,
  useInstitutionSettingsController,
  useLogsController,
  useMockDataResetController,
  usePermissionsController,
  useRequestsController
} from '@/composables/useMockDataControllers';
export { useRouteNavigation } from '@/composables/useRouteNavigation';
export { useSessionInactivity } from '@/composables/useSessionInactivity';
export { useThemePreference } from '@/composables/useThemePreference';
export { useMockDataStore } from '@/stores/mockDataStore';
export { MOCK_MILLISECONDS_RESPONSE_DELAY } from '@/mock/constants/mockConfig';
export { withMockControllerDelay } from '@/mock/controllers/controllerDelay';
export { MockDataError, isMockDataError } from '@/mock/errors/mockDataError';
export { canonicalMockSeedDataset, cloneMockDataset } from '@/mock/seed/mockSeed';
export { createMockDataService } from '@/mock/services/mockDataService';
export {
  loadMockDataset,
  resetMockDataset,
  saveMockDataset
} from '@/mock/storage/mockStorage';
export { webUIMessages } from '@/shared/constants/webUIMessages';
export { nowUtcMilliseconds, yearsAgoUtcMilliseconds } from '@/shared/utils/dateUtils';
export { deepClone } from '@/shared/utils/objectUtils';


export { webSystemMessages } from '@/shared/constants/systemMessages';
export {
  logSystemMessage,
  logSystemMessageError,
  logSystemMessageVerbose,
  logSystemMessageWarning
} from '@/shared/logging/systemLogger';

export { createAppVuestic } from '@/plugins/vuestic';
export {
  VUESTIC_DARK_PRESET,
  VUESTIC_LIGHT_PRESET,
  appVuesticConfig,
  darkThemeColors,
  lightThemeColors
} from '@/plugins/vuestic';
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
