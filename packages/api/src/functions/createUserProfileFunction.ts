/**
 * @package api
 * @name createUserProfileFunction.ts
 * @version 0.0.1
 * @description Crea perfil Firestore y bitácora cuando Firebase Auth crea un usuario.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-19)	Mueve trigger Auth onCreate a carpeta functions.	@codex
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { auth } from 'firebase-functions/v1';
import { logger } from 'firebase-functions/v2';
import {
  buildUserCreatedLog,
  buildUserProfileFromAuthUser
} from '../services/authAuditService.js';

/**
 * @description Inicializa Firebase Admin SDK una sola vez.
 */
function initializeAdmin() {
  return getApps()[0] ?? initializeApp();
}

/**
 * @description Devuelve Firestore usando Admin SDK inicializado.
 */
function getAdminFirestore() {
  initializeAdmin();
  return getFirestore();
}

export const createUserProfile = auth.user().onCreate(async (authUser, context) => {
  try {
    const now = Date.now();
    const user = buildUserProfileFromAuthUser(authUser, now);
    const firestore = getAdminFirestore();
    const logRef = firestore.collection('logs').doc();
    const log = buildUserCreatedLog({
      id: logRef.id,
      originTraceId: context.eventId,
      userId: user.userId,
      email: user.email
    }, now);
    const batch = firestore.batch();

    batch.set(firestore.collection('users').doc(user.userId), user);
    batch.set(logRef, log);

    await batch.commit();
  } catch (error) {
    logger.error('create_user_profile_failed', {
      uid: authUser.uid,
      email: authUser.email ?? null,
      eventId: context.eventId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
});
