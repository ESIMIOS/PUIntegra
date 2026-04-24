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
  ApiResponseSchema,
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_RFC,
  PERMISSION_STATUS,
  ROLE,
  CommercialPlanSchema,
  CommercialPlanStatusSchema,
  SYSTEM_RFC,
  type ApiResponse
} from '@shared';
import { z } from 'zod';
import { getFirebaseRuntime } from '@/plugins/firebase';
import { APP_DATA_ERROR_KIND, AppDataError } from '@/shared/errors/appErrors';

const CreateInstitutionOnboardingInputSchema = z.object({
  RFC: z.string().min(1),
  name: z.string().min(1),
  plan: CommercialPlanSchema,
  planStatus: CommercialPlanStatusSchema,
  planStartAt: z.number().int().nonnegative(),
  planFinishAt: z.number().int().nonnegative(),
  adminEmail: z.string().email()
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
      COMMERCIAL_PLAN_STATUS.STOPPED
    ]),
    planStartAt: z.number().int().nonnegative(),
    planFinishAt: z.number().int().nonnegative(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative()
  }),
  permission: z.object({
    permissionId: z.string().min(1),
    RFC: z.string().min(1),
    email: z.string().email(),
    role: z.literal(ROLE.INSTITUTION_ADMIN),
    status: z.literal(PERMISSION_STATUS.GRANTED),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative()
  })
});

export type CreateInstitutionOnboardingInput = z.infer<typeof CreateInstitutionOnboardingInputSchema>;
export type CreateInstitutionOnboardingResponse = z.infer<typeof CreateInstitutionOnboardingResponseSchema>;

/**
 * @description Resuelve URL base del API HTTP para entorno local/emulador.
 */
function resolveApiUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
  if (baseUrl.endsWith('/api') && path.startsWith('/api/')) {
    return `${baseUrl}${path.substring(4)}`;
  }
  return `${baseUrl}${path}`;
}

/**
 * @description Convierte un status HTTP API a error neutral de datos.
 */
function toDataError(status: number, fallbackMessage: string, details: Record<string, unknown> = {}) {
  if (status === 400 || status === 422) {
    return new AppDataError(APP_DATA_ERROR_KIND.VALIDATION, fallbackMessage, details);
  }
  if (status === 403) {
    return new AppDataError(APP_DATA_ERROR_KIND.FORBIDDEN, fallbackMessage, details);
  }
  if (status === 409) {
    return new AppDataError(APP_DATA_ERROR_KIND.CONFLICT, fallbackMessage, details);
  }
  if (status === 404) {
    return new AppDataError(
      APP_DATA_ERROR_KIND.SERVER_ERROR,
      'Institution onboarding API endpoint is unavailable.',
      details
    );
  }
  if (status >= 500) {
    return new AppDataError(APP_DATA_ERROR_KIND.SERVER_ERROR, fallbackMessage, details);
  }
  return new AppDataError(APP_DATA_ERROR_KIND.UNKNOWN, fallbackMessage, details);
}

/**
 * @description Crea institución y permiso bootstrap vía API HTTP autenticado.
 */
export async function createInstitutionOnboarding(input: CreateInstitutionOnboardingInput): Promise<CreateInstitutionOnboardingResponse> {
  const parsed = CreateInstitutionOnboardingInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppDataError(APP_DATA_ERROR_KIND.VALIDATION, 'Invalid institution onboarding payload.', {
      issues: parsed.error.issues
    });
  }

  const payload = {
    ...parsed.data,
    RFC: parsed.data.RFC.trim().toUpperCase(),
    name: parsed.data.name.trim(),
    adminEmail: parsed.data.adminEmail.trim().toLowerCase()
  };
  if (payload.RFC === SYSTEM_RFC || payload.RFC === DEFAULT_RFC) {
    throw new AppDataError(APP_DATA_ERROR_KIND.VALIDATION, 'Reserved RFC cannot be used for onboarding.', {
      RFC: payload.RFC
    });
  }

  const firebaseUser = getFirebaseRuntime().auth.currentUser;
  if (!firebaseUser) {
    throw new AppDataError(APP_DATA_ERROR_KIND.FORBIDDEN, 'Current session is not authenticated.');
  }

  const token = await firebaseUser.getIdToken();
  const response = await fetch(resolveApiUrl('/api/admin/institutions'), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let payloadResponse: unknown;
  try {
    payloadResponse = await response.json();
  } catch {
    throw toDataError(response.status, 'Failed to parse onboarding API response.', {
      status: response.status
    });
  }

  const apiEnvelope = ApiResponseSchema.safeParse(payloadResponse);
  if (!apiEnvelope.success) {
    throw toDataError(response.status, 'Onboarding API response does not match envelope contract.', {
      issues: apiEnvelope.error.issues
    });
  }

  const apiResponse: ApiResponse = apiEnvelope.data;
  if (!apiResponse.ok) {
    throw toDataError(
      response.status,
      apiResponse.error.displayMessage ?? apiResponse.error.message,
      {
        code: apiResponse.error.code,
        uiMessageKey: apiResponse.error.uiMessageKey,
        displayMessage: apiResponse.error.displayMessage,
        details: apiResponse.error.details
      }
    );
  }

  const parsedData = CreateInstitutionOnboardingResponseSchema.safeParse(apiResponse.data);
  if (!parsedData.success) {
    throw toDataError(500, 'Onboarding API success payload is invalid.', {
      issues: parsedData.error.issues
    });
  }
  return parsedData.data;
}
