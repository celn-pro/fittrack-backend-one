// External API response types

/**
 * ExerciseDB API Response Types (exercisedb.dev)
 */
export interface ExerciseDBResponse {
  exerciseId: string;
  name: string;
  gifUrl: string;
  instructions: string[];
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
}

/**
 * ExerciseDB API Paginated Response
 */
export interface ExerciseDBPaginatedResponse {
  success: boolean;
  data: {
    previousPage: string | null;
    nextPage: string | null;
    totalPages: number;
    totalExercises: number;
    currentPage: number;
    exercises: ExerciseDBResponse[];
  };
}

export type BodyPart = 
  | 'back'
  | 'cardio'
  | 'chest'
  | 'lower arms'
  | 'lower legs'
  | 'neck'
  | 'shoulders'
  | 'upper arms'
  | 'upper legs'
  | 'waist';

export type TargetMuscle = 
  | 'abductors'
  | 'abs'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'cardiovascular system'
  | 'delts'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'levator scapulae'
  | 'pectorals'
  | 'quads'
  | 'serratus anterior'
  | 'spine'
  | 'traps'
  | 'triceps'
  | 'upper back';

export type Equipment = 
  | 'assisted'
  | 'band'
  | 'barbell'
  | 'body weight'
  | 'bosu ball'
  | 'cable'
  | 'dumbbell'
  | 'elliptical machine'
  | 'ez barbell'
  | 'hammer'
  | 'kettlebell'
  | 'leverage machine'
  | 'medicine ball'
  | 'olympic barbell'
  | 'resistance band'
  | 'roller'
  | 'rope'
  | 'skierg machine'
  | 'sled machine'
  | 'smith machine'
  | 'stability ball'
  | 'stationary bike'
  | 'stepmill machine'
  | 'tire'
  | 'trap bar'
  | 'upper body ergometer'
  | 'weighted';

/**
 * Nutrition API Response Types (for future integration)
 */
export interface NutritionApiResponse {
  id: string;
  name: string;
  calories: number;
  macronutrients: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  micronutrients?: {
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
  };
  servingSize: {
    amount: number;
    unit: string;
  };
  category: string;
  allergens?: string[];
}

/**
 * Weather API Response Types (for environmental factors)
 */
export interface WeatherApiResponse {
  temperature: number; // Celsius
  humidity: number; // Percentage
  pressure: number; // hPa
  windSpeed: number; // km/h
  uvIndex: number;
  airQuality?: {
    aqi: number;
    pollutants: Record<string, number>;
  };
  location: {
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  timestamp: string;
}

/**
 * Fitness Tracker API Response Types (for future integration)
 */
export interface FitnessTrackerApiResponse {
  userId: string;
  date: string;
  steps: number;
  distance: number; // kilometers
  caloriesBurned: number;
  activeMinutes: number;
  heartRate?: {
    resting: number;
    average: number;
    maximum: number;
    zones: {
      fatBurn: number; // minutes
      cardio: number; // minutes
      peak: number; // minutes
    };
  };
  sleep?: {
    duration: number; // hours
    efficiency: number; // percentage
    stages: {
      light: number; // minutes
      deep: number; // minutes
      rem: number; // minutes
      awake: number; // minutes
    };
  };
  workouts?: Array<{
    type: string;
    duration: number; // minutes
    caloriesBurned: number;
    averageHeartRate?: number;
    maxHeartRate?: number;
  }>;
}

/**
 * Generic API Response Wrapper
 */
export interface ApiResponseWrapper<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  metadata?: Record<string, any>;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  status: number;
  timestamp: string;
  requestId?: string;
}

/**
 * Rate Limiting Information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds
}

/**
 * Cache Metadata
 */
export interface CacheMetadata {
  cached: boolean;
  cacheKey?: string;
  cacheHit?: boolean;
  ttl?: number; // Time to live in seconds
  lastUpdated?: string;
}

/**
 * API Request Options
 */
export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  cache?: boolean;
  cacheTTL?: number;
}

/**
 * Batch API Request
 */
export interface BatchApiRequest {
  requests: Array<{
    id: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, any>;
    body?: any;
  }>;
  options?: ApiRequestOptions;
}

/**
 * Batch API Response
 */
export interface BatchApiResponse {
  responses: Array<{
    id: string;
    status: number;
    data?: any;
    error?: ApiErrorResponse;
  }>;
  metadata: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    processingTime: number;
  };
}

/**
 * API Health Check Response
 */
export interface ApiHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    lastCheck: string;
    error?: string;
  }>;
  version: string;
  uptime: number; // seconds
}

/**
 * API Usage Statistics
 */
export interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    averageResponseTime: number;
  }>;
  timeRange: {
    start: string;
    end: string;
  };
}
