// Common API functionality base class with rate limiting
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  cached?: boolean;
  requestId?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface RateLimiter {
  requestsPerMinute: number;
  requestsPerDay: number;
  minuteRequests: number[];
  dailyRequests: number;
  lastReset: number;
}

export abstract class BaseApiService {
  protected baseUrl: string;
  protected headers: Record<string, string>;
  protected timeout: number;
  protected axiosInstance: AxiosInstance;
  protected rateLimiter: RateLimiter;

  constructor(
    baseUrl: string,
    headers: Record<string, string> = {},
    rateLimits: { requestsPerMinute: number; requestsPerDay: number }
  ) {
    this.baseUrl = baseUrl;
    this.headers = headers;
    this.timeout = API_CONFIG.TIMEOUTS.API_REQUEST;

    // Initialize rate limiter
    this.rateLimiter = {
      requestsPerMinute: rateLimits.requestsPerMinute,
      requestsPerDay: rateLimits.requestsPerDay,
      minuteRequests: [],
      dailyRequests: 0,
      lastReset: Date.now()
    };

    // Create axios instance with interceptors
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: this.headers
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for logging and error handling
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        (config as any).metadata = { startTime: Date.now() };
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
        console.log(`API Response: ${response.status} in ${duration}ms`);
        return response;
      },
      (error) => {
        const duration = Date.now() - ((error.config as any)?.metadata?.startTime || 0);
        console.error(`API Error: ${error.response?.status || 'Network Error'} in ${duration}ms`);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * Check rate limits before making request
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    // const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Reset daily counter if needed
    if (now - this.rateLimiter.lastReset > 24 * 60 * 60 * 1000) {
      this.rateLimiter.dailyRequests = 0;
      this.rateLimiter.lastReset = now;
    }

    // Clean up old minute requests
    this.rateLimiter.minuteRequests = this.rateLimiter.minuteRequests.filter(
      timestamp => timestamp > oneMinuteAgo
    );

    // Check limits
    if (this.rateLimiter.minuteRequests.length >= this.rateLimiter.requestsPerMinute) {
      throw new Error('Rate limit exceeded: too many requests per minute');
    }

    if (this.rateLimiter.dailyRequests >= this.rateLimiter.requestsPerDay) {
      throw new Error('Rate limit exceeded: daily limit reached');
    }

    // Record this request
    this.rateLimiter.minuteRequests.push(now);
    this.rateLimiter.dailyRequests++;
  }

  /**
   * Make HTTP request with rate limiting and retry logic
   */
  protected async makeRequest<T>(
    endpoint: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    await this.checkRateLimit();

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request({
        url: endpoint,
        ...config
      });

      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
        requestId: this.generateRequestId()
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  protected buildQueryString(params: Record<string, string | number>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Handle API errors with detailed information
   */
  protected handleApiError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;

      return {
        message,
        status,
        code: error.code || 'API_ERROR',
        details: {
          url: error.config?.url,
          method: error.config?.method,
          responseData: error.response?.data
        }
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
        code: 'INTERNAL_ERROR'
      };
    }

    return {
      message: 'Unknown error occurred',
      status: 500,
      code: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get rate limiter status
   */
  getRateLimiterStatus(): {
    requestsThisMinute: number;
    requestsToday: number;
    minuteLimit: number;
    dailyLimit: number;
  } {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const currentMinuteRequests = this.rateLimiter.minuteRequests.filter(
      timestamp => timestamp > oneMinuteAgo
    ).length;

    return {
      requestsThisMinute: currentMinuteRequests,
      requestsToday: this.rateLimiter.dailyRequests,
      minuteLimit: this.rateLimiter.requestsPerMinute,
      dailyLimit: this.rateLimiter.requestsPerDay
    };
  }
}
