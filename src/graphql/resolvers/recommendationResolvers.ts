import { RecommendationService } from '../../services/RecommendationService';
import { ExerciseApiService } from '../../services/external-apis/ExerciseApiService';
import { bmrCalculator } from '../../utils/calculators/bmrCalculator';
import { CacheService } from '../../services/CacheService';

// Initialize services
const cacheService = new CacheService();
const recommendationService = new RecommendationService(cacheService);
const exerciseApiService = new ExerciseApiService(cacheService);

export const recommendationResolvers = {
  Query: {
    getRecommendations: async (_: any, { filter }: { filter?: any }, { user, isAuthenticated }: { user?: any; isAuthenticated: boolean }) => {
      try {
        // Use authenticated user data or default demo user data
        const userData = isAuthenticated && user ? {
          id: user._id || user.id,
          email: user.email,
          age: user.getAge ? user.getAge() : (user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 25),
          weight: user.weight || 70,
          height: user.height || 175,
          gender: user.gender || 'other',
          fitnessGoal: user.fitnessGoals?.[0] || 'Maintain Health',
          activityLevel: user.activityLevel || 'moderate',
          healthConditions: user.healthConditions || [],
          dietaryPreference: user.dietaryPreferences || 'none',
          dietaryRestrictions: user.dietaryRestrictions || [],
          preferredWorkoutTypes: user.preferredWorkoutTypes || ['strength', 'cardio'],
          bmi: user.getBMI ? user.getBMI() : (user.weight && user.height ? Math.round((user.weight / Math.pow(user.height / 100, 2)) * 10) / 10 : 22.9),
          isProfileComplete: user.isProfileComplete || false
        } : {
          // Default demo user for anonymous requests
          id: 'demo-user',
          email: 'demo@example.com',
          age: 25,
          weight: 70,
          height: 175,
          gender: 'other',
          fitnessGoal: 'Maintain Health',
          activityLevel: 'moderate',
          healthConditions: [],
          dietaryPreference: 'none',
          dietaryRestrictions: [],
          preferredWorkoutTypes: ['strength', 'cardio'],
          bmi: 22.9,
          isProfileComplete: true
        };

        // Generate recommendations
        const recommendations = await recommendationService.getPersonalizedRecommendations(userData, filter);

        return recommendations;
      } catch (error) {
        console.error('Error getting recommendations:', error);
        throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    getRecommendation: async (_: any, { id }: { id: string }, { user, isAuthenticated }: { user?: any; isAuthenticated: boolean }) => {
      try {
        // Use authenticated user ID or demo user ID for anonymous requests
        const userId = isAuthenticated && user ? (user._id || user.id) : 'demo-user';
        const recommendation = await recommendationService.getRecommendationById(id, userId);
        return recommendation;
      } catch (error) {
        console.error('Error getting recommendation:', error);
        throw new Error(`Failed to get recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    getUserMetrics: async (_: any, __: any, { user }: { user?: any }) => {
      try {
        // Use provided user data or demo user data for anonymous requests
        const userData = user ? {
          age: user.age,
          weight: user.weight,
          height: user.height,
          gender: user.gender,
          activityLevel: user.activityLevel,
          fitnessGoal: user.fitnessGoal
        } : {
          // Default demo user metrics
          age: 25,
          weight: 70,
          height: 175,
          gender: 'other',
          activityLevel: 'moderate',
          fitnessGoal: 'general_fitness'
        };

        const physicalStats = {
          weight: userData.weight,
          height: userData.height,
          age: userData.age,
          gender: userData.gender || 'other'
        };

        const metrics = bmrCalculator.calculateUserMetrics(
          physicalStats,
          userData.activityLevel || 'moderate',
          userData.fitnessGoal || 'general_fitness'
        );

        return metrics;
      } catch (error) {
        console.error('Error calculating user metrics:', error);
        throw new Error(`Failed to calculate metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    getApiHealth: async () => {
      try {
        const exerciseApiHealth = await exerciseApiService.healthCheck();
        const cacheStats = cacheService.getStats();

        return {
          status: exerciseApiHealth.status,
          exerciseDB: {
            configured: true, // exercisedb.dev doesn't require API keys
            apiUrl: process.env.EXERCISEDB_BASE_URL || 'https://exercisedb.dev/api/v1',
            rateLimiter: exerciseApiHealth.details.rateLimiter,
            lastCheck: new Date().toISOString()
          },
          cache: {
            totalEntries: cacheStats.totalEntries,
            totalSize: cacheStats.totalSize,
            hitRate: cacheStats.hitRate,
            missRate: cacheStats.missRate
          },
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error getting API health:', error);
        return {
          status: 'unhealthy',
          exerciseDB: {
            configured: false,
            rateLimiter: {
              requestsThisMinute: 0,
              requestsToday: 0,
              minuteLimit: 0,
              dailyLimit: 0
            },
            lastCheck: new Date().toISOString()
          },
          cache: {
            totalEntries: 0,
            totalSize: 0,
            hitRate: 0,
            missRate: 0
          },
          timestamp: new Date().toISOString()
        };
      }
    },

    getBodyParts: async () => {
      try {
        const response = await exerciseApiService.getBodyPartList();
        return response.data;
      } catch (error) {
        console.error('Error getting body parts:', error);
        // Return default body parts if API fails
        return ['chest', 'back', 'shoulders', 'upper arms', 'upper legs', 'lower legs', 'waist', 'cardio'];
      }
    },

    getEquipmentTypes: async () => {
      try {
        const response = await exerciseApiService.getEquipmentList();
        return response.data;
      } catch (error) {
        console.error('Error getting equipment types:', error);
        // Return default equipment types if API fails
        return ['body weight', 'dumbbell', 'barbell', 'cable', 'machine', 'resistance band'];
      }
    }
  },

  Mutation: {
    refreshRecommendations: async (_: any, { categories }: { categories?: string[] }, { user }: { user?: any }) => {
      try {
        // Use provided user data or default demo user data for anonymous requests
        const userData = user ? {
          id: user.userId,
          email: user.email,
          age: user.age,
          weight: user.weight,
          height: user.height,
          gender: user.gender,
          fitnessGoal: user.fitnessGoal,
          activityLevel: user.activityLevel,
          healthConditions: user.healthConditions || [],
          dietaryPreference: user.dietaryPreference,
          dietaryRestrictions: user.dietaryRestrictions || [],
          preferredWorkoutTypes: user.preferredWorkoutTypes || [],
          bmi: user.bmi,
          isProfileComplete: user.isProfileComplete || false
        } : {
          // Default demo user for anonymous requests
          id: 'demo-user',
          email: 'demo@example.com',
          age: 25,
          weight: 70,
          height: 175,
          gender: 'other',
          fitnessGoal: 'Maintain Health',
          activityLevel: 'moderate',
          healthConditions: [],
          dietaryPreference: 'none',
          dietaryRestrictions: [],
          preferredWorkoutTypes: ['strength', 'cardio'],
          bmi: 22.9,
          isProfileComplete: true
        };

        const recommendations = await recommendationService.refreshRecommendations(userData, categories);
        return recommendations;
      } catch (error) {
        console.error('Error refreshing recommendations:', error);
        throw new Error(`Failed to refresh recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    rateRecommendation: async (_: any, { id, rating }: { id: string; rating: number }, { user }: { user?: any }) => {
      try {
        if (rating < 1 || rating > 5) {
          throw new Error('Rating must be between 1 and 5');
        }

        // Use provided user ID or demo user ID for anonymous requests
        const userId = user?.userId || 'demo-user';
        await recommendationService.rateRecommendation(id, userId, rating);
        return true;
      } catch (error) {
        console.error('Error rating recommendation:', error);
        throw new Error(`Failed to rate recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    completeRecommendation: async (_: any, { id, feedback }: { id: string; feedback?: string }, { user }: { user?: any }) => {
      try {
        // Use provided user ID or demo user ID for anonymous requests
        const userId = user?.userId || 'demo-user';
        await recommendationService.completeRecommendation(id, userId, feedback);
        return true;
      } catch (error) {
        console.error('Error completing recommendation:', error);
        throw new Error(`Failed to complete recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
};
