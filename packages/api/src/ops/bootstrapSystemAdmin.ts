/**
 * @package api
 * @name bootstrapSystemAdmin.ts
 * @version 0.0.1
 * @description Script operacional para asegurar el permiso SYSTEM_ADMINISTRATOR inicial.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-02)	Agrega ejecución CLI del bootstrap de administrador del sistema.	@codex
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { PermissionSchema } from '@puintegra/shared';
import {
  buildSystemAdminPermission,
  buildSystemAdminPermissionId,
  isSystemAdminPermissionCurrent,
} from './systemAdminBootstrap.js';

const ADMIN_EMAIL_ENV = 'PUINTEGRA_BOOTSTRAP_SYSTEM_ADMIN_EMAIL';

/**
 * @description Inicializa Admin SDK usando credenciales de entorno/CI.
 */
function initializeAdmin() {
  return getApps()[0] ?? initializeApp();
}

/**
 * @description Obtiene y normaliza el email bootstrap desde variables de entorno.
 */
function readBootstrapEmail() {
  const email = process.env[ADMIN_EMAIL_ENV]?.trim().toLowerCase();
  if (!email) {
    throw new Error(`${ADMIN_EMAIL_ENV} is required.`);
  }
  return email;
}

/**
 * @description Asegura idempotentemente el permiso administrador del sistema por email.
 */
export async function bootstrapSystemAdminPermission() {
  initializeAdmin();
  const email = readBootstrapEmail();
  const firestore = getFirestore();
  const permissionId = buildSystemAdminPermissionId(email);
  const permissionRef = firestore.collection('permissions').doc(permissionId);
  const snapshot = await permissionRef.get();
  const existingPermission = snapshot.exists ? PermissionSchema.parse(snapshot.data()) : null;

  if (isSystemAdminPermissionCurrent(existingPermission)) {
    return { permissionId, email, changed: false };
  }

  const permission = buildSystemAdminPermission({
    email,
    now: Date.now(),
    existingPermission,
  });

  await permissionRef.set(permission);
  return { permissionId, email, changed: true };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrapSystemAdminPermission()
    .then((result) => {
      console.info(
        result.changed
          ? `SYSTEM_ADMINISTRATOR permission bootstrapped for ${result.email}.`
          : `SYSTEM_ADMINISTRATOR permission already current for ${result.email}.`,
      );
    })
    .catch((error) => { //NOSONAR
      console.error(error);
      process.exitCode = 1;
    });
}
