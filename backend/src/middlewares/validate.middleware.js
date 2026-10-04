import { ZodError } from 'zod';
import { sendError } from '../utils/api-response.js';

/**
 * Middleware factory for validating incoming request parts using Zod schemas.
 * Fully compatible with Express 5 getters on req.query and req.params.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source='body']
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);

      if (source === 'query' || source === 'params') {
        const target = req[source];
        for (const key of Object.keys(target)) {
          delete target[key];
        }
        Object.assign(target, parsed);
      } else {
        req.body = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        sendError(
          res,
          400,
          'VALIDATION_ERROR',
          'One or more input fields failed validation.',
          formattedErrors
        );
        return;
      }
      next(error);
    }
  };
}
