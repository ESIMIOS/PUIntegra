/**
 * @package api
 * @name seedEmulators.ts
 * @version 0.0.5
 * @description Siembra Auth y Firestore Emulator con datos locales deterministas.
 * @author @codex
 * @changelog
 * - 0.0.5	(2026-04-27)	Siembra logs tenant determinísticos para pruebas manuales de paginación.	@codex
 * - 0.0.4	(2026-04-19)	Retira seed directo de logs; se crean por funciones Auth/API.	@codex
 * - 0.0.3	(2026-04-19)	Delega la creación de users al trigger Auth onCreate.	@codex
 * - 0.0.2	(2026-04-19)	Usa contraseña local determinística en lugar de variable de entorno.	@codex
 * - 0.0.1	(2026-04-18)	Agrega script de seed para emuladores Firebase.	@codex
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import './loadRootEnv.js';
import { EMULATOR_AUTH_PASSWORD, EMULATOR_AUTH_USER, EMULATOR_PROJECT_ID, emulatorSeedData } from './seedData.js';

/**
 * @description Configura variables esperadas por Firebase Admin SDK para emuladores.
 */
function ensureEmulatorEnvironment() {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8081';
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099';
  process.env.GCLOUD_PROJECT ??= EMULATOR_PROJECT_ID;
}

/**
 * @description Inicializa Firebase Admin SDK contra el proyecto local.
 */
function initializeAdmin() {
  ensureEmulatorEnvironment();
  return getApps()[0] ?? initializeApp({
    projectId: EMULATOR_PROJECT_ID
  });
}

/**
 * @description Crea o actualiza el usuario local del Auth Emulator.
 */
async function upsertAuthUser() {
  const auth = getAuth();
  try {
    await auth.updateUser(EMULATOR_AUTH_USER.uid, {
      email: EMULATOR_AUTH_USER.email,
      password: EMULATOR_AUTH_PASSWORD,
      displayName: EMULATOR_AUTH_USER.displayName,
      phoneNumber: EMULATOR_AUTH_USER.phoneNumber,
      emailVerified: true,
      disabled: false
    });
  } catch {
    await auth.createUser({
      uid: EMULATOR_AUTH_USER.uid,
      email: EMULATOR_AUTH_USER.email,
      password: EMULATOR_AUTH_PASSWORD,
      displayName: EMULATOR_AUTH_USER.displayName,
      phoneNumber: EMULATOR_AUTH_USER.phoneNumber,
      emailVerified: true,
      disabled: false
    });
  }
}

/**
 * @description Escribe una colección completa en Firestore Emulator usando batch.
 */
async function writeCollection<T extends Record<string, unknown>>(name: string, idKey: keyof T, records: readonly T[]) {
  const firestore = getFirestore();
  const batch = firestore.batch();
  for (const record of records) {
    batch.set(firestore.collection(name).doc(String(record[idKey])), record);
  }
  await batch.commit();
}

/**
 * @description Siembra Auth y Firestore Emulator con datos deterministas.
 */
export async function seedEmulators() {
  initializeAdmin();
  await upsertAuthUser();
  await writeCollection('institutions', 'RFC', emulatorSeedData.institutions);
  await writeCollection('permissions', 'permissionId', emulatorSeedData.permissions);
  await writeCollection('contacts', 'contactId', emulatorSeedData.contacts);
  await writeCollection('requests', 'requestId', emulatorSeedData.requests);
  await writeCollection('findings', 'findingId', emulatorSeedData.findings);
  await writeCollection('logs', 'id', emulatorSeedData.logs);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedEmulators()
    .then(() => {
      console.info('Firebase emulators seeded.');
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
