/**
 * @package shared
 * @name domain.schema.test.ts
 * @version 0.0.1
 * @description Valida escenarios de aceptación y rechazo del contrato de dominio compartido.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { describe, expect, it } from 'vitest';
import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  DEFAULT_FUB,
  DEFAULT_RFC,
  ContactSchema,
  FINDING_PUI_SYNC_STATUS,
  INSTITUTION_CONTACT_TYPE,
  FindingSchema,
  InstitutionSchema,
  LOG_CATEGORIES,
  LOG_ORIGIN,
  PERMISSION_STATUS,
  LogSchema,
  PUI_FASE_BUSQUEDA,
  PUI_LUGAR_NACIMIENTO,
  PermissionSchema,
  RequestSchema,
  ROLE,
  SEARCH_REQUEST_PHASE,
  SEARCH_REQUEST_PHASE_STATUS,
  SEARCH_REQUEST_STATUS,
  UpdateInstitutionPlanSchema,
  UserSchema
} from '../src';

const NOW = Date.now();
const PUI_CASE_ID = `${DEFAULT_FUB}-550e8400-e29b-41d4-a716-446655440000`;
const REQUEST_DATA = {
  id: PUI_CASE_ID,
  curp: 'AAAA000000HDFXXX00',
  nombre: 'Maria',
  primer_apellido: 'Lopez',
  fecha_desaparicion: '2026-04-15',
  lugar_nacimiento: PUI_LUGAR_NACIMIENTO.DF
};
const FINDING_DATA = {
  id: PUI_CASE_ID,
  institucion_id: DEFAULT_RFC,
  curp: 'AAAA000000HDFXXX00',
  fase_busqueda: PUI_FASE_BUSQUEDA.FASE_1,
  lugar_nacimiento: PUI_LUGAR_NACIMIENTO.DF
};

describe('stage1 schemas', () => {
  it('accepts valid stage1 entity payloads', () => {
    expect(UserSchema.safeParse({
      userId: 'mock-user-001',
      name: 'Usuario Mock',
      email: 'admin@example.test',
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(true);

    expect(InstitutionSchema.safeParse({
      RFC: DEFAULT_RFC,
      name: 'Institucion Demo',
      plan: COMMERCIAL_PLAN.PORTAL,
      planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
      sharedSecret: 'sha256:secret',
      planStartAt: NOW,
      planFinishAt: NOW,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(true);

    expect(PermissionSchema.safeParse({
      permissionId: 'perm-001',
      RFC: DEFAULT_RFC,
      email: 'admin@example.test',
      userId: 'mock-user-001',
      role: ROLE.INSTITUTION_ADMIN,
      status: PERMISSION_STATUS.GRANTED,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(true);

    expect(ContactSchema.safeParse({
      contactId: 'contact-001',
      type: INSTITUTION_CONTACT_TYPE.TECHNICAL,
      RFC: DEFAULT_RFC,
      name: 'Contacto Demo',
      phone: '+525500000000',
      contactCURP: 'AAAA000000HDFXXX00',
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(true);

    expect(RequestSchema.safeParse({
      requestId: 'req-001',
      RFC: DEFAULT_RFC,
      FUB: DEFAULT_FUB,
      CURP: 'AAAA000000HDFXXX00',
      missingDate: NOW,
      searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
      searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
      searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
      searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
      data: REQUEST_DATA,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(true);

    expect(FindingSchema.safeParse({
      findingId: 'finding-001',
      RFC: DEFAULT_RFC,
      FUB: DEFAULT_FUB,
      CURP: 'AAAA000000HDFXXX00',
      searchRequestPhase: SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA,
      PUISyncStatus: FINDING_PUI_SYNC_STATUS.PENDING,
      PUISyncScheduleDate: NOW,
      data: FINDING_DATA,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(true);

    expect(LogSchema.safeParse({
      id: 'log-001',
      category: LOG_CATEGORIES.USER_ACCOUNT_LOGIN,
      RFC: DEFAULT_RFC,
      origin: LOG_ORIGIN.SYSTEM_DATA_TRIGGER,
      userId: 'mock-user-001',
      execution: {},
      impact: {},
      searchRequest: {},
      createdAt: NOW
    }).success).toBe(true);
  });

  it('accepts institution onboarding with deferred sharedSecret', () => {
    expect(InstitutionSchema.safeParse({
      RFC: 'AAA010101AAA',
      name: 'Institucion Onboarding',
      plan: COMMERCIAL_PLAN.PORTAL,
      planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
      sharedSecret: null,
      planStartAt: NOW,
      planFinishAt: NOW,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(true);

    expect(InstitutionSchema.safeParse({
      RFC: 'BBB010101BBB',
      name: 'Institucion Onboarding 2',
      plan: COMMERCIAL_PLAN.CLOUD,
      planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
      planStartAt: NOW,
      planFinishAt: NOW,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(true);
  });

  it('validates institution plan update payloads', () => {
    expect(UpdateInstitutionPlanSchema.safeParse({
      plan: COMMERCIAL_PLAN.CLOUD,
      planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
      planStartAt: NOW,
      planFinishAt: NOW + 86_400_000,
    }).success).toBe(true);

    expect(UpdateInstitutionPlanSchema.safeParse({
      plan: COMMERCIAL_PLAN.CLOUD,
      planStatus: COMMERCIAL_PLAN_STATUS.WARNING,
      planStartAt: NOW + 86_400_000,
      planFinishAt: NOW,
    }).success).toBe(false);
  });

  it('rejects malformed stage1 entity payloads', () => {
    expect(UserSchema.safeParse({
      userId: '',
      name: 'Usuario Mock',
      email: 'admin@example.test',
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(false);

    expect(InstitutionSchema.safeParse({
      RFC: DEFAULT_RFC,
      name: 'Institucion Demo',
      plan: 'STARTER',
      planStatus: 'UNKNOWN',
      sharedSecret: 'sha256:secret',
      planStartAt: NOW,
      planFinishAt: NOW,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(false);

    expect(PermissionSchema.safeParse({
      permissionId: 'perm-001',
      RFC: DEFAULT_RFC,
      email: 'admin@example.test',
      userId: 'mock-user-001',
      role: 'WRONG_ROLE',
      status: PERMISSION_STATUS.GRANTED,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(false);

    expect(ContactSchema.safeParse({
      contactId: 'contact-001',
      type: 'INVALID',
      RFC: DEFAULT_RFC,
      name: 'Contacto Demo',
      phone: '+525500000000',
      contactCURP: 'AAAA000000HDFXXX00',
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(false);

    expect(RequestSchema.safeParse({
      requestId: 'req-001',
      RFC: DEFAULT_RFC,
      FUB: DEFAULT_FUB,
      CURP: 'AAAA000000HDFXXX00',
      missingDate: NOW,
      searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
      searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
      searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
      searchRequestContinuousPhaseStatus: 'BAD',
      data: REQUEST_DATA,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(false);

    expect(FindingSchema.safeParse({
      findingId: 'finding-001',
      RFC: DEFAULT_RFC,
      FUB: DEFAULT_FUB,
      CURP: 'AAAA000000HDFXXX00',
      searchRequestPhase: 'INVALID_PHASE',
      PUISyncStatus: FINDING_PUI_SYNC_STATUS.PENDING,
      PUISyncScheduleDate: NOW,
      data: FINDING_DATA,
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(false);

    expect(LogSchema.safeParse({
      id: 'log-001',
      category: 'NOT_VALID',
      RFC: DEFAULT_RFC,
      origin: LOG_ORIGIN.SYSTEM_DATA_TRIGGER,
      userId: 'mock-user-001',
      execution: {},
      impact: {},
      searchRequest: {},
      createdAt: NOW
    }).success).toBe(false);
  });

  it('requires PUI-shaped request and finding data', () => {
    expect(RequestSchema.safeParse({
      requestId: 'req-001',
      RFC: DEFAULT_RFC,
      FUB: DEFAULT_FUB,
      CURP: 'AAAA000000HDFXXX00',
      missingDate: NOW,
      searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
      searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
      searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
      searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
      data: { id: 'missing-required-activation-fields' },
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(false);

    expect(FindingSchema.safeParse({
      findingId: 'finding-001',
      RFC: DEFAULT_RFC,
      FUB: DEFAULT_FUB,
      CURP: 'AAAA000000HDFXXX00',
      searchRequestPhase: SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA,
      PUISyncStatus: FINDING_PUI_SYNC_STATUS.PENDING,
      PUISyncScheduleDate: NOW,
      data: { id: 'generic-data-is-not-enough' },
      createdAt: NOW,
      updatedAt: NOW
    }).success).toBe(false);
  });
});
