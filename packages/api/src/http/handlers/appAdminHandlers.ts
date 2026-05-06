/**
 * @package api
 * @name appAdminHandlers.ts
 * @version 0.0.1
 * @description Handlers HTTP para operaciones administrativas institucionales del dominio app.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-04)	Agrega handlers para contactos, secreto compartido y permisos en /api/app/institutions/:rfc.	@codex
 */

import type { Context } from 'hono';
import { DEFAULT_RFC, SYSTEM_RFC, SystemError } from '@puintegra/shared';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import { apiOk } from '../apiResponse.js';
import type { CreateApiAppDependencies } from './types.js';
import { readBearerToken, readJsonPayload, readOriginTraceId } from './shared.js';

function readInstitutionRfc(context: Context) {
  return (context.req.param('rfc') ?? '').trim().toUpperCase();
}

function assertAllowedRfc(rfc: string) {
  if (rfc === SYSTEM_RFC) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnSystemRfc);
  }
  if (rfc === DEFAULT_RFC) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenOperationOnDefaultRfc);
  }
}

async function verify(context: Context, dependencies: CreateApiAppDependencies) {
  const token = readBearerToken(context.req.header('authorization'));
  if (!token) {
    throw new SystemError(apiSystemMessages.auth.missingBearerToken);
  }
  return dependencies.verifyBearerToken(token);
}

export function createInstitutionContactUpsertHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const verified = await verify(context, dependencies);
    const rfc = readInstitutionRfc(context);
    assertAllowedRfc(rfc);
    if (!dependencies.upsertInstitutionContact) {
      throw new Error('upsertInstitutionContact dependency is not configured.');
    }
    const payload = await readJsonPayload(context);
    const contactType = (context.req.param('type') ?? '').trim().toUpperCase();
    const result = await dependencies.upsertInstitutionContact({
      rfc,
      contactType,
      payload,
      actor: verified,
      originTraceId,
    });
    return context.json(apiOk(result, { originTraceId }));
  };
}

export function createInstitutionSharedSecretUpdateHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const verified = await verify(context, dependencies);
    const rfc = readInstitutionRfc(context);
    assertAllowedRfc(rfc);
    if (!dependencies.updateInstitutionSharedSecret) {
      throw new Error('updateInstitutionSharedSecret dependency is not configured.');
    }
    const payload = await readJsonPayload(context);
    const result = await dependencies.updateInstitutionSharedSecret({
      rfc,
      payload,
      actor: verified,
      originTraceId,
    });
    return context.json(apiOk(result, { originTraceId }));
  };
}

export function createInstitutionPermissionCreateHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const verified = await verify(context, dependencies);
    const rfc = readInstitutionRfc(context);
    assertAllowedRfc(rfc);
    if (!dependencies.createInstitutionPermission) {
      throw new Error('createInstitutionPermission dependency is not configured.');
    }
    const payload = await readJsonPayload(context);
    const result = await dependencies.createInstitutionPermission({
      rfc,
      payload,
      actor: verified,
      originTraceId,
    });
    return context.json(apiOk(result, { originTraceId }));
  };
}

export function createInstitutionPermissionUpdateHandler(dependencies: CreateApiAppDependencies) {
  return async (context: Context) => {
    const originTraceId = readOriginTraceId(context, dependencies.createOriginTraceId);
    const verified = await verify(context, dependencies);
    const rfc = readInstitutionRfc(context);
    assertAllowedRfc(rfc);
    const permissionId = (context.req.param('permissionId') ?? '').trim();
    if (!permissionId) {
      throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
        details: { field: 'permissionId', reason: 'missing_permission_id' },
      });
    }
    if (!dependencies.updateInstitutionPermission) {
      throw new Error('updateInstitutionPermission dependency is not configured.');
    }
    const payload = await readJsonPayload(context);
    const result = await dependencies.updateInstitutionPermission({
      rfc,
      permissionId,
      payload,
      actor: verified,
      originTraceId,
    });
    return context.json(apiOk(result, { originTraceId }));
  };
}
