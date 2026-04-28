import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Component } from 'vue';
import {
  DEFAULT_RFC,
  useAuthStore,
  useInstitutionStore,
} from '@/bom';
import {
  LOG_CATEGORIES,
  LOG_ORIGIN,
  ROLE,
  SYSTEM_RFC,
  type Log,
} from '@shared';
import AdminLogsPage from '@/pages/admin/AdminLogsPage.vue';
import AppLogsPage from '@/pages/app/AppLogsPage.vue';
import AccountLogsPage from '@/pages/account/AccountLogsPage.vue';
import { listInstitutions, listLogs } from '@/gateways/firebaseDataGateway';
import { mountWithVuestic } from './utils/mount';

const routeParams = { rfc: DEFAULT_RFC };

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: routeParams }),
}));

vi.mock('@/gateways/firebaseDataGateway', () => ({
  getUserById: vi.fn(),
  getInstitutionByRfc: vi.fn(),
  listInstitutions: vi.fn(),
  listPermissionsByRfc: vi.fn(),
  listPermissionsByEmail: vi.fn(),
  listPermissionsByUser: vi.fn(),
  listContactsByRfc: vi.fn(),
  listRequestsByRfc: vi.fn(),
  listFindingsByRfc: vi.fn(),
  listLogs: vi.fn(),
}));

const mockedListLogs = vi.mocked(listLogs);
const mockedListInstitutions = vi.mocked(listInstitutions);

function logFixture(category = LOG_CATEGORIES.INSTITUTION_PLAN_UPDATE): Log {
  return {
    id: 'log-001',
    category,
    RFC: DEFAULT_RFC,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: 'trace-001',
    userId: 'uid-owner',
    execution: {
      executedByUserEmail: 'operator@example.test',
      executedByRole: ROLE.INSTITUTION_ADMIN,
    },
    impact: {},
    searchRequest: {},
    createdAt: 1710000000000,
  };
}

function mountPage(component: Component) {
  return mountWithVuestic(component, {
    global: {
      plugins: [createPinia()],
    },
  });
}

describe('logs pages', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    routeParams.rfc = DEFAULT_RFC;
    mockedListLogs.mockReset();
    mockedListInstitutions.mockReset();
    mockedListLogs.mockResolvedValue([logFixture()]);
    mockedListInstitutions.mockResolvedValue([
      {
        RFC: DEFAULT_RFC,
        name: 'Institucion Demo',
        plan: 'PORTAL',
        planStatus: 'ACTIVE',
        planStartAt: 1710000000000,
        planFinishAt: 1710000000000,
        updates: [],
        createdAt: 1710000000000,
        updatedAt: 1710000000000,
      },
    ]);
  });

  it('loads global admin logs and tenant filter options', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    const institutionStore = useInstitutionStore(pinia);
    authStore.setRole(ROLE.SYSTEM_ADMINISTRATOR);
    institutionStore.setActiveRfc(SYSTEM_RFC);

    const wrapper = mountWithVuestic(AdminLogsPage, { global: { plugins: [pinia] } });
    await flushPromises();

    expect(mockedListLogs).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 20, order: 'desc' }));
    expect(mockedListLogs).toHaveBeenCalledWith(expect.not.objectContaining({
      createdAtStart: expect.any(Number),
      createdAtEnd: expect.any(Number),
    }));
    expect(mockedListInstitutions).toHaveBeenCalled();
    expect(wrapper.get('[data-testid="logs-table"]').text()).toContain('operator@example.test');
  });

  it('loads tenant logs with route RFC and institution/PUI categories', async () => {
    const wrapper = mountPage(AppLogsPage);
    await flushPromises();

    expect(mockedListLogs).toHaveBeenCalledWith(expect.objectContaining({ RFC: DEFAULT_RFC }));
    expect(wrapper.text()).toContain('INSTITUTION_PLAN_UPDATE');
    expect(wrapper.text()).not.toContain('USER_ACCOUNT_LOGIN');
  });

  it('loads account logs with current user and RFC null', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore(pinia);
    authStore.setRole(ROLE.INSTITUTION_OPERATOR);
    authStore.setIdentity({ uid: 'uid-owner', email: 'owner@example.test' });

    const wrapper = mountWithVuestic(AccountLogsPage, { global: { plugins: [pinia] } });
    await flushPromises();

    expect(mockedListLogs).toHaveBeenCalledWith(expect.objectContaining({ RFC: null, userId: 'uid-owner' }));
    expect(wrapper.text()).toContain('Logs de cuenta');
    expect(wrapper.text()).toContain('TODO');
    expect(wrapper.text()).toContain('Fecha');
    expect(wrapper.text()).toContain('Categoría');
  });
});
