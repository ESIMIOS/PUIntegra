/**
 * @package web
 * @name mockSeed.ts
 * @version 0.0.1
 * @description Define el dataset canónico inicial para operación mock del alcance 1.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import {
  COMMERCIAL_PLAN,
  COMMERCIAL_PLAN_STATUS,
  FINDING_PUI_SYNC_STATUS,
  INSTITUTION_CONTACT_TYPE,
  LOG_CATEGORIES,
  LOG_ORIGIN,
  PERMISSION_STATUS,
  ROLE,
  SEARCH_REQUEST_PHASE,
  SEARCH_REQUEST_PHASE_STATUS,
  SEARCH_REQUEST_STATUS,
  SYSTEM_RFC,
  type Contact,
  type Finding,
  type Institution,
  type Log,
  type Permission,
  type Request,
  type User
} from '@shared';
import { DEFAULT_RFC } from '@/shared/constants/routePaths';
import { nowUtcMilliseconds, yearsAgoUtcMilliseconds } from '@/shared/utils/dateUtils';
import { deepClone } from '@/shared/utils/objectUtils';
import type { MockDataset } from '../types/mockData';

const NOW = nowUtcMilliseconds();

const seedUser: User = {
  userId: 'mock-user-001',
  name: 'Usuario Mock',
  email: 'admin@example.test',
  phone: '+525500000000',
  emojiIcon: '🧩',
  updates: [],
  createdAt: NOW,
  updatedAt: NOW
};

const seedInstitution: Institution = {
  RFC: DEFAULT_RFC,
  name: 'Institucion Demo',
  plan: COMMERCIAL_PLAN.PORTAL,
  planStatus: COMMERCIAL_PLAN_STATUS.ACTIVE,
  sharedSecret: 'sha256:mock-shared-secret',
  planStartAt: NOW,
  planFinishAt: NOW,
  updates: [],
  createdAt: NOW,
  updatedAt: NOW
};

const seedPermissions: Permission[] = [
  {
    permissionId: 'perm-system-admin-001',
    RFC: SYSTEM_RFC,
    email: seedUser.email,
    userId: seedUser.userId,
    role: ROLE.SYSTEM_ADMINISTRATOR,
    status: PERMISSION_STATUS.GRANTED,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    permissionId: 'perm-institution-admin-001',
    RFC: DEFAULT_RFC,
    email: seedUser.email,
    userId: seedUser.userId,
    role: ROLE.INSTITUTION_ADMIN,
    status: PERMISSION_STATUS.GRANTED,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    permissionId: 'perm-institution-operator-001',
    RFC: DEFAULT_RFC,
    email: seedUser.email,
    userId: seedUser.userId,
    role: ROLE.INSTITUTION_OPERATOR,
    status: PERMISSION_STATUS.GRANTED,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  }
];

const seedContacts: Contact[] = [
  {
    contactId: 'contact-legal-001',
    type: INSTITUTION_CONTACT_TYPE.LEGAL,
    RFC: DEFAULT_RFC,
    name: 'Contacto Legal Demo',
    phone: '+525500000010',
    contactCURP: 'AAAA000000HDFXXX10',
    contactRFC: 'XAXX010101000',
    efirmaCertificate: null,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    contactId: 'contact-tech-001',
    type: INSTITUTION_CONTACT_TYPE.TECHNICAL,
    RFC: DEFAULT_RFC,
    name: 'Contacto Tecnico Demo',
    phone: '+525500000001',
    contactCURP: 'AAAA000000HDFXXX00',
    contactRFC: 'XAXX010101000',
    efirmaCertificate: null,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    contactId: 'contact-immediate-search-001',
    type: INSTITUTION_CONTACT_TYPE.IMMEDIATE_SEARCH,
    RFC: DEFAULT_RFC,
    name: 'Contacto Busqueda Inmediata Demo',
    phone: '+525500000011',
    contactCURP: 'AAAA000000HDFXXX11',
    contactRFC: 'XAXX010101000',
    efirmaCertificate: null,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  }
];

const seedRequests: Request[] = [
  {
    requestId: 'request-001',
    RFC: DEFAULT_RFC,
    FUB: 'FUB-0001',
    CURP: 'AAAA000000HDFXXX00',
    missingDate: NOW,
    searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
    searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
    searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
    searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    requestId: 'request-002',
    RFC: DEFAULT_RFC,
    FUB: 'FUB-0002',
    CURP: 'AAAA000000HDFXXX01',
    missingDate: null,
    searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
    searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
    searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
    searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    requestId: 'request-003',
    RFC: DEFAULT_RFC,
    FUB: 'FUB-0003',
    CURP: 'AAAA000000HDFXXX02',
    missingDate: yearsAgoUtcMilliseconds(15, NOW),
    searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
    searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.DONE,
    searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
    searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.PENDING,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    requestId: 'request-004',
    RFC: DEFAULT_RFC,
    FUB: 'FUB-0004',
    CURP: 'AAAA000000HDFXXX03',
    missingDate: yearsAgoUtcMilliseconds(5, NOW),
    searchRequestStatus: SEARCH_REQUEST_STATUS.ACTIVE,
    searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.DONE,
    searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.DONE,
    searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.IN_PROGRESS,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    requestId: 'request-005',
    RFC: DEFAULT_RFC,
    FUB: 'FUB-0005',
    CURP: 'AAAA000000HDFXXX04',
    missingDate: yearsAgoUtcMilliseconds(5, NOW),
    searchRequestStatus: SEARCH_REQUEST_STATUS.REVOKED,
    searchRequestBasicDataPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.REVOKED,
    searchRequestHistoricalPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.REVOKED,
    searchRequestContinuousPhaseStatus: SEARCH_REQUEST_PHASE_STATUS.REVOKED,
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  }
];

const seedFindings: Finding[] = [
  {
    findingId: 'finding-001',
    RFC: DEFAULT_RFC,
    FUB: 'FUB-0001',
    CURP: 'AAAA000000HDFXXX00',
    searchRequestPhase: SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA,
    PUISyncStatus: FINDING_PUI_SYNC_STATUS.PENDING,
    PUISyncScheduleDate: NOW,
    data: { id: 'finding-contract-001' },
    responses: [],
    updates: [],
    createdAt: NOW,
    updatedAt: NOW
  }
];

const logCategories = Object.values(LOG_CATEGORIES);
const seedLogs: Log[] = logCategories.map((category, index) => ({
  id: `log-${String(index + 1).padStart(3, '0')}`,
  category,
  RFC: category.startsWith('USER_ACCOUNT') ? SYSTEM_RFC : DEFAULT_RFC,
  origin: LOG_ORIGIN.SYSTEM_DATA_TRIGGER,
  originTraceId: null,
  userId: seedUser.userId,
  execution: {
    executedByUserId: seedUser.userId,
    executedByRole: category.startsWith('USER_ACCOUNT') ? ROLE.SYSTEM_ADMINISTRATOR : ROLE.INSTITUTION_ADMIN,
    executedByUserEmail: seedUser.email
  },
  impact: {},
  searchRequest: category.includes('SEARCH_REQUEST') || category.includes('FINDING')
    ? {
      FUB: seedRequests[0]?.FUB ?? null,
      CURP: seedRequests[0]?.CURP ?? null,
      searchRequestStatus: seedRequests[0]?.searchRequestStatus ?? null,
      searchRequestPhase: SEARCH_REQUEST_PHASE.SEARCH_REQUEST_BASIC_DATA,
      searchRequestPhaseStatus: seedRequests[0]?.searchRequestBasicDataPhaseStatus ?? null
    }
    : {},
  createdAt: NOW + index
}));

export const canonicalMockSeedDataset: MockDataset = {
  users: [seedUser],
  institutions: [seedInstitution],
  providerContexts: [{ RFC: SYSTEM_RFC, label: 'Proveedor SaaS' }],
  permissions: seedPermissions,
  contacts: seedContacts,
  requests: seedRequests,
  findings: seedFindings,
  logs: seedLogs
};

/**
 * @description Creates a deep clone of the mock dataset.
 */
export function cloneMockDataset(dataset: MockDataset = canonicalMockSeedDataset): MockDataset {
  return deepClone(dataset);
}
