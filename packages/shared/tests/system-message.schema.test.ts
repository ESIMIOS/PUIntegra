import { describe, expect, it } from 'vitest';
import {
  LogSeveritySchema,
  MessageCodeSchema,
  MessageKeySchema,
  SystemMessageSchema
} from '../src/schemas/system-message.schema';

describe('system message schema', () => {
  it('accepts a valid system message envelope', () => {
    const parsed = SystemMessageSchema.safeParse({
      code: 'WEB-GUARD-403-001',
      key: 'web.guard.role_mismatch',
      severity: 'WARNING',
      package: 'web',
      message: 'Role does not have access to the requested route.',
      meta: {
        route: '/admin/institutions'
      }
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects invalid severity values', () => {
    const parsed = LogSeveritySchema.safeParse('TRACE');
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid message code format', () => {
    const parsed = MessageCodeSchema.safeParse('web-guard-403-001');
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid message key format', () => {
    const parsed = MessageKeySchema.safeParse('web.guard');
    expect(parsed.success).toBe(false);
  });
});
