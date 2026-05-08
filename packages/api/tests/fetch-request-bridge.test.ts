import { describe, expect, it } from 'vitest';
import { toFetchRequest } from '../src/functions/fetchRequestBridge.js';

type IncomingRequestStub = Parameters<typeof toFetchRequest>[0];

function createRequestStub(overrides: Partial<IncomingRequestStub> = {}): IncomingRequestStub {
  return {
    protocol: 'http',
    method: 'POST',
    path: '/api/auth/lifecycle/account-creation-policy',
    url: 'http://localhost/api/auth/lifecycle/account-creation-policy',
    headers: {},
    rawBody: new TextEncoder().encode(JSON.stringify({ email: 'owner@example.test' })),
    ip: undefined,
    ips: [],
    socket: {},
    connection: {},
    get: (name: string) => {
      const value = overrides.headers?.[name.toLowerCase()] ?? overrides.headers?.[name];
      if (Array.isArray(value)) {
        return value[0];
      }
      return value;
    },
    ...overrides,
  };
}

describe('fetch request bridge', () => {
  it('injects x-forwarded-for from request.ip when proxy headers are absent', () => {
    const request = toFetchRequest(createRequestStub({ ip: '::1' }));

    expect(request.headers.get('x-forwarded-for')).toBe('::1');
  });

  it('falls back to socket remoteAddress when request.ip is absent', () => {
    const request = toFetchRequest(createRequestStub({ socket: { remoteAddress: '127.0.0.1' } }));

    expect(request.headers.get('x-forwarded-for')).toBe('127.0.0.1');
  });

  it('falls back to the first Express ip chain entry when request.ip is absent', () => {
    const request = toFetchRequest(createRequestStub({ ips: ['127.0.0.1'] }));

    expect(request.headers.get('x-forwarded-for')).toBe('127.0.0.1');
  });

  it('falls back to connection remoteAddress when socket remoteAddress is absent', () => {
    const request = toFetchRequest(createRequestStub({ connection: { remoteAddress: '127.0.0.1' } }));

    expect(request.headers.get('x-forwarded-for')).toBe('127.0.0.1');
  });

  it('preserves an existing x-forwarded-for header', () => {
    const request = toFetchRequest(createRequestStub({
      headers: { 'x-forwarded-for': '203.0.113.5' },
      ip: '::1',
    }));

    expect(request.headers.get('x-forwarded-for')).toBe('203.0.113.5');
  });
});
