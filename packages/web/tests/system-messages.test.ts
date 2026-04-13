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
import { webSystemMessages } from '@/shared/constants/systemMessages';

describe('web system messages', () => {
  it('uses valid schema envelopes', () => {
    for (const message of Object.values(webSystemMessages)) {
      const parsed = SystemMessageSchema.safeParse(message);
      expect(parsed.success).toBe(true);
    }
  });

  it('uses valid code and key formats', () => {
    for (const message of Object.values(webSystemMessages)) {
      expect(MessageCodeSchema.safeParse(message.code).success).toBe(true);
      expect(MessageKeySchema.safeParse(message.key).success).toBe(true);
    }
  });

  it('keeps unique codes and keys', () => {
    const messages = Object.values(webSystemMessages);
    const codes = messages.map((message) => message.code);
    const keys = messages.map((message) => message.key);

    expect(new Set(codes).size).toBe(codes.length);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
