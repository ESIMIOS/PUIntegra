/**
 * @package api
 * @name seedData.ts
 * @version 0.0.5
 * @description Define datos deterministas para Auth y Firestore Emulator.
 * @author @codex
 * @changelog
 * - 0.0.5	(2026-04-19)	Retira userId de permisos seed; permisos se asignan por correo.	@codex
 * - 0.0.4	(2026-04-19)	Retira bitácora inicial; logs Auth se generan por funciones.	@codex
 * - 0.0.3	(2026-04-19)	Retira users del seed directo; Auth onCreate genera el perfil.	@codex
 * - 0.0.2	(2026-04-19)	Agrega contraseña determinística para el usuario local del Auth Emulator.	@codex
 * - 0.0.1	(2026-04-18)	Agrega seed Firebase para desarrollo local con emuladores.	@codex
 */

export const EMULATOR_PROJECT_ID = 'puintegra-dev';
export const EMULATOR_DEFAULT_RFC = 'XAXX010101000';
export const EMULATOR_AUTH_USER = {
  uid: 'dev-user-001',
  email: 'admin@example.test',
  displayName: 'Usuario Firebase',
  phoneNumber: '+525533748806'
} as const;
export const EMULATOR_AUTH_PASSWORD = 'local-password'; //NOSONAR - Contraseña determinística para el usuario del Auth Emulator, no se usa en producción ni se expone públicamente.

const NOW = 1710000000000;
const TODAY = new Date(NOW).toISOString().slice(0, 10);
const SYSTEM_RFC = 'IEC120914FV8';
const permissionDocumentId = (email: string, RFC: string) => `${email.toLowerCase()}__${RFC.toLowerCase()}`;
const INSTITUTION_SHARED_SECRET_ENV = 'PUINTEGRA_EMULATOR_INSTITUTION_SHARED_SECRET';
const institutionSharedSecret = process.env[INSTITUTION_SHARED_SECRET_ENV];

if (!institutionSharedSecret) {
  throw new Error(`${INSTITUTION_SHARED_SECRET_ENV} is required to seed the Firebase emulators.`);
}


const institution = {
  RFC: EMULATOR_DEFAULT_RFC,
  name: 'Institucion Demo',
  plan: 'PORTAL',
  planStatus: 'ACTIVE',
  sharedSecret: institutionSharedSecret,
  planStartAt: NOW,
  planFinishAt: NOW,
  updates: [],
  createdAt: NOW,
  updatedAt: NOW
};

const permissions = [
  {
    permissionId: permissionDocumentId(EMULATOR_AUTH_USER.email, SYSTEM_RFC),
    RFC: SYSTEM_RFC,
    email: EMULATOR_AUTH_USER.email,
    role: 'SYSTEM_ADMINISTRATOR',
    status: 'GRANTED',
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    permissionId: permissionDocumentId(EMULATOR_AUTH_USER.email, EMULATOR_DEFAULT_RFC),
    RFC: EMULATOR_DEFAULT_RFC,
    email: EMULATOR_AUTH_USER.email,
    role: 'INSTITUTION_ADMIN',
    status: 'GRANTED',
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    permissionId: 'perm-institution-operator-001',
    RFC: EMULATOR_DEFAULT_RFC,
    email: EMULATOR_AUTH_USER.email,
    role: 'INSTITUTION_OPERATOR',
    status: 'GRANTED',
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  }
] as const;

const contacts = [
  {
    contactId: 'contact-tech-001',
    type: 'TECHNICAL',
    RFC: EMULATOR_DEFAULT_RFC,
    name: 'Contacto Tecnico Demo',
    phone: '+525500000001',
    contactCURP: 'AAAA000000HDFXXX00',
    contactRFC: 'XAXX010101000',
    efirmaCertificate: null,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  }
] as const;

const requests = [
  {
    requestId: 'FUB-0001-550e8400-e29b-41d4-a716-446655440001',
    RFC: EMULATOR_DEFAULT_RFC,
    FUB: 'FUB-0001',
    CURP: 'AAAA000000HDFXXX00',
    missingDate: NOW,
    searchRequestStatus: 'ACTIVE',
    searchRequestBasicDataPhaseStatus: 'IN_PROGRESS',
    searchRequestHistoricalPhaseStatus: 'PENDING',
    searchRequestContinuousPhaseStatus: 'PENDING',
    data: {
      id: 'FUB-0001-550e8400-e29b-41d4-a716-446655440001',
      curp: 'AAAA000000HDFXXX00',
      nombre: 'Maria',
      primer_apellido: 'Lopez',
      fecha_nacimiento: '1990-01-01',
      fecha_desaparicion: TODAY,
      lugar_nacimiento: 'CDMX',
      sexo_asignado: 'M'
    },
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  }
] as const;

const findings = [
  {
    findingId: 'finding-001',
    RFC: EMULATOR_DEFAULT_RFC,
    FUB: 'FUB-0001',
    CURP: 'AAAA000000HDFXXX00',
    searchRequestPhase: 'SEARCH_REQUEST_BASIC_DATA',
    PUISyncStatus: 'PENDING',
    PUISyncScheduleDate: NOW,
    data: {
      id: 'FUB-0001-550e8400-e29b-41d4-a716-446655440101',
      institucion_id: EMULATOR_DEFAULT_RFC,
      curp: 'AAAA000000HDFXXX00',
      fase_busqueda: '1',
      lugar_nacimiento: 'CDMX',
      nombre_completo: {
        nombre: 'Maria',
        primer_apellido: 'Lopez'
      }
    },
    responses: [],
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  }
] as const;

export const emulatorSeedData = {
  institutions: [institution],
  permissions,
  contacts,
  requests,
  findings
} as const;
