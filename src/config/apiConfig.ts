// API endpoints and keys configuration
export const API_CONFIG = {
  EXERCISE_DB: {
    BASE_URL: process.env.EXERCISEDB_BASE_URL || 'https://exercisedb.dev/api/v1',
    API_KEY: process.env.RAPIDAPI_KEY || '', // Not needed for exercisedb.dev but kept for compatibility
    ENDPOINTS: {
      EXERCISES: '/exercises',
      EXERCISES_BY_BODY_PART: '/exercises/bodyPart',
      EXERCISES_BY_TARGET: '/exercises/target',
      EXERCISES_BY_EQUIPMENT: '/exercises/equipment',
      BODY_PART_LIST: '/exercises/bodyParts',
      TARGET_LIST: '/exercises/targets',
      EQUIPMENT_LIST: '/exercises/equipments'
    },
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
      // No RapidAPI headers needed for exercisedb.dev
    },
    RATE_LIMIT: {
      requestsPerMinute: parseInt(process.env.EXERCISEDB_RATE_LIMIT_PER_MINUTE || '60'),
      requestsPerDay: parseInt(process.env.EXERCISEDB_RATE_LIMIT_PER_DAY || '5000')
    }
  },

  CACHE: {
    TTL: {
      EXERCISES: parseInt(process.env.CACHE_TTL_EXERCISES || '86400000'), // 24 hours in ms
      RECOMMENDATIONS: parseInt(process.env.CACHE_TTL_RECOMMENDATIONS || '7200000'), // 2 hours in ms
      USER_METRICS: parseInt(process.env.CACHE_TTL_USER_METRICS || '1800000') // 30 minutes in ms
    },
    MAX_SIZE: parseInt(process.env.CACHE_MAX_SIZE || '100') // Max number of cache entries
  },

  TIMEOUTS: {
    API_REQUEST: 10000, // 10 seconds
    CACHE_OPERATION: 1000 // 1 second
  }
};

// Environment validation
export const validateApiConfig = (): boolean => {
  // ExerciseDB.dev doesn't require API keys, so we just validate the configuration
  const baseUrl = API_CONFIG.EXERCISE_DB.BASE_URL;
  if (!baseUrl || !baseUrl.startsWith('http')) {
    console.error('Invalid ExerciseDB base URL configuration');
    return false;
  }

  // Validate rate limits are reasonable
  const rateLimit = API_CONFIG.EXERCISE_DB.RATE_LIMIT;
  if (rateLimit.requestsPerMinute <= 0 || rateLimit.requestsPerDay <= 0) {
    console.error('Invalid rate limit configuration');
    return false;
  }

  console.log('✅ ExerciseDB API configuration validated successfully');
  console.log(`📡 Using ExerciseDB API at: ${baseUrl}`);
  return true;
};

// Health check for API configuration
export const getApiHealthStatus = () => {
  return {
    exerciseDB: {
      configured: !!API_CONFIG.EXERCISE_DB.BASE_URL,
      baseUrl: API_CONFIG.EXERCISE_DB.BASE_URL,
      rateLimit: API_CONFIG.EXERCISE_DB.RATE_LIMIT,
      apiType: 'exercisedb.dev (no auth required)'
    },
    cache: {
      ttl: API_CONFIG.CACHE.TTL,
      maxSize: API_CONFIG.CACHE.MAX_SIZE
    },
    timeouts: API_CONFIG.TIMEOUTS
  };
};
