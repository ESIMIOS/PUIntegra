import {
  PERMISSION_STATUS,
  PermissionSchema,
  ROLE,
  SYSTEM_RFC,
  UPDATE_ORIGIN,
} from '@puintegra/shared';
import {
  buildSystemAdminPermission,
  buildSystemAdminPermissionId,
  isSystemAdminPermissionCurrent,
} from '../src/ops/systemAdminBootstrap';

const NOW = 1_710_000_000_000;
const ADMIN_EMAIL = 'tirsomartinezreyes@gmail.com';

describe('system admin bootstrap', () => {
  it('builds a valid SYSTEM_ADMINISTRATOR permission by normalized email', () => {
    const permission = buildSystemAdminPermission({
      email: ` ${ADMIN_EMAIL.toUpperCase()} `,
      now: NOW,
    });

    expect(() => PermissionSchema.parse(permission)).not.toThrow();
    expect(permission).toMatchObject({
      permissionId: buildSystemAdminPermissionId(ADMIN_EMAIL),
      RFC: SYSTEM_RFC,
      email: ADMIN_EMAIL,
      userId: null,
      role: ROLE.SYSTEM_ADMINISTRATOR,
      status: PERMISSION_STATUS.GRANTED,
      updates: [],
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('preserves existing metadata and records an update when regranting', () => {
    const existing = PermissionSchema.parse({
      permissionId: buildSystemAdminPermissionId(ADMIN_EMAIL),
      RFC: SYSTEM_RFC,
      email: ADMIN_EMAIL,
      userId: 'firebase-uid-001',
      role: ROLE.INSTITUTION_ADMIN,
      status: PERMISSION_STATUS.REVOKED,
      updates: [],
      createdAt: NOW - 1_000,
      updatedAt: NOW - 1_000,
    });

    const permission = buildSystemAdminPermission({
      email: ADMIN_EMAIL,
      now: NOW,
      existingPermission: existing,
    });

    expect(permission.userId).toBe('firebase-uid-001');
    expect(permission.createdAt).toBe(NOW - 1_000);
    expect(permission.role).toBe(ROLE.SYSTEM_ADMINISTRATOR);
    expect(permission.status).toBe(PERMISSION_STATUS.GRANTED);
    expect(permission.updates.at(-1)).toMatchObject({
      updateOrigin: UPDATE_ORIGIN.SYSTEM,
      previousRole: ROLE.INSTITUTION_ADMIN,
      updatedRole: ROLE.SYSTEM_ADMINISTRATOR,
      previousStatus: PERMISSION_STATUS.REVOKED,
      updatedStatus: PERMISSION_STATUS.GRANTED,
    });
  });

  it('detects current bootstrap permission state', () => {
    const permission = buildSystemAdminPermission({
      email: ADMIN_EMAIL,
      now: NOW,
    });

    expect(isSystemAdminPermissionCurrent(permission)).toBe(true);
    expect(isSystemAdminPermissionCurrent({ ...permission, status: PERMISSION_STATUS.DENIED })).toBe(false);
  });
});
