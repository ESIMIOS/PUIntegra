import { beforeEach, describe, expect, it, vi } from 'vitest';
import { COMMERCIAL_PLAN, COMMERCIAL_PLAN_STATUS, DEFAULT_RFC, HTTP_STATUS, type SystemError } from '@shared';
import { updateInstitutionPlan } from '@/gateways/institutionPlanGateway';

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

describe('institution plan gateway', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            data: {
              institution: {
                RFC: DEFAULT_RFC,
                name: 'Institucion Demo',
                plan: COMMERCIAL_PLAN.CLOUD,
                planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
                planStartAt: 1767225600000,
                planFinishAt: 1798675200000,
                updates: [],
                createdAt: 1767225600000,
                updatedAt: 1767225600000,
              },
            },
          }),
          {
            status: HTTP_STATUS.OK,
            headers: { 'content-type': 'application/json' },
          },
        ),
      ),
    );
  });

  it('calls institution plan update API over HTTP', async () => {
    await updateInstitutionPlan(' aaa010101aaa ', {
      plan: COMMERCIAL_PLAN.CLOUD,
      planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
      planStartAt: 1767225600000,
      planFinishAt: 1798675200000,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/admin/institutions/AAA010101AAA/plan',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          authorization: 'Bearer id-token',
          'content-type': 'application/json',
        }),
      }),
    );
  });

  it('rejects invalid date ranges before HTTP call', async () => {
    await expect(
      updateInstitutionPlan('AAA010101AAA', {
        plan: COMMERCIAL_PLAN.CLOUD,
        planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
        planStartAt: 1798675200000,
        planFinishAt: 1767225600000,
      }),
    ).rejects.toMatchObject({} satisfies Partial<SystemError>);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
