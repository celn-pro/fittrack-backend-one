// GraphQL Resolvers for Health Tips
import { HealthTipsService } from '../../services/HealthTipsService';
import { CacheService } from '../../services/CacheService';
import { HealthTipCategory, HealthTipFilter } from '../../types/healthTips.types';

// Initialize services
const cacheService = new CacheService();
const healthTipsService = new HealthTipsService(cacheService);

export const healthTipsResolvers = {
  Query: {
    /**
     * Get daily health tips (4 tips with category diversity)
     */
    getDailyHealthTips: async (_: any, { date }: { date?: string }) => {
      try {
        console.log(`🌟 Getting daily health tips for date: ${date || 'today'}`);
        
        const dailyTips = await healthTipsService.getDailyHealthTips(date);

        console.log(`✅ Retrieved ${dailyTips.totalTips} daily health tips covering categories: ${dailyTips.categories.join(', ')}`);
        console.log('🌟 Final Daily Health Tips being sent to frontend:', JSON.stringify(dailyTips, null, 2));

        return dailyTips;
      } catch (error) {
        console.error('Error getting daily health tips:', error);
        throw new Error(`Failed to get daily health tips: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get health tips with filtering options
     */
    getHealthTips: async (_: any, { filter }: { filter?: HealthTipFilter }) => {
      try {
        console.log('🔍 Getting health tips with filter:', filter);
        
        const tips = await healthTipsService.getHealthTips(filter || {});

        console.log(`✅ Retrieved ${tips.length} health tips`);
        console.log('🔍 Filtered Health Tips being sent to frontend:', JSON.stringify(tips, null, 2));

        return tips;
      } catch (error) {
        console.error('Error getting health tips:', error);
        throw new Error(`Failed to get health tips: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get tips by specific category
     */
    getHealthTipsByCategory: async (_: any, { category, limit }: { category: HealthTipCategory; limit?: number }) => {
      try {
        console.log(`🎯 Getting health tips for category: ${category}, limit: ${limit || 5}`);
        
        const tips = await healthTipsService.getTipsByCategory(category, limit);

        console.log(`✅ Retrieved ${tips.length} tips for category: ${category}`);
        console.log(`🎯 Category Health Tips (${category}) being sent to frontend:`, JSON.stringify(tips, null, 2));

        return tips;
      } catch (error) {
        console.error('Error getting health tips by category:', error);
        throw new Error(`Failed to get health tips by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Search health tips by keyword
     */
    searchHealthTips: async (_: any, { query, limit }: { query: string; limit?: number }) => {
      try {
        console.log(`🔎 Searching health tips for query: "${query}", limit: ${limit || 10}`);
        
        const tips = await healthTipsService.searchHealthTips(query, limit);

        console.log(`✅ Found ${tips.length} health tips matching query: "${query}"`);
        console.log(`🔎 Search Health Tips ("${query}") being sent to frontend:`, JSON.stringify(tips, null, 2));

        return tips;
      } catch (error) {
        console.error('Error searching health tips:', error);
        throw new Error(`Failed to search health tips: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get available categories
     */
    getHealthTipCategories: async () => {
      try {
        console.log('📋 Getting available health tip categories');
        
        const categories = healthTipsService.getAvailableCategories();
        
        console.log(`✅ Retrieved ${categories.length} health tip categories`);
        
        return categories;
      } catch (error) {
        console.error('Error getting health tip categories:', error);
        throw new Error(`Failed to get health tip categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get health tips statistics
     */
    getHealthTipsStatistics: async () => {
      try {
        console.log('📊 Getting health tips statistics');
        
        const stats = healthTipsService.getStatistics();
        
        console.log(`✅ Retrieved statistics: ${stats.totalTips} total tips across ${stats.categoriesCount} categories`);
        
        return stats;
      } catch (error) {
        console.error('Error getting health tips statistics:', error);
        throw new Error(`Failed to get health tips statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  // Enum resolvers to ensure proper mapping
  HealthTipCategory: {
    FITNESS: 'fitness',
    NUTRITION: 'nutrition',
    MENTAL_HEALTH: 'mental_health',
    SLEEP: 'sleep',
    HYDRATION: 'hydration',
    GENERAL_WELLNESS: 'general_wellness',
    INJURY_PREVENTION: 'injury_prevention',
    RECOVERY: 'recovery'
  },

  HealthTipDifficulty: {
    EASY: 'easy',
    MODERATE: 'moderate',
    ADVANCED: 'advanced'
  }
};
