// Main orchestrator for all recommendation engines
import { WorkoutEngine } from './recommendation-engines/WorkoutEngine';
import { NutritionEngine } from './recommendation-engines/NutritionEngine';
import { HydrationEngine } from './recommendation-engines/HydrationEngine';
import { SleepEngine } from './recommendation-engines/SleepEngine';
import { CacheService } from './CacheService';
import { EnhancedRecommendation } from '../utils/transformers/exerciseTransformer';
import { API_CONFIG } from '../config/apiConfig';

export interface IUser {
  id?: string;
  email: string;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  fitnessGoal?: string;
  dietaryPreference?: string;
  healthConditions?: string[];
  activityLevel?: string;
  preferredWorkoutTypes?: string[];
  dietaryRestrictions?: string[];
  bmi?: number;
  role?: 'user' | 'admin';
  isProfileComplete: boolean;
}

export class RecommendationService {
  private workoutEngine: WorkoutEngine;
  private nutritionEngine: NutritionEngine;
  private hydrationEngine: HydrationEngine;
  private sleepEngine: SleepEngine;
  private cacheService: CacheService;

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService();
    this.workoutEngine = new WorkoutEngine(this.cacheService);
    this.nutritionEngine = new NutritionEngine();
    this.hydrationEngine = new HydrationEngine();
    this.sleepEngine = new SleepEngine();
  }

  /**
   * Generate personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    user: IUser,
    filter?: any
  ): Promise<EnhancedRecommendation[]> {
    try {
      // Validate user profile
      this.validateUserProfile(user);

      // Check cache first
      const cacheKey = this.generateCacheKey(user, filter);
      const cachedRecommendations = await this.cacheService.get<EnhancedRecommendation[]>(cacheKey);

      if (cachedRecommendations) {
        return cachedRecommendations;
      }

      // Determine which recommendation types to generate
      const typesToGenerate = filter?.category ? [filter.category] : ['workout', 'nutrition', 'hydration', 'rest'];

      const recommendations: EnhancedRecommendation[] = [];
      const errors: string[] = [];

      // Generate recommendations sequentially to avoid API rate limits
      for (const type of typesToGenerate) {
        try {
          let recommendation: EnhancedRecommendation;

          switch (type) {
            case 'workout':
              recommendation = await this.workoutEngine.generateWorkoutRecommendation(user);
              break;
            case 'nutrition':
              recommendation = await this.nutritionEngine.generateNutritionRecommendation(user);
              break;
            case 'hydration':
              recommendation = await this.hydrationEngine.generateHydrationRecommendation(user);
              break;
            case 'rest':
            case 'sleep':
              recommendation = await this.sleepEngine.generateSleepRecommendation(user);
              break;
            default:
              console.warn(`Unknown recommendation type: ${type}`);
              continue;
          }

          // Apply filters if provided
          if (this.passesFilter(recommendation, filter)) {
            recommendations.push(recommendation);
          }
        } catch (error) {
          const errorMessage = `Failed to generate ${type} recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMessage);
          console.error(errorMessage, error);
        }
      }

      // Log errors but don't fail the entire request
      if (errors.length > 0) {
        console.warn('Some recommendation generation errors occurred:', errors);
      }

      // Ensure we have at least one recommendation
      if (recommendations.length === 0) {
        throw new Error('Failed to generate any recommendations. Please check your profile and try again.');
      }

      // Cache successful recommendations
      await this.cacheService.set(cacheKey, recommendations, API_CONFIG.CACHE.TTL.RECOMMENDATIONS);

      return recommendations;
    } catch (error) {
      console.error('Error in getPersonalizedRecommendations:', error);
      throw error;
    }
  }

  /**
   * Get a specific recommendation by ID
   */
  async getRecommendationById(id: string, userId: string): Promise<EnhancedRecommendation | null> {
    try {
      // In a real implementation, this would query the database
      // For now, we'll check the cache
      const cacheKey = `recommendation:${id}:${userId}`;
      const recommendation = await this.cacheService.get<EnhancedRecommendation>(cacheKey);

      if (!recommendation) {
        throw new Error('Recommendation not found');
      }

      return recommendation;
    } catch (error) {
      console.error('Error getting recommendation by ID:', error);
      return null;
    }
  }

  /**
   * Refresh recommendations for a user (clear cache and regenerate)
   */
  async refreshRecommendations(
    user: IUser,
    categories?: string[]
  ): Promise<EnhancedRecommendation[]> {
    try {
      // Clear cache for this user
      await this.invalidateUserCache(user.id || user.email);

      // Generate fresh recommendations
      const filter = categories ? { category: categories[0] } : undefined;
      return await this.getPersonalizedRecommendations(user, filter);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      throw error;
    }
  }

  /**
   * Rate a recommendation
   */
  async rateRecommendation(id: string, userId: string, rating: number): Promise<void> {
    try {
      // In a real implementation, this would update the database
      // For now, we'll just log it
      console.log(`User ${userId} rated recommendation ${id} with ${rating} stars`);

      // You could also update analytics here
      // await this.analyticsService.recordRating(id, userId, rating);
    } catch (error) {
      console.error('Error rating recommendation:', error);
      throw error;
    }
  }

  /**
   * Mark a recommendation as completed
   */
  async completeRecommendation(id: string, userId: string, feedback?: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`User ${userId} completed recommendation ${id}${feedback ? ` with feedback: ${feedback}` : ''}`);

      // You could also update user progress here
      // await this.progressService.recordCompletion(id, userId, feedback);
    } catch (error) {
      console.error('Error completing recommendation:', error);
      throw error;
    }
  }

  /**
   * Update user preferences and regenerate recommendations
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserProfile>,
    regenerateTypes?: string[]
  ): Promise<Recommendation[]> {
    // Invalidate cache for this user
    await this.cacheService.invalidateUserCache(userId);

    // Get current user profile (this would typically come from your database)
    // For now, we'll assume the preferences contain the full updated profile
    const updatedProfile = preferences as UserProfile;

    return this.generateRecommendations(updatedProfile, regenerateTypes);
  }

  /**
   * Get recommendation history for a user
   */
  async getRecommendationHistory(
    userId: string,
    type?: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    // This would typically query your database
    // For now, we'll return cached recommendations
    const cachePattern = `recommendations:${userId}:*`;
    
    if (type) {
      const cacheKey = `recommendations:${userId}:${type}`;
      const recommendation = await this.cacheService.get<Recommendation>(cacheKey);
      return recommendation ? [recommendation] : [];
    }

    // This is a simplified implementation
    // In a real application, you'd query your database for historical recommendations
    return [];
  }

  /**
   * Refresh recommendations for a user
   */
  async refreshRecommendations(
    userProfile: UserProfile,
    types?: string[]
  ): Promise<Recommendation[]> {
    // Clear cache for this user
    await this.cacheService.invalidateUserCache(userProfile.userId);

    // Generate fresh recommendations
    return this.generateRecommendations(userProfile, types);
  }

  /**
   * Get recommendation analytics/insights
   */
  async getRecommendationInsights(userId: string): Promise<{
    totalRecommendations: number;
    lastGenerated: Date | null;
    mostRequestedType: string | null;
    averageRating: number | null;
  }> {
    // This would typically query your database for analytics
    // For now, return basic structure
    return {
      totalRecommendations: 0,
      lastGenerated: null,
      mostRequestedType: null,
      averageRating: null
    };
  }

  /**
   * Validate user profile for recommendation generation
   */
  private validateUserProfile(user: IUser): void {
    if (!user.isProfileComplete) {
      throw new Error('Please complete your profile to get personalized recommendations');
    }

    if (!user.age || user.age < 13 || user.age > 120) {
      throw new Error('Invalid age: must be between 13 and 120');
    }

    if (!user.weight || user.weight < 30 || user.weight > 300) {
      throw new Error('Invalid weight: must be between 30 and 300 kg');
    }

    if (!user.height || user.height < 100 || user.height > 250) {
      throw new Error('Invalid height: must be between 100 and 250 cm');
    }
  }

  /**
   * Check if recommendation passes the provided filter
   */
  private passesFilter(recommendation: EnhancedRecommendation, filter?: any): boolean {
    if (!filter) return true;

    // Category filter
    if (filter.category && recommendation.category !== filter.category) {
      return false;
    }

    // Difficulty filter
    if (filter.difficultyLevel && recommendation.difficultyLevel !== filter.difficultyLevel) {
      return false;
    }

    // Duration filter
    if (filter.maxDuration && recommendation.estimatedDuration && recommendation.estimatedDuration > filter.maxDuration) {
      return false;
    }

    return true;
  }

  /**
   * Generate cache key for user recommendations
   */
  private generateCacheKey(user: IUser, filter?: any): string {
    const userId = user.id || user.email;
    const filterString = filter ? JSON.stringify(filter) : 'all';
    const profileHash = this.hashUserProfile(user);
    return `recommendations:${userId}:${filterString}:${profileHash}`;
  }

  /**
   * Generate hash of user profile for cache key
   */
  private hashUserProfile(user: IUser): string {
    const keyAttributes = {
      age: user.age,
      weight: user.weight,
      height: user.height,
      gender: user.gender,
      fitnessGoal: user.fitnessGoal,
      activityLevel: user.activityLevel,
      healthConditions: user.healthConditions?.sort(),
      dietaryRestrictions: user.dietaryRestrictions?.sort()
    };

    return Buffer.from(JSON.stringify(keyAttributes)).toString('base64').slice(0, 16);
  }

  /**
   * Invalidate cache for a specific user
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    try {
      await this.cacheService.invalidateUserCache(userId);
      console.log(`Cache invalidated for user ${userId}`);
    } catch (error) {
      console.error('Error invalidating user cache:', error);
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, any>;
  }> {
    try {
      const workoutHealth = await this.workoutEngine.healthCheck();
      const cacheStats = this.cacheService.getStats();

      const allHealthy = workoutHealth.status === 'healthy';

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        services: {
          workoutEngine: workoutHealth,
          cache: cacheStats,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}
