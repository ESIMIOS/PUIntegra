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

/**
 * @description Actualiza perfil de cuenta propia y persiste trazabilidad de cambios de perfil.
 */
export async function updateAccountProfile(input: AccountProfileUpdateInput) {
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

  const payload = input.payload as {
    name: string;
    emojiIcon: string;
    phone?: string | null;
  };
  const normalizedName = payload.name.trim();
  const normalizedEmojiIcon = payload.emojiIcon.trim();
  if (!normalizedName || !normalizedEmojiIcon) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload);
  }
  const normalizedPhone = normalizePhone(payload.phone);
  const now = Date.now();
  const firestore = getAdminFirestore();
  const userRef = firestore.collection('users').doc(input.actor.userId);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.exists) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: { userId: input.actor.userId, reason: 'user_profile_not_found' },
    });
  }
  const currentUser = UserSchema.parse(userSnapshot.data());
  const previousDisplayName = currentUser.name;
  const nextPhone = normalizedPhone;
  const hasNameChange = currentUser.name !== normalizedName;
  const hasEmojiChange = (currentUser.emojiIcon ?? null) !== normalizedEmojiIcon;
  const hasPhoneInput = typeof payload.phone === 'string' || payload.phone === null;
  const hasPhoneChange = hasPhoneInput && (currentUser.phone ?? null) !== nextPhone;

  if (!hasNameChange && !hasEmojiChange && !hasPhoneChange) {
    return {
      userId: currentUser.userId,
      name: currentUser.name,
      email: currentUser.email,
      emojiIcon: currentUser.emojiIcon ?? null,
      phone: currentUser.phone ?? null,
      updatedAt: currentUser.updatedAt,
    };
  }

  const auth = getAdminAuth();
  if (hasNameChange) {
    await auth.updateUser(input.actor.userId, { displayName: normalizedName });
  }

  const updateEntry = {
    updateOrigin: UPDATE_ORIGIN.USER,
    updatedByUserId: input.actor.userId,
    updatedByUserRole: parsedRole.data,
    updatedByUserEmail: actorEmail,
    updatedAt: now,
    ...(hasNameChange ? { previousName: currentUser.name, updatedName: normalizedName } : {}),
    ...(hasEmojiChange ? { previousEmojiIcon: currentUser.emojiIcon ?? null, updatedEmojiIcon: normalizedEmojiIcon } : {}),
    ...(hasPhoneChange ? { previousPhone: currentUser.phone ?? null, updatedPhone: nextPhone } : {}),
  };

  const nextUser = UserSchema.parse({
    ...currentUser,
    name: normalizedName,
    emojiIcon: normalizedEmojiIcon,
    ...(nextPhone ? { phone: nextPhone } : {}),
    updates: [...currentUser.updates, updateEntry],
    updatedAt: now,
  });

  if (!nextPhone) {
    delete (nextUser as { phone?: string }).phone;
  }

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
      executedByUserRole: parsedRole.data,
      executedByUserEmail: actorEmail,
    },
    impact: {
      impactedUserId: input.actor.userId,
      impactedUserEmail: actorEmail,
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
    if (hasNameChange) {
      try {
        await auth.updateUser(input.actor.userId, { displayName: previousDisplayName });
      } catch {
        // Keep the original persistence failure as the response error.
      }
    }
    throw error;
  }

  return {
    userId: nextUser.userId,
    name: nextUser.name,
    email: nextUser.email,
    emojiIcon: nextUser.emojiIcon ?? null,
    phone: nextUser.phone ?? null,
    updatedAt: nextUser.updatedAt,
  };
}
