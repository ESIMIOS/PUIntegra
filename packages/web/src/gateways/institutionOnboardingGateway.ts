/**
 * @package web
 * @name institutionOnboardingGateway.ts
 * @version 0.0.1
 * @description Envía altas institucionales al API HTTP autenticado del backoffice.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-23)	Agrega gateway HTTP para onboarding institucional sin escritura directa Firestore cliente.	@codex
 */

import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  PERMISSION_STATUS,
  ROLE,
  CommercialPlanSchema,
  CommercialPlanStatusSchema,
  SYSTEM_RFC,
  SystemError,
} from '@shared';
import { z } from 'zod';
import { getFirebaseRuntime } from '@/plugins/firebase';
import { executeHttpApi, resolveApiUrl } from '@/gateways/httpApiGateway';
import { systemMessageTree } from '@/shared/constants/systemMessages';

const CreateInstitutionOnboardingInputSchema = z.object({
  RFC: z.string().min(1),
  name: z.string().min(1),
  plan: CommercialPlanSchema,
  planStatus: CommercialPlanStatusSchema,
  planStartAt: z.number().int().nonnegative(),
  planFinishAt: z.number().int().nonnegative(),
  adminEmail: z.string().email(),
});

const CreateInstitutionOnboardingResponseSchema = z.object({
  institution: z.object({
    RFC: z.string().min(1),
    name: z.string().min(1),
    plan: z.enum([COMMERCIAL_PLAN.PORTAL, COMMERCIAL_PLAN.CLOUD, COMMERCIAL_PLAN.ENTERPRISE]),
    planStatus: z.enum([
      COMMERCIAL_PLAN_STATUS.ACTIVE,
      COMMERCIAL_PLAN_STATUS.WARNING,
      COMMERCIAL_PLAN_STATUS.PAUSED,
      COMMERCIAL_PLAN_STATUS.STOPPED,
    ]),
    planStartAt: z.number().int().nonnegative(),
    planFinishAt: z.number().int().nonnegative(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
  }),
  permission: z.object({
    permissionId: z.string().min(1),
    RFC: z.string().min(1),
    email: z.string().email(),
    role: z.literal(ROLE.INSTITUTION_ADMIN),
    status: z.literal(PERMISSION_STATUS.GRANTED),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
  }),
});

export type CreateInstitutionOnboardingInput = z.infer<typeof CreateInstitutionOnboardingInputSchema>;
export type CreateInstitutionOnboardingResponse = z.infer<typeof CreateInstitutionOnboardingResponseSchema>;

/**
 * @description Crea institución y permiso bootstrap vía API HTTP autenticado.
 */
export async function createInstitutionOnboarding(
  input: CreateInstitutionOnboardingInput,
): Promise<CreateInstitutionOnboardingResponse> {
  const parsed = CreateInstitutionOnboardingInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new SystemError(systemMessageTree.shared.data.operation.validationFailed, {
      displayMessage: 'Datos de onboarding inválidos. Por favor verifica la información e intenta de nuevo.',
      details: {
        issues: parsed.error.issues,
      },
    });
  }

  const payload = {
    ...parsed.data,
    RFC: parsed.data.RFC.trim().toUpperCase(),
    name: parsed.data.name.trim(),
    adminEmail: parsed.data.adminEmail.trim().toLowerCase(),
  };
  if (payload.RFC === SYSTEM_RFC || payload.RFC === DEFAULT_RFC) {
    throw new SystemError(systemMessageTree.shared.data.operation.validationFailed, {
      displayMessage: 'RFC reservado no puede ser utilizado para el onboarding.',
      details: {
        RFC: payload.RFC,
      },
    });
  }

  const firebaseUser = getFirebaseRuntime().auth.currentUser;
  if (!firebaseUser) {
    throw new SystemError(systemMessageTree.shared.data.operation.forbiddenOperation, {
      displayMessage: 'La sesión actual no está autenticada.',
    });
  }

  const token = await firebaseUser.getIdToken();
  return executeHttpApi<CreateInstitutionOnboardingResponse>({
    url: resolveApiUrl('/api/admin/institutions'),
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    parseData: CreateInstitutionOnboardingResponseSchema,
    transportMessage: 'La solicitud de onboarding institucional falló',
  });
}
