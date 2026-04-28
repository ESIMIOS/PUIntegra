/**
 * @package web
 * @name institutionPlanGateway.ts
 * @version 0.0.1
 * @description Envía ediciones de plan institucional al API HTTP autenticado.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-27)	Agrega gateway HTTP para actualizar planes institucionales.	@codex
 */

import {
  DEFAULT_RFC,
  InstitutionSchema,
  SYSTEM_RFC,
  SystemError,
  UpdateInstitutionPlanSchema,
  type UpdateInstitutionPlan,
} from '@shared';
import { z } from 'zod';
import { getFirebaseRuntime } from '@/plugins/firebase';
import { executeHttpApi, resolveApiUrl } from '@/gateways/httpApiGateway';
import { systemMessageTree } from '@/shared/constants/systemMessages';

const UpdateInstitutionPlanResponseSchema = z.object({
  institution: InstitutionSchema,
});

export type UpdateInstitutionPlanResponse = z.infer<typeof UpdateInstitutionPlanResponseSchema>;

/**
 * @description Actualiza el plan institucional vía API HTTP autenticado.
 */
export async function updateInstitutionPlan(
  rfc: string,
  input: UpdateInstitutionPlan,
): Promise<UpdateInstitutionPlanResponse> {
  const normalizedRfc = rfc.trim().toUpperCase();
  const parsed = UpdateInstitutionPlanSchema.safeParse(input);
  if (!parsed.success || normalizedRfc === SYSTEM_RFC || normalizedRfc === DEFAULT_RFC) {
    throw new SystemError(systemMessageTree.shared.data.operation.validationFailed, {
      displayMessage: 'Datos de plan inválidos. Por favor verifica la información e intenta de nuevo.',
      details: {
        RFC: normalizedRfc,
        issues: parsed.success ? [] : parsed.error.issues,
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
  return executeHttpApi<UpdateInstitutionPlanResponse>({
    url: resolveApiUrl(`/api/admin/institutions/${normalizedRfc}/plan`),
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(parsed.data),
    parseData: UpdateInstitutionPlanResponseSchema,
    transportMessage: 'La solicitud de actualización de plan institucional falló',
  });
}
