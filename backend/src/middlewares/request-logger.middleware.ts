import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware that attaches a unique X-Request-ID and measures request timing.
 */
export function requestCorrelationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req.headers['x-request-id'] as string) || randomUUID();
  const startTime = process.hrtime();

  res.setHeader('X-Request-ID', correlationId);

  // Hook into writeHead to ensure X-Response-Time header is sent before headers are committed
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = function (statusCode: number, ...args: unknown[]) {
    const diff = process.hrtime(startTime);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    res.setHeader('X-Response-Time', `${timeInMs}ms`);
    return originalWriteHead(statusCode, ...(args as [any]));
  };

  next();
}
