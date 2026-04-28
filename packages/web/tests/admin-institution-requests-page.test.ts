import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_FUB, DEFAULT_RFC, PUI_LUGAR_NACIMIENTO, SEARCH_REQUEST_PHASE_STATUS, SEARCH_REQUEST_STATUS } from '@shared';
import AdminInstitutionRequestsPage from '@/pages/admin/AdminInstitutionRequestsPage.vue';
import { listRequestsByRfc } from '@/gateways/firebaseDataGateway';
import { mountWithVuestic } from './utils/mount';

const push = vi.fn();
const routeParams = { rfc: DEFAULT_RFC };

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: routeParams }),
  useRouter: () => ({ push }),
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

const mockedListRequestsByRfc = vi.mocked(listRequestsByRfc);

function mountPage() {
  return mountWithVuestic(AdminInstitutionRequestsPage, {
    global: {
      plugins: [createPinia()],
    },
  });
}

describe('admin institution requests page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    routeParams.rfc = DEFAULT_RFC;
    mockedListRequestsByRfc.mockReset();
  });

  it('renders readonly request rows for the RFC tenant', async () => {
    mockedListRequestsByRfc.mockResolvedValue([
      {
        requestId: 'request-001',
        RFC: DEFAULT_RFC,
        FUB: DEFAULT_FUB,
        CURP: 'AAAA000000HDFXXX00',
        missingDate: 1767225600000,
        searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
        searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
        searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
        searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
        data: {
          id: `${DEFAULT_FUB}-550e8400-e29b-41d4-a716-446655440000`,
          curp: 'AAAA000000HDFXXX00',
          nombre: 'Maria',
          primer_apellido: 'Lopez',
          fecha_desaparicion: '2026-04-15',
          lugar_nacimiento: PUI_LUGAR_NACIMIENTO.DF,
        },
        updates: [],
        createdAt: 1767225600000,
        updatedAt: 1767225600000,
      },
    ]);

    const wrapper = mountPage();
    await flushPromises();

    expect(mockedListRequestsByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.find('[data-testid="admin-requests-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(DEFAULT_FUB);
    expect(wrapper.text()).toContain('AAAA000000HDFXXX00');
  });
});
