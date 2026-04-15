/**
 * @package web
 * @name mockStorage.ts
 * @version 0.0.1
 * @description Implementa hidratación, persistencia y reset del estado mock en almacenamiento local.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import type { MockDataset } from '../types/mockData';
import { MOCK_STORAGE_KEY } from '../constants/mockConfig';
import { canonicalMockSeedDataset, cloneMockDataset } from '../seed/mockSeed';
import { MockDatasetSchema } from './mockDatasetSchema';
import { MockDataError, MOCK_DATA_ERROR_KIND } from '../errors/mockDataError';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * @description Resolves browser storage or a custom storage implementation for tests.
 */
function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage) {
    return storage;
  }
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }
  return globalThis.localStorage;
}

/**
 * @description Loads mock dataset from storage with schema validation and seed fallback.
 */
export function loadMockDataset(storage?: StorageLike | null): MockDataset {
  const storageRef = resolveStorage(storage);
  if (!storageRef) {
    return cloneMockDataset(canonicalMockSeedDataset);
  }

  const raw = storageRef.getItem(MOCK_STORAGE_KEY);
  if (!raw) {
    return cloneMockDataset(canonicalMockSeedDataset);
  }

  try {
    const parsed = JSON.parse(raw);
    const validated = MockDatasetSchema.safeParse(parsed);
    if (!validated.success) {
      return cloneMockDataset(canonicalMockSeedDataset);
    }
    return cloneMockDataset(validated.data);
  } catch {
    return cloneMockDataset(canonicalMockSeedDataset);
  }
}

/**
 * @description Validates and persists mock dataset to storage.
 */
export function saveMockDataset(
  dataset: MockDataset,
  storage?: StorageLike | null
): void {
  const storageRef = resolveStorage(storage);
  if (!storageRef) {
    return;
  }

  const validated = MockDatasetSchema.safeParse(dataset);
  if (!validated.success) {
    throw new MockDataError(MOCK_DATA_ERROR_KIND.VALIDATION, 'Invalid dataset payload for persistence.', {
      reason: 'schema_validation_failed'
    });
  }

  try {
    storageRef.setItem(MOCK_STORAGE_KEY, JSON.stringify(validated.data));
  } catch (error) {
    throw new MockDataError(MOCK_DATA_ERROR_KIND.STORAGE, 'Failed to persist mock dataset.', {
      error
    });
  }
}

/**
 * @description Clears persisted dataset and returns canonical seed state.
 */
export function resetMockDataset(storage?: StorageLike | null): MockDataset {
  const storageRef = resolveStorage(storage);
  if (storageRef) {
    try {
      storageRef.removeItem(MOCK_STORAGE_KEY);
    } catch (error) {
      throw new MockDataError(MOCK_DATA_ERROR_KIND.STORAGE, 'Failed to reset mock dataset.', { error });
    }
  }
  return cloneMockDataset(canonicalMockSeedDataset);
}
