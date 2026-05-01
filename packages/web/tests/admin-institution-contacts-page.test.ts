import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_RFC, INSTITUTION_CONTACT_TYPE, UPDATE_ORIGIN } from '@shared';
import AdminInstitutionContactsPage from '@/pages/admin/AdminInstitutionContactsPage.vue';
import { listContactsByRfc } from '@/gateways/firebaseDataGateway';
import { mountWithVuestic } from './utils/mount';

const routeParams = { rfc: DEFAULT_RFC };

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: routeParams }),
  useRouter: () => ({ push: vi.fn() }),
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

const mockedListContactsByRfc = vi.mocked(listContactsByRfc);

function mountPage() {
  return mountWithVuestic(AdminInstitutionContactsPage, {
    global: {
      plugins: [createPinia()],
    },
  });
}

describe('admin institution contacts page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    routeParams.rfc = DEFAULT_RFC;
    mockedListContactsByRfc.mockReset();
  });

  it('renders readonly contact rows for the RFC tenant', async () => {
    mockedListContactsByRfc.mockResolvedValue([
      {
        contactId: 'contact-001',
        type: INSTITUTION_CONTACT_TYPE.TECHNICAL,
        RFC: DEFAULT_RFC,
        name: 'Contacto Técnico',
        phone: '+525500000000',
        contactCURP: 'AAAA000000HDFXXX00',
        contactRFC: 'AAA010101AAA',
        updates: [
          {
            previousPhone: '+525500000000',
            updatedPhone: '+525500000001',
            updateOrigin: UPDATE_ORIGIN.USER,
            updatedAt: 1767225601000,
          },
        ],
        createdAt: 1767225600000,
        updatedAt: 1767225600000,
      },
    ]);

    const wrapper = mountPage();
    await flushPromises();

    expect(mockedListContactsByRfc).toHaveBeenCalledWith(DEFAULT_RFC);
    expect(wrapper.find('[data-testid="admin-contacts-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Contacto Técnico');
    expect(wrapper.text()).toContain(INSTITUTION_CONTACT_TYPE.TECHNICAL);
    expect(wrapper.find('[data-testid="admin-contact-history-contact-001"]').exists()).toBe(true);
  });
});
