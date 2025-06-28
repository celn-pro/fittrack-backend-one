// Simplified Exercise Service - uses ExerciseDB exclusively for reliable exercise data
import { ExerciseApiService } from './external-apis/ExerciseApiService';
import { ApiResponse } from './external-apis/BaseApiService';
// import { ExerciseDBResponse } from '../types/api.types';
import { CacheService } from './CacheService';

export interface UnifiedExercise {
  id: string;
  name: string;
  gifUrl: string;
  instructions: string[];
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  source: 'exercisedb';
  hasWorkingImage: boolean;
}

export class UnifiedExerciseService {
  private exerciseDbService: ExerciseApiService;
  private cacheService: CacheService;

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService();
    this.exerciseDbService = new ExerciseApiService(this.cacheService);
  }

  /**
   * Get exercises from ExerciseDB with working images
   */
  async getExercises(
    bodyParts: string[],
    limit: number = 10
  ): Promise<ApiResponse<UnifiedExercise[]>> {
    const cacheKey = `unified:exercises:${bodyParts.join(',').toLowerCase()}:${limit}`;

    // Try cache first
    const cached = await this.cacheService.get<UnifiedExercise[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    try {
      console.log(`🔍 Fetching ${limit} exercises for body parts: ${bodyParts.join(', ')}`);
      const unifiedExercises = await this.getExerciseDbExercises(bodyParts, limit);

      // Cache the results
      await this.cacheService.set(cacheKey, unifiedExercises, 86400000); // 24 hours

      return {
        data: unifiedExercises.slice(0, limit),
        status: 200,
        headers: {},
        cached: false
      };
    } catch (error) {
      console.error('Error in exercise service:', error);
      throw error;
    }
  }



  /**
   * Get exercises from ExerciseDB with working images
   */
  private async getExerciseDbExercises(bodyParts: string[], limit: number): Promise<UnifiedExercise[]> {
    try {
      const unifiedExercises: UnifiedExercise[] = [];

      for (const bodyPart of bodyParts) {
        if (unifiedExercises.length >= limit) break;

        try {
          const response = await this.exerciseDbService.getExercisesByBodyPart(bodyPart, 10);

          for (const exercise of response.data) {
            if (unifiedExercises.length >= limit) break;

            const unifiedExercise: UnifiedExercise = {
              id: `exercisedb_${exercise.exerciseId}`,
              name: exercise.name,
              gifUrl: exercise.gifUrl, // ExerciseDB now uses working ucarecdn.com URLs
              instructions: exercise.instructions || [],
              targetMuscles: exercise.targetMuscles || [],
              bodyParts: exercise.bodyParts || [],
              equipments: exercise.equipments || [],
              secondaryMuscles: exercise.secondaryMuscles || [],
              source: 'exercisedb',
              hasWorkingImage: true // ExerciseDB images are now working
            };

            unifiedExercises.push(unifiedExercise);
          }
        } catch (error) {
          console.warn(`Failed to get ExerciseDB exercises for ${bodyPart}:`, error);
        }
      }

      console.log(`✅ Retrieved ${unifiedExercises.length} exercises from ExerciseDB`);
      return unifiedExercises;
    } catch (error) {
      console.warn('Failed to get exercises from ExerciseDB:', error);
      return [];
    }
  }

  /**
   * Health check for ExerciseDB API
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    exerciseDb: any;
  }> {
    try {
      const exerciseDbHealth = await this.exerciseDbService.healthCheck();

      return {
        status: exerciseDbHealth.status,
        exerciseDb: exerciseDbHealth
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        exerciseDb: { status: 'unhealthy', details: { error: 'Failed to check' } }
      };
    }
  }

  /**
   * Search exercises using ExerciseDB
   */
  async searchExercises(query: string, limit: number = 10): Promise<ApiResponse<UnifiedExercise[]>> {
    const cacheKey = `unified:search:${query}:${limit}`;

    const cached = await this.cacheService.get<UnifiedExercise[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        status: 200,
        headers: {},
        cached: true
      };
    }

    try {
      const exerciseDbResults = await this.exerciseDbService.searchExercises(query, limit);

      const unifiedExercises: UnifiedExercise[] = exerciseDbResults.data.map(exercise => ({
        id: `exercisedb_${exercise.exerciseId}`,
        name: exercise.name,
        gifUrl: exercise.gifUrl,
        instructions: exercise.instructions || [],
        targetMuscles: exercise.targetMuscles || [],
        bodyParts: exercise.bodyParts || [],
        equipments: exercise.equipments || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        source: 'exercisedb',
        hasWorkingImage: true
      }));

      await this.cacheService.set(cacheKey, unifiedExercises, 3600000); // 1 hour

      return {
        data: unifiedExercises,
        status: 200,
        headers: {},
        cached: false
      };
    } catch (error) {
      console.warn('Failed to search ExerciseDB:', error);
      return {
        data: [],
        status: 500,
        headers: {},
        cached: false
      };
    }
  }
}
