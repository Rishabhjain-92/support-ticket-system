import axios from 'axios';

export class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'UNKNOWN_ERROR', details = undefined) {
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
  (config) => {
    const requestId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    config.headers.set('X-Request-ID', requestId);
    config.metadata = { startTime: performance.now() };

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
    const config = response.config;
    if (config?.metadata?.startTime && import.meta.env.DEV) {
      const elapsed = (performance.now() - config.metadata.startTime).toFixed(1);
      console.log(
        `[HTTP Response] ${config.method?.toUpperCase()} ${config.url} - ${response.status} (${elapsed}ms)`
      );
    }
    return response;
  },
  (error) => {
    if (error.response) {
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
