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
import { SystemError } from '@puintegra/shared';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import { apiOk } from '../apiResponse.js';
import type { CreateApiAppDependencies } from './types.js';
import { AccountProfilePayloadSchema, readBearerToken, readJsonPayload, readOriginTraceId } from './shared.js';

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

    const updated = await dependencies.updateAccountProfile({
      payload: parsedPayload.data,
      actor: verified,
      originTraceId,
    });

    return context.json(apiOk(updated, { originTraceId }));
  };
}
