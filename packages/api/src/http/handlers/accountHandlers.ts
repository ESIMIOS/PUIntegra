/**
 * @package api
 * @name accountHandlers.ts
 * @version 0.0.1
 * @description Handlers HTTP para perfil de cuenta autenticada.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae handlers de cuenta desde routeHandlers para reducir complejidad por archivo.	@codex
 */

import type { Context } from 'hono';
import { API_THROTTLE_DIMENSION, API_THROTTLE_ENDPOINT, SystemError } from '@puintegra/shared';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import { apiOk } from '../apiResponse.js';
import type { CreateApiAppDependencies } from './types.js';
import { AccountProfilePayloadSchema, readBearerToken, readClientIp, readJsonPayload, readOriginTraceId } from './shared.js';
import { buildThrottleSubject, enforceThrottle } from './throttle.js';

/**
 * @description Crea handler autenticado para edición de perfil de cuenta propia.
 */
export function createAccountProfileUpdateHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const token = readBearerToken(context.req.header('authorization'));
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    if (!token) {
      throw new SystemError(apiSystemMessages.auth.missingBearerToken);
    }

    const verified = await dependencies.verifyBearerToken(token);
    const clientIp = readClientIp(context);
    if (!dependencies.updateAccountProfile) {
      throw new Error('updateAccountProfile dependency is not configured.');
    }

    const parsedPayload = AccountProfilePayloadSchema.safeParse(await readJsonPayload(context));
    if (!parsedPayload.success) {
      throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
        details: {
          issues: parsedPayload.error.issues,
        },
      });
    }

    await enforceThrottle(dependencies, {
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_ACCOUNT_PROFILE_UPDATE,
      originTraceId,
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: buildThrottleSubject([['ip', clientIp]]),
        [API_THROTTLE_DIMENSION.USER]: buildThrottleSubject([['user', verified.userId]]),
      },
    });

    const updated = await dependencies.updateAccountProfile({
      payload: parsedPayload.data,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(updated, { originTraceId }));
  };
}
