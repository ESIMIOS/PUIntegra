/**
 * @package web
 * @name httpApiGateway.ts
 * @version 0.0.1
 * @description Estandariza llamadas HTTP y manejo de envelope API para gateways web.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-24)	Agrega ejecutor HTTP común con validación de envelope y errores SystemError consistentes.	@codex
 */

import {
  ApiResponseSchema,
  LOG_SEVERITY,
  SYSTEM_PACKAGE_NAME,
  SystemError,
  type ApiError,
  type ApiResponse,
  HTTP_STATUS,
  HttpStatus,
  HttpMethod,
} from '@shared';
import { z } from 'zod';
import { systemMessageTree } from '@/shared/constants/systemMessages';

type HttpRequestOptions = {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  parseData?: z.ZodTypeAny;
  transportMessage?: string;
};

/**
 * @description Construye mensaje de sistema sintético desde envelope API para evitar dependencia de registro local por código.
 */
function toSystemMessageFromApiError(error: ApiError) {
  return {
    code: error.code,
    key: error.uiMessageKey ?? 'api.http.error',
    severity: LOG_SEVERITY.ERROR,
    packageName: SYSTEM_PACKAGE_NAME.API,
    message: error.message,
    displayMessage: error.displayMessage,
  } as const;
}

/**
 * @description Resuelve URL del API HTTP usando base opcional para emuladores.
 */
export function resolveApiUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
  if (baseUrl.endsWith('/api') && path.startsWith('/api/')) {
    return `${baseUrl}${path.substring(4)}`;
  }
  return `${baseUrl}${path}`;
}

/**
 * @description Mapea errores de transporte/envelope HTTP a SystemError consistente para UI.
 */
function mapTransportError(status: number, fallbackMessage: string, details: Record<string, unknown> = {}) {
  if (status === HTTP_STATUS.BAD_REQUEST || status === HTTP_STATUS.UNPROCESSABLE_CONTENT) {
    return new SystemError(systemMessageTree.shared.data.operation.validationFailed, {
      displayMessage: fallbackMessage,
      details,
    });
  }
  if (status === HTTP_STATUS.FORBIDDEN) {
    return new SystemError(systemMessageTree.shared.data.operation.forbiddenOperation, {
      displayMessage: fallbackMessage,
      details,
    });
  }
  if (status === HTTP_STATUS.CONFLICT) {
    return new SystemError(systemMessageTree.shared.data.operation.conflictDetected, {
      displayMessage: fallbackMessage,
      details,
    });
  }
  if (status === HTTP_STATUS.NOT_FOUND) {
    return new SystemError(systemMessageTree.web.ui.data.notFound, { displayMessage: fallbackMessage, details });
  }
  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return new SystemError(systemMessageTree.web.ui.data.serverError, { displayMessage: fallbackMessage, details });
  }
  return new SystemError(systemMessageTree.shared.data.operation.unknownFailure, {
    displayMessage: fallbackMessage,
    details,
  });
}

/**
 * @description Ejecuta request HTTP contra API con envelope estándar y respuesta validada opcional.
 */
export async function executeHttpApi<T = unknown>(options: HttpRequestOptions): Promise<T> {
  const requestInit: RequestInit = {
    method: options.method,
    headers: options.headers,
  };
  if (typeof options.body === 'string') {
    requestInit.body = options.body;
  }

  const response = await fetch(options.url, {
    ...requestInit,
  });

  let payloadResponse: unknown;
  try {
    payloadResponse = await response.json();
  } catch {
    throw mapTransportError(response.status, options.transportMessage ?? 'Failed to parse API response.', {
      status: response.status,
    });
  }

  const apiEnvelope = ApiResponseSchema.safeParse(payloadResponse);
  if (!apiEnvelope.success) {
    throw mapTransportError(
      response.status,
      options.transportMessage ?? 'API response does not match envelope contract.',
      { issues: apiEnvelope.error.issues, status: response.status },
    );
  }

  const apiResponse: ApiResponse = apiEnvelope.data;
  if (!apiResponse.ok) {
    throw new SystemError(toSystemMessageFromApiError(apiResponse.error), {
      httpStatus: response.status as HttpStatus,
      details: {
        uiMessageKey: apiResponse.error.uiMessageKey,
        details: apiResponse.error.details,
      },
    });
  }

  if (!options.parseData) {
    return apiResponse.data as T;
  }

  const parsedData = options.parseData.safeParse(apiResponse.data);
  if (!parsedData.success) {
    throw mapTransportError(500, options.transportMessage ?? 'API success payload is invalid.', {
      issues: parsedData.error.issues,
    });
  }
  return parsedData.data as T;
}
