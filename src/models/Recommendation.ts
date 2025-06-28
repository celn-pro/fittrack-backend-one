// Modified recommendation model for hybrid approach
import {
  Recommendation as RecommendationType,
  RecommendationType as RecType,
  WorkoutRecommendation,
  NutritionRecommendation,
  Exercise,
  MacroTargets,
  MealPlan
} from '../types/recommendation.types';

/**
 * Base Recommendation Model
 */
export abstract class Recommendation implements RecommendationType {
  id: string;
  userId: string;
  type: RecType;
  title: string;
  description: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;

  // Tracking and analytics
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  rating?: number; // 1-5 stars
  feedback?: string;
  viewCount: number;
  shareCount: number;
  
  // Source tracking for hybrid approach
  source: 'ai_generated' | 'api_based' | 'rule_based' | 'expert_curated';
  confidence: number; // 0-1 confidence score
  version: string;

  constructor(data: Partial<RecommendationType> & { 
    id: string; 
    userId: string; 
    type: RecType; 
    title: string; 
    description: string; 
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.createdAt = data.createdAt || new Date();
    if (data.expiresAt !== undefined) {
      this.expiresAt = data.expiresAt;
    }
    this.metadata = data.metadata || {};
    
    // Initialize tracking fields
    this.isActive = true;
    this.isCompleted = false;
    this.viewCount = 0;
    this.shareCount = 0;
    this.source = 'ai_generated';
    this.confidence = 1.0;
    this.version = '1.0';
  }

  /**
   * Mark recommendation as viewed
   */
  markAsViewed(): void {
    this.viewCount++;
    this.metadata!.lastViewedAt = new Date();
  }

  /**
   * Mark recommendation as completed
   */
  markAsCompleted(rating?: number, feedback?: string): void {
    this.isCompleted = true;
    this.completedAt = new Date();
    if (rating) this.rating = rating;
    if (feedback) this.feedback = feedback;
  }

  /**
   * Mark recommendation as shared
   */
  markAsShared(): void {
    this.shareCount++;
    this.metadata!.lastSharedAt = new Date();
  }

  /**
   * Check if recommendation is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Get recommendation age in days
   */
  getAgeInDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Update metadata
   */
  updateMetadata(updates: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...updates };
  }

  /**
   * Serialize for API response
   */
  toJSON(): RecommendationType {
    const result: RecommendationType = {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      description: this.description,
      createdAt: this.createdAt,
      metadata: {
        ...this.metadata,
        isActive: this.isActive,
        isCompleted: this.isCompleted,
        completedAt: this.completedAt,
        rating: this.rating,
        feedback: this.feedback,
        viewCount: this.viewCount,
        shareCount: this.shareCount,
        source: this.source,
        confidence: this.confidence,
        version: this.version
      }
    };

    if (this.expiresAt !== undefined) {
      result.expiresAt = this.expiresAt;
    }

    return result;
  }

  /**
   * Create a copy of the recommendation with new ID
   */
  abstract clone(newId: string): Recommendation;

  /**
   * Validate recommendation data
   */
  abstract validate(): { isValid: boolean; errors: string[] };
}

/**
 * Workout Recommendation Model
 */
export class WorkoutRecommendationModel extends Recommendation implements WorkoutRecommendation {
  override type: 'workout' = 'workout';
  exercises: Exercise[];
  estimatedDuration: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  targetMuscles: string[];
  equipment: string[];
  warmUp?: Exercise[];
  coolDown?: Exercise[];
  alternatives?: Exercise[];

  // Progress tracking
  exercisesCompleted: number;
  actualDuration?: number;
  caloriesBurned?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  perceivedExertion?: number; // 1-10 scale

  constructor(data: Partial<WorkoutRecommendation> & {
    id: string;
    userId: string;
    title: string;
    description: string;
    exercises: Exercise[];
    estimatedDuration: number;
    difficulty: 'easy' | 'moderate' | 'hard';
    targetMuscles: string[];
    equipment: string[];
  }) {
    super({ ...data, type: 'workout' });
    this.exercises = data.exercises;
    this.estimatedDuration = data.estimatedDuration;
    this.difficulty = data.difficulty;
    this.targetMuscles = data.targetMuscles;
    this.equipment = data.equipment;
    if (data.warmUp !== undefined) {
      this.warmUp = data.warmUp;
    }
    if (data.coolDown !== undefined) {
      this.coolDown = data.coolDown;
    }
    if (data.alternatives !== undefined) {
      this.alternatives = data.alternatives;
    }
    this.exercisesCompleted = 0;
  }

  /**
   * Mark exercise as completed
   */
  completeExercise(exerciseId: string, actualSets?: number, actualReps?: string): void {
    const exercise = this.exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      this.exercisesCompleted++;
      this.updateMetadata({
        [`exercise_${exerciseId}_completed`]: true,
        [`exercise_${exerciseId}_completedAt`]: new Date(),
        [`exercise_${exerciseId}_actualSets`]: actualSets,
        [`exercise_${exerciseId}_actualReps`]: actualReps
      });
    }
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    return (this.exercisesCompleted / this.exercises.length) * 100;
  }

  /**
   * Get remaining exercises
   */
  getRemainingExercises(): Exercise[] {
    const completedExerciseIds = Object.keys(this.metadata || {})
      .filter(key => key.includes('_completed') && this.metadata?.[key] === true)
      .map(key => key.replace('exercise_', '').replace('_completed', ''));

    return this.exercises.filter(ex => !completedExerciseIds.includes(ex.id));
  }

  clone(newId: string): WorkoutRecommendationModel {
    return new WorkoutRecommendationModel({
      ...this.toJSON(),
      id: newId,
      createdAt: new Date()
    });
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.exercises || this.exercises.length === 0) {
      errors.push('At least one exercise is required');
    }
    
    if (this.estimatedDuration <= 0) {
      errors.push('Estimated duration must be positive');
    }
    
    if (!this.targetMuscles || this.targetMuscles.length === 0) {
      errors.push('At least one target muscle is required');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  override toJSON(): WorkoutRecommendation {
    const result: WorkoutRecommendation = {
      ...super.toJSON(),
      type: 'workout',
      exercises: this.exercises,
      estimatedDuration: this.estimatedDuration,
      difficulty: this.difficulty,
      targetMuscles: this.targetMuscles,
      equipment: this.equipment
    };

    // Only add optional properties if they exist
    if (this.warmUp !== undefined) {
      result.warmUp = this.warmUp;
    }
    if (this.coolDown !== undefined) {
      result.coolDown = this.coolDown;
    }
    if (this.alternatives !== undefined) {
      result.alternatives = this.alternatives;
    }

    return result;
  }
}

/**
 * Nutrition Recommendation Model
 */
export class NutritionRecommendationModel extends Recommendation implements NutritionRecommendation {
  override type: 'nutrition' = 'nutrition';
  dailyCalories: number;
  macroTargets: MacroTargets;
  mealPlan: MealPlan;
  hydrationGoal: number;
  supplements?: string[];
  nutritionTips?: string[];

  // Progress tracking
  caloriesConsumed: number;
  macrosConsumed: {
    protein: number;
    carbs: number;
    fats: number;
  };
  mealsCompleted: number;
  waterIntake: number;

  constructor(data: Partial<NutritionRecommendation> & {
    id: string;
    userId: string;
    title: string;
    description: string;
    dailyCalories: number;
    macroTargets: MacroTargets;
    mealPlan: MealPlan;
    hydrationGoal: number;
  }) {
    super({ ...data, type: 'nutrition' });
    this.dailyCalories = data.dailyCalories;
    this.macroTargets = data.macroTargets;
    this.mealPlan = data.mealPlan;
    this.hydrationGoal = data.hydrationGoal;
    if (data.supplements !== undefined) {
      this.supplements = data.supplements;
    }
    if (data.nutritionTips !== undefined) {
      this.nutritionTips = data.nutritionTips;
    }
    
    // Initialize progress tracking
    this.caloriesConsumed = 0;
    this.macrosConsumed = { protein: 0, carbs: 0, fats: 0 };
    this.mealsCompleted = 0;
    this.waterIntake = 0;
  }

  /**
   * Log meal consumption
   */
  logMeal(mealType: string, calories: number, macros: { protein: number; carbs: number; fats: number }): void {
    this.caloriesConsumed += calories;
    this.macrosConsumed.protein += macros.protein;
    this.macrosConsumed.carbs += macros.carbs;
    this.macrosConsumed.fats += macros.fats;
    this.mealsCompleted++;
    
    this.updateMetadata({
      [`meal_${mealType}_logged`]: true,
      [`meal_${mealType}_loggedAt`]: new Date(),
      [`meal_${mealType}_calories`]: calories,
      [`meal_${mealType}_macros`]: macros
    });
  }

  /**
   * Log water intake
   */
  logWaterIntake(amount: number): void {
    this.waterIntake += amount;
    this.updateMetadata({
      waterIntakeLog: [...(this.metadata?.waterIntakeLog || []), {
        amount,
        timestamp: new Date()
      }]
    });
  }

  /**
   * Get calorie adherence percentage
   */
  getCalorieAdherence(): number {
    return Math.min((this.caloriesConsumed / this.dailyCalories) * 100, 100);
  }

  /**
   * Get hydration adherence percentage
   */
  getHydrationAdherence(): number {
    return Math.min((this.waterIntake / this.hydrationGoal) * 100, 100);
  }

  clone(newId: string): NutritionRecommendationModel {
    return new NutritionRecommendationModel({
      ...this.toJSON(),
      id: newId,
      createdAt: new Date()
    });
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (this.dailyCalories <= 0) {
      errors.push('Daily calories must be positive');
    }
    
    if (!this.macroTargets) {
      errors.push('Macro targets are required');
    }
    
    if (this.hydrationGoal <= 0) {
      errors.push('Hydration goal must be positive');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  override toJSON(): NutritionRecommendation {
    const result: NutritionRecommendation = {
      ...super.toJSON(),
      type: 'nutrition',
      dailyCalories: this.dailyCalories,
      macroTargets: this.macroTargets,
      mealPlan: this.mealPlan,
      hydrationGoal: this.hydrationGoal
    };

    // Only add optional properties if they exist
    if (this.supplements !== undefined) {
      result.supplements = this.supplements;
    }
    if (this.nutritionTips !== undefined) {
      result.nutritionTips = this.nutritionTips;
    }

    return result;
  }
}

/**
 * Factory for creating recommendation instances
 */
export class RecommendationFactory {
  static create(data: any): Recommendation {
    switch (data.type) {
      case 'workout':
        return new WorkoutRecommendationModel(data);
      case 'nutrition':
        return new NutritionRecommendationModel(data);
      default:
        throw new Error(`Unknown recommendation type: ${data.type}`);
    }
  }

  static createWorkout(data: Partial<WorkoutRecommendation> & {
    id: string;
    userId: string;
    title: string;
    description: string;
    exercises: Exercise[];
    estimatedDuration: number;
    difficulty: 'easy' | 'moderate' | 'hard';
    targetMuscles: string[];
    equipment: string[];
  }): WorkoutRecommendationModel {
    return new WorkoutRecommendationModel(data);
  }

  static createNutrition(data: Partial<NutritionRecommendation> & {
    id: string;
    userId: string;
    title: string;
    description: string;
    dailyCalories: number;
    macroTargets: MacroTargets;
    mealPlan: MealPlan;
    hydrationGoal: number;
  }): NutritionRecommendationModel {
    return new NutritionRecommendationModel(data);
  }
}
