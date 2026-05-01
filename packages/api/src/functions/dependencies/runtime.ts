/**
 * @package api
 * @name runtime.ts
 * @version 0.0.1
 * @description Provee acceso centralizado a Firebase Admin para dependencias runtime del API.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae inicialización y acceso a Firestore/Admin Auth para reducir complejidad.	@codex
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { PERMISSION_STATUS, ROLE } from '@puintegra/shared';

/**
 * @description Inicializa Firebase Admin SDK una sola vez.
 */
function initializeAdmin() {
  return getApps()[0] ?? initializeApp();
}

/**
 * @description Devuelve Firestore usando Admin SDK inicializado.
 */
export function getAdminFirestore() {
  initializeAdmin();
  return getFirestore();
}

/**
 * @description Devuelve Auth Admin usando SDK inicializado.
 */
export function getAdminAuth() {
  initializeAdmin();
  return getAuth();
}

/**
 * @description Obtiene el rol más alto concedido para un usuario según permisos actuales.
 */
export async function resolveHighestGrantedRole(email: string) {
  const snapshot = await getAdminFirestore()
    .collection('permissions')
    .where('email', '==', email)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .get();
  const grantedRoles = new Set(
    snapshot.docs.map((item) => item.data().role).filter((role): role is string => typeof role === 'string'),
  );

  if (grantedRoles.has(ROLE.SYSTEM_ADMINISTRATOR)) {
    return ROLE.SYSTEM_ADMINISTRATOR;
  }
  if (grantedRoles.has(ROLE.INSTITUTION_ADMIN)) {
    return ROLE.INSTITUTION_ADMIN;
  }
  if (grantedRoles.has(ROLE.INSTITUTION_OPERATOR)) {
    return ROLE.INSTITUTION_OPERATOR;
  }
  return null;
}
