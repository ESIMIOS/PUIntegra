/**
 * @package api
 * @name accountProfileDependencies.ts
 * @version 0.0.1
 * @description Implementa actualización de perfil de cuenta autenticada con trazabilidad y rollback seguro.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae updateAccountProfile desde apiDependencies para reducir complejidad cognitiva.	@codex
 */

import {
  LOG_CATEGORIES,
  LOG_ORIGIN,
  LogSchema,
  RoleSchema,
  SystemError,
  UPDATE_ORIGIN,
  UserSchema,
} from '@puintegra/shared';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import { getAdminAuth, getAdminFirestore } from './runtime.js';
import type { AccountProfileUpdateInput } from './types.js';

type AccountProfilePayload = {
  name: string;
  emojiIcon: string;
  phone?: string | null;
};

type ValidActor = {
  role: (typeof RoleSchema)['enum'][keyof (typeof RoleSchema)['enum']];
  email: string;
};

type ProfileChanges = {
  nextPhone: string | null;
  hasPhoneInput: boolean;
  hasNameChange: boolean;
  hasEmojiChange: boolean;
  hasPhoneChange: boolean;
};

function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const sanitized = trimmed.replaceAll(/\s+/g, '').replaceAll('-', '').replaceAll('(', '').replaceAll(')', '');
  if (!sanitized.startsWith('+') || sanitized === '+52' || !/^\+\d{8,15}$/.test(sanitized)) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: {
        field: 'phone',
        reason: 'invalid_phone_format',
      },
    });
  }
  return sanitized;
}

function assertValidActor(input: AccountProfileUpdateInput): ValidActor {
  const actorRole = typeof input.actor.role === 'string' ? input.actor.role : null;
  const actorEmail = typeof input.actor.email === 'string' ? input.actor.email.toLowerCase() : null;
  const parsedRole = actorRole ? RoleSchema.safeParse(actorRole) : null;
  if (!actorEmail || !parsedRole?.success) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: {
        reason: 'actor_identity_missing',
      },
    });
  }
  return { role: parsedRole.data, email: actorEmail };
}

function parseProfilePayload(payload: unknown): {
  normalizedName: string;
  normalizedEmojiIcon: string;
  normalizedPhone: string | null;
  hasPhoneInput: boolean;
} {
  const parsedPayload = payload as AccountProfilePayload;
  const normalizedName = parsedPayload.name.trim();
  const normalizedEmojiIcon = parsedPayload.emojiIcon.trim();
  if (!normalizedName || !normalizedEmojiIcon) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload);
  }
  return {
    normalizedName,
    normalizedEmojiIcon,
    normalizedPhone: normalizePhone(parsedPayload.phone),
    hasPhoneInput: typeof parsedPayload.phone === 'string' || parsedPayload.phone === null,
  };
}

function detectProfileChanges(
  currentUser: ReturnType<typeof UserSchema.parse>,
  normalizedName: string,
  normalizedEmojiIcon: string,
  normalizedPhone: string | null,
  hasPhoneInput: boolean,
): ProfileChanges {
  return {
    nextPhone: normalizedPhone,
    hasPhoneInput,
    hasNameChange: currentUser.name !== normalizedName,
    hasEmojiChange: (currentUser.emojiIcon ?? null) !== normalizedEmojiIcon,
    hasPhoneChange: hasPhoneInput && (currentUser.phone ?? null) !== normalizedPhone,
  };
}

function buildResponse(user: ReturnType<typeof UserSchema.parse>) {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    emojiIcon: user.emojiIcon ?? null,
    phone: user.phone ?? null,
    updatedAt: user.updatedAt,
  };
}

function buildMissingUser(
  actor: ValidActor,
  userId: string,
  normalizedName: string,
  normalizedEmojiIcon: string,
  normalizedPhone: string | null,
  now: number,
) {
  return UserSchema.parse({
    userId,
    name: normalizedName,
    email: actor.email,
    ...(normalizedPhone ? { phone: normalizedPhone } : {}),
    emojiIcon: normalizedEmojiIcon,
    updates: [],
    createdAt: now,
    updatedAt: now,
  });
}

function buildUpdatedUser(
  currentUser: ReturnType<typeof UserSchema.parse>,
  changes: ProfileChanges,
  normalizedName: string,
  normalizedEmojiIcon: string,
  now: number,
  updateEntry: Record<string, unknown>,
) {
  const nextUser = UserSchema.parse({
    ...currentUser,
    name: normalizedName,
    emojiIcon: normalizedEmojiIcon,
    ...(changes.nextPhone ? { phone: changes.nextPhone } : {}),
    updates: [...currentUser.updates, updateEntry],
    updatedAt: now,
  });

  if (changes.hasPhoneChange && changes.nextPhone === null) {
    delete (nextUser as { phone?: string }).phone;
  }
  return nextUser;
}

/**
 * @description Actualiza perfil de cuenta propia y persiste trazabilidad de cambios de perfil.
 */
export async function updateAccountProfile(input: AccountProfileUpdateInput) {
  const actor = assertValidActor(input);
  const { normalizedName, normalizedEmojiIcon, normalizedPhone, hasPhoneInput } = parseProfilePayload(input.payload);
  const now = Date.now();
  const firestore = getAdminFirestore();
  const userRef = firestore.collection('users').doc(input.actor.userId);
  const userSnapshot = await userRef.get();
  const userExists = userSnapshot.exists;
  const currentUser = userExists
    ? UserSchema.parse(userSnapshot.data())
    : buildMissingUser(actor, input.actor.userId, normalizedName, normalizedEmojiIcon, normalizedPhone, now);
  const previousDisplayName = userExists ? currentUser.name : null;
  const changes = userExists
    ? detectProfileChanges(currentUser, normalizedName, normalizedEmojiIcon, normalizedPhone, hasPhoneInput)
    : {
        nextPhone: normalizedPhone,
        hasPhoneInput,
        hasNameChange: true,
        hasEmojiChange: true,
        hasPhoneChange: hasPhoneInput,
      };

  if (!changes.hasNameChange && !changes.hasEmojiChange && !changes.hasPhoneChange) {
    return buildResponse(currentUser);
  }

  const auth = getAdminAuth();
  if (changes.hasNameChange) {
    await auth.updateUser(input.actor.userId, { displayName: normalizedName });
  }

  const updateEntry = {
    updateOrigin: UPDATE_ORIGIN.USER,
    updatedByUserId: input.actor.userId,
    updatedByUserRole: actor.role,
    updatedByUserEmail: actor.email,
    updatedAt: now,
    ...(changes.hasNameChange ? { previousName: currentUser.name, updatedName: normalizedName } : {}),
    ...(changes.hasEmojiChange
      ? { previousEmojiIcon: currentUser.emojiIcon ?? null, updatedEmojiIcon: normalizedEmojiIcon }
      : {}),
    ...(changes.hasPhoneChange ? { previousPhone: currentUser.phone ?? null, updatedPhone: changes.nextPhone } : {}),
  };

  const nextUser = buildUpdatedUser(currentUser, changes, normalizedName, normalizedEmojiIcon, now, updateEntry);

  const logRef = firestore.collection('logs').doc();
  const log = LogSchema.parse({
    id: logRef.id,
    category: LOG_CATEGORIES.USER_ACCOUNT_SETTINGS_UPDATE,
    RFC: null,
    origin: LOG_ORIGIN.SYSTEM_HTTP_API_CALL,
    originTraceId: input.originTraceId,
    userId: input.actor.userId,
    execution: {
      executedByUserId: input.actor.userId,
      executedByRole: actor.role,
      executedByUserEmail: actor.email,
    },
    impact: {
      impactedUserId: input.actor.userId,
      impactedUserEmail: actor.email,
    },
    searchRequest: {},
    createdAt: now,
  });

  try {
    const batch = firestore.batch();
    batch.set(userRef, nextUser);
    batch.set(logRef, log);
    await batch.commit();
  } catch (error) {
    if (changes.hasNameChange) {
      try {
        await auth.updateUser(input.actor.userId, { displayName: previousDisplayName ?? undefined });
      } catch {
        // Keep the original persistence failure as the response error.
      }
    }
    throw error;
  }

  return buildResponse(nextUser);
}
