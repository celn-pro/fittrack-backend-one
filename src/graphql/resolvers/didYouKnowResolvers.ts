// GraphQL Resolvers for Did You Know Facts
import { DidYouKnowService } from '../../services/DidYouKnowService';
import { CacheService } from '../../services/CacheService';
import { FactCategory, DidYouKnowFilter } from '../../types/didYouKnow.types';

// Initialize services
const cacheService = new CacheService();
const didYouKnowService = new DidYouKnowService(cacheService);

export const didYouKnowResolvers = {
  Query: {
    /**
     * Get daily did you know facts (mix of curated and API facts)
     */
    getDailyDidYouKnowFacts: async (_: any, { date, count }: { date?: string; count?: number }) => {
      try {
        console.log(`🧠 Getting daily did you know facts for date: ${date || 'today'}, count: ${count || 3}`);
        
        const dailyFacts = await didYouKnowService.getDailyDidYouKnowFacts(date, count);

        return dailyFacts;
      } catch (error) {
        console.error('Error getting daily did you know facts:', error);
        throw new Error(`Failed to get daily did you know facts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get did you know facts with filtering options
     */
    getDidYouKnowFacts: async (_: any, { filter }: { filter?: DidYouKnowFilter }) => {
      try {
        console.log('🔍 Getting did you know facts with filter:', filter);
        
        const facts = await didYouKnowService.getDidYouKnowFacts(filter || {});

        return facts;
      } catch (error) {
        console.error('Error getting did you know facts:', error);
        throw new Error(`Failed to get did you know facts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get facts by specific category
     */
    getDidYouKnowFactsByCategory: async (_: any, { category, limit }: { category: FactCategory; limit?: number }) => {
      try {
        console.log(`🎯 Getting did you know facts for category: ${category}, limit: ${limit || 10}`);
        
        const facts = await didYouKnowService.getDidYouKnowFacts({ category, limit });

        return facts;
      } catch (error) {
        console.error('Error getting did you know facts by category:', error);
        throw new Error(`Failed to get did you know facts by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Search did you know facts by keyword
     */
    searchDidYouKnowFacts: async (_: any, { query, limit }: { query: string; limit?: number }) => {
      try {
        console.log(`🔎 Searching did you know facts for query: "${query}", limit: ${limit || 10}`);
        
        const facts = await didYouKnowService.searchDidYouKnowFacts(query, limit);

        return facts;
      } catch (error) {
        console.error('Error searching did you know facts:', error);
        throw new Error(`Failed to search did you know facts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get available categories
     */
    getDidYouKnowCategories: async () => {
      try {
        console.log('📋 Getting available did you know fact categories');
        
        const categories = didYouKnowService.getAvailableCategories();
        
        console.log(`✅ Retrieved ${categories.length} did you know fact categories`);
        
        return categories;
      } catch (error) {
        console.error('Error getting did you know fact categories:', error);
        throw new Error(`Failed to get did you know fact categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get did you know facts statistics
     */
    getDidYouKnowStatistics: async () => {
      try {
        console.log('📊 Getting did you know facts statistics');
        
        const stats = didYouKnowService.getStatistics();
        
        console.log(`✅ Retrieved statistics: ${stats.totalFacts} total facts across ${stats.categoriesCount} categories`);
        
        return stats;
      } catch (error) {
        console.error('Error getting did you know facts statistics:', error);
        throw new Error(`Failed to get did you know facts statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  // Enum resolvers to ensure proper mapping
  FactCategory: {
    SCIENCE: 'science',
    HISTORY: 'history',
    NATURE: 'nature',
    TECHNOLOGY: 'technology',
    HEALTH: 'health',
    SPACE: 'space',
    ANIMALS: 'animals',
    FOOD: 'food',
    SPORTS: 'sports',
    GENERAL: 'general',
    NUMBERS: 'numbers',
    HUMAN_BODY: 'human_body'
  },

  FactSource: {
    CURATED: 'curated',
    NUMBERS_API: 'numbers_api',
    CAT_FACTS_API: 'cat_facts_api',
    USELESS_FACTS_API: 'useless_facts_api',
    EXTERNAL_API: 'external_api'
  },

  FactDifficulty: {
    EASY: 'easy',
    MODERATE: 'moderate',
    ADVANCED: 'advanced'
  }
};
