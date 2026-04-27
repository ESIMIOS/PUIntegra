import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  HTTP_STATUS,
  PERMISSION_STATUS,
  ROLE,
  SYSTEM_RFC,
  type SystemError,
} from '@shared';
import { createInstitutionOnboarding } from '@/gateways/institutionOnboardingGateway';

const mocks = vi.hoisted(() => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('id-token'),
    },
  },
}));

vi.mock('@/plugins/firebase', () => ({
  getFirebaseRuntime: () => ({
    auth: mocks.auth,
  }),
}));

describe('institution onboarding gateway', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            data: {
              institution: {
                RFC: 'AAA010101AAA',
                name: 'Institucion Prueba',
                plan: COMMERCIAL_PLAN.PORTAL,
                planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
                planStartAt: 1767225600000,
                planFinishAt: 1798675200000,
                createdAt: 1767225600000,
                updatedAt: 1767225600000,
              },
              permission: {
                permissionId: 'owner@example.test__aaa010101aaa',
                RFC: 'AAA010101AAA',
                email: 'owner@example.test',
                role: ROLE.INSTITUTION_ADMIN,
                status: PERMISSION_STATUS.GRANTED,
                createdAt: 1767225600000,
                updatedAt: 1767225600000,
              },
            },
          }),
          {
            status: HTTP_STATUS.CREATED,
            headers: { 'content-type': 'application/json' },
          },
        ),
      ),
    );
  });

  it('calls onboarding API over HTTP', async () => {
    await createInstitutionOnboarding({
      RFC: 'AAA010101AAA',
      name: 'Institucion Prueba',
      plan: COMMERCIAL_PLAN.PORTAL,
      planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
      planStartAt: 1767225600000,
      planFinishAt: 1798675200000,
      adminEmail: 'owner@example.test',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/admin/institutions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer id-token',
          'content-type': 'application/json',
        }),
      }),
    );
  });

  it('rejects reserved RFC values before HTTP call', async () => {
    await expect(
      createInstitutionOnboarding({
        RFC: SYSTEM_RFC,
        name: 'Institucion Prueba',
        plan: COMMERCIAL_PLAN.PORTAL,
        planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
        planStartAt: 1767225600000,
        planFinishAt: 1798675200000,
        adminEmail: 'owner@example.test',
      }),
    ).rejects.toMatchObject({} satisfies Partial<SystemError>);
  });

  it('maps 404 endpoint responses to server error kind', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<!doctype html>', {
          status: 404,
          headers: { 'content-type': 'text/html' },
        }),
      ),
    );

    await expect(
      createInstitutionOnboarding({
        RFC: 'AAA010101AAA',
        name: 'Institucion Prueba',
        plan: COMMERCIAL_PLAN.PORTAL,
        planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
        planStartAt: 1767225600000,
        planFinishAt: 1798675200000,
        adminEmail: 'owner@example.test',
      }),
    ).rejects.toMatchObject({} satisfies Partial<SystemError>);
  });

  it('preserves API displayMessage when API code is not locally registered', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: 'API-ADMIN-007',
              message: 'Institution already exists.',
              uiMessageKey: 'api.admin.institutions.duplicate_rfc',
              displayMessage: 'Ya existe una institución registrada con RFC AAA010101AAA.',
            },
          }),
          {
            status: HTTP_STATUS.CONFLICT,
            headers: { 'content-type': 'application/json' },
          },
        ),
      ),
    );

    await expect(
      createInstitutionOnboarding({
        RFC: 'AAA010101AAA',
        name: 'Institucion Prueba',
        plan: COMMERCIAL_PLAN.PORTAL,
        planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
        planStartAt: 1767225600000,
        planFinishAt: 1798675200000,
        adminEmail: 'owner@example.test',
      }),
    ).rejects.toMatchObject({
      code: 'API-ADMIN-007',
      displayMessage: 'Ya existe una institución registrada con RFC AAA010101AAA.',
    } satisfies Partial<SystemError>);
  });
});
