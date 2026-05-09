/**
 * @package api
 * @name apiFunction.ts
 * @version 0.0.5
 * @description Expone la función HTTP principal del API sobre Firebase Functions.
 * @author @codex
 * @changelog
 * - 0.0.5	(2026-05-06)	Vincula PUINTEGRA_SHARED_SECRET_MASTER_KEY como secret runtime en Cloud Functions v2.	@codex
 * - 0.0.4	(2026-05-05)	Carga variables de entorno root en runtime API para ejecución local/emulador.	@codex
 * - 0.0.3	(2026-04-23)	Reduce apiFunction a wiring y delega dependencias/servicios a módulos dedicados.	@codex
 * - 0.0.2	(2026-04-19)	Elimina rol/RFC de eventos login/logout.	@codex
 * - 0.0.1	(2026-04-19)	Mueve la función HTTP API a carpeta functions.	@codex
 */

import { randomUUID } from 'node:crypto';
import { onRequest } from 'firebase-functions/v2/https';
import { createApiApp } from '../http/createApiApp.js';
import { createApiDependencies } from './apiDependencies.js';
import { toFetchRequest } from './fetchRequestBridge.js';
import '../emulator/loadRootEnv.js';

const app = createApiApp({
  ...createApiDependencies(),
  createOriginTraceId: randomUUID
});

export const api = onRequest(
  { invoker: 'public', secrets: ['PUINTEGRA_SHARED_SECRET_MASTER_KEY'] },
  async (request, response) => {
  const honoResponse = await app.fetch(toFetchRequest(request));

  honoResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });
  response.status(honoResponse.status).send(await honoResponse.text());
  },
);
