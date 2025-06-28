// Rule-based hydration recommendations
import { hydrationCalculator } from '../../utils/calculators/hydrationCalculator';
import { EnhancedRecommendation } from '../../utils/transformers/exerciseTransformer';

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

export class HydrationEngine {
  /**
   * Generate hydration recommendations based on user profile
   */
  async generateHydrationRecommendation(user: IUser): Promise<EnhancedRecommendation> {
    try {
      // Validate user profile
      this.validateUserProfile(user);

      // Calculate daily water goal
      const dailyWaterGoal = this.calculateDailyWaterGoal(user);

      // Generate hydration schedule
      const hydrationSchedule = this.generateHydrationSchedule(dailyWaterGoal);

      // Generate hydration tips
      const tips = this.generateHydrationTips(user);

      // Create hydration recommendation
      const recommendation: EnhancedRecommendation = {
        id: this.generateRecommendationId(),
        category: 'hydration',
        title: 'Daily Hydration Plan',
        description: this.generateHydrationDescription(user, dailyWaterGoal),
        dailyGoalMl: dailyWaterGoal,
        tips,
        reminders: this.generateReminders(),
        personalizedTips: this.generatePersonalizedHydrationTips(user)
      };

      return recommendation;
    } catch (error) {
      console.error('Error generating hydration recommendation:', error);
      throw new Error(`Failed to generate hydration recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate user profile for hydration generation
   */
  private validateUserProfile(user: IUser): void {
    if (!user.weight || user.weight < 30 || user.weight > 300) {
      throw new Error('Invalid weight: must be between 30 and 300 kg');
    }
  }

  /**
   * Calculate daily water goal based on user profile
   */
  private calculateDailyWaterGoal(user: IUser): number {
    const weight = user.weight || 70;
    const activityLevel = user.activityLevel || 'Moderate';
    const fitnessGoal = user.fitnessGoal || 'Maintain Health';

    // Base water needs: 35ml per kg body weight
    let dailyGoal = weight * 35;

    // Activity level adjustments
    const activityAdjustments: Record<string, number> = {
      'Sedentary': 0,
      'Moderate': 250,
      'Active': 500
    };

    dailyGoal += activityAdjustments[activityLevel] || 250;

    // Goal adjustments
    if (fitnessGoal === 'Lose Weight') {
      dailyGoal += 300; // Extra water helps with metabolism
    } else if (fitnessGoal === 'Gain Muscle') {
      dailyGoal += 200; // Muscle tissue needs more water
    }

    // Health condition adjustments
    if (user.healthConditions?.includes('Diabetes')) {
      dailyGoal += 200; // Diabetes increases water needs
    }

    return Math.round(dailyGoal);
  }

  private generateHydrationSchedule(dailyGoal: number): Array<{time: string, amount: number, description: string}> {
    const schedule = [];
    const hourlyAmount = dailyGoal / 16; // Spread over 16 waking hours

    // Wake up
    schedule.push({
      time: '07:00',
      amount: Math.round(hourlyAmount * 2 * 100) / 100,
      description: 'Start your day with water to rehydrate after sleep'
    });

    // Pre-breakfast
    schedule.push({
      time: '07:30',
      amount: Math.round(hourlyAmount * 100) / 100,
      description: 'Before breakfast to aid digestion'
    });

    // Mid-morning
    schedule.push({
      time: '10:00',
      amount: Math.round(hourlyAmount * 1.5 * 100) / 100,
      description: 'Mid-morning hydration boost'
    });

    // Pre-lunch
    schedule.push({
      time: '12:00',
      amount: Math.round(hourlyAmount * 100) / 100,
      description: 'Before lunch to prepare for digestion'
    });

    // Afternoon
    schedule.push({
      time: '15:00',
      amount: Math.round(hourlyAmount * 1.5 * 100) / 100,
      description: 'Afternoon energy and focus boost'
    });

    // Pre-workout (if applicable)
    schedule.push({
      time: '17:00',
      amount: Math.round(hourlyAmount * 2 * 100) / 100,
      description: 'Pre-workout hydration'
    });

    // Post-workout
    schedule.push({
      time: '18:30',
      amount: Math.round(hourlyAmount * 2 * 100) / 100,
      description: 'Post-workout recovery hydration'
    });

    // Evening
    schedule.push({
      time: '20:00',
      amount: Math.round(hourlyAmount * 100) / 100,
      description: 'Evening hydration (stop 2 hours before bed)'
    });

    return schedule;
  }

  private generateHydrationTips(userProfile: UserProfile): string[] {
    const tips = [
      'Drink water first thing in the morning',
      'Keep a water bottle with you throughout the day',
      'Set regular reminders to drink water',
      'Monitor your urine color - aim for pale yellow',
      'Drink water before, during, and after exercise'
    ];

    const { goals, activityLevel, environment } = userProfile;

    if (goals.includes('weight_loss')) {
      tips.push('Drink water before meals to help with portion control');
    }

    if (activityLevel === 'very_active' || activityLevel === 'extremely_active') {
      tips.push('Increase water intake on workout days');
      tips.push('Consider electrolyte replacement for intense workouts');
    }

    if (environment?.temperature > 25) {
      tips.push('Increase water intake in hot weather');
      tips.push('Drink cool water to help regulate body temperature');
    }

    tips.push('Eat water-rich foods like fruits and vegetables');
    tips.push('Limit caffeine and alcohol as they can be dehydrating');

    return tips;
  }

  private generateReminders(): Array<{time: string, message: string}> {
    return [
      {
        time: '08:00',
        message: '🌅 Good morning! Start your day with a glass of water'
      },
      {
        time: '10:30',
        message: '💧 Mid-morning hydration check - time for some water!'
      },
      {
        time: '13:00',
        message: '🥤 Lunch time hydration - don\'t forget your water'
      },
      {
        time: '15:30',
        message: '⚡ Afternoon energy boost - drink some water'
      },
      {
        time: '17:30',
        message: '🏃‍♀️ Pre-workout hydration time'
      },
      {
        time: '19:00',
        message: '🌆 Evening hydration - keep up the good work!'
      }
    ];
  }

  private generateRecommendationId(): string {
    return `hydration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate hydration schedule
   */
  private generateHydrationSchedule(dailyGoal: number): Array<{time: string, amount: number, description: string}> {
    const hourlyAmount = Math.round(dailyGoal / 8); // Spread over 8 key times

    return [
      {
        time: '07:00',
        amount: hourlyAmount,
        description: 'Start your day with water to rehydrate after sleep'
      },
      {
        time: '09:00',
        amount: hourlyAmount,
        description: 'Mid-morning hydration boost'
      },
      {
        time: '12:00',
        amount: hourlyAmount,
        description: 'Lunch time hydration'
      },
      {
        time: '15:00',
        amount: hourlyAmount,
        description: 'Afternoon energy and focus boost'
      },
      {
        time: '17:00',
        amount: hourlyAmount,
        description: 'Pre-workout hydration'
      },
      {
        time: '19:00',
        amount: hourlyAmount,
        description: 'Post-workout recovery hydration'
      },
      {
        time: '21:00',
        amount: hourlyAmount,
        description: 'Evening hydration (stop 2 hours before bed)'
      },
      {
        time: 'Throughout day',
        amount: dailyGoal - (hourlyAmount * 7),
        description: 'Additional water as needed'
      }
    ];
  }

  /**
   * Generate hydration tips
   */
  private generateHydrationTips(user: IUser): string[] {
    const tips = [
      'Drink water first thing in the morning',
      'Keep a water bottle with you throughout the day',
      'Monitor your urine color - aim for pale yellow',
      'Drink water before, during, and after exercise',
      'Eat water-rich foods like fruits and vegetables'
    ];

    // Activity-specific tips
    if (user.activityLevel === 'Active') {
      tips.push('Increase water intake on workout days');
      tips.push('Consider electrolyte replacement for intense workouts');
    }

    // Goal-specific tips
    if (user.fitnessGoal === 'Lose Weight') {
      tips.push('Drink water before meals to help with portion control');
    }

    return tips;
  }

  /**
   * Generate hydration reminders
   */
  private generateReminders(): string[] {
    return [
      'Set regular water reminders on your phone',
      'Use a marked water bottle to track intake',
      'Drink a glass of water with each meal',
      'Replace one sugary drink with water each day',
      'Listen to your thirst cues'
    ];
  }

  /**
   * Generate personalized hydration tips
   */
  private generatePersonalizedHydrationTips(user: IUser): string[] {
    const tips: string[] = [];
    const age = user.age || 30;

    // Age-specific tips
    if (age > 50) {
      tips.push('Older adults may have reduced thirst sensation - drink regularly');
    }

    // Health condition tips
    if (user.healthConditions?.includes('Diabetes')) {
      tips.push('Monitor blood sugar levels as hydration affects glucose');
    }

    if (user.healthConditions?.includes('Hypertension')) {
      tips.push('Adequate hydration helps maintain healthy blood pressure');
    }

    // Activity level tips
    if (user.activityLevel === 'Active') {
      tips.push('Weigh yourself before and after workouts to gauge fluid loss');
    }

    return tips;
  }

  /**
   * Generate hydration description
   */
  private generateHydrationDescription(user: IUser, dailyGoal: number): string {
    const activityLevel = user.activityLevel || 'moderate';
    return `A personalized hydration plan with a daily goal of ${dailyGoal}ml for ${activityLevel} activity levels.`;
  }

  /**
   * Generate recommendation ID
   */
  private generateRecommendationId(): string {
    return `hydration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
