#!/usr/bin/env ts-node

/**
 * Demo script to showcase the GIF Fallback Service
 * 
 * This script demonstrates how the service works when ExerciseDB GIFs are broken
 * and shows the fallback process using GIPHY and Tenor APIs.
 * 
 * Usage: npm run demo:gif-fallback
 */

import { GifFallbackService } from '../src/services/external-apis/GifFallbackService';
import { CacheService } from '../src/services/CacheService';

async function demonstrateGifFallback() {
  console.log('🎯 GIF Fallback Service Demonstration\n');

  // Initialize services
  const cacheService = new CacheService();
  const gifFallbackService = new GifFallbackService(cacheService);

  // Check API health first
  console.log('📊 Checking API Health...');
  const health = await gifFallbackService.healthCheck();
  console.log(`GIPHY API: ${health.giphy ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Tenor API: ${health.tenor ? '✅ Configured' : '❌ Not configured'}\n`);

  if (!health.giphy && !health.tenor) {
    console.log('⚠️  No API keys configured. Please set GIPHY_API_KEY or TENOR_API_KEY in your .env file');
    console.log('📖 See docs/GIF_FALLBACK_SETUP.md for setup instructions\n');
    return;
  }

  // Test exercises with different characteristics
  const testExercises = [
    {
      name: 'Push Up',
      bodyParts: ['chest', 'upper arms'],
      originalGif: 'https://broken-url.com/pushup.gif'
    },
    {
      name: 'Squat',
      bodyParts: ['upper legs', 'waist'],
      originalGif: 'https://broken-url.com/squat.gif'
    },
    {
      name: 'Plank',
      bodyParts: ['waist', 'chest'],
      originalGif: 'https://broken-url.com/plank.gif'
    },
    {
      name: 'Bicep Curl',
      bodyParts: ['upper arms'],
      originalGif: 'https://broken-url.com/bicep.gif'
    }
  ];

  console.log('🔄 Testing GIF Fallback for Common Exercises...\n');

  for (const exercise of testExercises) {
    console.log(`🏋️  Testing: ${exercise.name}`);
    console.log(`   Body Parts: ${exercise.bodyParts.join(', ')}`);
    console.log(`   Original GIF: ${exercise.originalGif} (broken)`);

    try {
      const result = await gifFallbackService.searchExerciseGifs(
        exercise.name,
        exercise.bodyParts,
        2 // Get 2 fallback options
      );

      if (result.success && result.data.length > 0) {
        console.log(`   ✅ Found ${result.data.length} fallback GIF(s) from ${result.source.toUpperCase()}`);
        
        result.data.forEach((gif, index) => {
          console.log(`      ${index + 1}. ${gif.title}`);
          console.log(`         URL: ${gif.url}`);
          console.log(`         Size: ${gif.width}x${gif.height}px`);
          if (gif.size) {
            console.log(`         File Size: ${Math.round(gif.size / 1024)}KB`);
          }
        });
      } else {
        console.log(`   ❌ No fallback GIFs found`);
      }
    } catch (error) {
      console.log(`   ⚠️  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log(''); // Empty line for readability
  }

  // Demonstrate caching
  console.log('💾 Testing Cache Performance...');
  const testExercise = 'jumping jacks';
  const testBodyParts = ['cardio'];

  console.log(`First search for "${testExercise}"...`);
  const start1 = Date.now();
  await gifFallbackService.searchExerciseGifs(testExercise, testBodyParts, 1);
  const time1 = Date.now() - start1;

  console.log(`Second search for "${testExercise}" (should be cached)...`);
  const start2 = Date.now();
  await gifFallbackService.searchExerciseGifs(testExercise, testBodyParts, 1);
  const time2 = Date.now() - start2;

  console.log(`First search: ${time1}ms`);
  console.log(`Second search: ${time2}ms (${time2 < time1 ? 'faster due to caching' : 'similar timing'})`);
  console.log('');

  // Show search query building
  console.log('🔍 Search Query Examples:');
  const service = gifFallbackService as any; // Access private method for demo
  
  const queries = [
    { name: 'push up exercise', bodyParts: ['chest', 'upper arms'] },
    { name: 'barbell squat workout', bodyParts: ['upper legs'] },
    { name: 'plank fitness', bodyParts: ['waist', 'chest'] }
  ];

  queries.forEach(({ name, bodyParts }) => {
    const query = service.buildSearchQuery(name, bodyParts);
    console.log(`   "${name}" + [${bodyParts.join(', ')}] → "${query}"`);
  });

  console.log('\n✨ Demo Complete!');
  console.log('\n📝 Summary:');
  console.log('   • GIF Fallback Service automatically detects broken ExerciseDB GIFs');
  console.log('   • Searches GIPHY and Tenor APIs for relevant exercise demonstrations');
  console.log('   • Caches results to improve performance and reduce API calls');
  console.log('   • Integrates seamlessly with the workout recommendation engine');
  console.log('\n📖 For setup instructions, see: docs/GIF_FALLBACK_SETUP.md');
}

// Run the demonstration
if (require.main === module) {
  demonstrateGifFallback()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Demo failed:', error);
      process.exit(1);
    });
}

export { demonstrateGifFallback };
