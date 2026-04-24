import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  PERMISSION_STATUS,
  ROLE,
  SYSTEM_RFC
} from '@shared';
import { AppDataError, APP_DATA_ERROR_KIND } from '@/shared/errors/appErrors';
import { routePaths } from '@/shared/constants/routePaths';
import AdminNewInstitutionPage from '@/pages/admin/AdminNewInstitutionPage.vue';
import { mountWithVuestic } from './utils/mount';
import { createInstitutionOnboarding } from '@/gateways/institutionOnboardingGateway';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}));

vi.mock('@/gateways/institutionOnboardingGateway', () => ({
  createInstitutionOnboarding: vi.fn()
}));

const mockedCreateInstitutionOnboarding = vi.mocked(createInstitutionOnboarding);

function mountPage() {
  return mountWithVuestic(AdminNewInstitutionPage, {
    global: {
      plugins: [createPinia()]
    }
  });
}

describe('admin new institution page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    push.mockReset();
    mockedCreateInstitutionOnboarding.mockReset();
  });

  it('rejects reserved SYSTEM_RFC and avoids API call', async () => {
    const wrapper = mountPage();

    await wrapper.find('[data-testid="admin-new-institution-rfc"] input').setValue(SYSTEM_RFC);
    await wrapper.find('[data-testid="admin-new-institution-name"] input').setValue('Institucion Prueba');
    await wrapper.find('[data-testid="admin-new-institution-plan-start-at"] input').setValue('2026-01-01');
    await wrapper.find('[data-testid="admin-new-institution-plan-finish-at"] input').setValue('2026-12-31');
    await wrapper.find('[data-testid="admin-new-institution-admin-email"] input').setValue('owner@example.test');
    await wrapper.find('form').trigger('submit.prevent');

    expect(mockedCreateInstitutionOnboarding).not.toHaveBeenCalled();
    expect(wrapper.get('[data-testid="admin-new-institution-error"]').text()).toContain('Revisa los campos marcados');
  });

  it('shows field errors on submit without blur', async () => {
    const wrapper = mountPage();

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const renderedText = wrapper.text();
    expect(renderedText).toContain('RFC es requerido.');
    expect(renderedText).toContain('Nombre es requerido.');
    expect(renderedText).toContain('Inicio del plan es requerido.');
    expect(renderedText).toContain('Fin del plan es requerido.');
    expect(renderedText).toContain('Correo del administrador es requerido.');
  });

  it('keeps submit disabled until all requirements are valid', async () => {
    const wrapper = mountPage();
    const getSubmitButton = () => wrapper.get('[data-testid="admin-new-institution-submit"]');

    expect(getSubmitButton().attributes('disabled')).toBeDefined();

    await wrapper.find('[data-testid="admin-new-institution-rfc"] input').setValue('AAA010101AAA');
    await wrapper.find('[data-testid="admin-new-institution-name"] input').setValue('Institucion Prueba');
    await wrapper.find('[data-testid="admin-new-institution-plan-start-at"] input').setValue('2026-01-01');
    await wrapper.find('[data-testid="admin-new-institution-plan-finish-at"] input').setValue('2026-12-31');
    await wrapper.find('[data-testid="admin-new-institution-admin-email"] input').setValue('owner@example.test');
    await flushPromises();

    expect(getSubmitButton().attributes('disabled')).toBeUndefined();
  });

  it('renders API validation errors from data store mapping', async () => {
    mockedCreateInstitutionOnboarding.mockRejectedValue(
      new AppDataError(APP_DATA_ERROR_KIND.VALIDATION, 'payload rejected')
    );
    const wrapper = mountPage();

    await wrapper.find('[data-testid="admin-new-institution-rfc"] input').setValue('AAA010101AAA');
    await wrapper.find('[data-testid="admin-new-institution-name"] input').setValue('Institucion Prueba');
    await wrapper.find('[data-testid="admin-new-institution-plan-start-at"] input').setValue('2026-01-01');
    await wrapper.find('[data-testid="admin-new-institution-plan-finish-at"] input').setValue('2026-12-31');
    await wrapper.find('[data-testid="admin-new-institution-admin-email"] input').setValue('owner@example.test');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.get('[data-testid="admin-new-institution-error"]').text()).toContain('Revisa los campos marcados');
    expect(wrapper.find('[data-testid="admin-new-institution-retry"]').exists()).toBe(true);
  });

  it('renders explicit backend displayMessage when provided', async () => {
    mockedCreateInstitutionOnboarding.mockRejectedValue(
      new AppDataError(APP_DATA_ERROR_KIND.CONFLICT, 'duplicate rfc', {
        displayMessage: 'Ya existe una institución registrada con RFC AAA010101AAA.'
      })
    );
    const wrapper = mountPage();

    await wrapper.find('[data-testid="admin-new-institution-rfc"] input').setValue('AAA010101AAA');
    await wrapper.find('[data-testid="admin-new-institution-name"] input').setValue('Institucion Prueba');
    await wrapper.find('[data-testid="admin-new-institution-plan-start-at"] input').setValue('2026-01-01');
    await wrapper.find('[data-testid="admin-new-institution-plan-finish-at"] input').setValue('2026-12-31');
    await wrapper.find('[data-testid="admin-new-institution-admin-email"] input').setValue('owner@example.test');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.get('[data-testid="admin-new-institution-error"]').text()).toContain(
      'Ya existe una institución registrada con RFC AAA010101AAA.'
    );
  });

  it('shows success result and navigates only when user clicks detail action', async () => {
    mockedCreateInstitutionOnboarding.mockResolvedValue({
      institution: {
        RFC: 'AAA010101AAA',
        name: 'Institucion Prueba',
        plan: COMMERCIAL_PLAN.PORTAL,
        planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
        planStartAt: 1767225600000,
        planFinishAt: 1798675200000,
        createdAt: 1767225600000,
        updatedAt: 1767225600000
      },
      permission: {
        permissionId: 'owner@example.test__aaa010101aaa',
        RFC: 'AAA010101AAA',
        email: 'owner@example.test',
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
        createdAt: 1767225600000,
        updatedAt: 1767225600000
      }
    });
    const wrapper = mountPage();

    await wrapper.find('[data-testid="admin-new-institution-rfc"] input').setValue('AAA010101AAA');
    await wrapper.find('[data-testid="admin-new-institution-name"] input').setValue('Institucion Prueba');
    await wrapper.find('[data-testid="admin-new-institution-plan-start-at"] input').setValue('2026-01-01');
    await wrapper.find('[data-testid="admin-new-institution-plan-finish-at"] input').setValue('2026-12-31');
    await wrapper.find('[data-testid="admin-new-institution-admin-email"] input').setValue('owner@example.test');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(mockedCreateInstitutionOnboarding).toHaveBeenCalledWith({
      RFC: 'AAA010101AAA',
      name: 'Institucion Prueba',
      plan: COMMERCIAL_PLAN.PORTAL,
      planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
      planStartAt: Date.parse('2026-01-01T00:00:00.000Z'),
      planFinishAt: Date.parse('2026-12-31T00:00:00.000Z'),
      adminEmail: 'owner@example.test'
    });
    expect(wrapper.find('[data-testid="admin-new-institution-result-success"]').exists()).toBe(true);
    expect(push).not.toHaveBeenCalled();

    await wrapper.get('[data-testid="admin-new-institution-go-detail"]').trigger('click');
    expect(push).toHaveBeenCalledWith(routePaths.adminInstitution('AAA010101AAA'));
  });

  it('allows creating another institution after success', async () => {
    mockedCreateInstitutionOnboarding.mockResolvedValue({
      institution: {
        RFC: 'AAA010101AAA',
        name: 'Institucion Prueba',
        plan: COMMERCIAL_PLAN.PORTAL,
        planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
        planStartAt: 1767225600000,
        planFinishAt: 1798675200000,
        createdAt: 1767225600000,
        updatedAt: 1767225600000
      },
      permission: {
        permissionId: 'owner@example.test__aaa010101aaa',
        RFC: 'AAA010101AAA',
        email: 'owner@example.test',
        role: ROLE.INSTITUTION_ADMIN,
        status: PERMISSION_STATUS.GRANTED,
        createdAt: 1767225600000,
        updatedAt: 1767225600000
      }
    });
    const wrapper = mountPage();

    await wrapper.find('[data-testid="admin-new-institution-rfc"] input').setValue('AAA010101AAA');
    await wrapper.find('[data-testid="admin-new-institution-name"] input').setValue('Institucion Prueba');
    await wrapper.find('[data-testid="admin-new-institution-plan-start-at"] input').setValue('2026-01-01');
    await wrapper.find('[data-testid="admin-new-institution-plan-finish-at"] input').setValue('2026-12-31');
    await wrapper.find('[data-testid="admin-new-institution-admin-email"] input').setValue('owner@example.test');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    await wrapper.get('[data-testid="admin-new-institution-create-another"]').trigger('click');

    expect(wrapper.find('[data-testid="admin-new-institution-form"]').exists()).toBe(true);
  });
});
