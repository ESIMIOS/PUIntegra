/**
 * @package api
 * @name shared.ts
 * @version 0.0.1
 * @description Utilidades compartidas de parsing y autenticación para handlers HTTP.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Extrae utilidades comunes para reducir duplicación entre handlers.	@codex
 */

import type { Context } from 'hono';
import { SystemError } from '@puintegra/shared';
import { z } from 'zod';
import { apiSystemMessages } from '../../constants/systemMessages.js';

const EmailPayloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const LifecycleCompletionPayloadSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
});

export const MfaResetPayloadSchema = z.object({
  verificationNote: z.string().trim().min(12),
});

export const AccountProfilePayloadSchema = z.object({
  name: z.string().trim().min(1),
  emojiIcon: z.string().trim().min(1),
  phone: z.string().trim().optional().nullable(),
});

/**
 * @description Extrae token Bearer del encabezado Authorization.
 */
export function readBearerToken(authorization: string | undefined) {
  const [scheme, token] = authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

/**
 * @description Lee la IP cliente desde encabezados de proxy conocidos.
 */
export function readClientIp(context: Context) {
  const requestHost = new URL(context.req.url).hostname.toLowerCase();
  const parseCandidate = (value: string | undefined) => {
    const normalized = value?.trim();
    if (!normalized) {
      return null;
    }

    const bracketedIpv6 = new RegExp(/^\[([^\]]+)\](?::\d+)?$/).exec(normalized);
    let withoutPort = normalized.replaceAll(/^\[|\]$/g, '');
    if (bracketedIpv6) {
      withoutPort = bracketedIpv6[1];
    } else if (/^[0-9.]+:\d+$/.test(normalized)) {
      withoutPort = normalized.replaceAll(/:\d+$/, '');
    }
    const withoutIpv6Prefix = withoutPort.startsWith('::ffff:')
      ? withoutPort.slice('::ffff:'.length)
      : withoutPort;
    const loopbackNormalized = withoutIpv6Prefix === '::1'
      ? '127.0.0.1'
      : withoutIpv6Prefix;
    return loopbackNormalized.length > 0 ? loopbackNormalized : null;
  };
  const forwardedFor = parseCandidate(context.req.header('x-forwarded-for')?.split(',')[0]);
  if (forwardedFor) {
    return forwardedFor;
  }

  const forwarded = context.req.header('forwarded');
  const forwardedMatch = forwarded?.match(/for=(?:"?\[?)([^;\],"]+)/i);
  const forwardedIp = parseCandidate(forwardedMatch?.[1]);
  if (forwardedIp) {
    return forwardedIp;
  }

  const proxyHeaders = [
    context.req.header('x-real-ip'),
    context.req.header('cf-connecting-ip'),
    context.req.header('fastly-client-ip'),
    context.req.header('x-client-ip'),
    context.req.header('x-appengine-user-ip'),
  ];
  for (const headerValue of proxyHeaders) {
    const clientIp = parseCandidate(headerValue);
    if (clientIp) {
      return clientIp;
    }
  }

  if (requestHost === 'localhost' || requestHost === '127.0.0.1') {
    return '127.0.0.1';
  }

  return 'unknown-client';
}

/**
 * @description Lee JSON y normaliza errores de payload para rutas auth lifecycle.
 */
export async function readJsonPayload(context: Context) {
  try {
    return await context.req.json();
  } catch {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload);
  }
}

export function parseEmailPayload(payload: unknown) {
  const parsed = EmailPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: {
        issues: parsed.error.issues,
      },
    });
  }
  return parsed.data;
}

export function parseLifecycleCompletionPayload(payload: unknown) {
  const parsed = LifecycleCompletionPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new SystemError(apiSystemMessages.auth.lifecycle.invalidPayload, {
      details: {
        issues: parsed.error.issues,
      },
    });
  }
  return parsed.data;
}

/**
 * @description Usa identificadores de ejecución/traza disponibles para correlación con logs de Cloud Functions.
 */
export function readOriginTraceId(context: Context, createOriginTraceId: () => string) {
  return (
    context.req.header('function-execution-id') ??
    context.req.header('x-cloud-trace-context') ??
    context.req.header('x-request-id') ??
    createOriginTraceId()
  );
}
