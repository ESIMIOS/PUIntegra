/**
 * @package api
 * @name types.ts
 * @version 0.0.1
 * @description Tipos compartidos para handlers HTTP del API.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae tipos de routeHandlers para reducir acoplamiento por archivo.	@codex
 */

import type { AuthEventName, AuthLifecycleEventName } from '../../services/authAuditService.js';

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
