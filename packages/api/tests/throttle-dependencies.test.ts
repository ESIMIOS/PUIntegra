import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_THROTTLE_DIMENSION, API_THROTTLE_ENDPOINT, SystemError } from '@puintegra/shared';

const loggerMock = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
}));

type StoredDocument = Record<string, unknown>;

class FakeDocSnapshot {
  constructor(private readonly value: StoredDocument | undefined) {}

  get exists() {
    return this.value !== undefined;
  }

  data() {
    return this.value;
  }
}

class FakeDocRef {
  constructor(private readonly store: Map<string, StoredDocument>, private readonly key: string) {}

  async get() {
    return new FakeDocSnapshot(this.store.get(this.key));
  }

  set(value: StoredDocument) {
    this.store.set(this.key, value);
  }
}

class FakeCollectionRef {
  constructor(private readonly store: Map<string, StoredDocument>, private readonly name: string) {}

  doc(id: string) {
    return new FakeDocRef(this.store, `${this.name}/${id}`);
  }
}

class FakeTransaction {
  constructor(private readonly store: Map<string, StoredDocument>) {}

  async get(docRef: FakeDocRef) {
    return docRef.get();
  }

  set(docRef: FakeDocRef, value: StoredDocument) {
    docRef.set(value);
  }
}

class FakeFirestore {
  private readonly store = new Map<string, StoredDocument>();

  collection(name: string) {
    return new FakeCollectionRef(this.store, name);
  }

  seed(name: string, id: string, value: StoredDocument) {
    this.store.set(`${name}/${id}`, value);
  }

  read(name: string, id: string) {
    return this.store.get(`${name}/${id}`);
  }

  async runTransaction<T>(callback: (transaction: FakeTransaction) => Promise<T>) {
    return callback(new FakeTransaction(this.store));
  }
}

const runtimeMock = vi.hoisted(() => ({
  firestore: null as FakeFirestore | null,
}));

vi.mock('firebase-functions/v2', () => ({
  logger: loggerMock,
}));

vi.mock('../src/functions/dependencies/runtime.js', () => ({
  getAdminFirestore: () => runtimeMock.firestore,
}));

const { enforceApiThrottle } = await import('../src/functions/dependencies/throttleDependencies');

describe('distributed api throttle dependency', () => {
  beforeEach(() => {
    runtimeMock.firestore = new FakeFirestore();
    loggerMock.warn.mockReset();
    loggerMock.error.mockReset();
  });

  it('shares counters across service calls and denies when any configured dimension exceeds quota', async () => {
    runtimeMock.firestore.seed('apiThrottleConfigs', API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY, {
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
      dimensions: [
        { dimensionKey: API_THROTTLE_DIMENSION.IP, maxRequests: 5, windowMs: 300000 },
        { dimensionKey: API_THROTTLE_DIMENSION.EMAIL, maxRequests: 1, windowMs: 900000 },
      ],
      updatedAt: 1710000000000,
    });

    await enforceApiThrottle({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
      originTraceId: 'trace-1',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: { subjectKey: 'ip=198.51.100.1', subject: { ip: '198.51.100.1' } },
        [API_THROTTLE_DIMENSION.EMAIL]: {
          subjectKey: 'email=owner_at_example.test',
          subject: { email: 'owner@example.test' },
        },
      },
    });

    await expect(
      enforceApiThrottle({
        endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
        originTraceId: 'trace-2',
        subjects: {
          [API_THROTTLE_DIMENSION.IP]: { subjectKey: 'ip=198.51.100.2', subject: { ip: '198.51.100.2' } },
          [API_THROTTLE_DIMENSION.EMAIL]: {
            subjectKey: 'email=owner_at_example.test',
            subject: { email: 'owner@example.test' },
          },
        },
      }),
    ).rejects.toBeInstanceOf(SystemError);

    expect(loggerMock.warn).toHaveBeenCalledWith(
      'api_throttle_over_quota',
      expect.objectContaining({
        endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
        dimensionKey: API_THROTTLE_DIMENSION.EMAIL,
      }),
    );
  });

  it('enforces only the configured simple subjects that are present on the request', async () => {
    runtimeMock.firestore.seed('apiThrottleConfigs', API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RESET_COMPLETED, {
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RESET_COMPLETED,
      dimensions: [
        { dimensionKey: API_THROTTLE_DIMENSION.IP, maxRequests: 2, windowMs: 600000 },
        { dimensionKey: API_THROTTLE_DIMENSION.USER, maxRequests: 1, windowMs: 600000 },
        { dimensionKey: API_THROTTLE_DIMENSION.EMAIL, maxRequests: 1, windowMs: 600000 },
      ],
      updatedAt: 1710000000000,
    });

    await expect(
      enforceApiThrottle({
        endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RESET_COMPLETED,
        originTraceId: 'trace-reset-1',
        subjects: {
          [API_THROTTLE_DIMENSION.IP]: { subjectKey: 'ip=198.51.100.40', subject: { ip: '198.51.100.40' } },
          [API_THROTTLE_DIMENSION.EMAIL]: {
            subjectKey: 'email=owner_at_example.test',
            subject: { email: 'owner@example.test' },
          },
        },
      }),
    ).resolves.toBeUndefined();

    expect(
      runtimeMock.firestore.read(
        'apiThrottleCounters',
        'auth.lifecycle.password-reset-completed__ip__ip=198.51.100.40',
      ),
    ).toBeDefined();
    expect(
      runtimeMock.firestore.read(
        'apiThrottleCounters',
        'auth.lifecycle.password-reset-completed__email__email=owner_at_example.test',
      ),
    ).toBeDefined();
    expect(
      runtimeMock.firestore.read(
        'apiThrottleCounters',
        'auth.lifecycle.password-reset-completed__user__user=missing-user',
      ),
    ).toBeUndefined();
  });

  it('treats prior windows as expired logically even before TTL deletion', async () => {
    runtimeMock.firestore.seed('apiThrottleConfigs', API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGIN, {
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGIN,
      dimensions: [{ dimensionKey: API_THROTTLE_DIMENSION.IP, maxRequests: 1, windowMs: 1000 }],
      updatedAt: 1710000000000,
    });
    const dateNowSpy = vi.spyOn(Date, 'now');
    dateNowSpy.mockReturnValueOnce(1500).mockReturnValueOnce(2600);

    await enforceApiThrottle({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGIN,
      originTraceId: 'trace-login-1',
      subjects: {
        [API_THROTTLE_DIMENSION.IP]: { subjectKey: 'ip=203.0.113.10', subject: { ip: '203.0.113.10' } },
      },
    });

    await expect(
      enforceApiThrottle({
        endpointKey: API_THROTTLE_ENDPOINT.AUTH_EVENTS_LOGIN,
        originTraceId: 'trace-login-2',
        subjects: {
          [API_THROTTLE_DIMENSION.IP]: { subjectKey: 'ip=203.0.113.10', subject: { ip: '203.0.113.10' } },
        },
      }),
    ).resolves.toBeUndefined();

    const counter = runtimeMock.firestore.read('apiThrottleCounters', 'auth.events.login__ip__ip=203.0.113.10');
    expect(counter).toBeDefined();
    expect(counter).toMatchObject({
      count: 1,
      windowStart: 2000,
      windowMs: 1000,
    });
    dateNowSpy.mockRestore();
  });
});
