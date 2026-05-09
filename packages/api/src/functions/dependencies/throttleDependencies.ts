/**
 * @package api
 * @name throttleDependencies.ts
 * @version 0.0.1
 * @description Implementa throttling distribuido con Firestore para rutas API protegidas.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-07)	Agrega enforcement por dimensiones con config runtime y TTL lógico.	@codex
 */

import {
  API_THROTTLE_COUNTER_TTL_BUFFER_MS,
  API_THROTTLE_DEFAULT_DIMENSIONS,
  ApiThrottleConfigSchema,
  SystemError,
  type ApiThrottleConfig,
} from '@puintegra/shared';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { apiSystemMessages } from '../../constants/systemMessages.js';
import { getAdminFirestore } from './runtime.js';
import type { EnforceApiThrottleInput } from './types.js';

const THROTTLE_CONFIG_COLLECTION = 'apiThrottleConfigs';
const THROTTLE_COUNTER_COLLECTION = 'apiThrottleCounters';

function buildFallbackConfig(endpointKey: EnforceApiThrottleInput['endpointKey']): ApiThrottleConfig {
  return ApiThrottleConfigSchema.parse({
    endpointKey,
    dimensions: API_THROTTLE_DEFAULT_DIMENSIONS,
    updatedAt: Date.now(),
  });
}

function resolveThrottleConfig(
  endpointKey: EnforceApiThrottleInput['endpointKey'],
  rawConfig: unknown,
  originTraceId: string,
): ApiThrottleConfig {
  if (!rawConfig) {
    return buildFallbackConfig(endpointKey);
  }

  const parsed = ApiThrottleConfigSchema.safeParse(rawConfig);
  if (parsed.success) {
    return parsed.data;
  }

  logger.warn('api_throttle_invalid_config', {
    endpointKey,
    originTraceId,
    issues: parsed.error.issues,
  });
  return buildFallbackConfig(endpointKey);
}

function buildOverQuotaError(input: {
  endpointKey: EnforceApiThrottleInput['endpointKey'];
  dimensionKey: NonNullable<ApiThrottleConfig['dimensions']>[number]['dimensionKey'];
  maxRequests: number;
  windowMs: number;
  retryAfterSeconds: number;
}) {
  return new SystemError(apiSystemMessages.throttle.overQuota, {
    details: input,
  });
}

/**
 * @description Aplica throttling distribuido por endpoint y dimensión usando Firestore.
 */
export async function enforceApiThrottle(input: EnforceApiThrottleInput) {
  const firestore = getAdminFirestore();
  const configSnapshot = await firestore.collection(THROTTLE_CONFIG_COLLECTION).doc(input.endpointKey).get();
  const config = resolveThrottleConfig(input.endpointKey, configSnapshot.data(), input.originTraceId);
  const now = Date.now();
  let enforcedDimensions = 0;

  for (const dimension of config.dimensions) {
    const subject = input.subjects[dimension.dimensionKey];
    if (!subject) {
      continue;
    }
    enforcedDimensions += 1;

    const windowStart = Math.floor(now / dimension.windowMs) * dimension.windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowStart + dimension.windowMs - now) / 1000));
    const counterId = `${input.endpointKey}__${dimension.dimensionKey}__${subject.subjectKey}`;
    const counterRef = firestore.collection(THROTTLE_COUNTER_COLLECTION).doc(counterId);

    await firestore.runTransaction(async (transaction) => {
      const counterSnapshot = await transaction.get(counterRef);
      const counter = counterSnapshot.data() as
        | {
            count?: number;
            createdAt?: number;
            windowStart?: number;
            windowMs?: number;
          }
        | undefined;
      const isCurrentWindow =
        counterSnapshot.exists &&
        counter?.windowStart === windowStart &&
        counter?.windowMs === dimension.windowMs;
      const currentCount = isCurrentWindow ? (counter?.count ?? 0) : 0;
      if (currentCount >= dimension.maxRequests) {
        logger.warn('api_throttle_over_quota', {
          endpointKey: input.endpointKey,
          dimensionKey: dimension.dimensionKey,
          subjectKey: subject.subjectKey,
          originTraceId: input.originTraceId,
          retryAfterSeconds,
        });
        throw buildOverQuotaError({
          endpointKey: input.endpointKey,
          dimensionKey: dimension.dimensionKey,
          maxRequests: dimension.maxRequests,
          windowMs: dimension.windowMs,
          retryAfterSeconds,
        });
      }
      const nextCount = currentCount + 1;

      transaction.set(counterRef, {
        endpointKey: input.endpointKey,
        dimensionKey: dimension.dimensionKey,
        subjectKey: subject.subjectKey,
        subject: subject.subject,
        count: nextCount,
        windowStart,
        windowMs: dimension.windowMs,
        createdAt: isCurrentWindow ? (counter?.createdAt ?? now) : now,
        updatedAt: now,
        expiresAt: Timestamp.fromMillis(windowStart + dimension.windowMs + API_THROTTLE_COUNTER_TTL_BUFFER_MS),
      });
    });
  }

  if (enforcedDimensions === 0) {
    logger.error('api_throttle_subject_missing', {
      endpointKey: input.endpointKey,
      originTraceId: input.originTraceId,
      configuredDimensions: config.dimensions.map(({ dimensionKey }) => dimensionKey),
    });
    throw new SystemError(apiSystemMessages.sys.unexpectedFailure, {
      displayMessage: 'La configuración de throttling es incompleta para esta ruta.',
    });
  }
}
