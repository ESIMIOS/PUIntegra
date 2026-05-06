/**
 * @package api
 * @name types.ts
 * @version 0.0.1
 * @description Tipos compartidos para módulos de dependencias runtime del API.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Define entradas compartidas para auth, instituciones y perfil de cuenta.	@codex
 */

import type { AuthEventName, AuthLifecycleEventName } from '../../services/authAuditService.js';

export type ActorIdentity = {
  userId: string;
  email?: string | null;
  role?: string | null;
};

export type AuthEventWriteInput = {
  event: AuthEventName;
  originTraceId: string;
  userId: string;
  email?: string | null;
  role?: string | null;
};

export type AuthLifecyclePolicyInput = {
  email: string;
  originTraceId: string;
  requestKey: string;
};

export type AuthLifecycleEventWriteInput = {
  event: AuthLifecycleEventName;
  originTraceId: string;
  userId?: string | null;
  email?: string | null;
};

export type ResetUserMfaInput = {
  userId: string;
  verificationNote: string;
  actor: ActorIdentity;
  originTraceId: string;
};

export type CreateInstitutionOnboardingInput = {
  payload: unknown;
  actor: ActorIdentity;
  originTraceId: string;
};

export type UpdateInstitutionPlanInput = {
  rfc: string;
  payload: unknown;
  actor: ActorIdentity;
  originTraceId: string;
};

export type UpsertInstitutionContactInput = {
  rfc: string;
  contactType: string;
  payload: unknown;
  actor: ActorIdentity;
  originTraceId: string;
};

export type UpdateInstitutionSharedSecretInput = {
  rfc: string;
  payload: unknown;
  actor: ActorIdentity;
  originTraceId: string;
};

export type CreateInstitutionPermissionInput = {
  rfc: string;
  payload: unknown;
  actor: ActorIdentity;
  originTraceId: string;
};

export type UpdateInstitutionPermissionInput = {
  rfc: string;
  permissionId: string;
  payload: unknown;
  actor: ActorIdentity;
  originTraceId: string;
};

export type AccountProfileUpdateInput = {
  payload: unknown;
  actor: ActorIdentity;
  originTraceId: string;
};
