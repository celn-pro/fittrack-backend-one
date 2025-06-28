#!/usr/bin/env node

/**
 * Direct JavaScript test to avoid TypeScript compilation issues
 */

const { WorkoutEngine } = require('../dist/services/recommendation-engines/WorkoutEngine');
const { CacheService } = require('../dist/services/CacheService');

async function testWorkoutEngine() {
  console.log('🧪 Direct WorkoutEngine Test (JavaScript)...\n');

  try {
    const cacheService = new CacheService();
    const workoutEngine = new WorkoutEngine(cacheService);

    // Create test user with the problematic fitness goal
    const testUser = {
      id: 'demo-user',
      email: 'demo@example.com',
      age: 25,
      weight: 70,
      height: 175,
      gender: 'other',
      fitnessGoal: 'general_fitness', // This should now work!
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
    console.log(`- Health Conditions: ${testUser.healthConditions.join(', ') || 'none'}`);
    console.log('');

    console.log('🏋️ Generating workout recommendation...');
    const recommendation = await workoutEngine.generateWorkoutRecommendation(testUser);
    
    console.log('✅ SUCCESS! Workout recommendation generated:');
    console.log({
      id: recommendation.id,
      title: recommendation.title,
      description: recommendation.description,
      stepsCount: recommendation.steps?.length || 0,
      difficultyLevel: recommendation.difficultyLevel,
      estimatedDuration: recommendation.estimatedDuration,
      hasWorkingImage: recommendation.hasWorkingImage
    });

    if (recommendation.steps && recommendation.steps.length > 0) {
      console.log('\n📋 Workout Steps:');
      recommendation.steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.title}`);
        if (step.media && step.media.length > 0) {
          const firstMedia = step.media[0];
          console.log(`     Media: ${firstMedia.type} - ${firstMedia.url?.substring(0, 60)}...`);
        }
      });
    }

    console.log('\n🎯 Test completed successfully! The "No exercises provided for transformation" error is fixed.');

  } catch (error) {
    console.error('❌ FAILED! Error:', error.message);
    
    if (error.message.includes('No exercises provided for transformation')) {
      console.log('\n🔍 The error still exists. This means:');
      console.log('1. Exercises are being fetched successfully (we verified this)');
      console.log('2. But they\'re being lost somewhere in the pipeline');
      console.log('3. Check the console logs above for where exactly they\'re lost');
    }
  }
}

// Run the test
testWorkoutEngine().catch(console.error);
