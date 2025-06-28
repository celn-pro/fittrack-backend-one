// ExerciseDB integration service
import { BaseApiService, ApiResponse } from './BaseApiService';
import { API_CONFIG } from '../../config/apiConfig';
import { ExerciseDBResponse, ExerciseDBPaginatedResponse } from '../../types/api.types';
import { CacheService } from '../CacheService';

export class ExerciseApiService extends BaseApiService {
  private cacheService: CacheService;

  constructor(cacheService?: CacheService) {
    super(
      API_CONFIG.EXERCISE_DB.BASE_URL,
      API_CONFIG.EXERCISE_DB.HEADERS,
      API_CONFIG.EXERCISE_DB.RATE_LIMIT
    );
    this.cacheService = cacheService || new CacheService();
  }

  /**
   * Get all exercises with caching and pagination
   */
  async getAllExercises(limit?: number, offset?: number): Promise<ApiResponse<ExerciseDBResponse[]>> {
    const cacheKey = `exercises:all:${limit || 10}:${offset || 0}`;

    // Try cache first
    const cached = await this.cacheService.get<ExerciseDBResponse[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    const params: Record<string, string> = {};
    if (limit) params.limit = limit.toString();
    if (offset) params.offset = offset.toString();

    const response = await this.makeRequest<ExerciseDBPaginatedResponse>(
      API_CONFIG.EXERCISE_DB.ENDPOINTS.EXERCISES,
      { params }
    );

    // Extract exercises from the paginated response
    const exercises = response.data.success ? response.data.data.exercises : [];

    // Cache the exercises
    await this.cacheService.set(cacheKey, exercises, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: exercises,
      status: response.status,
      headers: response.headers,
      cached: false
    };
  }

  /**
   * Get exercises by body part with caching (using search functionality)
   */
  async getExercisesByBodyPart(bodyPart: string, limit?: number): Promise<ApiResponse<ExerciseDBResponse[]>> {
    const cacheKey = `exercises:bodyPart:${bodyPart}:${limit || 10}`;

    const cached = await this.cacheService.get<ExerciseDBResponse[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    // Use search functionality to filter by body part
    const params: Record<string, string> = {
      search: bodyPart
    };
    if (limit) params.limit = limit.toString();

    const response = await this.makeRequest<ExerciseDBPaginatedResponse>(
      API_CONFIG.EXERCISE_DB.ENDPOINTS.EXERCISES,
      { params }
    );

    // Extract exercises and filter by body part
    const allExercises = response.data.success ? response.data.data.exercises : [];
    const filteredExercises = allExercises.filter(exercise =>
      exercise.bodyParts.some(part =>
        part.toLowerCase().includes(bodyPart.toLowerCase())
      )
    );

    await this.cacheService.set(cacheKey, filteredExercises, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: filteredExercises,
      status: response.status,
      headers: response.headers,
      cached: false
    };
  }

  /**
   * Get exercises by target muscle with caching (using search functionality)
   */
  async getExercisesByTarget(target: string, limit?: number): Promise<ApiResponse<ExerciseDBResponse[]>> {
    const cacheKey = `exercises:target:${target}:${limit || 10}`;

    const cached = await this.cacheService.get<ExerciseDBResponse[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    // Use search functionality to filter by target muscle
    const params: Record<string, string> = {
      search: target
    };
    if (limit) params.limit = limit.toString();

    const response = await this.makeRequest<ExerciseDBPaginatedResponse>(
      API_CONFIG.EXERCISE_DB.ENDPOINTS.EXERCISES,
      { params }
    );

    // Extract exercises and filter by target muscle
    const allExercises = response.data.success ? response.data.data.exercises : [];
    const filteredExercises = allExercises.filter(exercise =>
      exercise.targetMuscles.some(muscle =>
        muscle.toLowerCase().includes(target.toLowerCase())
      ) || exercise.secondaryMuscles.some(muscle =>
        muscle.toLowerCase().includes(target.toLowerCase())
      )
    );

    await this.cacheService.set(cacheKey, filteredExercises, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: filteredExercises,
      status: response.status,
      headers: response.headers,
      cached: false
    };
  }

  /**
   * Get exercises by equipment with caching (using search functionality)
   */
  async getExercisesByEquipment(equipment: string, limit?: number): Promise<ApiResponse<ExerciseDBResponse[]>> {
    const cacheKey = `exercises:equipment:${equipment}:${limit || 10}`;

    const cached = await this.cacheService.get<ExerciseDBResponse[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    // Use search functionality to filter by equipment
    const params: Record<string, string> = {
      search: equipment
    };
    if (limit) params.limit = limit.toString();

    const response = await this.makeRequest<ExerciseDBPaginatedResponse>(
      API_CONFIG.EXERCISE_DB.ENDPOINTS.EXERCISES,
      { params }
    );

    // Extract exercises and filter by equipment
    const allExercises = response.data.success ? response.data.data.exercises : [];
    const filteredExercises = allExercises.filter(exercise =>
      exercise.equipments.some(equip =>
        equip.toLowerCase().includes(equipment.toLowerCase())
      )
    );

    await this.cacheService.set(cacheKey, filteredExercises, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: filteredExercises,
      status: response.status,
      headers: response.headers,
      cached: false
    };
  }

  /**
   * Get list of available body parts with caching (extracted from exercises)
   */
  async getBodyPartList(): Promise<ApiResponse<string[]>> {
    const cacheKey = 'exercises:bodyPartList';

    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    // Get all exercises to extract body parts
    const exercisesResponse = await this.getAllExercises(100); // Get a good sample
    const bodyParts = new Set<string>();

    exercisesResponse.data.forEach(exercise => {
      exercise.bodyParts.forEach(part => bodyParts.add(part));
    });

    const bodyPartList = Array.from(bodyParts).sort();
    await this.cacheService.set(cacheKey, bodyPartList, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: bodyPartList,
      status: 200,
      headers: {},
      cached: false
    };
  }

  /**
   * Get list of available target muscles with caching (extracted from exercises)
   */
  async getTargetList(): Promise<ApiResponse<string[]>> {
    const cacheKey = 'exercises:targetList';

    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    // Get all exercises to extract target muscles
    const exercisesResponse = await this.getAllExercises(100); // Get a good sample
    const targetMuscles = new Set<string>();

    exercisesResponse.data.forEach(exercise => {
      exercise.targetMuscles.forEach(muscle => targetMuscles.add(muscle));
      exercise.secondaryMuscles.forEach(muscle => targetMuscles.add(muscle));
    });

    const targetList = Array.from(targetMuscles).sort();
    await this.cacheService.set(cacheKey, targetList, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: targetList,
      status: 200,
      headers: {},
      cached: false
    };
  }

  /**
   * Get list of available equipment with caching (extracted from exercises)
   */
  async getEquipmentList(): Promise<ApiResponse<string[]>> {
    const cacheKey = 'exercises:equipmentList';

    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    // Get all exercises to extract equipment
    const exercisesResponse = await this.getAllExercises(100); // Get a good sample
    const equipment = new Set<string>();

    exercisesResponse.data.forEach(exercise => {
      exercise.equipments.forEach(equip => equipment.add(equip));
    });

    const equipmentList = Array.from(equipment).sort();
    await this.cacheService.set(cacheKey, equipmentList, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: equipmentList,
      status: 200,
      headers: {},
      cached: false
    };
  }

  /**
   * Get a specific exercise by ID with caching
   */
  async getExerciseById(id: string): Promise<ApiResponse<ExerciseDBResponse>> {
    const cacheKey = `exercises:id:${id}`;

    const cached = await this.cacheService.get<ExerciseDBResponse>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    // The new API structure for single exercise
    const response = await this.makeRequest<{ success: boolean; data: ExerciseDBResponse }>(
      `${API_CONFIG.EXERCISE_DB.ENDPOINTS.EXERCISES}/${id}`
    );

    const exercise = response.data.success ? response.data.data : null;
    if (!exercise) {
      throw new Error(`Exercise with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, exercise, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: exercise,
      status: response.status,
      headers: response.headers,
      cached: false
    };
  }

  /**
   * Health check for ExerciseDB API
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const startTime = Date.now();
      const response = await this.getAllExercises(1); // Just get 1 exercise to test
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        details: {
          responseTime,
          cached: response.cached,
          exerciseCount: response.data.length,
          rateLimiter: this.getRateLimiterStatus(),
          apiUrl: API_CONFIG.EXERCISE_DB.BASE_URL
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          rateLimiter: this.getRateLimiterStatus(),
          apiUrl: API_CONFIG.EXERCISE_DB.BASE_URL
        }
      };
    }
  }

  /**
   * Search exercises with autocomplete functionality
   */
  async searchExercises(query: string, limit?: number): Promise<ApiResponse<ExerciseDBResponse[]>> {
    const cacheKey = `exercises:search:${query}:${limit || 10}`;

    const cached = await this.cacheService.get<ExerciseDBResponse[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    const params: Record<string, string> = {
      search: query
    };
    if (limit) params.limit = limit.toString();

    const response = await this.makeRequest<ExerciseDBPaginatedResponse>(
      API_CONFIG.EXERCISE_DB.ENDPOINTS.EXERCISES,
      { params }
    );

    const exercises = response.data.success ? response.data.data.exercises : [];
    await this.cacheService.set(cacheKey, exercises, API_CONFIG.CACHE.TTL.EXERCISES);

    return {
      data: exercises,
      status: response.status,
      headers: response.headers,
      cached: false
    };
  }
}
