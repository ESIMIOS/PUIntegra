/**
 * @package api
 * @name institutionDependencies.ts
 * @version 0.0.2
 * @description Implementa dependencias runtime para onboarding institucional y actualización de planes.
 * @author @codex
 * @changelog
 * - 0.0.2	(2026-05-05)	Documenta funciones app-admin con encabezados JSDoc faltantes.	@codex
 * - 0.0.1	(2026-05-01)	Extrae operaciones institucionales desde apiDependencies para reducir complejidad.	@codex
 */

import {
  ContactSchema,
  InstitutionSchema,
  PERMISSION_STATUS,
  PermissionSchema,
  ROLE,
  RoleSchema,
  SYSTEM_RFC,
  SystemError,
} from '@puintegra/shared';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import {
  AppAdminInstitutionService,
  buildContactUpsertResult,
  buildPermissionCreateResult,
  buildPermissionUpdateResult,
  buildSharedSecretUpdateResult,
} from '../../services/appAdminInstitutionService.js';
import {
  buildInstitutionOnboardingRecords,
  parseInstitutionOnboardingInput,
} from '../../services/institutionOnboardingService.js';
import {
  buildInstitutionPlanUpdateRecords,
  parseInstitutionPlanUpdateInput,
} from '../../services/institutionPlanService.js';
import { getAdminFirestore } from './runtime.js';
import type {
  CreateInstitutionOnboardingInput,
  CreateInstitutionPermissionInput,
  UpdateInstitutionPermissionInput,
  UpdateInstitutionPlanInput,
  UpdateInstitutionSharedSecretInput,
  UpsertInstitutionContactInput,
} from './types.js';

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

/**
 * @description Verifica que el actor tenga permiso GRANTED como INSTITUTION_ADMIN para el RFC objetivo.
 */
async function assertAppInstitutionAdminGrantedRole(input: { rfc: string; email: string }) {
  const granted = await getAdminFirestore()
    .collection('permissions')
    .where('RFC', '==', input.rfc)
    .where('email', '==', input.email)
    .where('status', '==', PERMISSION_STATUS.GRANTED)
    .where('role', '==', ROLE.INSTITUTION_ADMIN)
    .limit(1)
    .get();
  return !granted.empty;
}

/**
 * @description Normaliza y valida el actor autenticado para mutaciones app-admin.
 */
function parseAppActor(input: { userId: string; email?: string | null; role?: string | null }) {
  const actorRole = typeof input.role === 'string' ? input.role : null;
  const actorEmail = typeof input.email === 'string' ? input.email.toLowerCase() : null;
  const parsedRole = actorRole ? RoleSchema.safeParse(actorRole) : null;
  if (!actorEmail || !parsedRole?.success) {
    throw new SystemError(apiSystemMessages.app.institutions.invalidActorContext);
  }
  return { role: parsedRole.data, email: actorEmail };
}

/**
 * @description Crea o reemplaza el contacto canónico por tipo para una institución en dominio app.
 */
export async function upsertInstitutionContact(input: UpsertInstitutionContactInput) {
  const normalizedRfc = input.rfc.trim().toUpperCase();
  const actor = parseAppActor(input.actor);
  AppAdminInstitutionService.assertInstitutionAdminAccess({
    actor: { userId: input.actor.userId, email: actor.email, role: actor.role },
    rfc: normalizedRfc,
    hasGrantedPermissionForRfc: await assertAppInstitutionAdminGrantedRole({ rfc: normalizedRfc, email: actor.email }),
  });

  const firestore = getAdminFirestore();
  const existing = await firestore
    .collection('contacts')
    .where('RFC', '==', normalizedRfc)
    .where('type', '==', input.contactType)
    .limit(1)
    .get();
  const existingContact = existing.empty ? null : ContactSchema.parse(existing.docs[0].data());
  const parsed = buildContactUpsertResult({
    existingContact,
    contactType: input.contactType,
    rfc: normalizedRfc,
    payload: input.payload,
    actor: input.actor,
    originTraceId: input.originTraceId,
    now: Date.now(),
    contactId: firestore.collection('contacts').doc().id,
    logId: firestore.collection('logs').doc().id,
  });
  const contactRef = firestore.collection('contacts').doc(parsed.contact.contactId);
  const logRef = firestore.collection('logs').doc(parsed.log.id);
  const batch = firestore.batch();
  batch.set(contactRef, parsed.contact);
  batch.set(logRef, parsed.log);
  await batch.commit();
  return parsed.response;
}

/**
 * @description Actualiza el secreto compartido institucional cifrado y su huella SHA256 en una operación auditada.
 */
export async function updateInstitutionSharedSecret(input: UpdateInstitutionSharedSecretInput) {
  const normalizedRfc = input.rfc.trim().toUpperCase();
  const actor = parseAppActor(input.actor);
  AppAdminInstitutionService.assertInstitutionAdminAccess({
    actor: { userId: input.actor.userId, email: actor.email, role: actor.role },
    rfc: normalizedRfc,
    hasGrantedPermissionForRfc: await assertAppInstitutionAdminGrantedRole({ rfc: normalizedRfc, email: actor.email }),
  });

  const firestore = getAdminFirestore();
  const institutionRef = firestore.collection('institutions').doc(normalizedRfc);
  const snapshot = await institutionRef.get();
  if (!snapshot.exists) {
    throw new SystemError(apiSystemMessages.admin.institutions.institutionNotFound, {
      displayMessage: `No existe una institucion registrada con RFC ${normalizedRfc}.`,
    });
  }
  const parsed = buildSharedSecretUpdateResult({
    institution: InstitutionSchema.parse(snapshot.data()),
    rfc: normalizedRfc,
    payload: input.payload,
    actor: input.actor,
    originTraceId: input.originTraceId,
    now: Date.now(),
    logId: firestore.collection('logs').doc().id,
  });
  const batch = firestore.batch();
  batch.set(institutionRef, parsed.institution);
  batch.set(firestore.collection('logs').doc(parsed.log.id), parsed.log);
  await batch.commit();
  return parsed.response;
}

/**
 * @description Crea un permiso institucional por correo con identificador determinístico y bitácora.
 */
export async function createInstitutionPermission(input: CreateInstitutionPermissionInput) {
  const normalizedRfc = input.rfc.trim().toUpperCase();
  const actor = parseAppActor(input.actor);
  AppAdminInstitutionService.assertInstitutionAdminAccess({
    actor: { userId: input.actor.userId, email: actor.email, role: actor.role },
    rfc: normalizedRfc,
    hasGrantedPermissionForRfc: await assertAppInstitutionAdminGrantedRole({ rfc: normalizedRfc, email: actor.email }),
  });

  const firestore = getAdminFirestore();
  const parsedPayload = input.payload as { email?: string };
  const permissionId = AppAdminInstitutionService.buildPermissionId(parsedPayload.email ?? '', normalizedRfc);
  const existingPermission = await firestore.collection('permissions').doc(permissionId).get();
  if (existingPermission.exists) {
    throw new SystemError(apiSystemMessages.admin.institutions.duplicateBootstrapPermission, {
      displayMessage: `Ya existe un permiso con correo ${parsedPayload.email ?? ''} para ${normalizedRfc}.`,
    });
  }
  const parsed = buildPermissionCreateResult({
    rfc: normalizedRfc,
    payload: input.payload,
    actor: input.actor,
    originTraceId: input.originTraceId,
    now: Date.now(),
    permissionId,
    logId: firestore.collection('logs').doc().id,
  });
  const batch = firestore.batch();
  batch.set(firestore.collection('permissions').doc(parsed.permission.permissionId), parsed.permission);
  batch.set(firestore.collection('logs').doc(parsed.log.id), parsed.log);
  await batch.commit();
  return parsed.response;
}

/**
 * @description Actualiza únicamente rol y estado de un permiso institucional existente.
 */
export async function updateInstitutionPermission(input: UpdateInstitutionPermissionInput) {
  const normalizedRfc = input.rfc.trim().toUpperCase();
  const actor = parseAppActor(input.actor);
  AppAdminInstitutionService.assertInstitutionAdminAccess({
    actor: { userId: input.actor.userId, email: actor.email, role: actor.role },
    rfc: normalizedRfc,
    hasGrantedPermissionForRfc: await assertAppInstitutionAdminGrantedRole({ rfc: normalizedRfc, email: actor.email }),
  });

  const firestore = getAdminFirestore();
  const permissionRef = firestore.collection('permissions').doc(input.permissionId);
  const snapshot = await permissionRef.get();
  if (!snapshot.exists) {
    throw new SystemError(apiSystemMessages.admin.institutions.institutionNotFound, {
      displayMessage: `No existe un permiso con id ${input.permissionId}.`,
    });
  }
  const permission = PermissionSchema.parse(snapshot.data());
  if (permission.RFC !== normalizedRfc) {
    throw new SystemError(apiSystemMessages.app.institutions.forbiddenRfcContext);
  }
  const parsed = buildPermissionUpdateResult({
    permission,
    payload: input.payload,
    actor: input.actor,
    originTraceId: input.originTraceId,
    now: Date.now(),
    logId: firestore.collection('logs').doc().id,
  });
  const batch = firestore.batch();
  batch.set(permissionRef, parsed.permission);
  batch.set(firestore.collection('logs').doc(parsed.log.id), parsed.log);
  await batch.commit();
  return parsed.response;
}
