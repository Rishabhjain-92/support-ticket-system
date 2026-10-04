import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { requestCorrelationMiddleware } from './middlewares/request-logger.middleware.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();

// Security and request parsing middlewares
app.use(helmet());
const allowedOrigins = process.env.FRONTEND_URL
  ? (process.env.FRONTEND_URL.includes(',')
      ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
      : process.env.FRONTEND_URL)
  : '*';

app.use(
  cors({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging & request timing middlewares
app.use(requestCorrelationMiddleware);
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

// Mount versioned API routes
app.use('/api', apiRouter);

// Catch-all 404 handler for unknown endpoints
app.use(notFoundHandler);

// Centralized error boundary middleware
app.use(globalErrorHandler);

export { app };
export default app;
