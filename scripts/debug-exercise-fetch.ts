#!/usr/bin/env ts-node

/**
 * Debug script to test exercise fetching and identify the root cause
 * of "No exercises provided for transformation" error
 */

import { ExerciseApiService } from '../src/services/external-apis/ExerciseApiService';
import { UnifiedExerciseService } from '../src/services/UnifiedExerciseService';
import { CacheService } from '../src/services/CacheService';

async function debugExerciseFetch() {
  console.log('🔍 Debugging Exercise Fetch Process...\n');

  const cacheService = new CacheService();
  const exerciseApiService = new ExerciseApiService(cacheService);
  const unifiedExerciseService = new UnifiedExerciseService(cacheService);

  // Test 1: Check API configuration
  console.log('📋 Step 1: API Configuration');
  console.log(`ExerciseDB Base URL: ${process.env.EXERCISEDB_BASE_URL || 'https://exercisedb.dev/api/v1'}`);
  console.log(`Rate Limit Per Minute: ${process.env.EXERCISEDB_RATE_LIMIT_PER_MINUTE || '60'}`);
  console.log(`Rate Limit Per Day: ${process.env.EXERCISEDB_RATE_LIMIT_PER_DAY || '5000'}\n`);

  // Test 2: Health check
  console.log('🏥 Step 2: API Health Check');
  try {
    const health = await exerciseApiService.healthCheck();
    console.log('Health Status:', health.status);
    console.log('Health Details:', JSON.stringify(health.details, null, 2));
  } catch (error) {
    console.error('Health check failed:', error);
  }
  console.log('');

  // Test 3: Try to fetch all exercises
  console.log('📚 Step 3: Fetch All Exercises (limit 5)');
  try {
    const allExercisesResponse = await exerciseApiService.getAllExercises(5);
    console.log(`Status: ${allExercisesResponse.status}`);
    console.log(`Cached: ${allExercisesResponse.cached}`);
    console.log(`Found: ${allExercisesResponse.data.length} exercises`);
    
    if (allExercisesResponse.data.length > 0) {
      const firstExercise = allExercisesResponse.data[0];
      if (firstExercise) {
        console.log('First exercise sample:', {
          id: firstExercise.exerciseId,
          name: firstExercise.name,
          bodyParts: firstExercise.bodyParts,
          gifUrl: firstExercise.gifUrl?.substring(0, 50) + '...'
        });
      }
    }
  } catch (error) {
    console.error('❌ Failed to fetch all exercises:', error);
  }
  console.log('');

  // Test 4: Try to fetch exercises by body part
  console.log('🎯 Step 4: Fetch Exercises by Body Part (chest)');
  try {
    const bodyPartResponse = await exerciseApiService.getExercisesByBodyPart('chest', 3);
    console.log(`Status: ${bodyPartResponse.status}`);
    console.log(`Cached: ${bodyPartResponse.cached}`);
    console.log(`Found: ${bodyPartResponse.data.length} exercises for chest`);
    
    if (bodyPartResponse.data.length > 0) {
      bodyPartResponse.data.forEach((exercise, index) => {
        console.log(`  ${index + 1}. ${exercise.name} (${exercise.bodyParts.join(', ')})`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to fetch exercises by body part:', error);
  }
  console.log('');

  // Test 5: Try unified exercise service
  console.log('🔗 Step 5: Unified Exercise Service');
  try {
    const unifiedResponse = await unifiedExerciseService.getExercises(['chest', 'upper arms'], 3);
    console.log(`Status: ${unifiedResponse.status}`);
    console.log(`Cached: ${unifiedResponse.cached}`);
    console.log(`Found: ${unifiedResponse.data.length} exercises from unified service`);
    
    if (unifiedResponse.data.length > 0) {
      unifiedResponse.data.forEach((exercise, index) => {
        console.log(`  ${index + 1}. ${exercise.name} (${exercise.bodyParts.join(', ')}) - Source: ${exercise.source}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to fetch from unified service:', error);
  }
  console.log('');

  // Test 6: Simulate the exact workout engine flow
  console.log('⚙️ Step 6: Simulate Workout Engine Flow');
  try {
    const targetBodyParts = ['chest', 'upper arms'];
    const exerciseCount = 3;
    
    console.log(`Fetching ${exerciseCount} exercises for body parts: ${targetBodyParts.join(', ')}`);
    
    // This is exactly what WorkoutEngine does
    const response = await unifiedExerciseService.getExercises(targetBodyParts, exerciseCount);
    
    // Convert to ExerciseDBResponse format (like WorkoutEngine does)
    const convertedExercises = response.data.map(exercise => ({
      exerciseId: exercise.id,
      name: exercise.name,
      gifUrl: exercise.gifUrl,
      instructions: exercise.instructions,
      targetMuscles: exercise.targetMuscles,
      bodyParts: exercise.bodyParts,
      equipments: exercise.equipments,
      secondaryMuscles: exercise.secondaryMuscles
    }));

    console.log(`✅ Converted ${convertedExercises.length} exercises for transformation`);
    
    if (convertedExercises.length === 0) {
      console.log('❌ THIS IS THE PROBLEM: No exercises returned for transformation!');
    } else {
      console.log('✅ Exercises ready for transformation:');
      convertedExercises.forEach((exercise, index) => {
        console.log(`  ${index + 1}. ${exercise.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Workout engine simulation failed:', error);
  }
  console.log('');

  // Test 7: Direct API call to see raw response
  console.log('🌐 Step 7: Direct API Call Test');
  try {
    const baseUrl = process.env.EXERCISEDB_BASE_URL || 'https://exercisedb.dev/api/v1';
    const testUrl = `${baseUrl}/exercises?limit=2`;
    
    console.log(`Testing direct call to: ${testUrl}`);
    
    const response = await fetch(testUrl);
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      const dataObj = data as Record<string, any>;
      console.log('Raw API response structure:', {
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        hasSuccess: 'success' in dataObj,
        hasDataField: 'data' in dataObj,
        keys: Object.keys(dataObj)
      });

      if (data && typeof data === 'object') {
        console.log('Response sample:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Direct API call failed:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 DIAGNOSIS COMPLETE');
  console.log('If you see "No exercises returned for transformation" above,');
  console.log('that explains the "No exercises provided for transformation" error.');
  console.log('The issue is in the exercise fetching, not the GIF transformation.');
}

if (require.main === module) {
  debugExerciseFetch().catch(console.error);
}
