/**
 * @package web
 * @name system-messages.test.ts
 * @version 0.0.1
 * @description Verifica consistencia del catálogo de mensajes de sistema para guards y service worker.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { describe, expect, it } from 'vitest';
import { MessageCodeSchema, MessageKeySchema, SystemMessageSchema } from '@shared';
import { systemMessageTree } from '@/shared/constants/systemMessages';

function isSystemMessageLeaf(value: unknown): value is { code: string; key: string } {
  return typeof value === 'object'
    && value !== null
    && 'code' in value
    && 'key' in value;
}

function collectMessages(tree: unknown): Array<{ code: string; key: string }> {
  if (isSystemMessageLeaf(tree)) {
    return [tree];
  }
  if (typeof tree !== 'object' || tree === null) {
    return [];
  }
  return Object.values(tree).flatMap((value) => collectMessages(value));
}

describe('web system messages', () => {
  it('uses valid schema envelopes', () => {
    for (const message of collectMessages(systemMessageTree)) {
      const parsed = SystemMessageSchema.safeParse(message);
      expect(parsed.success).toBe(true);
    }
  });

  it('uses valid code and key formats', () => {
    for (const message of collectMessages(systemMessageTree)) {
      expect(MessageCodeSchema.safeParse(message.code).success).toBe(true);
      expect(MessageKeySchema.safeParse(message.key).success).toBe(true);
    }
  });

  it('keeps unique codes and keys', () => {
    const messages = collectMessages(systemMessageTree);
    const codes = messages.map((message) => message.code);
    const keys = messages.map((message) => message.key);

    expect(new Set(codes).size).toBe(codes.length);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
