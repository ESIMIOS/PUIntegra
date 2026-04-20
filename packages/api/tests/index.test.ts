/**
 * @package api
 * @name index.test.ts
 * @version 0.0.1
 * @description Valida que el entrypoint API publique la función HTTP.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Smoke test inicial del entrypoint API.  @antigravity
 */

import { describe, expect, it } from 'vitest';

describe('api package entrypoint', () => {
  it('exports the Firebase HTTP function', async () => {
    const module = await import('../src/index');

    expect(module.api).toBeTruthy();
  });
});
