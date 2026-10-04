import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorEnvelope } from '../types/ticket.js';

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'UNKNOWN_ERROR',
    details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Production Axios HTTP client equipped with request and response middleware interceptors.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * ============================================================================
 * FRONTEND MIDDLEWARE: Request Interceptor
 * - Injects unique X-Request-ID for distributed tracing
 * - Attaches timestamp metadata for client-side latency tracking
 * ============================================================================
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate UUIDv4 for request correlation if crypto API is available
    const requestId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    config.headers.set('X-Request-ID', requestId);
    (config as any).metadata = { startTime: performance.now() };

    if (import.meta.env.DEV) {
      console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[HTTP Request Middleware Error]', error);
    return Promise.reject(error);
  }
);

/**
 * ============================================================================
 * FRONTEND MIDDLEWARE: Response Interceptor
 * - Unpacks standardized API envelope
 * - Measures network latency
 * - Catches errors and transforms them into typed ApiError instances
 * ============================================================================
 */
apiClient.interceptors.response.use(
  (response) => {
    const config = response.config as any;
    if (config.metadata?.startTime && import.meta.env.DEV) {
      const elapsed = (performance.now() - config.metadata.startTime).toFixed(1);
      console.log(
        `[HTTP Response] ${config.method?.toUpperCase()} ${config.url} - ${response.status} (${elapsed}ms)`
      );
    }
    return response;
  },
  (error: AxiosError<ApiErrorEnvelope>) => {
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      const errorData = error.response.data;
      if (errorData && errorData.error) {
        throw new ApiError(
          errorData.error.message || 'Server error occurred',
          error.response.status,
          errorData.error.code || 'SERVER_ERROR',
          errorData.error.details
        );
      }

      throw new ApiError(
        error.message || 'Request failed',
        error.response.status,
        `HTTP_${error.response.status}`
      );
    } else if (error.code === 'ECONNABORTED') {
      throw new ApiError('Request timed out. Please check your connection.', 408, 'TIMEOUT');
    } else if (error.request) {
      // The request was made but no response was received
      throw new ApiError(
        'Unable to communicate with the server. Please ensure the backend is running.',
        503,
        'NETWORK_ERROR'
      );
    }

    throw new ApiError(error.message || 'An unexpected error occurred.', 500, 'UNEXPECTED');
  }
);

export default apiClient;
