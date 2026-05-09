import { describe, expect, it } from 'vitest';
import {
  API_THROTTLE_DEFAULT_DIMENSIONS,
  API_THROTTLE_DEFAULT_MAX_REQUESTS,
  API_THROTTLE_DEFAULT_WINDOW_MS,
  API_THROTTLE_DIMENSION,
  API_THROTTLE_ENDPOINT,
} from '../src/constants/api-throttling';
import { ApiThrottleConfigSchema, ApiThrottleDimensionKeySchema } from '../src/schemas/api-throttle.schema';

describe('api throttle schema', () => {
  it('accepts a valid throttle config document', () => {
    const parsed = ApiThrottleConfigSchema.safeParse({
      endpointKey: API_THROTTLE_ENDPOINT.AUTH_LIFECYCLE_PASSWORD_RECOVERY,
      dimensions: [
        {
          dimensionKey: API_THROTTLE_DIMENSION.IP,
          maxRequests: 20,
          windowMs: 300000,
        },
        {
          dimensionKey: API_THROTTLE_DIMENSION.EMAIL,
          maxRequests: 5,
          windowMs: 900000,
        },
      ],
      updatedAt: 1710000000000,
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects invalid dimension keys', () => {
    const parsed = ApiThrottleDimensionKeySchema.safeParse('ip_email');
    expect(parsed.success).toBe(false);
  });

  it('exports the shared fallback dimension policy', () => {
    expect(API_THROTTLE_DEFAULT_DIMENSIONS).toEqual([
      {
        dimensionKey: API_THROTTLE_DIMENSION.IP,
        maxRequests: API_THROTTLE_DEFAULT_MAX_REQUESTS,
        windowMs: API_THROTTLE_DEFAULT_WINDOW_MS,
      },
    ]);
  });
});
