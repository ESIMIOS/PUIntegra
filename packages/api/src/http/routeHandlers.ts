/**
 * @package api
 * @name routeHandlers.ts
 * @version 0.0.2
 * @description Define handlers HTTP de Hono para mantener createApiApp enfocado en wiring de rutas.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-05-01)	Agrega handler autenticado para actualización de perfil de cuenta.	@codex
 * - 0.0.1	(2026-04-23)	Extrae handlers de rutas y tipos de dependencias del API.	@codex
 */

import type { Context } from 'hono';
import { DEFAULT_RFC, ROLE, SYSTEM_RFC, SystemError, HTTP_STATUS } from '@puintegra/shared';
import { z } from 'zod';
import { type AuthEventName, type AuthLifecycleEventName } from '../services/authAuditService.js';
import { apiSystemMessages } from '../constants/systemMessages.js';
import { parseInstitutionOnboardingInput } from '../services/institutionOnboardingService.js';
import { parseInstitutionPlanUpdateInput } from '../services/institutionPlanService.js';
import { apiOk } from './apiResponse.js';

export type VerifiedBearerToken = {
  userId: string;
  email?: string | null;
  role?: string | null;
};

export type RecordAuthEventInput = VerifiedBearerToken & {
  event: AuthEventName;
  originTraceId: string;
};

export type AuthLifecyclePolicyInput = {
  email: string;
  originTraceId: string;
  requestKey: string;
};

export type RecordAuthLifecycleEventInput = {
  event: AuthLifecycleEventName;
  originTraceId: string;
  userId?: string | null;
  email?: string | null;
};

export type ResetUserMfaInput = {
  userId: string;
  verificationNote: string;
  actor: VerifiedBearerToken;
  originTraceId: string;
};

export type CreateApiAppDependencies = {
  verifyBearerToken: (token: string) => Promise<VerifiedBearerToken>;
  recordAuthEvent: (input: RecordAuthEventInput) => Promise<unknown>;
  checkAccountCreationPolicy?: (input: AuthLifecyclePolicyInput) => Promise<unknown>;
  requestPasswordRecovery?: (input: AuthLifecyclePolicyInput) => Promise<unknown>;
  recordAuthLifecycleEvent?: (input: RecordAuthLifecycleEventInput) => Promise<unknown>;
  resetUserMfa?: (input: ResetUserMfaInput) => Promise<unknown>;
  createInstitutionOnboarding: (input: {
    payload: unknown;
    actor: VerifiedBearerToken;
    originTraceId: string;
  }) => Promise<unknown>;
  updateInstitutionPlan?: (input: {
    rfc: string;
    payload: unknown;
    actor: VerifiedBearerToken;
    originTraceId: string;
  }) => Promise<unknown>;
  updateAccountProfile?: (input: {
    payload: unknown;
    actor: VerifiedBearerToken;
    originTraceId: string;
  }) => Promise<unknown>;
  createOriginTraceId: () => string;
};

const EmailPayloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const LifecycleCompletionPayloadSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
});

const MfaResetPayloadSchema = z.object({
  verificationNote: z.string().trim().min(12),
});

const AccountProfilePayloadSchema = z.object({
  name: z.string().trim().min(1),
  emojiIcon: z.string().trim().min(1),
  phone: z.string().trim().optional().nullable(),
});

/**
 * @description Extrae token Bearer del encabezado Authorization.
 */
function readBearerToken(authorization: string | undefined) {
  const [scheme, token] = authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

/**
 * @description Resuelve una llave de rate-limit sin exponer datos sensibles.
 */
function readRequestKey(context: Context, email: string) {
  const forwardedFor = context.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  const clientId = forwardedFor || context.req.header('x-real-ip') || 'unknown-client';
  return `${clientId}:${email}`;
}

/**
 * @description Lee JSON y normaliza errores de payload para rutas auth lifecycle.
 */
async function readJsonPayload(context: Context) {
  try {
    return await context.req.json();
  } catch {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload);
  }
}

function parseEmailPayload(payload: unknown) {
  const parsed = EmailPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: {
        issues: parsed.error.issues,
      },
    });
  }
  return parsed.data;
}

function parseLifecycleCompletionPayload(payload: unknown) {
  const parsed = LifecycleCompletionPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: {
        issues: parsed.error.issues,
      },
    });
  }
  return parsed.data;
}

/**
 * @description Usa identificadores de ejecución/traza disponibles para correlación con logs de Cloud Functions.
 */
export function readOriginTraceId(context: Context, createOriginTraceId: () => string) {
  return (
    context.req.header('function-execution-id') ??
    context.req.header('x-cloud-trace-context') ??
    context.req.header('x-request-id') ??
    createOriginTraceId()
  );
}

/**
 * @description Crea handler de login/logout auditado.
 */
export function createAuthEventHandler(dependencies: CreateApiAppDependencies, event: AuthEventName) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    await dependencies.recordAuthEvent({
      event,
      originTraceId,
      userId: verified.userId,
      email: verified.email ?? null,
    });

    return context.json(
      apiOk(
        {
          recorded: true,
        },
        { originTraceId },
      ),
    );
  };
}

/**
 * @description Crea handler público de prevalidación de creación de cuenta.
 */
export function createAccountCreationPolicyHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const payload = parseEmailPayload(await readJsonPayload(context));
    const result = await dependencies.checkAccountCreationPolicy?.({
      email: payload.email,
      originTraceId,
      requestKey: readRequestKey(context, payload.email),
    });

    return context.json(apiOk(result ?? { eligible: true }, { originTraceId }));
  };
}

/**
 * @description Crea handler público de recuperación neutral de contraseña.
 */
export function createPasswordRecoveryHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const payload = parseEmailPayload(await readJsonPayload(context));
    await dependencies.requestPasswordRecovery?.({
      email: payload.email,
      originTraceId,
      requestKey: readRequestKey(context, payload.email),
    });

    return context.json(
      apiOk(
        {
          accepted: true,
          message: 'Si la cuenta existe, enviaremos instrucciones al correo indicado.',
        },
        { originTraceId },
      ),
    );
  };
}

/**
 * @description Crea handler de eventos sanitizados del ciclo de vida Auth.
 */
export function createAuthLifecycleEventHandler(
  dependencies: CreateApiAppDependencies,
  event: AuthLifecycleEventName,
) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const payload = parseLifecycleCompletionPayload(await readJsonPayload(context));
    await dependencies.recordAuthLifecycleEvent?.({
      event,
      originTraceId,
      userId: payload.userId ?? null,
      email: payload.email ?? null,
    });

    return context.json(apiOk({ recorded: true }, { originTraceId }));
  };
}

/**
 * @description Crea handler autenticado de restablecimiento administrativo MFA.
 */
export function createMfaResetHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    if (verified.role !== ROLE.SYSTEM_ADMINISTRATOR) {
      throw new SystemError(apiSystemMessages.auth.lifecycle.forbiddenMfaReset);
    }

    const parsedPayload = MfaResetPayloadSchema.safeParse(await readJsonPayload(context));
    if (!parsedPayload.success) {
      throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
        details: {
          issues: parsedPayload.error.issues,
        },
      });
    }

    const userId = context.req.param('userId');
    if (!userId) {
      throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload);
    }

    const result = await dependencies.resetUserMfa?.({
      userId,
      verificationNote: parsedPayload.data.verificationNote,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(result ?? { reset: true }, { originTraceId }));
  };
}

/**
 * @description Crea handler de onboarding institucional de backoffice.
 */
export function createInstitutionOnboardingHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    if (verified.role !== ROLE.SYSTEM_ADMINISTRATOR) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole);
    }

    let payload: unknown;
    try {
      payload = await context.req.json();
    } catch {
      throw new SystemError(apiSystemMessages.admin.institutions.invalidPayload, {
        displayMessage: 'No se pudo leer el payload del alta institucional.',
      });
    }

    const normalizedPayload = parseInstitutionOnboardingInput(payload);
    if (normalizedPayload.RFC === SYSTEM_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnSystemRfc);
    }
    if (normalizedPayload.RFC === DEFAULT_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnDefaultRfc);
    }

    const created = await dependencies.createInstitutionOnboarding({
      payload: normalizedPayload,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(created, { originTraceId }), HTTP_STATUS.CREATED);
  };
}

/**
 * @description Crea handler de edición auditada de plan institucional de backoffice.
 */
export function createInstitutionPlanUpdateHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    if (verified.role !== ROLE.SYSTEM_ADMINISTRATOR) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole);
    }

    const rfc = (context.req.param('rfc') ?? '').trim().toUpperCase();
    if (rfc === SYSTEM_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnSystemRfc);
    }
    if (rfc === DEFAULT_RFC) {
      throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnDefaultRfc);
    }

    let payload: unknown;
    try {
      payload = await context.req.json();
    } catch {
      throw new SystemError(apiSystemMessages.admin.institutions.invalidPayload, {
        displayMessage: 'No se pudo leer el payload de edición del plan institucional.',
      });
    }

    const normalizedPayload = parseInstitutionPlanUpdateInput(payload);
    if (!dependencies.updateInstitutionPlan) {
      throw new Error('updateInstitutionPlan dependency is not configured.');
    }

    const updated = await dependencies.updateInstitutionPlan({
      rfc,
      payload: normalizedPayload,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(updated, { originTraceId }));
  };
}

/**
 * @description Crea handler autenticado para edición de perfil de cuenta propia.
 */
export function createAccountProfileUpdateHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    if (!dependencies.updateAccountProfile) {
      throw new Error('updateAccountProfile dependency is not configured.');
    }

    const parsedPayload = AccountProfilePayloadSchema.safeParse(await readJsonPayload(context));
    if (!parsedPayload.success) {
      throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
        details: {
          issues: parsedPayload.error.issues,
        },
      });
    }

    const updated = await dependencies.updateAccountProfile({
      payload: parsedPayload.data,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(updated, { originTraceId }));
  };
}
