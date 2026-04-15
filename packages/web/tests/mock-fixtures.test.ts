/**
 * @package web
 * @name mock-fixtures.test.ts
 * @version 0.0.1
 * @description Verifica que fixtures mock canónicos cumplan contrato y rechacen payloads inválidos.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { describe, expect, it } from 'vitest';
import {
  cloneMockDataset,
  canonicalMockSeedDataset
} from '@/bom';
import { LOG_CATEGORIES, ROLE, SEARCH_REQUEST_STATUS } from '@shared';
import { MockDatasetSchema } from '@/mock/storage/mockDatasetSchema';

describe('mock fixtures', () => {
  it('accepts canonical fixture payload', () => {
    const parsed = MockDatasetSchema.safeParse(cloneMockDataset(canonicalMockSeedDataset));
    expect(parsed.success).toBe(true);
  });

  it('rejects malformed fixture payloads', () => {
    const malformed = cloneMockDataset(canonicalMockSeedDataset);
    malformed.institutions[0]!.planStatus = 'BAD_STATUS' as never; //NOSONAR - forzamos un valor inválido para probar rechazo de esquema

    const parsed = MockDatasetSchema.safeParse(malformed);
    expect(parsed.success).toBe(false);
  });

  it('covers seeded roles, contacts, requests, and log categories', () => {
    const dataset = cloneMockDataset(canonicalMockSeedDataset);

    expect(dataset.permissions.some((item) => item.role === ROLE.SYSTEM_ADMINISTRATOR)).toBe(true);
    expect(dataset.permissions.some((item) => item.role === ROLE.INSTITUTION_ADMIN)).toBe(true);
    expect(dataset.permissions.some((item) => item.role === ROLE.INSTITUTION_OPERATOR)).toBe(true);

    expect(new Set(dataset.contacts.map((item) => item.type)).size).toBe(3);

    expect(dataset.requests).toHaveLength(5);
    expect(dataset.requests.some((item) => item.missingDate === null)).toBe(true);
    expect(dataset.requests.some((item) => item.missingDate !== null && item.missingDate <= Date.now() - (15 * 365 * 24 * 60 * 60 * 1000))).toBe(true);
    expect(dataset.requests.some((item) => item.missingDate !== null && item.missingDate <= Date.now() - (5 * 365 * 24 * 60 * 60 * 1000))).toBe(true);
    expect(dataset.requests.some((item) => item.searchRequestStatus === SEARCH_REQUEST_STATUS.REVOKED)).toBe(true);

    const categoryCount = new Set(dataset.logs.map((item) => item.category)).size;
    expect(categoryCount).toBe(Object.values(LOG_CATEGORIES).length);
  });
});
