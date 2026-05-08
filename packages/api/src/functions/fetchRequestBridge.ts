/**
 * @package api
 * @name fetchRequestBridge.ts
 * @version 0.0.1
 * @description Convierte la request HTTP de Firebase Functions a Fetch Request preservando IP útil para Hono.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-08)	Agrega bridge reusable con propagación explícita de IP cliente para emulador y runtime.	@codex
 */

type HeaderValue = string | string[] | undefined;

type IncomingRequest = {
  protocol?: string;
  method: string;
  path?: string;
  url: string;
  headers: Record<string, HeaderValue>;
  rawBody: Uint8Array;
  ip?: string;
  ips?: string[];
  socket?: {
    remoteAddress?: string;
  };
  connection?: {
    remoteAddress?: string;
  };
  get(name: string): string | undefined;
};

function normalizeHeaderValue(value: HeaderValue) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function readRequestIp(request: IncomingRequest) {
  const candidates = [
    request.ip,
    request.ips?.[0],
    request.socket?.remoteAddress,
    request.connection?.remoteAddress,
  ];
  for (const candidate of candidates) {
    const normalized = candidate?.trim();
    if (normalized) {
      return normalized;
    }
  }
  return null;
}

function buildHeaders(request: IncomingRequest) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    const normalizedValue = normalizeHeaderValue(value);
    if (typeof normalizedValue === 'string') {
      headers.set(key, normalizedValue);
    }
  }

  if (!headers.has('x-forwarded-for')) {
    const requestIp = readRequestIp(request);
    if (requestIp) {
      headers.set('x-forwarded-for', requestIp);
    }
  }

  return headers;
}

/**
 * @description Construye una Request Fetch preservando método, headers, body e IP derivada del runtime Node.
 */
export function toFetchRequest(request: IncomingRequest) {
  const protocol = request.protocol || 'http';
  const host = request.get('host') || 'localhost';
  const requestUrl = new URL(request.path || request.url, `${protocol}://${host}`);
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : new Uint8Array(request.rawBody);

  return new Request(requestUrl, {
    method: request.method,
    headers: buildHeaders(request),
    body,
  });
}
