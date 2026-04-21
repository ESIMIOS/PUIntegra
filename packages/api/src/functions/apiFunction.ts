/**
 * @package api
 * @name apiFunction.ts
 * @version 0.0.2
 * @description Expone la función HTTP principal y persiste bitácoras Auth desde Hono.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-04-19)	Elimina rol/RFC de eventos login/logout.	@codex
 * - 0.0.1	(2026-04-19)	Mueve la función HTTP API a carpeta functions.	@codex
 */

import { randomUUID } from 'node:crypto';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import {
  buildAuthEventLog,
  type AuthEventName,
} from '../services/authAuditService.js';
import { createApiApp } from '../http/createApiApp.js';

type AuthEventWriteInput = {
  event: AuthEventName;
  originTraceId: string;
  userId: string;
  email?: string | null;
};

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

/**
 * @description Verifica el token Firebase enviado por el cliente web.
 */
async function verifyBearerToken(token: string) {
  initializeAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  return {
    userId: decoded.uid,
    email: typeof decoded.email === 'string' ? decoded.email : null
  };
}

/**
 * @description Persiste una bitácora de login/logout autenticada.
 */
async function recordAuthEvent(input: AuthEventWriteInput) {
  const logRef = getAdminFirestore().collection('logs').doc();
  const log = buildAuthEventLog({
    ...input,
    id: logRef.id
  }, Date.now());
  await logRef.set(log);
  return log;
}

const app = createApiApp({
  verifyBearerToken,
  recordAuthEvent,
  createOriginTraceId: randomUUID
});

/**
 * @description Construye una Request Fetch preservando método, headers y body.
 */
function toFetchRequest(request: Parameters<Parameters<typeof onRequest>[0]>[0]) {
  const protocol = request.protocol || 'http';
  const host = request.get('host') || 'localhost';
  const requestUrl = new URL(request.path || request.url, `${protocol}://${host}`);
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : new Uint8Array(request.rawBody);
  return new Request(requestUrl, {
    method: request.method,
    headers: request.headers as HeadersInit,
    body
  });
}

export const api = onRequest(async (request, response) => {
  const honoResponse = await app.fetch(toFetchRequest(request));

  honoResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });
  response.status(honoResponse.status).send(await honoResponse.text());
});
