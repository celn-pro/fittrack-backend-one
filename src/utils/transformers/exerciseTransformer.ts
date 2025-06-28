// Raw API → Your format transformer for ExerciseDB
import { ExerciseDBResponse } from '../../types/api.types';
import { Exercise } from '../../types/recommendation.types';
import { MediaFallbackService } from '../../services/external-apis/MediaFallbackService';

export interface EnhancedRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  image?: string;
  steps?: Step[];
  tips?: string[];
  articles?: Article[];
  macros?: any;
  calories?: number;
  reminders?: string[];
  dailyGoalMl?: number;
  sleepGoalHours?: number;
  calculatedCalories?: number;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration?: number;
  personalizedTips?: string[];
  createdAt?: string;
  source?: string; // 'exercisedb' | 'wger' | 'generated'
  hasWorkingImage?: boolean; // true if images are working, false if placeholders
}

export interface Step {
  title: string;
  description: string;
  media?: StepMedia[];
  duration?: number;
}

export interface StepMedia {
  type: 'image' | 'gif' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
}

export interface Article {
  title: string;
  url: string;
  summary?: string;
}

export class ExerciseTransformer {
  private mediaFallbackService: MediaFallbackService;

  constructor() {
    this.mediaFallbackService = new MediaFallbackService();
  }

  /**
   * Transform external API exercise data to internal format
   */
  transformToInternalFormat(apiExercise: ExerciseDBResponse): Exercise {
    return {
      id: apiExercise.id,
      name: this.formatExerciseName(apiExercise.name),
      description: this.generateDescription(apiExercise),
      type: this.determineExerciseType(apiExercise),
      targetMuscles: this.extractTargetMuscles(apiExercise),
      equipment: this.normalizeEquipment(apiExercise.equipments?.[0] || 'bodyweight'),
      difficulty: this.determineDifficulty(apiExercise),
      instructions: this.formatInstructions(apiExercise.instructions),
      imageUrl: apiExercise.gifUrl,
      bodyPart: this.normalizeBodyPart(apiExercise.bodyParts?.[0] || 'unknown'),
      secondaryMuscles: this.extractSecondaryMuscles(apiExercise),
      tips: this.generateTips(apiExercise),
      variations: this.generateVariations(apiExercise),
      safetyNotes: this.generateSafetyNotes(apiExercise),
      // These will be set by the recommendation engine
      recommendedSets: undefined,
      recommendedReps: undefined,
      restTime: undefined
    };
  }

  /**
   * Transform ExerciseDB data to GraphQL recommendation format
   */
  async transformToRecommendation(
    exercises: ExerciseDBResponse[],
    userProfile: any
  ): Promise<EnhancedRecommendation> {
    const primaryExercise = exercises[0];
    if (!primaryExercise) {
      throw new Error('No exercises provided for transformation');
    }

    const steps = await this.createWorkoutSteps(exercises, userProfile);
    const personalizedTips = this.generatePersonalizedTips(exercises, userProfile);
    const difficultyLevel = this.determineDifficultyLevel(userProfile);
    const estimatedDuration = this.calculateWorkoutDuration(exercises, userProfile);
    const calculatedCalories = this.estimateCaloriesBurned(exercises, userProfile);
    const sourceInfo = this.analyzeExerciseSources(exercises);

    return {
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: 'workout',
      title: this.generateWorkoutTitle(exercises, userProfile),
      description: this.generateWorkoutDescription(exercises, userProfile),
      image: this.getValidImageUrl(primaryExercise.gifUrl, primaryExercise.name),
      steps,
      tips: personalizedTips,
      calculatedCalories,
      difficultyLevel,
      estimatedDuration,
      personalizedTips,
      createdAt: new Date().toISOString(),
      source: sourceInfo.primarySource,
      hasWorkingImage: sourceInfo.hasWorkingImages
    };
  }

  /**
   * Transform multiple exercises
   */
  transformMultiple(apiExercises: ExerciseDBResponse[]): Exercise[] {
    return apiExercises.map(exercise => this.transformToInternalFormat(exercise));
  }

  /**
   * Transform internal format back to API format (if needed)
   */
  transformToApiFormat(exercise: Exercise): Partial<ExerciseDBResponse> {
    return {
      id: exercise.id,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      equipment: exercise.equipment,
      target: exercise.targetMuscles[0] || '',
      instructions: exercise.instructions,
      gifUrl: exercise.imageUrl || '',
      secondaryMuscles: exercise.secondaryMuscles || []
    };
  }

  private formatExerciseName(name: string): string {
    // Convert from API format (e.g., "3/4 sit-up") to proper case
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private generateDescription(apiExercise: ExerciseDBResponse): string {
    const bodyPart = this.normalizeBodyPart(apiExercise.bodyParts?.[0] || 'unknown');
    const target = apiExercise.targetMuscles?.[0] || 'muscles';
    const equipment = this.normalizeEquipment(apiExercise.equipments?.[0] || 'bodyweight');

    return `A ${bodyPart} exercise targeting the ${target} using ${equipment}.`;
  }

  private determineExerciseType(apiExercise: ExerciseDBResponse): string {
    const name = apiExercise.name.toLowerCase();
    const bodyPart = apiExercise.bodyParts?.[0]?.toLowerCase() || '';
    
    // Cardio exercises
    if (name.includes('run') || name.includes('jump') || name.includes('burpee') || 
        name.includes('mountain climber') || name.includes('high knees')) {
      return 'cardio';
    }
    
    // Strength exercises
    if (name.includes('press') || name.includes('curl') || name.includes('row') || 
        name.includes('squat') || name.includes('deadlift') || name.includes('bench')) {
      return 'strength';
    }
    
    // Flexibility/stretching
    if (name.includes('stretch') || name.includes('yoga') || name.includes('pose')) {
      return 'flexibility';
    }
    
    // Core exercises
    if (bodyPart.includes('waist') || name.includes('plank') || name.includes('crunch')) {
      return 'core';
    }
    
    // Default to strength
    return 'strength';
  }

  private extractTargetMuscles(apiExercise: ExerciseDBResponse): string[] {
    const muscles = apiExercise.targetMuscles || [];

    // Add secondary muscles based on body part and exercise type
    const bodyPart = apiExercise.bodyParts?.[0]?.toLowerCase() || '';
    const name = apiExercise.name.toLowerCase();
    
    if (bodyPart === 'chest') {
      muscles.push('pectorals', 'anterior deltoids');
    } else if (bodyPart === 'back') {
      muscles.push('latissimus dorsi', 'rhomboids', 'middle trapezius');
    } else if (bodyPart === 'shoulders') {
      muscles.push('deltoids', 'rotator cuff');
    } else if (bodyPart === 'upper arms') {
      if (name.includes('bicep')) {
        muscles.push('biceps brachii');
      } else if (name.includes('tricep')) {
        muscles.push('triceps brachii');
      }
    } else if (bodyPart === 'lower legs') {
      muscles.push('calves', 'tibialis anterior');
    } else if (bodyPart === 'upper legs') {
      muscles.push('quadriceps', 'hamstrings', 'glutes');
    }
    
    return [...new Set(muscles)]; // Remove duplicates
  }

  private normalizeEquipment(equipment: string): string {
    const equipmentMap: Record<string, string> = {
      'body weight': 'bodyweight',
      'assisted': 'assisted',
      'band': 'resistance band',
      'barbell': 'barbell',
      'dumbbell': 'dumbbell',
      'cable': 'cable machine',
      'machine': 'machine',
      'kettlebell': 'kettlebell',
      'stability ball': 'stability ball',
      'medicine ball': 'medicine ball',
      'foam roll': 'foam roller',
      'bosu ball': 'bosu ball',
      'ez barbell': 'ez bar',
      'hammer': 'hammer',
      'leverage machine': 'leverage machine',
      'olympic barbell': 'olympic barbell',
      'resistance band': 'resistance band',
      'rope': 'rope',
      'skierg machine': 'ski erg',
      'sled machine': 'sled',
      'smith machine': 'smith machine',
      'stationary bike': 'stationary bike',
      'stepmill machine': 'stepmill',
      'tire': 'tire',
      'trap bar': 'trap bar',
      'upper body ergometer': 'upper body ergometer',
      'weighted': 'weighted'
    };
    
    return equipmentMap[equipment.toLowerCase()] || equipment;
  }

  private normalizeBodyPart(bodyPart: string): string {
    const bodyPartMap: Record<string, string> = {
      'back': 'back',
      'cardio': 'cardiovascular',
      'chest': 'chest',
      'lower arms': 'forearms',
      'lower legs': 'calves',
      'neck': 'neck',
      'shoulders': 'shoulders',
      'upper arms': 'arms',
      'upper legs': 'legs',
      'waist': 'core'
    };
    
    return bodyPartMap[bodyPart.toLowerCase()] || bodyPart;
  }

  private extractSecondaryMuscles(apiExercise: ExerciseDBResponse): string[] {
    // This would be more sophisticated in a real implementation
    // For now, return empty array as the API doesn't provide secondary muscles
    return [];
  }

  private determineDifficulty(apiExercise: ExerciseDBResponse): string {
    const name = apiExercise.name.toLowerCase();
    const equipment = apiExercise.equipments?.[0]?.toLowerCase() || 'bodyweight';
    
    // Advanced exercises
    if (name.includes('olympic') || name.includes('snatch') || name.includes('clean') ||
        name.includes('muscle up') || name.includes('handstand') || name.includes('pistol')) {
      return 'advanced';
    }
    
    // Beginner exercises
    if (equipment === 'body weight' || name.includes('assisted') || 
        name.includes('wall') || name.includes('knee')) {
      return 'beginner';
    }
    
    // Default to intermediate
    return 'intermediate';
  }

  private formatInstructions(instructions: string[]): string[] {
    return instructions.map(instruction => {
      // Capitalize first letter and ensure proper punctuation
      const formatted = instruction.charAt(0).toUpperCase() + instruction.slice(1);
      return formatted.endsWith('.') ? formatted : formatted + '.';
    });
  }

  private generateTips(apiExercise: ExerciseDBResponse): string[] {
    const tips: string[] = [];
    const name = apiExercise.name.toLowerCase();
    const bodyPart = apiExercise.bodyParts?.[0]?.toLowerCase() || '';
    
    // General tips based on body part
    if (bodyPart === 'back') {
      tips.push('Keep your core engaged throughout the movement');
      tips.push('Focus on squeezing your shoulder blades together');
    } else if (bodyPart === 'chest') {
      tips.push('Control the weight on both the lifting and lowering phases');
      tips.push('Keep your shoulders back and down');
    } else if (bodyPart === 'shoulders') {
      tips.push('Avoid using momentum to lift the weight');
      tips.push('Keep your core stable throughout the movement');
    }
    
    // Exercise-specific tips
    if (name.includes('squat')) {
      tips.push('Keep your knees in line with your toes');
      tips.push('Descend until your thighs are parallel to the floor');
    } else if (name.includes('deadlift')) {
      tips.push('Keep the bar close to your body throughout the lift');
      tips.push('Drive through your heels when lifting');
    }
    
    return tips;
  }

  private generateVariations(apiExercise: ExerciseDBResponse): string[] {
    const variations: string[] = [];
    const name = apiExercise.name.toLowerCase();
    
    // Common variations based on exercise type
    if (name.includes('push up') || name.includes('pushup')) {
      variations.push('Incline Push-up', 'Decline Push-up', 'Diamond Push-up');
    } else if (name.includes('squat')) {
      variations.push('Goblet Squat', 'Jump Squat', 'Single-leg Squat');
    } else if (name.includes('plank')) {
      variations.push('Side Plank', 'Plank with Leg Lift', 'Plank to Push-up');
    }
    
    return variations;
  }

  private generateSafetyNotes(apiExercise: ExerciseDBResponse): string[] {
    const safetyNotes: string[] = [];
    const name = apiExercise.name.toLowerCase();
    const bodyPart = apiExercise.bodyParts?.[0]?.toLowerCase() || '';

    // General safety notes
    safetyNotes.push('Warm up properly before performing this exercise');
    safetyNotes.push('Stop immediately if you feel any pain');

    // Specific safety notes based on exercise type
    if (name.includes('deadlift') || name.includes('squat')) {
      safetyNotes.push('Maintain proper spinal alignment throughout the movement');
    }

    if (bodyPart === 'shoulders') {
      safetyNotes.push('Be cautious with overhead movements if you have shoulder issues');
    }

    if (name.includes('jump') || name.includes('plyometric')) {
      safetyNotes.push('Land softly to reduce impact on joints');
    }

    return safetyNotes;
  }

  /**
   * Create workout steps from exercises with intelligent media selection
   */
  private async createWorkoutSteps(exercises: ExerciseDBResponse[], userProfile: any): Promise<Step[]> {
    const steps: Step[] = [];

    // Warm-up step
    steps.push({
      title: 'Warm-up',
      description: 'Perform 5-10 minutes of light cardio and dynamic stretching',
      duration: 10
    });

    // Exercise steps with intelligent media selection
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      const sets = this.calculateSets(userProfile.fitnessLevel || 'beginner');
      const reps = this.calculateReps(userProfile.fitnessLevel || 'beginner', exercise);

      // Get optimal media for this exercise
      const exerciseMedia = await this.mediaFallbackService.getStepMedia(
        exercise.name || `Exercise ${i + 1}`,
        exercise.bodyParts || [],
        'auto', // Let the service decide the best media type
        exercise.gifUrl // Pass original URL for validation
      );

      steps.push({
        title: exercise.name || `Exercise ${i + 1}`,
        description: `Perform ${sets} sets of ${reps} reps`,
        media: exerciseMedia.length > 0 ? exerciseMedia.slice(0, 1).map(media => ({
          type: media.type,
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
          caption: exercise.instructions?.join(' ') || media.caption || ''
        })) : [{
          type: 'gif',
          url: this.getValidImageUrl(exercise.gifUrl, exercise.name || `Exercise ${i + 1}`),
          caption: exercise.instructions?.join(' ') || ''
        }],
        duration: this.estimateExerciseDuration(sets, reps)
      });
    }

    // Cool-down step
    steps.push({
      title: 'Cool-down',
      description: 'Perform 5-10 minutes of static stretching',
      duration: 10
    });

    return steps;
  }

  /**
   * Generate personalized tips based on user profile
   */
  private generatePersonalizedTips(exercises: ExerciseDBResponse[], userProfile: any): string[] {
    const tips: string[] = [];
    const fitnessLevel = userProfile.fitnessLevel || 'beginner';
    const healthConditions = userProfile.healthConditions || [];
    const fitnessGoal = userProfile.fitnessGoal || 'general_fitness';

    // Fitness level specific tips
    if (fitnessLevel === 'beginner') {
      tips.push('Start with lighter weights and focus on proper form');
      tips.push('Rest 60-90 seconds between sets');
    } else if (fitnessLevel === 'advanced') {
      tips.push('Consider adding progressive overload techniques');
      tips.push('Focus on mind-muscle connection');
    }

    // Health condition specific tips
    if (healthConditions.includes('Knee Injury')) {
      tips.push('Avoid deep squats and high-impact movements');
    }
    if (healthConditions.includes('Back Pain')) {
      tips.push('Maintain neutral spine throughout all movements');
    }

    // Goal specific tips
    if (fitnessGoal === 'Lose Weight') {
      tips.push('Keep rest periods short to maintain elevated heart rate');
    } else if (fitnessGoal === 'Gain Muscle') {
      tips.push('Focus on controlled movements and full range of motion');
    }

    return tips;
  }

  /**
   * Determine difficulty level based on user profile
   */
  private determineDifficultyLevel(userProfile: any): 'Beginner' | 'Intermediate' | 'Advanced' {
    const fitnessLevel = userProfile.fitnessLevel || 'beginner';
    const activityLevel = userProfile.activityLevel || 'Sedentary';

    if (fitnessLevel === 'beginner' || activityLevel === 'Sedentary') {
      return 'Beginner';
    } else if (fitnessLevel === 'intermediate' || activityLevel === 'Moderate') {
      return 'Intermediate';
    } else {
      return 'Advanced';
    }
  }

  /**
   * Calculate workout duration
   */
  private calculateWorkoutDuration(exercises: ExerciseDBResponse[], userProfile: any): number {
    const warmupTime = 10;
    const cooldownTime = 10;
    const exerciseTime = exercises.length * 8; // 8 minutes per exercise average
    const restTime = exercises.length * 2; // 2 minutes rest between exercises

    return warmupTime + exerciseTime + restTime + cooldownTime;
  }

  /**
   * Estimate calories burned
   */
  private estimateCaloriesBurned(exercises: ExerciseDBResponse[], userProfile: any): number {
    const weight = userProfile.weight || 70; // Default 70kg
    const duration = this.calculateWorkoutDuration(exercises, userProfile);
    const intensity = this.getIntensityMultiplier(userProfile.fitnessLevel || 'beginner');

    // Basic calculation: 5 calories per minute per kg of body weight * intensity
    return Math.round((weight * duration * 0.08) * intensity);
  }

  /**
   * Generate workout title
   */
  private generateWorkoutTitle(exercises: ExerciseDBResponse[], userProfile: any): string {
    const primaryBodyPart = exercises[0]?.bodyParts?.[0] || 'Full Body';
    const fitnessGoal = userProfile.fitnessGoal || 'Fitness';

    return `${primaryBodyPart} Workout for ${fitnessGoal}`;
  }

  /**
   * Generate workout description
   */
  private generateWorkoutDescription(exercises: ExerciseDBResponse[], userProfile: any): string {
    const exerciseCount = exercises.length;
    const duration = this.calculateWorkoutDuration(exercises, userProfile);
    const difficulty = this.determineDifficultyLevel(userProfile);

    return `A ${difficulty.toLowerCase()} ${duration}-minute workout with ${exerciseCount} exercises designed for your fitness goals.`;
  }

  private calculateSets(fitnessLevel: string): number {
    switch (fitnessLevel) {
      case 'beginner': return 2;
      case 'intermediate': return 3;
      case 'advanced': return 4;
      default: return 3;
    }
  }

  private calculateReps(fitnessLevel: string, exercise: ExerciseDBResponse): string {
    const isCardio = exercise.bodyParts?.includes('cardio') || false;

    if (isCardio) return '30-60 seconds';

    switch (fitnessLevel) {
      case 'beginner': return '8-12';
      case 'intermediate': return '10-15';
      case 'advanced': return '12-20';
      default: return '10-15';
    }
  }

  private estimateExerciseDuration(sets: number, reps: string): number {
    // Estimate 30 seconds per set + 60 seconds rest between sets
    return (sets * 0.5) + ((sets - 1) * 1);
  }

  private getIntensityMultiplier(fitnessLevel: string): number {
    switch (fitnessLevel) {
      case 'beginner': return 0.8;
      case 'intermediate': return 1.0;
      case 'advanced': return 1.2;
      default: return 1.0;
    }
  }

  /**
   * Get a valid image URL with fallback options
   */
  private getValidImageUrl(originalUrl: string, exerciseName: string): string {
    // If no original URL, use placeholder
    if (!originalUrl) {
      console.warn(`⚠️ No URL provided for ${exerciseName}, using placeholder`);
      return this.getPlaceholderImageUrl(exerciseName);
    }

    // PRIORITY 1: Check if it's already a working Uploadcare URL (ExerciseDB now uses these)
    if (originalUrl.includes('ucarecdn.com')) {
      console.log(`✅ Using working ExerciseDB Uploadcare image: ${originalUrl}`);
      return originalUrl; // These work fine
    }

    // PRIORITY 2: Check if it's a working wger image (no longer used but kept for compatibility)
    if (originalUrl.includes('wger.de/media/')) {
      console.log(`✅ Using working wger image: ${originalUrl}`);
      return originalUrl; // wger images work fine
    }

    // PRIORITY 3: Check if the URL is from the old problematic CDN
    if (originalUrl.includes('cdn-exercisedb.vercel.app')) {
      console.warn(`⚠️ Old ExerciseDB API returns broken Vercel CDN URLs. Using placeholder for: ${exerciseName}`);
      return this.getAlternativeImageUrl(originalUrl, exerciseName);
    }

    // PRIORITY 4: For any other URL format, try to use it directly (trust ExerciseDB)
    console.log(`🔍 Trusting original ExerciseDB URL for ${exerciseName}: ${originalUrl}`);
    return originalUrl;
  }

  /**
   * Analyze exercise sources to determine primary source and image status
   */
  private analyzeExerciseSources(exercises: ExerciseDBResponse[]): {
    primarySource: string;
    hasWorkingImages: boolean;
    sourceCounts: Record<string, number>;
  } {
    const sourceCounts: Record<string, number> = {
      wger: 0,
      exercisedb: 0,
      generated: 0
    };

    let workingImageCount = 0;

    exercises.forEach(exercise => {
      // Determine source based on exercise ID format or URL patterns
      if (exercise.exerciseId?.startsWith('wger_')) {
        sourceCounts.wger++;
      } else if (exercise.exerciseId?.startsWith('exercisedb_')) {
        sourceCounts.exercisedb++;
      } else {
        // Default to exercisedb for legacy format
        sourceCounts.exercisedb++;
      }

      // Check if image is working (ExerciseDB now uses ucarecdn.com)
      if (exercise.gifUrl &&
          (exercise.gifUrl.includes('ucarecdn.com') ||
           exercise.gifUrl.includes('wger.de/media/') ||
           !exercise.gifUrl.includes('cdn-exercisedb.vercel.app'))) {
        workingImageCount++;
      }
    });

    // Determine primary source
    const primarySource = sourceCounts.wger > sourceCounts.exercisedb ? 'wger' : 'exercisedb';
    const hasWorkingImages = workingImageCount > 0;

    return {
      primarySource,
      hasWorkingImages,
      sourceCounts
    };
  }

  /**
   * Get alternative image URL or placeholder
   *
   * CURRENT ISSUE: ExerciseDB still returns broken Vercel CDN URLs
   * SOLUTION: Transform broken URLs to working Uploadcare URLs using known patterns
   */
  private getAlternativeImageUrl(originalUrl: string, exerciseName: string): string {
    // Extract the exercise ID from the broken URL
    const imageIdMatch = originalUrl.match(/\/images\/([^.]+)\.gif$/);
    const exerciseId = imageIdMatch ? imageIdMatch[1] : null;

    if (exerciseId) {
      console.log(`🔄 Transforming broken URL to working Uploadcare URL for: ${exerciseName}`);

      // Transform broken Vercel CDN URL to working Uploadcare URL
      // Pattern discovered: Vercel ID maps to Uploadcare UUID
      const uploadcareUrl = `https://ucarecdn.com/${exerciseId}/${exerciseId}.gif`;
      console.log(`✨ Transformed URL: ${originalUrl} -> ${uploadcareUrl}`);

      return uploadcareUrl;
    }

    console.warn(`⚠️ Could not extract exercise ID from URL: ${originalUrl}`);
    // For now, use descriptive placeholder that ensures frontend always works
    return this.getPlaceholderImageUrl(exerciseName);
  }

  /**
   * Generate a placeholder image URL or use alternative sources
   */
  private getPlaceholderImageUrl(exerciseName: string): string {
    // Use a placeholder service that generates images based on text
    const encodedName = encodeURIComponent(exerciseName);

    // Option 1: Use a fitness-themed placeholder service
    return `https://via.placeholder.com/400x300/FF5722/FFFFFF?text=Exercise+Demo`;

    // Option 2: Use exercise name in placeholder (can be too long)
    // return `https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=${encodedName}`;

    // Option 3: Use a generic fitness icon (would need to host these)
    // return `/assets/images/exercise-placeholder.gif`;
  }
}

// Export singleton instance
export const exerciseTransformer = new ExerciseTransformer();
