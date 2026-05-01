/**
 * @package api
 * @name institutionDependencies.ts
 * @version 0.0.1
 * @description Implementa dependencias runtime para onboarding institucional y actualización de planes.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae operaciones institucionales desde apiDependencies para reducir complejidad.	@codex
 */

import { InstitutionSchema, PERMISSION_STATUS, ROLE, RoleSchema, SYSTEM_RFC, SystemError } from '@puintegra/shared';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import {
  buildInstitutionOnboardingRecords,
  parseInstitutionOnboardingInput,
} from '../../services/institutionOnboardingService.js';
import {
  buildInstitutionPlanUpdateRecords,
  parseInstitutionPlanUpdateInput,
} from '../../services/institutionPlanService.js';
import { getAdminFirestore } from './runtime.js';
import type { CreateInstitutionOnboardingInput, UpdateInstitutionPlanInput } from './types.js';

/**
 * @description Crea institución y permiso bootstrap de forma auditada para backoffice.
 */
export async function createInstitutionOnboarding(input: CreateInstitutionOnboardingInput) {
  const actorRole = typeof input.actor.role === 'string' ? input.actor.role : null;
  const actorEmail = typeof input.actor.email === 'string' ? input.actor.email.toLowerCase() : null;
  const parsedRole = actorRole ? RoleSchema.safeParse(actorRole) : null;
  if (!actorEmail || !parsedRole?.success) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole.code);
  }

  const firestore = getAdminFirestore();
  const normalizedPayload = parseInstitutionOnboardingInput(input.payload);
  const parsed = buildInstitutionOnboardingRecords({
    rawInput: normalizedPayload,
    actor: {
      userId: input.actor.userId,
      email: actorEmail,
      role: parsedRole.data,
    },
    now: Date.now(),
    originTraceId: input.originTraceId,
    permissionId: `${normalizedPayload.adminEmail.toLowerCase()}__${normalizedPayload.RFC.toLowerCase()}`,
    institutionLogId: firestore.collection('logs').doc().id,
    permissionLogId: firestore.collection('logs').doc().id,
    planLogId: firestore.collection('logs').doc().id,
  });

  const existingInstitution = await firestore.collection('institutions').doc(parsed.institution.RFC).get();
  if (existingInstitution.exists) {
    throw new SystemError(apiSystemMessages.admin.institutions.duplicateRfc, {
      displayMessage: `Ya existe una institución registrada con RFC ${parsed.institution.RFC}.`,
    });
  }

  const duplicateBootstrapPermission = await firestore
    .collection('permissions')
    .where('RFC', '==', parsed.permission.RFC)
    .where('email', '==', parsed.permission.email)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .limit(1)
    .get();
  if (!duplicateBootstrapPermission.empty) {
    throw new SystemError(apiSystemMessages.admin.institutions.duplicateBootstrapPermission, {
      displayMessage: `Ya existe un permiso administrador GRANTED para ${parsed.permission.email} en ${parsed.permission.RFC}.`,
    });
  }

  const roleValidationSnapshot = await firestore
    .collection('permissions')
    .where('email', '==', actorEmail)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .where('role', '==', ROLE.SYSTEM_ADMINISTRATOR)
    .where('RFC', '==', SYSTEM_RFC)
    .limit(1)
    .get();
  if (roleValidationSnapshot.empty) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole, {
      displayMessage: `El usuario ${actorEmail} no tiene permisos para crear instituciones.`,
    });
  }

  const batch = firestore.batch();
  batch.set(firestore.collection('institutions').doc(parsed.institution.RFC), parsed.institution);
  batch.set(firestore.collection('permissions').doc(parsed.permission.permissionId), parsed.permission);
  batch.set(firestore.collection('logs').doc(parsed.logs[0].id), parsed.logs[0]);
  batch.set(firestore.collection('logs').doc(parsed.logs[1].id), parsed.logs[1]);
  batch.set(firestore.collection('logs').doc(parsed.logs[2].id), parsed.logs[2]);
  await batch.commit();

  return parsed.response;
}

/**
 * @description Actualiza el plan institucional con historial y bitácora en una escritura atómica.
 */
export async function updateInstitutionPlan(input: UpdateInstitutionPlanInput) {
  const actorRole = typeof input.actor.role === 'string' ? input.actor.role : null;
  const actorEmail = typeof input.actor.email === 'string' ? input.actor.email.toLowerCase() : null;
  const parsedRole = actorRole ? RoleSchema.safeParse(actorRole) : null;
  if (!actorEmail || !parsedRole?.success) {
    throw new SystemError(apiSystemMessages.admin.institutions.forbiddenRole.code);
  }

  const firestore = getAdminFirestore();
  const normalizedRfc = input.rfc.trim().toUpperCase();
  const normalizedPayload = parseInstitutionPlanUpdateInput(input.payload);
  const institutionRef = firestore.collection('institutions').doc(normalizedRfc);
  const institutionSnapshot = await institutionRef.get();
  if (!institutionSnapshot.exists) {
    throw new SystemError(apiSystemMessages.admin.institutions.institutionNotFound, {
      displayMessage: `No existe una institución registrada con RFC ${normalizedRfc}.`,
    });
  }

  const parsed = buildInstitutionPlanUpdateRecords({
    rawInput: normalizedPayload,
    institution: InstitutionSchema.parse(institutionSnapshot.data()),
    actor: {
      userId: input.actor.userId,
      email: actorEmail,
      role: parsedRole.data,
    },
    now: Date.now(),
    originTraceId: input.originTraceId,
    logId: firestore.collection('logs').doc().id,
  });

  const batch = firestore.batch();
  batch.set(institutionRef, parsed.institution);
  batch.set(firestore.collection('logs').doc(parsed.log.id), parsed.log);
  await batch.commit();

  return parsed.response;
}
