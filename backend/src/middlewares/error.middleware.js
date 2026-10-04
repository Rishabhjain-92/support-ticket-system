import { Prisma } from '@prisma/client';
import { AppError } from '../utils/app-error.js';
import { sendError } from '../utils/api-response.js';

/**
 * 404 Not Found handler for undefined routes
 */
export function notFoundHandler(req, res) {
  sendError(
    res,
    404,
    'ROUTE_NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl} - endpoint does not exist.`
  );
}

/**
 * Global centralized error-handling middleware.
 * Intercepts all thrown errors, standardizes their format, and prevents server crashes.
 */
export function globalErrorHandler(err, _req, res, _next) {
  // Operational errors (instantiated via AppError)
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Prisma record not found error (P2025)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', 'Requested record was not found.');
      return;
    }
    if (err.code === 'P2002') {
      sendError(res, 409, 'CONFLICT', 'A record with this unique attribute already exists.', {
        target: err.meta?.target,
      });
      return;
    }
  }

  // Malformed JSON payload
  if ('type' in err && err.type === 'entity.parse.failed') {
    sendError(res, 400, 'MALFORMED_JSON', 'Invalid JSON payload received in request body.');
    return;
  }

  // Unhandled / system errors
  console.error('Unhandled Application Error:', err);
  const isDev = process.env.NODE_ENV === 'development';
  sendError(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred. Please try again later.',
    isDev ? { stack: err.stack, raw: err.message } : undefined
  );
}
