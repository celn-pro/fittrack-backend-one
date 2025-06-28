#!/usr/bin/env ts-node

/**
 * Simple test to reproduce the workout recommendation error
 */

import { RecommendationService } from '../src/services/RecommendationService';
import { CacheService } from '../src/services/CacheService';

async function testWorkoutRecommendation() {
  console.log('🧪 Testing Workout Recommendation via RecommendationService...\n');

  const cacheService = new CacheService();
  const recommendationService = new RecommendationService(cacheService);

  // Create the exact user profile that GraphQL resolver creates
  const testUser = {
    id: 'demo-user',
    email: 'demo@example.com',
    age: 25,
    weight: 70,
    height: 175,
    gender: 'other',
    fitnessGoal: 'general_fitness', // This is the problematic value!
    activityLevel: 'moderate',
    healthConditions: [],
    dietaryPreference: 'none',
    dietaryRestrictions: [],
    preferredWorkoutTypes: ['strength', 'cardio'],
    bmi: 22.9,
    isProfileComplete: true
  };

  console.log('👤 Test User Profile:');
  console.log(`- Fitness Goal: ${testUser.fitnessGoal}`);
  console.log(`- Age: ${testUser.age}`);
  console.log(`- Preferred Workout Types: ${testUser.preferredWorkoutTypes.join(', ')}`);
  console.log('');

  try {
    console.log('🏋️ Generating recommendations (workout only)...');
    
    // Test with workout filter only
    const filter = { category: 'workout' };
    const recommendations = await recommendationService.getPersonalizedRecommendations(testUser as any, filter);
    
    console.log('✅ SUCCESS! Recommendations generated:');
    console.log(`Found: ${recommendations.length} recommendations`);
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title} (${rec.category})`);
      console.log(`   Description: ${rec.description}`);
      console.log(`   Steps: ${rec.steps?.length || 0}`);
      console.log(`   Difficulty: ${rec.difficultyLevel}`);
      console.log(`   Duration: ${rec.estimatedDuration} minutes`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ FAILED! Error generating recommendations:');
    console.error(error);
    
    if (error instanceof Error) {
      console.log(`\n🔍 Error message: "${error.message}"`);
      
      if (error.message.includes('No exercises provided for transformation')) {
        console.log('\n🎯 This is the exact error we\'re investigating!');
        console.log('The issue is that exercises are being lost somewhere in the pipeline.');
      }
      
      if (error.message.includes('Some recommendation generation errors occurred')) {
        console.log('\n🎯 This suggests the error is being caught and logged by RecommendationService');
        console.log('Check the console logs above for the actual error details.');
      }
    }
  }
}

if (require.main === module) {
  testWorkoutRecommendation().catch(console.error);
}
