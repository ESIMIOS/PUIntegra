import { describe, expect, it } from 'vitest';
import { ROLE } from '../src/constants/access';
import {
  AuthenticatedRoleSchema,
  RoleSchema
} from '../src/schemas/access.schema';

describe('access schema', () => {
  it('accepts every declared role in role schema', () => {
    for (const role of Object.values(ROLE)) {
      expect(RoleSchema.safeParse(role).success).toBe(true);
    }
  });

  it('rejects anonymous role in authenticated role schema', () => {
    expect(AuthenticatedRoleSchema.safeParse(ROLE.ANONYMOUS).success).toBe(false);
  });
});
