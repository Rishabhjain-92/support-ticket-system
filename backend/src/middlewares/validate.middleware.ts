import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/api-response.js';

type ValidationSource = 'body' | 'query' | 'params';

/**
 * Middleware factory for validating incoming request parts using Zod schemas.
 * Fully compatible with Express 5 getters on req.query and req.params.
 */
export function validate(schema: ZodSchema, source: ValidationSource = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[source]);

      if (source === 'query' || source === 'params') {
        const target = req[source] as Record<string, unknown>;
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
