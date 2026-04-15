/**
 * @package shared
 * @name pui-transport.schema.test.ts
 * @version 0.0.1
 * @description Valida contratos de transporte PUI, fechas y adaptadores de dominio.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { describe, expect, it } from 'vitest';
import {
  PUI_FASE_BUSQUEDA,
  PUI_LUGAR_NACIMIENTO,
  PUI_SEXO_ASIGNADO,
  type PUIInstitucionNotificaCoincidenciaEnPUIPayload,
  type PUIPUIActivaReporteEnInstitucionPayload,
  PUIPUIActivaReporteEnInstitucionPayloadSchema,
  PUIReporteActivoSchema,
  PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema,
  SEARCH_REQUEST_PHASE,
  SEARCH_REQUEST_PHASE_STATUS,
  SEARCH_REQUEST_STATUS,
  extractFubFromPuiCaseId,
  fromPuiFaseBusqueda,
  optionalPuiDateToUtcMilliseconds,
  puiActivationPayloadToRequestCreateData,
  puiDateToUtcMilliseconds,
  puiMatchPayloadToFindingCreateData,
  toPuiFaseBusqueda,
  utcMillisecondsToPuiDate
} from '../src';

const NOW = Date.now();
const VALID_CASE_ID = 'FUB-0001-550e8400-e29b-41d4-a716-446655440000';
const VALID_CURP = 'AAAA000000HDFXXX00';
const DEFAULT_RFC = 'XAXX010101000';

const validActivationPayload = {
  id: VALID_CASE_ID,
  curp: VALID_CURP,
  nombre: 'Maria',
  primer_apellido: 'Lopez',
  segundo_apellido: 'Perez',
  fecha_nacimiento: '1990-02-14',
  fecha_desaparicion: '2026-04-15',
  lugar_nacimiento: PUI_LUGAR_NACIMIENTO.DF,
  sexo_asignado: PUI_SEXO_ASIGNADO.M,
  telefono: '+525500000000',
  correo: 'persona@example.test',
  direccion: 'Calle Demo 123',
  calle: 'Calle Demo',
  numero: '123',
  colonia: 'Centro',
  codigo_postal: '01000',
  municipio_o_alcaldia: 'Cuauhtemoc',
  entidad_federativa: 'CDMX'
} satisfies PUIPUIActivaReporteEnInstitucionPayload;

const validMatchPayload = {
  id: VALID_CASE_ID,
  institucion_id: DEFAULT_RFC,
  curp: VALID_CURP,
  fase_busqueda: PUI_FASE_BUSQUEDA.FASE_2,
  nombre_completo: {
    nombre: 'Maria',
    primer_apellido: 'Lopez',
    segundo_apellido: 'Perez'
  },
  fecha_nacimiento: '1990-02-14',
  lugar_nacimiento: PUI_LUGAR_NACIMIENTO.DF,
  sexo_asignado: PUI_SEXO_ASIGNADO.M,
  telefono: '+525500000000',
  correo: 'persona@example.test',
  domicilio: {
    direccion: 'Calle Demo 123',
    codigo_postal: '01000'
  },
  fotos: ['base64-encrypted-photo'],
  formato_fotos: 'jpg',
  huellas: {
    rone: 'rone'
  },
  formato_huellas: 'wsq',
  tipo_evento: 'Operacion administrativa',
  fecha_evento: '2026-04-15',
  descripcion_lugar_evento: 'Sucursal Demo',
  direccion_evento: {
    direccion: 'Sucursal Demo 123'
  }
} satisfies PUIInstitucionNotificaCoincidenciaEnPUIPayload;

describe('PUI transport schemas', () => {
  it('accepts valid activation, active report, and match payloads', () => {
    expect(PUIPUIActivaReporteEnInstitucionPayloadSchema.safeParse(validActivationPayload).success).toBe(true);

    expect(PUIReporteActivoSchema.safeParse({
      id: VALID_CASE_ID,
      curp: VALID_CURP,
      nombre: 'Maria',
      primer_apellido: 'Lopez',
      segundo_apellido: 'Perez',
      fecha_nacimiento: '1990-02-14',
      fecha_desaparicion: '2026-04-15',
      fecha_registro: '2026-04-15',
      lugar_nacimiento: PUI_LUGAR_NACIMIENTO.DF,
      sexo_asignado: PUI_SEXO_ASIGNADO.M
    }).success).toBe(true);

    expect(PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema.safeParse(validMatchPayload).success).toBe(true);
  });

  it('rejects invalid transport fields', () => {
    expect(PUIPUIActivaReporteEnInstitucionPayloadSchema.safeParse({
      ...validActivationPayload,
      curp: 'BAD'
    }).success).toBe(false);

    expect(PUIPUIActivaReporteEnInstitucionPayloadSchema.safeParse({
      ...validActivationPayload,
      codigo_postal: '123456'
    }).success).toBe(false);

    expect(PUIReporteActivoSchema.safeParse({
      ...validActivationPayload,
      fecha_registro: '2026/04/15',
      sexo_asignado: 'Z'
    }).success).toBe(false);

    expect(PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema.safeParse({
      ...validMatchPayload,
      correo: 'not-an-email'
    }).success).toBe(false);
  });

  it('rejects phase one match payloads with event-specific fields', () => {
    expect(PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema.safeParse({
      ...validMatchPayload,
      fase_busqueda: PUI_FASE_BUSQUEDA.FASE_1,
      tipo_evento: undefined,
      fecha_evento: undefined,
      descripcion_lugar_evento: undefined,
      direccion_evento: undefined
    }).success).toBe(true);

    expect(PUIInstitucionNotificaCoincidenciaEnPUIPayloadSchema.safeParse({
      ...validMatchPayload,
      fase_busqueda: PUI_FASE_BUSQUEDA.FASE_1
    }).success).toBe(false);
  });
});

describe('PUI date utilities', () => {
  it('converts PUI dates and internal UTC timestamps', () => {
    const timestamp = Date.UTC(2026, 3, 15);

    expect(puiDateToUtcMilliseconds('2026-04-15')).toBe(timestamp);
    expect(optionalPuiDateToUtcMilliseconds(undefined)).toBeNull();
    expect(optionalPuiDateToUtcMilliseconds(null)).toBeNull();
    expect(utcMillisecondsToPuiDate(timestamp)).toBe('2026-04-15');
  });

  it('throws on invalid calendar dates and unsafe timestamps', () => {
    expect(() => puiDateToUtcMilliseconds('2026-02-30')).toThrow();
    expect(() => puiDateToUtcMilliseconds('2026/04/15')).toThrow();
    expect(() => utcMillisecondsToPuiDate(Number.NaN)).toThrow();
  });
});

describe('PUI domain adapters', () => {
  it('maps search request phases in both directions', () => {
    expect(toPuiFaseBusqueda(SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA)).toBe(PUI_FASE_BUSQUEDA.FASE_1);
    expect(toPuiFaseBusqueda(SEARCH_REQUEST_PHASE.SEARCH_REQUEST_HISTORICAL)).toBe(PUI_FASE_BUSQUEDA.FASE_2);
    expect(toPuiFaseBusqueda(SEARCH_REQUEST_PHASE.SEARCH_REQUEST_CONTINUOUS)).toBe(PUI_FASE_BUSQUEDA.FASE_3);

    expect(fromPuiFaseBusqueda(PUI_FASE_BUSQUEDA.FASE_1)).toBe(SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA);
    expect(fromPuiFaseBusqueda(PUI_FASE_BUSQUEDA.FASE_2)).toBe(SEARCH_REQUEST_PHASE.SEARCH_REQUEST_HISTORICAL);
    expect(fromPuiFaseBusqueda(PUI_FASE_BUSQUEDA.FASE_3)).toBe(SEARCH_REQUEST_PHASE.SEARCH_REQUEST_CONTINUOUS);
  });

  it('derives request creation data from PUI activation payloads', () => {
    const derived = puiActivationPayloadToRequestCreateData(validActivationPayload, DEFAULT_RFC, NOW);

    expect(derived).toMatchObject({
      requestId: VALID_CASE_ID,
      RFC: DEFAULT_RFC,
      FUB: 'FUB-0001',
      CURP: VALID_CURP,
      missingDate: Date.UTC(2026, 3, 15),
      searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
      searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
      searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
      searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
      data: validActivationPayload
    });
  });

  it('derives finding creation data from PUI match payloads', () => {
    const derived = puiMatchPayloadToFindingCreateData(validMatchPayload, DEFAULT_RFC, 'finding-001', NOW);

    expect(derived).toMatchObject({
      findingId: 'finding-001',
      RFC: DEFAULT_RFC,
      FUB: 'FUB-0001',
      CURP: VALID_CURP,
      searchRequestPhase: SEARCH_REQUEST_PHASE.SEARCH_REQUEST_HISTORICAL,
      data: validMatchPayload
    });
  });

  it('throws when PUI ids do not follow FUB-UUID4 format', () => {
    expect(extractFubFromPuiCaseId(VALID_CASE_ID)).toBe('FUB-0001');
    expect(() => extractFubFromPuiCaseId('not-a-pui-id')).toThrow();
    expect(() => puiActivationPayloadToRequestCreateData({
      ...validActivationPayload,
      id: 'not-a-pui-id'
    }, DEFAULT_RFC, NOW)).toThrow();
    expect(() => puiMatchPayloadToFindingCreateData({
      ...validMatchPayload,
      id: 'not-a-pui-id'
    }, DEFAULT_RFC, 'finding-001', NOW)).toThrow();
  });
});
