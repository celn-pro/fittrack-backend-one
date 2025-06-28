#!/usr/bin/env ts-node

/**
 * Test script to reproduce the exact workout recommendation error
 */

import { WorkoutEngine } from '../src/services/recommendation-engines/WorkoutEngine';
import { CacheService } from '../src/services/CacheService';

async function testWorkoutRecommendation() {
  console.log('🧪 Testing Workout Recommendation Generation...\n');

  const cacheService = new CacheService();
  const workoutEngine = new WorkoutEngine(cacheService);

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
  console.log(JSON.stringify(testUser, null, 2));
  console.log('');

  try {
    console.log('🏋️ Generating workout recommendation...');
    const recommendation = await workoutEngine.generateWorkoutRecommendation(testUser as any);
    
    console.log('✅ SUCCESS! Workout recommendation generated:');
    console.log({
      id: recommendation.id,
      title: recommendation.title,
      description: recommendation.description,
      stepsCount: recommendation.steps?.length || 0,
      difficultyLevel: recommendation.difficultyLevel,
      estimatedDuration: recommendation.estimatedDuration
    });

    if (recommendation.steps && recommendation.steps.length > 0) {
      console.log('\n📋 Workout Steps:');
      recommendation.steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.title}`);
        if (step.media && step.media.length > 0) {
          const firstMedia = step.media[0];
          if (firstMedia) {
            console.log(`     Media: ${firstMedia.type} - ${firstMedia.url?.substring(0, 50)}...`);
          }
        }
      });
    }

  } catch (error) {
    console.error('❌ FAILED! Error generating workout recommendation:');
    console.error(error);
    
    if (error instanceof Error && error.message.includes('No exercises provided for transformation')) {
      console.log('\n🔍 This is the exact error we\'re investigating!');
      console.log('Let\'s debug step by step...\n');
      
      // Debug step by step
      try {
        console.log('Step 1: Check fitness goal mapping');
        const fitnessGoal = testUser.fitnessGoal || 'Maintain Health';
        console.log(`Fitness goal: "${fitnessGoal}"`);
        
        // Access private method for testing
        const engine = workoutEngine as any;
        const targetBodyParts = engine.getTargetBodyParts(fitnessGoal);
        console.log(`Target body parts: ${targetBodyParts.join(', ')}`);
        
        const fitnessLevel = engine.determineFitnessLevel(testUser);
        console.log(`Fitness level: ${fitnessLevel}`);
        
        const exerciseCount = engine.getExerciseCount(fitnessLevel);
        console.log(`Exercise count: ${exerciseCount}`);
        
        console.log('\nStep 2: Test exercise fetching');
        const exercises = await engine.fetchRelevantExercisesUnified(
          targetBodyParts,
          testUser.preferredWorkoutTypes || [],
          testUser.healthConditions || [],
          exerciseCount
        );
        console.log(`Fetched exercises: ${exercises.length}`);
        
        if (exercises.length === 0) {
          console.log('❌ PROBLEM: No exercises fetched!');
        } else {
          console.log('✅ Exercises fetched successfully');
          
          console.log('\nStep 3: Test health condition filtering');
          const safeExercises = engine.filterExercisesByHealthConditions(exercises, testUser.healthConditions || []);
          console.log(`Safe exercises after filtering: ${safeExercises.length}`);
          
          if (safeExercises.length === 0) {
            console.log('❌ PROBLEM: All exercises filtered out by health conditions!');
          } else {
            console.log('✅ Health condition filtering passed');
            
            console.log('\nStep 4: Test GIF enhancement');
            const enhancedExercises = await engine.enhanceExercisesWithFallbackGifs(safeExercises);
            console.log(`Enhanced exercises: ${enhancedExercises.length}`);
            
            if (enhancedExercises.length === 0) {
              console.log('❌ PROBLEM: All exercises lost during GIF enhancement!');
            } else {
              console.log('✅ GIF enhancement passed');
              console.log('\n🤔 All steps passed individually, but transformation failed...');
              console.log('This suggests a timing or async issue in the actual flow.');
            }
          }
        }
        
      } catch (debugError) {
        console.error('Debug error:', debugError);
      }
    }
  }
}

if (require.main === module) {
  testWorkoutRecommendation().catch(console.error);
}
