// Metabolic calculations utility for fitness recommendations
export interface PhysicalStats {
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: 'male' | 'female' | 'other';
  bodyFatPercentage?: number;
}

export interface BMRResult {
  bmr: number;
  method: string;
  accuracy: 'high' | 'medium' | 'low';
  confidence: number; // 0-1 confidence score
}

export interface UserMetrics {
  bmr: number;
  tdee: number;
  dailyCalorieGoal: number;
  dailyWaterGoal: number; // ml
  recommendedSleepHours: number;
  activityMultiplier: number;
  bmi: number;
  bmiCategory: string;
  idealWeightRange: { min: number; max: number };
}

export class BMRCalculator {
  /**
   * Calculate Basal Metabolic Rate using the most appropriate method
   */
  calculateBMR(physicalStats: PhysicalStats): number {
    const result = this.calculateBMRDetailed(physicalStats);
    return Math.round(result.bmr);
  }

  /**
   * Calculate BMR with detailed information about the method used
   */
  calculateBMRDetailed(physicalStats: PhysicalStats): BMRResult {
    const { weight, height, age, gender, bodyFatPercentage } = physicalStats;

    // Validate inputs
    if (weight <= 0 || height <= 0 || age <= 0) {
      throw new Error('Invalid physical stats: weight, height, and age must be positive');
    }

    // If body fat percentage is available, use Katch-McArdle formula (most accurate)
    if (bodyFatPercentage && bodyFatPercentage > 0 && bodyFatPercentage < 50) {
      const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
      const bmr = 370 + (21.6 * leanBodyMass);

      return {
        bmr,
        method: 'Katch-McArdle',
        accuracy: 'high',
        confidence: 0.95
      };
    }

    // Use Mifflin-St Jeor equation (more accurate than Harris-Benedict)
    let bmr: number;

    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender === 'female') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      // For 'other' gender, use average of male and female formulas
      const maleBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      const femaleBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      bmr = (maleBMR + femaleBMR) / 2;
    }

    return {
      bmr,
      method: 'Mifflin-St Jeor',
      accuracy: 'medium',
      confidence: 0.85
    };
  }

  /**
   * Calculate BMR using Harris-Benedict equation (legacy method)
   */
  calculateBMRHarrisBenedict(physicalStats: PhysicalStats): number {
    const { weight, height, age, gender } = physicalStats;
    
    let bmr: number;
    
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    return Math.round(bmr);
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   */
  calculateTDEE(physicalStats: PhysicalStats, activityLevel: string): number {
    const bmr = this.calculateBMR(physicalStats);
    const activityMultiplier = this.getActivityMultiplier(activityLevel);
    
    return Math.round(bmr * activityMultiplier);
  }

  /**
   * Calculate lean body mass
   */
  calculateLeanBodyMass(physicalStats: PhysicalStats): number {
    const { weight, bodyFatPercentage } = physicalStats;
    
    if (bodyFatPercentage && bodyFatPercentage > 0) {
      return weight * (1 - bodyFatPercentage / 100);
    }
    
    // Estimate using Boer formula if body fat is not available
    const { height, gender } = physicalStats;
    
    if (gender === 'male') {
      return (0.407 * weight) + (0.267 * height) - 19.2;
    } else {
      return (0.252 * weight) + (0.473 * height) - 48.3;
    }
  }

  /**
   * Calculate body fat percentage using BMI (rough estimate)
   */
  estimateBodyFatFromBMI(physicalStats: PhysicalStats): number {
    const { weight, height, age, gender } = physicalStats;
    const bmi = this.calculateBMI(physicalStats);
    
    let bodyFat: number;
    
    if (gender === 'male') {
      bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
      bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
    }
    
    // Ensure reasonable bounds
    return Math.max(5, Math.min(50, bodyFat));
  }

  /**
   * Calculate BMI (Body Mass Index)
   */
  calculateBMI(physicalStats: PhysicalStats): number {
    const { weight, height } = physicalStats;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  /**
   * Get BMI category
   */
  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  /**
   * Calculate ideal weight range
   */
  calculateIdealWeightRange(height: number, gender: 'male' | 'female'): { min: number; max: number } {
    const heightInMeters = height / 100;
    
    // Using BMI range of 18.5-24.9 for normal weight
    const minWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxWeight = 24.9 * (heightInMeters * heightInMeters);
    
    return {
      min: Math.round(minWeight),
      max: Math.round(maxWeight)
    };
  }

  /**
   * Calculate daily calorie needs for specific goals
   */
  calculateCaloriesForGoal(
    physicalStats: PhysicalStats,
    activityLevel: string,
    goal: 'maintain' | 'lose' | 'gain',
    rate: 'slow' | 'moderate' | 'fast' = 'moderate'
  ): number {
    const tdee = this.calculateTDEE(physicalStats, activityLevel);
    
    const adjustments = {
      lose: {
        slow: -250,    // 0.5 lbs/week
        moderate: -500, // 1 lb/week
        fast: -750     // 1.5 lbs/week
      },
      gain: {
        slow: 250,     // 0.5 lbs/week
        moderate: 500, // 1 lb/week
        fast: 750      // 1.5 lbs/week
      },
      maintain: {
        slow: 0,
        moderate: 0,
        fast: 0
      }
    };
    
    const adjustment = adjustments[goal][rate];
    return Math.round(tdee + adjustment);
  }

  /**
   * Calculate comprehensive user metrics for fitness recommendations
   */
  calculateUserMetrics(
    physicalStats: PhysicalStats,
    activityLevel: string,
    fitnessGoal: string = 'general_fitness'
  ): UserMetrics {
    const bmr = this.calculateBMR(physicalStats);
    const tdee = this.calculateTDEE(physicalStats, activityLevel);
    const bmi = this.calculateBMI(physicalStats);
    const bmiCategory = this.getBMICategory(bmi);
    const idealWeightRange = this.calculateIdealWeightRange(physicalStats.height, physicalStats.gender);

    // Calculate daily calorie goal based on fitness goal
    let dailyCalorieGoal = tdee;
    if (fitnessGoal === 'weight_loss' || fitnessGoal === 'Lose Weight') {
      dailyCalorieGoal = tdee - 500; // 500 calorie deficit
    } else if (fitnessGoal === 'muscle_gain' || fitnessGoal === 'Gain Muscle') {
      dailyCalorieGoal = tdee + 300; // 300 calorie surplus
    }

    // Calculate daily water goal (35ml per kg body weight + activity bonus)
    const baseWater = physicalStats.weight * 35; // ml
    const activityBonus = this.getActivityWaterBonus(activityLevel);
    const dailyWaterGoal = Math.round(baseWater + activityBonus);

    // Calculate recommended sleep hours based on age and activity
    const recommendedSleepHours = this.calculateRecommendedSleep(physicalStats.age, activityLevel);

    return {
      bmr,
      tdee,
      dailyCalorieGoal: Math.max(1200, dailyCalorieGoal), // Minimum 1200 calories
      dailyWaterGoal,
      recommendedSleepHours,
      activityMultiplier: this.getActivityMultiplier(activityLevel),
      bmi,
      bmiCategory,
      idealWeightRange
    };
  }

  /**
   * Calculate macronutrient needs
   */
  calculateMacronutrients(
    totalCalories: number,
    goal: 'endurance' | 'strength' | 'weight_loss' | 'muscle_gain' | 'general',
    bodyWeight: number
  ): {
    protein: { grams: number; calories: number; percentage: number };
    carbs: { grams: number; calories: number; percentage: number };
    fats: { grams: number; calories: number; percentage: number };
  } {
    let proteinPercentage: number;
    let carbPercentage: number;
    let fatPercentage: number;

    switch (goal) {
      case 'muscle_gain':
        proteinPercentage = 0.30;
        carbPercentage = 0.40;
        fatPercentage = 0.30;
        break;
      case 'weight_loss':
        proteinPercentage = 0.35;
        carbPercentage = 0.35;
        fatPercentage = 0.30;
        break;
      case 'endurance':
        proteinPercentage = 0.20;
        carbPercentage = 0.55;
        fatPercentage = 0.25;
        break;
      case 'strength':
        proteinPercentage = 0.25;
        carbPercentage = 0.45;
        fatPercentage = 0.30;
        break;
      default: // general
        proteinPercentage = 0.25;
        carbPercentage = 0.45;
        fatPercentage = 0.30;
    }

    const proteinCalories = totalCalories * proteinPercentage;
    const carbCalories = totalCalories * carbPercentage;
    const fatCalories = totalCalories * fatPercentage;

    return {
      protein: {
        grams: Math.round(proteinCalories / 4),
        calories: Math.round(proteinCalories),
        percentage: Math.round(proteinPercentage * 100)
      },
      carbs: {
        grams: Math.round(carbCalories / 4),
        calories: Math.round(carbCalories),
        percentage: Math.round(carbPercentage * 100)
      },
      fats: {
        grams: Math.round(fatCalories / 9),
        calories: Math.round(fatCalories),
        percentage: Math.round(fatPercentage * 100)
      }
    };
  }

  private getActivityMultiplier(activityLevel: string): number {
    const multipliers: Record<string, number> = {
      'Sedentary': 1.2,           // Little to no exercise
      'sedentary': 1.2,
      'Moderate': 1.375,          // Light exercise 1-3 days/week
      'lightly_active': 1.375,
      'moderately_active': 1.55,  // Moderate exercise 3-5 days/week
      'Active': 1.55,
      'very_active': 1.725,       // Hard exercise 6-7 days/week
      'extremely_active': 1.9     // Very hard exercise, physical job
    };

    return multipliers[activityLevel] || 1.55;
  }

  private getActivityWaterBonus(activityLevel: string): number {
    const bonuses: Record<string, number> = {
      'Sedentary': 0,
      'sedentary': 0,
      'Moderate': 250,
      'lightly_active': 250,
      'moderately_active': 500,
      'Active': 500,
      'very_active': 750,
      'extremely_active': 1000
    };

    return bonuses[activityLevel] || 250;
  }

  private calculateRecommendedSleep(age: number, activityLevel: string): number {
    let baseSleep = 8; // Default 8 hours

    // Age adjustments
    if (age < 18) baseSleep = 9;
    else if (age < 26) baseSleep = 8.5;
    else if (age > 65) baseSleep = 7.5;

    // Activity adjustments
    if (activityLevel === 'very_active' || activityLevel === 'extremely_active') {
      baseSleep += 0.5;
    }

    return Math.min(10, Math.max(6, baseSleep));
  }
}

// Export singleton instance
export const bmrCalculator = new BMRCalculator();
