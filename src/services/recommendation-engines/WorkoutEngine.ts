// Smart workout recommendation logic with health condition filtering
import { ExerciseApiService } from '../external-apis/ExerciseApiService';
import { UnifiedExerciseService, UnifiedExercise } from '../UnifiedExerciseService';
import { GifFallbackService } from '../external-apis/GifFallbackService';
import { ExerciseTransformer, EnhancedRecommendation } from '../../utils/transformers/exerciseTransformer';
import { ExerciseDBResponse } from '../../types/api.types';
import { CacheService } from '../CacheService';

export interface IUser {
  id?: string;
  email: string;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  fitnessGoal?: string;
  dietaryPreference?: string;
  healthConditions?: string[];
  activityLevel?: string;
  preferredWorkoutTypes?: string[];
  dietaryRestrictions?: string[];
  bmi?: number;
  role?: 'user' | 'admin';
  isProfileComplete: boolean;
}

export class WorkoutEngine {
  private exerciseApiService: ExerciseApiService;
  private unifiedExerciseService: UnifiedExerciseService;
  private exerciseTransformer: ExerciseTransformer;
  private gifFallbackService: GifFallbackService;
  private cacheService: CacheService;

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService();
    this.exerciseApiService = new ExerciseApiService(this.cacheService);
    this.unifiedExerciseService = new UnifiedExerciseService(this.cacheService);
    this.exerciseTransformer = new ExerciseTransformer();
    this.gifFallbackService = new GifFallbackService(this.cacheService);
  }

  /**
   * Generate workout recommendations based on user profile
   */
  async generateWorkoutRecommendation(user: IUser): Promise<EnhancedRecommendation> {
    try {
      // Validate user profile
      this.validateUserProfile(user);

      // Determine user fitness level and constraints
      const fitnessLevel = this.determineFitnessLevel(user);
      const targetBodyParts = this.getTargetBodyParts(user.fitnessGoal || 'Maintain Health');
      const exerciseCount = this.getExerciseCount(fitnessLevel);

      // Get exercises from unified API (prioritizes working images)
      console.log(`🔄 Fetching ${exerciseCount} exercises for body parts: ${targetBodyParts.join(', ')}`);
      const exercises = await this.fetchRelevantExercisesUnified(
        targetBodyParts,
        user.preferredWorkoutTypes || [],
        user.healthConditions || [],
        exerciseCount
      );
      console.log(`📚 Fetched ${exercises.length} exercises from API`);

      if (exercises.length === 0) {
        throw new Error(`No exercises found for body parts: ${targetBodyParts.join(', ')}. Check API connectivity.`);
      }

      // Filter exercises based on health conditions
      const safeExercises = this.filterExercisesByHealthConditions(exercises, user.healthConditions || []);
      console.log(`🛡️ ${safeExercises.length} exercises after health condition filtering`);

      if (safeExercises.length === 0) {
        throw new Error(`All exercises filtered out by health conditions: ${user.healthConditions?.join(', ') || 'none'}`);
      }

      // Enhance exercises with fallback GIFs if original GIFs are broken
      const enhancedExercises = await this.enhanceExercisesWithFallbackGifs(safeExercises);
      console.log(`✨ ${enhancedExercises.length} exercises after GIF enhancement`);

      if (enhancedExercises.length === 0) {
        throw new Error('All exercises lost during GIF enhancement process');
      }

      // Transform to recommendation format
      console.log(`🔄 Transforming ${enhancedExercises.length} exercises to recommendation format`);
      const recommendation = await this.exerciseTransformer.transformToRecommendation(enhancedExercises, user);

      // Add personalized elements (simplified for now)
      recommendation.personalizedTips = ['Focus on proper form', 'Stay hydrated', 'Listen to your body'];
      recommendation.difficultyLevel = user.activityLevel === 'low' ? 'Beginner' :
                                      user.activityLevel === 'high' ? 'Advanced' : 'Intermediate';

      return recommendation;
    } catch (error) {
      console.error('Error generating workout recommendation:', error);
      throw new Error(`Failed to generate workout recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate user profile for workout generation
   */
  private validateUserProfile(user: IUser): void {
    if (!user.age || user.age < 13 || user.age > 120) {
      throw new Error('Invalid age: must be between 13 and 120');
    }
    if (!user.fitnessGoal) {
      throw new Error('Fitness goal is required');
    }
  }

  /**
   * Determine fitness level based on user data
   */
  private determineFitnessLevel(user: IUser): 'beginner' | 'intermediate' | 'advanced' {
    const age = user.age || 30;
    const activityLevel = user.activityLevel || 'Sedentary';
    const bmi = user.bmi || 25;

    // Beginner criteria
    if (activityLevel === 'Sedentary' || age > 60 || bmi > 30) {
      return 'beginner';
    }

    // Advanced criteria
    if (activityLevel === 'Active' && age < 40 && bmi < 25) {
      return 'advanced';
    }

    return 'intermediate';
  }

  /**
   * Get target body parts based on fitness goal
   */
  private getTargetBodyParts(fitnessGoal: string): string[] {
    const bodyPartMap: Record<string, string[]> = {
      'Lose Weight': ['cardio', 'waist', 'upper legs'],
      'lose_weight': ['cardio', 'waist', 'upper legs'],
      'Gain Muscle': ['chest', 'back', 'shoulders', 'upper arms', 'upper legs'],
      'gain_muscle': ['chest', 'back', 'shoulders', 'upper arms', 'upper legs'],
      'build_muscle': ['chest', 'back', 'shoulders', 'upper arms', 'upper legs'],
      'Maintain Health': ['chest', 'back', 'upper legs', 'waist'],
      'maintain_health': ['chest', 'back', 'upper legs', 'waist'],
      'general_fitness': ['chest', 'back', 'upper legs', 'waist'], // Fix for GraphQL resolver
      'Strength': ['chest', 'back', 'upper legs', 'shoulders'],
      'strength': ['chest', 'back', 'upper legs', 'shoulders'],
      'Endurance': ['cardio', 'upper legs', 'waist'],
      'endurance': ['cardio', 'upper legs', 'waist'],
      'improve_endurance': ['cardio', 'upper legs', 'waist']
    };

    const targetParts = bodyPartMap[fitnessGoal] || bodyPartMap[fitnessGoal.toLowerCase()] || ['chest', 'back', 'upper legs'];
    console.log(`🎯 Fitness goal "${fitnessGoal}" mapped to body parts: ${targetParts.join(', ')}`);
    return targetParts;
  }

  /**
   * Get number of exercises based on fitness level
   */
  private getExerciseCount(fitnessLevel: string): number {
    switch (fitnessLevel) {
      case 'beginner': return 3;
      case 'intermediate': return 4;
      case 'advanced': return 5;
      default: return 4;
    }
  }

  /**
   * Fetch relevant exercises from unified API (prioritizes working images)
   */
  private async fetchRelevantExercisesUnified(
    bodyParts: string[],
    preferredWorkoutTypes: string[],
    healthConditions: string[],
    count: number
  ): Promise<ExerciseDBResponse[]> {
    try {
      console.log(`🔄 Fetching ${count} exercises from unified service for body parts:`, bodyParts);

      // Get exercises from unified service (exercisedb)
      const response = await this.unifiedExerciseService.getExercises(bodyParts, count);

      // Convert unified exercises to ExerciseDBResponse format for compatibility
      const convertedExercises: ExerciseDBResponse[] = response.data.map(exercise => ({
        exerciseId: exercise.id,
        name: exercise.name,
        gifUrl: exercise.gifUrl,
        instructions: exercise.instructions,
        targetMuscles: exercise.targetMuscles,
        bodyParts: exercise.bodyParts,
        equipments: exercise.equipments,
        secondaryMuscles: exercise.secondaryMuscles
      }));

      console.log(`✅ Exercise service returned ${convertedExercises.length} exercises from ExerciseDB`);

      return convertedExercises;
    } catch (error) {
      console.warn('Exercise service failed, falling back to direct ExerciseDB:', error);
      return this.fetchRelevantExercises(bodyParts, preferredWorkoutTypes, healthConditions, count);
    }
  }

  /**
   * Fetch relevant exercises from ExerciseDB API (fallback method)
   */
  private async fetchRelevantExercises(
    bodyParts: string[],
    preferredWorkoutTypes: string[],
    healthConditions: string[],
    count: number
  ): Promise<ExerciseDBResponse[]> {
    const allExercises: ExerciseDBResponse[] = [];

    for (const bodyPart of bodyParts) {
      try {
        const response = await this.exerciseApiService.getExercisesByBodyPart(bodyPart, 10);
        allExercises.push(...response.data);
      } catch (error) {
        console.error(`Error fetching exercises for body part ${bodyPart}:`, error);
        // Continue with other body parts if one fails
      }
    }

    // If no exercises found, get some general exercises
    if (allExercises.length === 0) {
      try {
        const response = await this.exerciseApiService.getAllExercises(20);
        allExercises.push(...response.data);
      } catch (error) {
        console.error('Error fetching fallback exercises:', error);
        throw new Error('Unable to fetch exercises from API');
      }
    }

    // Shuffle and limit to requested count
    const shuffled = this.shuffleArray([...allExercises]);
    return shuffled.slice(0, count);
  }

  /**
   * Filter exercises based on health conditions
   */
  private filterExercisesByHealthConditions(
    exercises: ExerciseDBResponse[],
    healthConditions: string[]
  ): ExerciseDBResponse[] {
    if (healthConditions.length === 0 || healthConditions.includes('None')) {
      return exercises;
    }

    return exercises.filter(exercise => {
      const exerciseName = exercise.name?.toLowerCase() || '';
      const bodyParts = exercise.bodyParts?.map(part => part.toLowerCase()) || [];
      const equipments = exercise.equipments?.map(equip => equip.toLowerCase()) || [];

      // Filter based on health conditions
      for (const condition of healthConditions) {
        switch (condition) {
          case 'Knee Injury':
            if (exerciseName.includes('squat') ||
                exerciseName.includes('lunge') ||
                exerciseName.includes('jump') ||
                (bodyParts.includes('upper legs') && !equipments.includes('body weight'))) {
              return false;
            }
            break;

          case 'Back Pain':
            if (exerciseName.includes('deadlift') ||
                exerciseName.includes('row') ||
                (bodyParts.includes('back') && equipments.includes('barbell'))) {
              return false;
            }
            break;

          case 'Heart Condition':
            if (bodyParts.includes('cardio') || exerciseName.includes('high intensity')) {
              return false;
            }
            break;

          case 'Hypertension':
            if (exerciseName.includes('overhead') ||
                exerciseName.includes('heavy') ||
                equipments.includes('barbell')) {
              return false;
            }
            break;

          case 'Asthma':
            if (bodyParts.includes('cardio') && exerciseName.includes('running')) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }

  // Commented out unused method
  // private customizeExercises(exercises: Exercise[], userProfile: UserProfile): Exercise[] {
  //   const { fitnessLevel, preferences } = userProfile;
  //
  //   // Filter out exercises user dislikes
  //   let filteredExercises = exercises.filter(exercise =>
  //     !preferences?.dislikedExercises?.includes(exercise.id)
  //   );

  //   // Prioritize preferred exercises
  //   if (preferences?.preferredExercises?.length) {
  //     const preferred = filteredExercises.filter(exercise =>
  //       preferences.preferredExercises!.includes(exercise.id)
  //     );
  //     const others = filteredExercises.filter(exercise =>
  //       !preferences.preferredExercises!.includes(exercise.id)
  //     );
  //     filteredExercises = [...preferred, ...others];
  //   }

  //   // Adjust difficulty based on fitness level
  //   return filteredExercises.map(exercise => ({
  //     ...exercise,
  //     recommendedSets: this.calculateSets(fitnessLevel),
  //     recommendedReps: this.calculateReps(fitnessLevel, exercise.type),
  //     restTime: this.calculateRestTime(fitnessLevel)
  //   }));
  // }

  // Commented out unused method
  // private createWorkoutPlan(exercises: Exercise[], userProfile: UserProfile) {
  //   const { timeConstraints } = userProfile;
  //   const maxDuration = timeConstraints?.preferredDuration === 'short' ? 30 :
  //                      timeConstraints?.preferredDuration === 'long' ? 90 : 60;

  //   const selectedExercises: Exercise[] = [];
  //   let estimatedDuration = 0;

  //   for (const exercise of exercises) {
  //     const exerciseDuration = this.calculateExerciseDuration(exercise);
  //
  //     if (estimatedDuration + exerciseDuration <= maxDuration) {
  //       selectedExercises.push(exercise);
  //       estimatedDuration += exerciseDuration;
  //     }

  //     if (selectedExercises.length >= 8) break; // Max 8 exercises per workout
  //   }

  //   return {
  //     exercises: selectedExercises,
  //     estimatedDuration
  //   };
  // }

  // Commented out unused helper methods
  // private calculateSets(fitnessLevel: string): number {
  //   switch (fitnessLevel) {
  //     case 'beginner': return 2;
  //     case 'intermediate': return 3;
  //     case 'advanced': return 4;
  //     default: return 3;
  //   }
  // }

  // private calculateReps(fitnessLevel: string, exerciseType: string): string {
  //   if (exerciseType === 'cardio') return '30-60 seconds';
  //
  //   switch (fitnessLevel) {
  //     case 'beginner': return '8-12';
  //     case 'intermediate': return '10-15';
  //     case 'advanced': return '12-20';
  //     default: return '10-15';
  //   }
  // }

  // private calculateRestTime(fitnessLevel: string): number {
  //   switch (fitnessLevel) {
  //     case 'beginner': return 90; // seconds
  //     case 'intermediate': return 60;
  //     case 'advanced': return 45;
  //     default: return 60;
  //   }
  // }

  // private calculateExerciseDuration(exercise: Exercise): number {
  //   // Estimate: sets * reps * time per rep + rest time
  //   const sets = exercise.recommendedSets || 3;
  //   const restTime = exercise.restTime || 60;
  //   const workTime = 30; // seconds per set average
  //
  //   return (sets * workTime) + ((sets - 1) * restTime / 60); // Convert to minutes
  // }

  // Commented out unused helper methods
  // private calculateDifficulty(fitnessLevel: string, exercises: Exercise[]): string {
  //   // Simple difficulty calculation based on fitness level and exercise count
  //   const baseScore = fitnessLevel === 'beginner' ? 1 : fitnessLevel === 'intermediate' ? 2 : 3;
  //   const exerciseScore = exercises.length > 6 ? 1 : 0;
  //
  //   const totalScore = baseScore + exerciseScore;
  //
  //   if (totalScore <= 2) return 'easy';
  //   if (totalScore <= 3) return 'moderate';
  //   return 'hard';
  // }

  // private extractTargetMuscles(exercises: Exercise[]): string[] {
  //   const muscles = new Set<string>();
  //   exercises.forEach(exercise => {
  //     exercise.targetMuscles.forEach(muscle => muscles.add(muscle));
  //   });
  //   return Array.from(muscles);
  // }

  // private extractRequiredEquipment(exercises: Exercise[]): string[] {
  //   const equipment = new Set<string>();
  //   exercises.forEach(exercise => {
  //     if (exercise.equipment) {
  //       equipment.add(exercise.equipment);
  //     }
  //   });
  //   return Array.from(equipment);
  // }

  // private generateRecommendationId(): string {
  //   return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  // }

  // private generateWorkoutTitle(goals: WorkoutGoal[]): string {
  //   const primaryGoal = goals[0];
  //   const titleMap: Record<string, string> = {
  //     'weight_loss': 'Fat Burning Workout',
  //     'muscle_gain': 'Muscle Building Session',
  //     'strength': 'Strength Training Workout',
  //     'endurance': 'Endurance Building Session',
  //     'flexibility': 'Flexibility & Mobility',
  //     'general_fitness': 'Full Body Fitness'
  //   };
  //
  //   return titleMap[primaryGoal] || 'Custom Workout';
  // }

  // Commented out unused method
  // /**
  //  * Generate personalized tips for the user
  //  */
  // private generatePersonalizedTips(user: IUser, exercises: ExerciseDBResponse[]): string[] {
  //   const tips: string[] = [];
  //   const fitnessLevel = this.determineFitnessLevel(user);
  //   const healthConditions = user.healthConditions || [];
  //   const age = user.age || 30;

  //   // Age-specific tips
  //   if (age > 50) {
  //     tips.push('Focus on proper warm-up and cool-down to prevent injury');
  //     tips.push('Listen to your body and rest when needed');
  //   }

  //   // Fitness level tips
  //   if (fitnessLevel === 'beginner') {
  //     tips.push('Start with bodyweight exercises and focus on proper form');
  //     tips.push('Gradually increase intensity as you build strength');
  //   }

  //   // Health condition tips
  //   if (healthConditions.includes('Knee Injury')) {
  //     tips.push('Avoid deep squats and high-impact movements');
  //     tips.push('Consider low-impact alternatives like swimming');
  //   }

  //   if (healthConditions.includes('Back Pain')) {
  //     tips.push('Maintain neutral spine throughout all exercises');
  //     tips.push('Strengthen your core to support your back');
  //   }

  //   // Goal-specific tips
  //   const goal = user.fitnessGoal;
  //   if (goal === 'Lose Weight') {
  //     tips.push('Combine strength training with cardio for best results');
  //     tips.push('Maintain a caloric deficit through diet and exercise');
  //   } else if (goal === 'Gain Muscle') {
  //     tips.push('Focus on progressive overload and proper nutrition');
  //     tips.push('Allow adequate rest between training sessions');
  //   }

  //   return tips;
  // }

  // Commented out unused methods
  // /**
  //  * Determine difficulty level
  //  */
  // private determineDifficultyLevel(user: IUser): 'Beginner' | 'Intermediate' | 'Advanced' {
  //   const fitnessLevel = this.determineFitnessLevel(user);

  //   switch (fitnessLevel) {
  //     case 'beginner': return 'Beginner';
  //     case 'intermediate': return 'Intermediate';
  //     case 'advanced': return 'Advanced';
  //     default: return 'Beginner';
  //   }
  // }

  // /**
  //  * Shuffle array utility
  //  */
  // private shuffleArray<T>(array: T[]): T[] {
  //   const shuffled = [...array];
  //   for (let i = shuffled.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  //   }
  //   return shuffled;
  // }

  /**
   * Enhance exercises with fallback GIFs when original GIFs are broken
   */
  private async enhanceExercisesWithFallbackGifs(exercises: ExerciseDBResponse[]): Promise<ExerciseDBResponse[]> {
    const enhancedExercises = await Promise.all(
      exercises.map(async (exercise) => {
        try {
          // Check if original GIF URL is working by attempting a quick validation
          const isOriginalGifWorking = await this.isGifUrlWorking(exercise.gifUrl);

          if (isOriginalGifWorking) {
            return exercise; // Original GIF is working, no need for fallback
          }

          // Original GIF is broken, search for fallback
          console.log(`🔄 Original GIF broken for "${exercise.name}", searching for fallback...`);

          const fallbackResult = await this.gifFallbackService.searchExerciseGifs(
            exercise.name,
            exercise.bodyParts || [],
            1 // Get just one fallback GIF
          );

          if (fallbackResult.success && fallbackResult.data.length > 0) {
            const fallbackGif = fallbackResult.data[0];
            if (fallbackGif) {
              console.log(`✅ Found fallback GIF from ${fallbackGif.source} for "${exercise.name}"`);

              return {
                ...exercise,
                gifUrl: fallbackGif.url,
                // Add metadata about the fallback
                fallbackGifSource: fallbackGif.source,
                fallbackGifId: fallbackGif.id
              };
            }
          } else {
            console.warn(`⚠️ No fallback GIF found for "${exercise.name}"`);
            return exercise; // Return original even if GIF is broken
          }
        } catch (error) {
          console.error(`Error enhancing exercise "${exercise.name}" with fallback GIF:`, error);
          return exercise; // Return original on error
        }
      })
    );

    return enhancedExercises;
  }

  /**
   * Quick check to see if a GIF URL is working
   */
  private async isGifUrlWorking(gifUrl: string): Promise<boolean> {
    try {
      // Simple HEAD request to check if URL is accessible
      const response = await fetch(gifUrl, {
        method: 'HEAD'
        // Note: timeout not supported in standard fetch
      });
      return response.ok;
    } catch (error) {
      return false; // Assume broken if any error occurs
    }
  }

  /**
   * Health check for workout engine
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const apiHealth = await this.exerciseApiService.healthCheck();
      const gifFallbackHealth = await this.gifFallbackService.healthCheck();

      return {
        status: apiHealth.status,
        details: {
          exerciseApi: apiHealth.details,
          gifFallback: {
            giphy: gifFallbackHealth.giphy ? 'configured' : 'not configured',
            tenor: gifFallbackHealth.tenor ? 'configured' : 'not configured'
          },
          cacheStats: this.cacheService.getStats()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}
