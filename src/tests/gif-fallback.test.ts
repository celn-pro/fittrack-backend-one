import { GifFallbackService } from '../services/external-apis/GifFallbackService';
import { CacheService } from '../services/CacheService';

describe('GIF Fallback Service', () => {
  let gifFallbackService: GifFallbackService;
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    gifFallbackService = new GifFallbackService(cacheService);
  });

  describe('searchExerciseGifs', () => {
    it('should search for exercise GIFs using exercise name and body parts', async () => {
      // Test with a common exercise
      const result = await gifFallbackService.searchExerciseGifs(
        'push up',
        ['chest', 'upper arms'],
        2
      );

      console.log('Search result:', result);

      // Basic assertions
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.source).toMatch(/^(giphy|tenor)$/);
      expect(Array.isArray(result.data)).toBe(true);

      // If successful, check the structure of returned GIFs
      if (result.success && result.data.length > 0) {
        const gif = result.data[0];
        expect(gif).toHaveProperty('id');
        expect(gif).toHaveProperty('url');
        expect(gif).toHaveProperty('title');
        expect(gif).toHaveProperty('width');
        expect(gif).toHaveProperty('height');
        expect(gif).toHaveProperty('source');
        expect(gif.source).toMatch(/^(giphy|tenor)$/);
        
        console.log('Sample GIF:', {
          id: gif.id,
          title: gif.title,
          url: gif.url,
          source: gif.source,
          dimensions: `${gif.width}x${gif.height}`
        });
      }
    }, 10000); // 10 second timeout for API calls

    it('should handle different exercise types', async () => {
      const exercises = [
        { name: 'squat', bodyParts: ['upper legs', 'waist'] },
        { name: 'bicep curl', bodyParts: ['upper arms'] },
        { name: 'plank', bodyParts: ['waist', 'chest'] }
      ];

      for (const exercise of exercises) {
        const result = await gifFallbackService.searchExerciseGifs(
          exercise.name,
          exercise.bodyParts,
          1
        );

        console.log(`${exercise.name} result:`, {
          success: result.success,
          source: result.source,
          count: result.data.length
        });

        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
      }
    }, 15000);

    it('should return cached results on subsequent calls', async () => {
      const exerciseName = 'jumping jacks';
      const bodyParts = ['cardio'];

      // First call
      const result1 = await gifFallbackService.searchExerciseGifs(exerciseName, bodyParts, 1);
      
      // Second call (should be cached)
      const result2 = await gifFallbackService.searchExerciseGifs(exerciseName, bodyParts, 1);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      
      // Results should be similar (cached)
      if (result1.success && result2.success) {
        expect(result1.data.length).toBe(result2.data.length);
      }
    }, 10000);
  });

  describe('healthCheck', () => {
    it('should return health status for both APIs', async () => {
      const health = await gifFallbackService.healthCheck();

      expect(health).toBeDefined();
      expect(health).toHaveProperty('giphy');
      expect(health).toHaveProperty('tenor');
      expect(typeof health.giphy).toBe('boolean');
      expect(typeof health.tenor).toBe('boolean');

      console.log('API Health Status:', health);
    });
  });

  describe('buildSearchQuery', () => {
    it('should build appropriate search queries', () => {
      // Access private method for testing (TypeScript hack)
      const service = gifFallbackService as any;
      
      const query1 = service.buildSearchQuery('push up exercise', ['chest', 'upper arms']);
      const query2 = service.buildSearchQuery('barbell squat', ['upper legs']);
      const query3 = service.buildSearchQuery('plank workout', ['waist', 'chest']);

      console.log('Search queries:', {
        pushUp: query1,
        squat: query2,
        plank: query3
      });

      expect(typeof query1).toBe('string');
      expect(typeof query2).toBe('string');
      expect(typeof query3).toBe('string');
      
      // Should contain exercise name and relevant terms
      expect(query1.toLowerCase()).toContain('push up');
      expect(query2.toLowerCase()).toContain('squat');
      expect(query3.toLowerCase()).toContain('plank');
    });
  });
});

// Integration test with actual workout recommendation
describe('Workout Engine with GIF Fallback Integration', () => {
  it('should demonstrate the complete flow', async () => {
    console.log('\n=== GIF Fallback Integration Demo ===');
    
    const cacheService = new CacheService();
    const gifFallbackService = new GifFallbackService(cacheService);

    // Simulate a broken ExerciseDB GIF scenario
    const brokenExercise = {
      exerciseId: 'test-123',
      name: 'Push Up',
      gifUrl: 'https://broken-url.com/broken.gif', // This will fail
      instructions: ['Start in plank position', 'Lower body to ground', 'Push back up'],
      targetMuscles: ['chest', 'triceps'],
      bodyParts: ['chest', 'upper arms'],
      equipments: ['body weight'],
      secondaryMuscles: ['shoulders']
    };

    console.log('Original exercise:', {
      name: brokenExercise.name,
      originalGifUrl: brokenExercise.gifUrl,
      bodyParts: brokenExercise.bodyParts
    });

    // Search for fallback GIF
    const fallbackResult = await gifFallbackService.searchExerciseGifs(
      brokenExercise.name,
      brokenExercise.bodyParts,
      1
    );

    console.log('Fallback search result:', {
      success: fallbackResult.success,
      source: fallbackResult.source,
      gifsFound: fallbackResult.data.length
    });

    if (fallbackResult.success && fallbackResult.data.length > 0) {
      const fallbackGif = fallbackResult.data[0];
      console.log('Fallback GIF details:', {
        id: fallbackGif.id,
        title: fallbackGif.title,
        url: fallbackGif.url,
        source: fallbackGif.source,
        dimensions: `${fallbackGif.width}x${fallbackGif.height}`
      });

      // Simulate the enhanced exercise
      const enhancedExercise = {
        ...brokenExercise,
        gifUrl: fallbackGif.url,
        fallbackGifSource: fallbackGif.source,
        fallbackGifId: fallbackGif.id
      };

      console.log('Enhanced exercise:', {
        name: enhancedExercise.name,
        newGifUrl: enhancedExercise.gifUrl,
        fallbackSource: enhancedExercise.fallbackGifSource
      });

      expect(enhancedExercise.gifUrl).not.toBe(brokenExercise.gifUrl);
      expect(enhancedExercise.fallbackGifSource).toMatch(/^(giphy|tenor)$/);
    }

    console.log('=== Demo Complete ===\n');
  }, 15000);
});
