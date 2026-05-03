/**
 * @package web
 * @name firebase.ts
 * @version 0.0.1
 * @description Inicializa Firebase client SDK y conecta emuladores en desarrollo local.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-04-19)	Agrega normalización de URLs para emuladores en localhost (evita delay en first load de Auth) y mejora lectura de configuración.	@tirsomartinezreyes
 * - 0.0.1	(2026-04-18)	Agrega inicialización Firebase para Auth y Firestore Emulator.	@codex
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, initializeAuth, type Auth, browserSessionPersistence } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

type FirebaseRuntime = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let runtime: FirebaseRuntime | null = null;
let emulatorsConnected = false;

/**
 * @description Normaliza URLs de emulador local para evitar latencia por resolución IPv6 de localhost.
 */
function normalizeLoopbackUrl(rawUrl: string): string {
  return rawUrl.replace("://localhost", "://127.0.0.1");
}

/**
 * @description Lee configuración pública Firebase desde variables Vite con defaults de desarrollo.
 */
function readFirebaseConfig() {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "puintegra-dev";
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "demo-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? `1:000000000000:web:${projectId}`,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? `G-0000000000`,
  };
}

/**
 * @description Determina si el runtime debe conectarse a emuladores Firebase.
 */
function shouldUseEmulators() {
  return import.meta.env.VITE_APP_ENV === "development" || import.meta.env.MODE === "test";
}

/**
 * @description Retorna instancias singleton de Firebase configuradas para web.
 */
export function getFirebaseRuntime(): FirebaseRuntime {
  if (runtime) {
    return runtime;
  }

  const app = getApps()[0] ?? initializeApp(readFirebaseConfig());
  const auth = shouldUseEmulators() && !emulatorsConnected ? initializeAuth(app, {persistence: browserSessionPersistence}) : getAuth(app);
  const firestore = getFirestore(app);

  const authEmulatorUrl = normalizeLoopbackUrl(
    import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL ?? "http://127.0.0.1:9099",
  );
  const firestoreEmulatorHost = (import.meta.env.VITE_FIRESTORE_EMULATOR_HOST ?? "127.0.0.1").replace(
    /^localhost$/i,
    "127.0.0.1",
  );

  if (shouldUseEmulators() && !emulatorsConnected) {
    connectAuthEmulator(auth, authEmulatorUrl, {
      disableWarnings: true,
    });
    connectFirestoreEmulator(
      firestore,
      firestoreEmulatorHost,
      Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT ?? 8081),
    );
    emulatorsConnected = true;
  }

  runtime = { app, auth, firestore };
  return runtime;
}
