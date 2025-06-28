// Water intake formulas utility
import { PhysicalStats } from './bmrCalculator';

export interface HydrationFactors {
  temperature?: number; // Celsius
  humidity?: number; // Percentage
  altitude?: number; // Meters above sea level
  exerciseDuration?: number; // Minutes
  exerciseIntensity?: 'low' | 'moderate' | 'high' | 'very_high';
  sweatRate?: number; // Liters per hour
  caffeineIntake?: number; // mg per day
  alcoholIntake?: number; // standard drinks per day
}

export interface HydrationRecommendation {
  baseWaterNeeds: number; // Liters per day
  totalWaterNeeds: number; // Liters per day including adjustments
  preWorkoutHydration: number; // Liters
  duringWorkoutHydration: number; // Liters per hour
  postWorkoutHydration: number; // Liters
  electrolyteNeeds: boolean;
  recommendations: string[];
}

export class HydrationCalculator {
  /**
   * Calculate base water needs using multiple methods
   */
  calculateBaseWaterNeeds(physicalStats: PhysicalStats): number {
    const { weight } = physicalStats;
    
    // Method 1: 35ml per kg body weight (most common)
    const method1 = weight * 0.035;
    
    // Method 2: 8 glasses (2 liters) baseline + weight adjustment
    const method2 = 2 + ((weight - 70) * 0.02);
    
    // Method 3: Based on caloric intake (1ml per calorie, estimated)
    const estimatedCalories = this.estimateDailyCalories(physicalStats);
    const method3 = estimatedCalories / 1000;
    
    // Use the average of methods, with method 1 weighted more heavily
    const weightedAverage = (method1 * 0.5) + (method2 * 0.3) + (method3 * 0.2);
    
    // Ensure minimum of 1.5L and maximum of 4L for base needs
    return Math.max(1.5, Math.min(4.0, weightedAverage));
  }

  /**
   * Calculate comprehensive hydration needs with all factors
   */
  calculateComprehensiveHydration(
    physicalStats: PhysicalStats,
    activityLevel: string,
    factors: HydrationFactors = {}
  ): HydrationRecommendation {
    const baseWaterNeeds = this.calculateBaseWaterNeeds(physicalStats);
    
    let totalAdjustment = 0;
    const recommendations: string[] = [];
    
    // Activity level adjustment
    const activityAdjustment = this.getActivityAdjustment(activityLevel);
    totalAdjustment += activityAdjustment;
    
    if (activityAdjustment > 0) {
      recommendations.push(`Increased hydration needed for ${activityLevel} activity level`);
    }
    
    // Environmental adjustments
    if (factors.temperature !== undefined) {
      const tempAdjustment = this.getTemperatureAdjustment(factors.temperature);
      totalAdjustment += tempAdjustment;
      
      if (tempAdjustment > 0) {
        recommendations.push(`Additional ${(tempAdjustment * 1000).toFixed(0)}ml needed for hot weather`);
      }
    }
    
    if (factors.humidity !== undefined) {
      const humidityAdjustment = this.getHumidityAdjustment(factors.humidity);
      totalAdjustment += humidityAdjustment;
      
      if (humidityAdjustment > 0) {
        recommendations.push(`Extra hydration needed for high humidity`);
      }
    }
    
    if (factors.altitude !== undefined) {
      const altitudeAdjustment = this.getAltitudeAdjustment(factors.altitude);
      totalAdjustment += altitudeAdjustment;
      
      if (altitudeAdjustment > 0) {
        recommendations.push(`Increased hydration needed at high altitude`);
      }
    }
    
    // Exercise-specific adjustments
    let exerciseHydration = 0;
    if (factors.exerciseDuration && factors.exerciseIntensity) {
      exerciseHydration = this.calculateExerciseHydration(
        factors.exerciseDuration,
        factors.exerciseIntensity,
        physicalStats.weight,
        factors.sweatRate
      );
      totalAdjustment += exerciseHydration;
      
      recommendations.push(`Additional ${(exerciseHydration * 1000).toFixed(0)}ml needed for exercise`);
    }
    
    // Dehydrating substances
    if (factors.caffeineIntake && factors.caffeineIntake > 200) {
      const caffeineAdjustment = this.getCaffeineAdjustment(factors.caffeineIntake);
      totalAdjustment += caffeineAdjustment;
      recommendations.push('Extra water needed to offset caffeine intake');
    }
    
    if (factors.alcoholIntake && factors.alcoholIntake > 0) {
      const alcoholAdjustment = this.getAlcoholAdjustment(factors.alcoholIntake);
      totalAdjustment += alcoholAdjustment;
      recommendations.push('Additional hydration needed to offset alcohol consumption');
    }
    
    const totalWaterNeeds = baseWaterNeeds + totalAdjustment;
    
    // Calculate workout-specific hydration
    const workoutHydration = this.calculateWorkoutHydration(
      factors.exerciseDuration || 60,
      factors.exerciseIntensity || 'moderate',
      physicalStats.weight
    );
    
    return {
      baseWaterNeeds: Math.round(baseWaterNeeds * 100) / 100,
      totalWaterNeeds: Math.round(totalWaterNeeds * 100) / 100,
      preWorkoutHydration: workoutHydration.preWorkout,
      duringWorkoutHydration: workoutHydration.duringWorkout,
      postWorkoutHydration: workoutHydration.postWorkout,
      electrolyteNeeds: this.needsElectrolytes(factors),
      recommendations
    };
  }

  /**
   * Calculate hydration needs for specific exercise session
   */
  calculateExerciseHydration(
    duration: number,
    intensity: string,
    bodyWeight: number,
    sweatRate?: number
  ): number {
    // Estimate sweat rate if not provided
    const estimatedSweatRate = sweatRate || this.estimateSweatRate(intensity, bodyWeight);
    
    // Calculate fluid loss during exercise
    const fluidLoss = estimatedSweatRate * (duration / 60);
    
    // Recommend replacing 150% of fluid loss
    return fluidLoss * 1.5;
  }

  /**
   * Calculate workout-specific hydration timing
   */
  calculateWorkoutHydration(
    duration: number,
    intensity: string,
    bodyWeight: number
  ): {
    preWorkout: number;
    duringWorkout: number;
    postWorkout: number;
  } {
    const sweatRate = this.estimateSweatRate(intensity, bodyWeight);
    const totalFluidLoss = sweatRate * (duration / 60);
    
    return {
      preWorkout: Math.round((0.4 + (bodyWeight * 0.005)) * 100) / 100, // 400ml + 5ml per kg
      duringWorkoutHydration: Math.round(sweatRate * 100) / 100, // Per hour
      postWorkout: Math.round(totalFluidLoss * 1.5 * 100) / 100 // 150% of losses
    };
  }

  /**
   * Check if electrolyte replacement is needed
   */
  needsElectrolytes(factors: HydrationFactors): boolean {
    // Electrolytes needed for:
    // - Exercise > 60 minutes
    // - High intensity exercise > 45 minutes
    // - Hot/humid conditions
    // - High sweat rate
    
    if (factors.exerciseDuration && factors.exerciseDuration > 60) return true;
    
    if (factors.exerciseDuration && factors.exerciseDuration > 45 && 
        factors.exerciseIntensity && ['high', 'very_high'].includes(factors.exerciseIntensity)) {
      return true;
    }
    
    if (factors.temperature && factors.temperature > 25) return true;
    if (factors.humidity && factors.humidity > 70) return true;
    if (factors.sweatRate && factors.sweatRate > 1.2) return true;
    
    return false;
  }

  /**
   * Generate hydration schedule for the day
   */
  generateHydrationSchedule(totalWaterNeeds: number): Array<{
    time: string;
    amount: number;
    type: 'water' | 'electrolyte';
    note: string;
  }> {
    const schedule = [];
    const hourlyAmount = totalWaterNeeds / 16; // Spread over 16 waking hours
    
    // Morning hydration
    schedule.push({
      time: '07:00',
      amount: Math.round(hourlyAmount * 2 * 100) / 100,
      type: 'water' as const,
      note: 'Rehydrate after sleep'
    });
    
    // Regular intervals throughout the day
    const times = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
    times.forEach(time => {
      schedule.push({
        time,
        amount: Math.round(hourlyAmount * 100) / 100,
        type: 'water' as const,
        note: 'Regular hydration'
      });
    });
    
    return schedule;
  }

  private estimateDailyCalories(physicalStats: PhysicalStats): number {
    // Rough estimate for hydration calculation
    const { weight, height, age, gender } = physicalStats;
    
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    return bmr * 1.55; // Assume moderate activity
  }

  private getActivityAdjustment(activityLevel: string): number {
    const adjustments: Record<string, number> = {
      'sedentary': 0,
      'lightly_active': 0.3,
      'moderately_active': 0.5,
      'very_active': 0.8,
      'extremely_active': 1.2
    };
    
    return adjustments[activityLevel] || 0.5;
  }

  private getTemperatureAdjustment(temperature: number): number {
    if (temperature <= 20) return 0;
    if (temperature <= 25) return 0.2;
    if (temperature <= 30) return 0.5;
    if (temperature <= 35) return 0.8;
    return 1.2; // Very hot conditions
  }

  private getHumidityAdjustment(humidity: number): number {
    if (humidity <= 50) return 0;
    if (humidity <= 70) return 0.1;
    if (humidity <= 85) return 0.3;
    return 0.5; // Very humid conditions
  }

  private getAltitudeAdjustment(altitude: number): number {
    if (altitude < 1500) return 0;
    if (altitude < 2500) return 0.3;
    if (altitude < 3500) return 0.5;
    return 0.8; // Very high altitude
  }

  private getCaffeineAdjustment(caffeineIntake: number): number {
    // Mild diuretic effect
    return Math.min(0.5, (caffeineIntake - 200) / 400);
  }

  private getAlcoholAdjustment(alcoholIntake: number): number {
    // Each drink requires additional hydration
    return alcoholIntake * 0.25;
  }

  private estimateSweatRate(intensity: string, bodyWeight: number): number {
    const baseRates: Record<string, number> = {
      'low': 0.5,      // L/hour
      'moderate': 0.8,
      'high': 1.2,
      'very_high': 1.8
    };
    
    const baseRate = baseRates[intensity] || 0.8;
    
    // Adjust for body weight (larger people tend to sweat more)
    const weightAdjustment = (bodyWeight - 70) * 0.01;
    
    return Math.max(0.3, baseRate + weightAdjustment);
  }
}

// Export singleton instance
export const hydrationCalculator = new HydrationCalculator();
