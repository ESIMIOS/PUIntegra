/**
 * @package api
 * @name apiFunction.ts
 * @version 0.0.4
 * @description Expone la función HTTP principal del API sobre Firebase Functions.
 * @author @codex
 * @changelog
 * - 0.0.4	(2026-05-05)	Carga variables de entorno root en runtime API para ejecución local/emulador.	@codex
 * - 0.0.3	(2026-04-23)	Reduce apiFunction a wiring y delega dependencias/servicios a módulos dedicados.	@codex
 * - 0.0.2	(2026-04-19)	Elimina rol/RFC de eventos login/logout.	@codex
 * - 0.0.1	(2026-04-19)	Mueve la función HTTP API a carpeta functions.	@codex
 */

import { randomUUID } from 'node:crypto';
import { onRequest } from 'firebase-functions/v2/https';
import { createApiApp } from '../http/createApiApp.js';
import { createApiDependencies } from './apiDependencies.js';
import '../emulator/loadRootEnv.js';

const app = createApiApp({
  ...createApiDependencies(),
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

export const api = onRequest({ invoker: 'public' }, async (request, response) => {
  const honoResponse = await app.fetch(toFetchRequest(request));

  honoResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });
  response.status(honoResponse.status).send(await honoResponse.text());
});
