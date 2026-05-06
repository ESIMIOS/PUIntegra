/**
 * @package api
 * @name appAdminInstitutionService.ts
 * @version 0.0.1
 * @description Construye mutaciones administrativas institucionales del dominio app con trazabilidad auditada.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-04)	Agrega builders para contactos, secreto compartido y permisos en /app/:rfc/admin.	@codex
 */

import {
  AppAdminContactUpsertPayloadSchema,
  AppAdminPermissionCreatePayloadSchema,
  AppAdminPermissionUpdatePayloadSchema,
  AppAdminSharedSecretUpdatePayloadSchema,
  ContactSchema,
  INSTITUTION_CONTACT_TYPE,
  InstitutionSchema,
  LOG_CATEGORIES,
  LOG_ORIGIN,
  LogSchema,
  PermissionSchema,
  ROLE,
  RoleSchema,
  SystemError,
  UPDATE_ORIGIN,
  type Contact,
  type Institution,
  type Permission,
} from '@puintegra/shared';
import { Buffer } from 'node:buffer';
import { createHash, createCipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { apiSystemMessages } from '../constants/systemMessages.js';

type ValidActor = {
  userId: string;
  email: string;
  role: (typeof RoleSchema)['enum'][keyof (typeof RoleSchema)['enum']];
};

type EncryptedSharedSecretPayload = {
  alg: 'aes-256-gcm';
  keyVersion: string;
  context: string;
  iv: string;
  tag: string;
  ciphertext: string;
};

const SHARED_SECRET_KEY_VERSION = 'v1';
const SHARED_SECRET_CONTEXT = 'puintegra/shared-secret/v1';

function normalizeRfc(value: string) {
  return value.trim().toUpperCase();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function toActor(input: { userId: string; email?: string | null; role?: string | null }) {
  const parsedRole = RoleSchema.safeParse(input.role);
  if (!parsedRole.success || !input.email) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole);
  }
  return {
    userId: input.userId,
    email: normalizeEmail(input.email),
    role: parsedRole.data,
  } satisfies ValidActor;
}

function buildAuditLog(input: {
  logId: string;
  category: (typeof LOG_CATEGORIES)[keyof typeof LOG_CATEGORIES];
  rfc: string;
  originTraceId: string;
  actor: ValidActor;
  now: number;
  impact?: Record<string, unknown>;
}) {
  return LogSchema.parse({
    id: input.logId,
    category: input.category,
    RFC: input.rfc,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: input.originTraceId,
    userId: input.actor.userId,
    execution: {
      executedByUserId: input.actor.userId,
      executedByUserRole: input.actor.role,
      executedByUserEmail: input.actor.email,
    },
    impact: input.impact ?? {},
    searchRequest: {},
    createdAt: input.now,
  });
}

function sha256(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function readMasterKeyRaw() {
  const value = process.env.PUINTEGRA_SHARED_SECRET_MASTER_KEY?.trim();
  if (!value) {
    throw new SystemError(apiSystemMessages.sys.unexpectedFailure, {
      displayMessage: 'Missing PUINTEGRA_SHARED_SECRET_MASTER_KEY environment variable.',
    });
  }
  return value;
}

function resolveMasterKeyBytes() {
  const raw = readMasterKeyRaw();
  const asBase64 = Buffer.from(raw, 'base64');
  const parsed =
    asBase64.length >= 32 && asBase64.toString('base64').replace(/=+$/, '') === raw.replace(/=+$/, '')
      ? asBase64
      : Buffer.from(raw, 'utf8');
  if (parsed.length < 32) {
    throw new SystemError(apiSystemMessages.sys.unexpectedFailure, {
      displayMessage: 'PUINTEGRA_SHARED_SECRET_MASTER_KEY must be at least 32 bytes (raw or base64-decoded).',
    });
  }
  return parsed;
}

function encryptSharedSecret(sharedSecret: string, rfc: string): EncryptedSharedSecretPayload {
  const masterKey = resolveMasterKeyBytes();
  const salt = Buffer.from(normalizeRfc(rfc), 'utf8');
  const info = Buffer.from(SHARED_SECRET_CONTEXT, 'utf8');
  const derivedKey = Buffer.from(hkdfSync('sha256', masterKey, salt, info, 32));
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', derivedKey, iv);
  const ciphertext = Buffer.concat([cipher.update(sharedSecret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    alg: 'aes-256-gcm',
    keyVersion: SHARED_SECRET_KEY_VERSION,
    context: SHARED_SECRET_CONTEXT,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

function assertInstitutionAdminAccess(input: {
  actor: ValidActor;
  rfc: string;
  hasGrantedPermissionForRfc: boolean;
}) {
  if (input.actor.role !== ROLE.INSTITUTION_ADMIN || !input.hasGrantedPermissionForRfc) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole);
  }
}

function buildPermissionId(email: string, rfc: string) {
  return `${normalizeEmail(email)}__${normalizeRfc(rfc).toLowerCase()}`;
}

export function buildContactUpsertResult(input: {
  existingContact: Contact | null;
  contactType: string;
  rfc: string;
  payload: unknown;
  actor: { userId: string; email?: string | null; role?: string | null };
  originTraceId: string;
  now: number;
  contactId: string;
  logId: string;
}) {
  const actor = toActor(input.actor);
  const parsedType = Object.values(INSTITUTION_CONTACT_TYPE).find((item) => item === input.contactType);
  if (!parsedType) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: { field: 'type', value: input.contactType },
    });
  }
  const payloadRecord = typeof input.payload === 'object' && input.payload !== null ? input.payload : {};
  const payload = AppAdminContactUpsertPayloadSchema.parse({ ...payloadRecord, type: parsedType });
  const previous = input.existingContact;
  const updates = previous?.updates ?? [];
  const next = ContactSchema.parse({
    contactId: previous?.contactId ?? input.contactId,
    type: payload.type,
    RFC: normalizeRfc(input.rfc),
    name: payload.name,
    phone: payload.phone,
    contactCURP: payload.contactCURP,
    contactRFC: payload.contactRFC ?? null,
    efirmaCertificate: payload.efirmaCertificate ?? null,
    updates: [
      ...updates,
      {
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedByUserId: actor.userId,
        updatedByUserRole: actor.role,
        updatedByUserEmail: actor.email,
        updatedAt: input.now,
        previousName: previous?.name ?? null,
        updatedName: payload.name,
        previousPhone: previous?.phone ?? null,
        updatedPhone: payload.phone,
        previousContactCURP: previous?.contactCURP ?? null,
        updatedContactCURP: payload.contactCURP,
        previousContactRFC: previous?.contactRFC ?? null,
        updatedContactRFC: payload.contactRFC ?? null,
        previousEfirmaCertificate: previous?.efirmaCertificate ?? null,
        updatedEfirmaCertificate: payload.efirmaCertificate ?? null,
      },
    ],
    createdAt: previous?.createdAt ?? input.now,
    updatedAt: input.now,
  });
  const category = previous ? LOG_CATEGORIES.INSTITUTION_CONTACT_UPDATE : LOG_CATEGORIES.INSTITUTION_CONTACT_CREATION;
  const log = buildAuditLog({
    logId: input.logId,
    category,
    rfc: next.RFC,
    originTraceId: input.originTraceId,
    actor,
    now: input.now,
  });
  return { contact: next, log, response: { contact: next } };
}

export function buildSharedSecretUpdateResult(input: {
  institution: Institution;
  rfc: string;
  payload: unknown;
  actor: { userId: string; email?: string | null; role?: string | null };
  originTraceId: string;
  now: number;
  logId: string;
}) {
  const actor = toActor(input.actor);
  const parsed = AppAdminSharedSecretUpdatePayloadSchema.parse(input.payload);
  const normalizedRfc = normalizeRfc(input.rfc);
  const nextSha = sha256(parsed.sharedSecret);
  const encrypted = encryptSharedSecret(parsed.sharedSecret, normalizedRfc);
  const previousSha = input.institution.SHA256SharedSecret ?? null;
  const nextInstitution = InstitutionSchema.parse({
    ...input.institution,
    RFC: normalizedRfc,
    sharedSecret: JSON.stringify(encrypted),
    SHA256SharedSecret: nextSha,
    updates: [
      ...input.institution.updates,
      {
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedByUserId: actor.userId,
        updatedByUserRole: actor.role,
        updatedByUserEmail: actor.email,
        updatedAt: input.now,
        previousSHA256SharedSecret: previousSha,
        updatedSHA256SharedSecret: nextSha,
      },
    ],
    updatedAt: input.now,
  });
  const log = buildAuditLog({
    logId: input.logId,
    category: LOG_CATEGORIES.INSTITUTION_SHARED_SECRET_UPDATE,
    rfc: normalizedRfc,
    originTraceId: input.originTraceId,
    actor,
    now: input.now,
  });
  return {
    institution: nextInstitution,
    log,
    response: {
      sharedSecretConfigured: !!nextInstitution.sharedSecret,
      SHA256SharedSecret: nextInstitution.SHA256SharedSecret ?? null,
      updatedAt: nextInstitution.updatedAt,
    },
  };
}

export function buildPermissionCreateResult(input: {
  rfc: string;
  payload: unknown;
  actor: { userId: string; email?: string | null; role?: string | null };
  originTraceId: string;
  now: number;
  permissionId: string;
  logId: string;
}) {
  const actor = toActor(input.actor);
  const parsed = AppAdminPermissionCreatePayloadSchema.parse(input.payload);
  const permission = PermissionSchema.parse({
    permissionId: input.permissionId,
    RFC: normalizeRfc(input.rfc),
    email: normalizeEmail(parsed.email),
    role: parsed.role,
    status: parsed.status,
    updates: [],
    createdAt: input.now,
    updatedAt: input.now,
  });
  const log = buildAuditLog({
    logId: input.logId,
    category: LOG_CATEGORIES.INSTITUTION_PERMISSION_CREATION,
    rfc: permission.RFC,
    originTraceId: input.originTraceId,
    actor,
    now: input.now,
    impact: {
      impactedUserEmail: permission.email,
      impactedUserRole: permission.role,
      impactedPermissionStatus: permission.status,
    },
  });
  return { permission, log, response: { permission } };
}

export function buildPermissionUpdateResult(input: {
  permission: Permission;
  payload: unknown;
  actor: { userId: string; email?: string | null; role?: string | null };
  originTraceId: string;
  now: number;
  logId: string;
}) {
  const actor = toActor(input.actor);
  const parsed = AppAdminPermissionUpdatePayloadSchema.parse(input.payload);
  const nextPermission = PermissionSchema.parse({
    ...input.permission,
    role: parsed.role,
    status: parsed.status,
    updates: [
      ...input.permission.updates,
      {
        updateOrigin: UPDATE_ORIGIN.USER,
        updatedByUserId: actor.userId,
        updatedByUserRole: actor.role,
        updatedByUserEmail: actor.email,
        updatedAt: input.now,
        previousRole: input.permission.role,
        updatedRole: parsed.role,
        previousStatus: input.permission.status,
        updatedStatus: parsed.status,
      },
    ],
    updatedAt: input.now,
  });
  const log = buildAuditLog({
    logId: input.logId,
    category: LOG_CATEGORIES.INSTITUTION_PERMISSION_UPDATE,
    rfc: nextPermission.RFC,
    originTraceId: input.originTraceId,
    actor,
    now: input.now,
    impact: {
      impactedUserEmail: nextPermission.email,
      impactedUserRole: nextPermission.role,
      impactedPermissionStatus: nextPermission.status,
    },
  });
  return { permission: nextPermission, log, response: { permission: nextPermission } };
}

export const AppAdminInstitutionService = {
  assertInstitutionAdminAccess,
  buildPermissionId,
};
