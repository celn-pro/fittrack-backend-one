// Your recommendation types

/**
 * User Profile Types
 */
export interface UserProfile {
  userId: string;
  age: number;
  physicalStats: PhysicalStats;
  goals: WorkoutGoal[];
  fitnessLevel: FitnessLevel;
  activityLevel: ActivityLevel;
  dietaryRestrictions?: DietaryRestriction[];
  preferences?: UserPreferences;
  timeConstraints?: TimeConstraints;
  lifestyle?: LifestyleFactors;
  environment?: EnvironmentalFactors;
  sleepHistory?: SleepHistory;
  medicalHistory?: MedicalHistory;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PhysicalStats {
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female' | 'other';
  bodyFatPercentage?: number;
  muscleMass?: number; // kg
  boneDensity?: number;
  restingHeartRate?: number; // bpm
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
}

export type WorkoutGoal = 
  | 'weight_loss'
  | 'muscle_gain'
  | 'strength'
  | 'endurance'
  | 'flexibility'
  | 'general_fitness'
  | 'rehabilitation'
  | 'sports_performance';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type ActivityLevel = 
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type DietaryRestriction = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'low_carb'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'halal'
  | 'kosher';

export interface UserPreferences {
  preferredExercises?: string[];
  dislikedExercises?: string[];
  availableEquipment?: string[];
  workoutEnvironment?: 'home' | 'gym' | 'outdoor' | 'mixed';
  musicPreferences?: string[];
  workoutPartner?: boolean;
  intensityPreference?: 'low' | 'moderate' | 'high' | 'varied';
}

export interface TimeConstraints {
  preferredDuration?: 'short' | 'medium' | 'long'; // 30min, 60min, 90min+
  availableDays?: string[]; // ['monday', 'wednesday', 'friday']
  preferredTimes?: string[]; // ['morning', 'afternoon', 'evening']
  maxWorkoutsPerWeek?: number;
}

export interface LifestyleFactors {
  stressLevel?: 'low' | 'moderate' | 'high';
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  workSchedule?: 'regular' | 'shift' | 'irregular';
  travelFrequency?: 'never' | 'occasionally' | 'frequently';
  socialSupport?: 'low' | 'moderate' | 'high';
}

export interface EnvironmentalFactors {
  climate?: 'temperate' | 'tropical' | 'arid' | 'cold';
  altitude?: number; // meters above sea level
  airQuality?: 'good' | 'moderate' | 'poor';
  seasonality?: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface SleepHistory {
  averageSleepDuration?: number; // hours
  sleepEfficiency?: number; // percentage
  commonIssues?: string[]; // ['insomnia', 'sleep_apnea', 'restless_legs']
  bedtime?: string; // '22:30'
  wakeTime?: string; // '06:30'
}

export interface MedicalHistory {
  conditions?: string[];
  medications?: string[];
  injuries?: string[];
  allergies?: string[];
  lastCheckup?: Date;
  doctorApproval?: boolean;
}

/**
 * Recommendation Types
 */
export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  title: string;
  description: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export type RecommendationType = 'workout' | 'nutrition' | 'hydration' | 'sleep';

export interface WorkoutRecommendation extends Recommendation {
  type: 'workout';
  exercises: Exercise[];
  estimatedDuration: number; // minutes
  difficulty: 'easy' | 'moderate' | 'hard';
  targetMuscles: string[];
  equipment: string[];
  warmUp?: Exercise[];
  coolDown?: Exercise[];
  alternatives?: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'core' | 'balance';
  targetMuscles: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  bodyPart: string;
  secondaryMuscles?: string[];
  tips?: string[];
  variations?: string[];
  safetyNotes?: string[];
  recommendedSets?: number;
  recommendedReps?: string; // e.g., "8-12" or "30 seconds"
  restTime?: number; // seconds
  weight?: number; // kg
  progression?: {
    beginner: { sets: number; reps: string; weight?: number };
    intermediate: { sets: number; reps: string; weight?: number };
    advanced: { sets: number; reps: string; weight?: number };
  };
}

export interface NutritionRecommendation extends Recommendation {
  type: 'nutrition';
  dailyCalories: number;
  macroTargets: MacroTargets;
  mealPlan: MealPlan;
  hydrationGoal: number; // liters
  supplements?: string[];
  nutritionTips?: string[];
}

export interface MacroTargets {
  calories: number;
  protein: MacroNutrient;
  carbohydrates: MacroNutrient;
  fats: MacroNutrient;
}

export interface MacroNutrient {
  grams: number;
  calories: number;
  percentage: number;
}

export interface MealPlan {
  totalCalories: number;
  meals: Meal[];
  guidelines?: string[];
  shoppingList?: string[];
}

export interface Meal {
  type: string; // 'breakfast', 'lunch', 'dinner', 'snack'
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  suggestions: string[];
  recipes?: Recipe[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
  };
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
  substitutes?: string[];
}

export interface HydrationRecommendation extends Recommendation {
  type: 'hydration';
  dailyWaterGoal: number; // liters
  hydrationSchedule: Array<{
    time: string;
    amount: number;
    description: string;
  }>;
  tips: string[];
  reminders?: Array<{
    time: string;
    message: string;
  }>;
  electrolyteNeeds?: boolean;
}

export interface SleepRecommendation extends Recommendation {
  type: 'sleep';
  optimalSleepDuration: number; // hours
  sleepSchedule: {
    bedtime: string;
    wakeTime: string;
    sleepDuration: number;
    consistency: string[];
  };
  sleepHygieneTips: string[];
  bedtimeRoutine: Array<{
    time: string;
    activity: string;
    description: string;
  }>;
  wakeUpRoutine: Array<{
    time: string;
    activity: string;
    description: string;
  }>;
  sleepEnvironmentTips: string[];
}

/**
 * Progress Tracking Types
 */
export interface ProgressEntry {
  id: string;
  userId: string;
  recommendationId: string;
  date: Date;
  type: 'workout' | 'nutrition' | 'hydration' | 'sleep';
  completed: boolean;
  rating?: number; // 1-5 stars
  feedback?: string;
  metrics?: Record<string, number>;
  notes?: string;
}

export interface WorkoutProgress extends ProgressEntry {
  type: 'workout';
  exercisesCompleted: number;
  totalExercises: number;
  duration: number; // minutes
  caloriesBurned?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  perceivedExertion?: number; // 1-10 scale
}

export interface NutritionProgress extends ProgressEntry {
  type: 'nutrition';
  caloriesConsumed: number;
  macrosConsumed: {
    protein: number;
    carbs: number;
    fats: number;
  };
  mealsCompleted: number;
  totalMeals: number;
  waterIntake: number; // liters
}

export interface SleepProgress extends ProgressEntry {
  type: 'sleep';
  sleepDuration: number; // hours
  sleepEfficiency: number; // percentage
  bedtime: string;
  wakeTime: string;
  sleepQuality: number; // 1-10 scale
  timeToFallAsleep: number; // minutes
  nightWakeups: number;
}

/**
 * Analytics Types
 */
export interface UserAnalytics {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  workoutStats: {
    totalWorkouts: number;
    averageDuration: number;
    completionRate: number;
    favoriteExercises: string[];
    progressTrend: 'improving' | 'stable' | 'declining';
  };
  nutritionStats: {
    averageCalories: number;
    macroBalance: MacroTargets;
    hydrationRate: number;
    mealPlanAdherence: number;
  };
  sleepStats: {
    averageSleepDuration: number;
    averageSleepEfficiency: number;
    sleepConsistency: number;
    sleepQualityTrend: 'improving' | 'stable' | 'declining';
  };
  overallProgress: {
    goalProgress: Record<string, number>; // percentage completion
    streaks: Record<string, number>; // days
    achievements: string[];
  };
}
