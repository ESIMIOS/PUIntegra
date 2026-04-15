/**
 * @package web
 * @name mock-storage.test.ts
 * @version 0.0.1
 * @description Verifica hidratación, fallback y persistencia del almacenamiento mock.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { describe, expect, it } from 'vitest';
import {
  canonicalMockSeedDataset,
  cloneMockDataset,
  loadMockDataset,
  resetMockDataset,
  saveMockDataset
} from '@/bom';

class MemoryStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }
}

describe('mock storage', () => {
  it('persists and hydrates valid datasets', () => {
    const storage = new MemoryStorage();
    const dataset = cloneMockDataset(canonicalMockSeedDataset);
    dataset.institutions[0].name = 'Institucion Persistida';

    saveMockDataset(dataset, storage);
    const hydrated = loadMockDataset(storage);

    expect(hydrated.institutions[0].name).toBe('Institucion Persistida');
  });

  it('falls back to seed dataset when persisted state is invalid', () => {
    const storage = new MemoryStorage();
    storage.setItem('puintegra:web:mock-dataset:v1', '{"institutions":[{"broken":true}]}');

    const hydrated = loadMockDataset(storage);
    expect(hydrated.institutions[0].RFC).toBe(canonicalMockSeedDataset.institutions[0].RFC);
  });

  it('throws on persistence failure', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('write-failed');
      },
      removeItem: () => {}
    };

    expect(() => saveMockDataset(cloneMockDataset(canonicalMockSeedDataset), storage)).toThrow();
  });

  it('resets persisted dataset', () => {
    const storage = new MemoryStorage();
    saveMockDataset(cloneMockDataset(canonicalMockSeedDataset), storage);

    const reset = resetMockDataset(storage);
    expect(reset.institutions[0].RFC).toBe(canonicalMockSeedDataset.institutions[0].RFC);
    expect(loadMockDataset(storage).institutions[0].RFC).toBe(canonicalMockSeedDataset.institutions[0].RFC);
  });
});
