import { RecommendationService, IUser } from '../services/RecommendationService';
import { CacheService } from '../services/CacheService';

// Mock the external API service
jest.mock('../services/external-apis/ExerciseApiService');

describe('RecommendationService', () => {
  let recommendationService: RecommendationService;
  let cacheService: CacheService;
  let mockUser: IUser;

  beforeEach(() => {
    cacheService = new CacheService();
    recommendationService = new RecommendationService(cacheService);
    
    mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      age: 30,
      weight: 70,
      height: 175,
      gender: 'male',
      fitnessGoal: 'Lose Weight',
      activityLevel: 'Moderate',
      healthConditions: [],
      dietaryPreference: 'None',
      dietaryRestrictions: [],
      preferredWorkoutTypes: ['Strength', 'Cardio'],
      bmi: 22.9,
      isProfileComplete: true
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPersonalizedRecommendations', () => {
    it('should generate recommendations for a valid user', async () => {
      const recommendations = await recommendationService.getPersonalizedRecommendations(mockUser);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Check that we have different types of recommendations
      const categories = recommendations.map(r => r.category);
      expect(categories).toContain('workout');
      expect(categories).toContain('nutrition');
      expect(categories).toContain('hydration');
      expect(categories).toContain('rest');
    });

    it('should throw error for incomplete user profile', async () => {
      const incompleteUser = { ...mockUser, isProfileComplete: false };
      
      await expect(
        recommendationService.getPersonalizedRecommendations(incompleteUser)
      ).rejects.toThrow('Please complete your profile');
    });

    it('should throw error for invalid age', async () => {
      const invalidUser = { ...mockUser, age: 10 };
      
      await expect(
        recommendationService.getPersonalizedRecommendations(invalidUser)
      ).rejects.toThrow('Invalid age');
    });

    it('should filter recommendations by category', async () => {
      const filter = { category: 'workout' };
      const recommendations = await recommendationService.getPersonalizedRecommendations(mockUser, filter);
      
      expect(recommendations).toBeDefined();
      expect(recommendations.every(r => r.category === 'workout')).toBe(true);
    });

    it('should use cache for subsequent requests', async () => {
      // First request
      const recommendations1 = await recommendationService.getPersonalizedRecommendations(mockUser);
      
      // Second request should use cache
      const recommendations2 = await recommendationService.getPersonalizedRecommendations(mockUser);
      
      expect(recommendations1).toEqual(recommendations2);
    });
  });

  describe('refreshRecommendations', () => {
    it('should generate fresh recommendations', async () => {
      // Get initial recommendations
      const initial = await recommendationService.getPersonalizedRecommendations(mockUser);
      
      // Refresh recommendations
      const refreshed = await recommendationService.refreshRecommendations(mockUser);
      
      expect(refreshed).toBeDefined();
      expect(Array.isArray(refreshed)).toBe(true);
      expect(refreshed.length).toBeGreaterThan(0);
    });
  });

  describe('rateRecommendation', () => {
    it('should successfully rate a recommendation', async () => {
      await expect(
        recommendationService.rateRecommendation('test-rec-123', 'test-user-123', 5)
      ).resolves.not.toThrow();
    });
  });

  describe('completeRecommendation', () => {
    it('should successfully complete a recommendation', async () => {
      await expect(
        recommendationService.completeRecommendation('test-rec-123', 'test-user-123', 'Great workout!')
      ).resolves.not.toThrow();
    });
  });

  describe('getHealthStatus', () => {
    it('should return health status', async () => {
      const health = await recommendationService.getHealthStatus();
      
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.services).toBeDefined();
    });
  });
});

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  describe('set and get', () => {
    it('should store and retrieve data', async () => {
      const testData = { message: 'Hello, World!' };
      const key = 'test-key';
      
      await cacheService.set(key, testData, 1000);
      const retrieved = await cacheService.get(key);
      
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent key', async () => {
      const retrieved = await cacheService.get('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should return null for expired data', async () => {
      const testData = { message: 'Hello, World!' };
      const key = 'test-key';
      
      await cacheService.set(key, testData, 1); // 1ms TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired data', async () => {
      const testData = { message: 'Hello, World!' };
      const key = 'test-key';
      
      await cacheService.set(key, testData, 1000);
      const exists = await cacheService.has(key);
      
      expect(exists).toBe(true);
    });

    it('should return false for expired data', async () => {
      const testData = { message: 'Hello, World!' };
      const key = 'test-key';
      
      await cacheService.set(key, testData, 1); // 1ms TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const exists = await cacheService.has(key);
      expect(exists).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing data', async () => {
      const testData = { message: 'Hello, World!' };
      const key = 'test-key';
      
      await cacheService.set(key, testData, 1000);
      const deleted = await cacheService.delete(key);
      
      expect(deleted).toBe(true);
      
      const retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent key', async () => {
      const deleted = await cacheService.delete('non-existent-key');
      expect(deleted).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      await cacheService.set('key1', 'data1', 1000);
      await cacheService.set('key2', 'data2', 1000);
      
      const stats = cacheService.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalEntries).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.missRate).toBe('number');
    });
  });
});
