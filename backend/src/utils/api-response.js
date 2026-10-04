/**
 * Sends a standardized success response.
 * @param {import('express').Response} res
 * @param {any} data
 * @param {number} [statusCode=200]
 * @param {string} [message]
 * @param {object} [meta]
 */
export function sendSuccess(res, data, statusCode = 200, message = undefined, meta = undefined) {
  const envelope = {
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
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} code
 * @param {string} message
 * @param {any} [details]
 */
export function sendError(res, statusCode, code, message, details = undefined) {
  const envelope = {
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
