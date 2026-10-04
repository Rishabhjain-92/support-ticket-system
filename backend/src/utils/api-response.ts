import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  statusCode: number;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Sends a standardized success response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string,
  meta?: PaginationMeta
): Response {
  const envelope: ApiSuccessEnvelope<T> = {
    success: true,
    statusCode,
    ...(message ? { message } : {}),
    data,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(envelope);
}

/**
 * Sends a standardized error response.
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  const envelope: ApiErrorEnvelope = {
    success: false,
    statusCode,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(envelope);
}
