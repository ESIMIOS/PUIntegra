/**
 * @package shared
 * @name api-throttle.schema.ts
 * @version 0.0.1
 * @description Define el contrato compartido para configuraciones runtime de throttling del API.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-07)	Agrega esquemas Zod para configuración de throttling distribuido del API.	@codex
 */

import { z } from 'zod';
import { apiThrottleDimensionValues, apiThrottleEndpointValues } from '../constants/api-throttling';
import { TimestampMillisecondsUtcSchema } from './domain-common.schema';

export const ApiThrottleEndpointKeySchema = z.enum(apiThrottleEndpointValues);
export const ApiThrottleDimensionKeySchema = z.enum(apiThrottleDimensionValues);

export const ApiThrottleConfigDimensionSchema = z.object({
  dimensionKey: ApiThrottleDimensionKeySchema,
  maxRequests: z.number().int().positive(),
  windowMs: z.number().int().positive(),
});

export const ApiThrottleConfigSchema = z.object({
  endpointKey: ApiThrottleEndpointKeySchema,
  dimensions: z.array(ApiThrottleConfigDimensionSchema).min(1),
  updatedAt: TimestampMillisecondsUtcSchema,
});

export type ApiThrottleEndpointKey = z.infer<typeof ApiThrottleEndpointKeySchema>;
export type ApiThrottleDimensionKey = z.infer<typeof ApiThrottleDimensionKeySchema>;
export type ApiThrottleConfigDimension = z.infer<typeof ApiThrottleConfigDimensionSchema>;
export type ApiThrottleConfig = z.infer<typeof ApiThrottleConfigSchema>;
