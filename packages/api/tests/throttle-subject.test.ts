import { describe, expect, it } from 'vitest';
import { buildThrottleSubject } from '../src/http/handlers/throttle.js';

describe('throttle subject serializer', () => {
  it('builds readable subject keys for email values', () => {
    expect(buildThrottleSubject([['email', 'owner@example.test']])).toEqual({
      subjectKey: 'email=owner_at_example.test',
      subject: { email: 'owner@example.test' },
    });
  });

  it('escapes reserved characters without colliding with literal underscores', () => {
    expect(buildThrottleSubject([['permissionId', 'perm_value@tenant/example=1%ok']])).toEqual({
      subjectKey: 'permissionId=perm__value_at_tenant_slash_example_eq_1_pct_ok',
      subject: { permissionId: 'perm_value@tenant/example=1%ok' },
    });
  });
});
