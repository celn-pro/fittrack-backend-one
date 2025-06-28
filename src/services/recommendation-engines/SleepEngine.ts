// Rule-based sleep recommendations
import { sleepCalculator } from '../../utils/calculators/sleepCalculator';
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

export class SleepEngine {
  /**
   * Generate sleep recommendations based on user profile
   */
  async generateSleepRecommendation(user: IUser): Promise<EnhancedRecommendation> {
    try {
      // Validate user profile
      this.validateUserProfile(user);

      // Calculate optimal sleep duration
      const optimalSleepHours = this.calculateOptimalSleepDuration(user);

      // Generate sleep tips
      const sleepTips = this.generateSleepTips(user);

      // Create sleep recommendation
      const recommendation: EnhancedRecommendation = {
        id: this.generateRecommendationId(),
        category: 'rest',
        title: 'Optimal Sleep Plan',
        description: this.generateSleepDescription(user, optimalSleepHours),
        sleepGoalHours: optimalSleepHours,
        tips: sleepTips,
        reminders: this.generateSleepReminders(),
        personalizedTips: this.generatePersonalizedSleepTips(user)
      };

      return recommendation;
    } catch (error) {
      console.error('Error generating sleep recommendation:', error);
      throw new Error(`Failed to generate sleep recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateSleepSchedule(optimalDuration: number, lifestyle?: any): {
    bedtime: string;
    wakeTime: string;
    sleepDuration: number;
    consistency: string[];
  } {
    // Default schedule - can be customized based on lifestyle
    let wakeTime = '07:00';
    
    if (lifestyle?.workSchedule === 'night_shift') {
      wakeTime = '15:00';
    } else if (lifestyle?.workSchedule === 'early_morning') {
      wakeTime = '05:30';
    } else if (lifestyle?.workSchedule === 'flexible') {
      wakeTime = '08:00';
    }

    // Calculate bedtime based on optimal duration
    const wakeHour = parseInt(wakeTime.split(':')[0]);
    const wakeMinute = parseInt(wakeTime.split(':')[1]);
    
    const bedtimeHour = (wakeHour - optimalDuration + 24) % 24;
    const bedtime = `${bedtimeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;

    return {
      bedtime,
      wakeTime,
      sleepDuration: optimalDuration,
      consistency: [
        'Go to bed and wake up at the same time every day',
        'Maintain schedule even on weekends',
        'Allow for 15-30 minutes to fall asleep',
        'Avoid "catching up" on sleep with long weekend sleeps'
      ]
    };
  }

  private generateSleepHygieneTips(userProfile: UserProfile): string[] {
    const tips = [
      'Keep your bedroom cool (60-67°F/15-19°C)',
      'Make your bedroom as dark as possible',
      'Reduce noise or use white noise',
      'Avoid screens 1-2 hours before bedtime',
      'Avoid caffeine 6 hours before bedtime',
      'Avoid large meals 2-3 hours before bedtime',
      'Get natural sunlight exposure during the day'
    ];

    const { goals, activityLevel, lifestyle } = userProfile;

    if (goals.includes('weight_loss')) {
      tips.push('Poor sleep can affect hunger hormones - prioritize sleep for weight management');
    }

    if (goals.includes('muscle_gain')) {
      tips.push('Growth hormone is released during deep sleep - crucial for muscle recovery');
    }

    if (activityLevel === 'very_active' || activityLevel === 'extremely_active') {
      tips.push('Finish intense workouts at least 3 hours before bedtime');
      tips.push('Consider a cool shower after evening workouts');
    }

    if (lifestyle?.stressLevel === 'high') {
      tips.push('Practice stress-reduction techniques before bed');
      tips.push('Consider meditation or deep breathing exercises');
    }

    return tips;
  }

  private generateBedtimeRoutine(userProfile: UserProfile): Array<{
    time: string;
    activity: string;
    description: string;
  }> {
    const routine = [
      {
        time: '2 hours before bed',
        activity: 'Dim the lights',
        description: 'Start reducing light exposure to signal your body it\'s time to wind down'
      },
      {
        time: '1.5 hours before bed',
        activity: 'No more screens',
        description: 'Put away phones, tablets, and turn off TV to reduce blue light exposure'
      },
      {
        time: '1 hour before bed',
        activity: 'Relaxing activity',
        description: 'Read a book, take a warm bath, or practice gentle stretching'
      },
      {
        time: '30 minutes before bed',
        activity: 'Prepare for tomorrow',
        description: 'Set out clothes, prepare lunch, or write in a journal'
      },
      {
        time: '15 minutes before bed',
        activity: 'Relaxation technique',
        description: 'Practice deep breathing, meditation, or progressive muscle relaxation'
      }
    ];

    const { lifestyle, goals } = userProfile;

    if (lifestyle?.stressLevel === 'high') {
      routine.push({
        time: '45 minutes before bed',
        activity: 'Stress relief',
        description: 'Practice gratitude journaling or gentle yoga'
      });
    }

    if (goals.includes('muscle_gain') || goals.includes('strength')) {
      routine.push({
        time: '2.5 hours before bed',
        activity: 'Light protein snack',
        description: 'Small protein snack to support overnight muscle recovery'
      });
    }

    return routine.sort((a, b) => {
      const timeA = parseFloat(a.time.split(' ')[0]);
      const timeB = parseFloat(b.time.split(' ')[0]);
      return timeB - timeA; // Sort in descending order (2 hours before, 1.5 hours before, etc.)
    });
  }

  private generateWakeUpRoutine(userProfile: UserProfile): Array<{
    time: string;
    activity: string;
    description: string;
  }> {
    const routine = [
      {
        time: 'Immediately upon waking',
        activity: 'Avoid snooze button',
        description: 'Get up as soon as your alarm goes off to maintain sleep schedule'
      },
      {
        time: 'Within 5 minutes',
        activity: 'Expose yourself to light',
        description: 'Open curtains or go outside to signal your body it\'s time to wake up'
      },
      {
        time: 'Within 10 minutes',
        activity: 'Hydrate',
        description: 'Drink a glass of water to rehydrate after sleep'
      },
      {
        time: 'Within 15 minutes',
        activity: 'Light movement',
        description: 'Gentle stretching or light exercise to activate your body'
      },
      {
        time: 'Within 30 minutes',
        activity: 'Healthy breakfast',
        description: 'Eat a nutritious breakfast to fuel your day'
      }
    ];

    const { goals, activityLevel } = userProfile;

    if (activityLevel === 'very_active' || activityLevel === 'extremely_active') {
      routine.push({
        time: 'Within 20 minutes',
        activity: 'Plan workout',
        description: 'Review your workout plan for the day'
      });
    }

    if (goals.includes('weight_loss')) {
      routine.push({
        time: 'Within 25 minutes',
        activity: 'Mindful eating prep',
        description: 'Plan your meals for the day to support weight loss goals'
      });
    }

    return routine;
  }

  private generateEnvironmentTips(): string[] {
    return [
      'Invest in blackout curtains or an eye mask',
      'Use a white noise machine or earplugs if needed',
      'Keep bedroom temperature between 60-67°F (15-19°C)',
      'Use a comfortable, supportive mattress and pillows',
      'Remove electronic devices from the bedroom',
      'Consider an air purifier for better air quality',
      'Use calming scents like lavender if helpful',
      'Ensure good ventilation in your bedroom',
      'Keep the bedroom clean and clutter-free',
      'Use your bedroom only for sleep and intimacy'
    ];
  }

  private generateRecommendationId(): string {
    return `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate user profile for sleep generation
   */
  private validateUserProfile(user: IUser): void {
    if (!user.age || user.age < 13 || user.age > 120) {
      throw new Error('Invalid age: must be between 13 and 120');
    }
  }

  /**
   * Calculate optimal sleep duration based on age and activity
   */
  private calculateOptimalSleepDuration(user: IUser): number {
    const age = user.age || 30;
    const activityLevel = user.activityLevel || 'Moderate';

    let baseSleep = 8; // Default 8 hours

    // Age-based adjustments
    if (age < 18) {
      baseSleep = 9; // Teenagers need more sleep
    } else if (age < 26) {
      baseSleep = 8.5; // Young adults
    } else if (age > 65) {
      baseSleep = 7.5; // Older adults
    }

    // Activity level adjustments
    if (activityLevel === 'Active') {
      baseSleep += 0.5; // Active people need more recovery
    }

    // Health condition adjustments
    if (user.healthConditions?.includes('Diabetes')) {
      baseSleep += 0.5; // Diabetes affects sleep quality
    }

    return Math.min(10, Math.max(6, baseSleep));
  }

  /**
   * Generate sleep tips
   */
  private generateSleepTips(user: IUser): string[] {
    const tips = [
      'Maintain a consistent sleep schedule',
      'Create a relaxing bedtime routine',
      'Keep your bedroom cool, dark, and quiet',
      'Avoid screens 1-2 hours before bedtime',
      'Avoid caffeine 6 hours before bedtime',
      'Get natural sunlight exposure during the day'
    ];

    // Age-specific tips
    if ((user.age || 30) > 50) {
      tips.push('Consider a short afternoon nap (20-30 minutes)');
    }

    // Activity-specific tips
    if (user.activityLevel === 'Active') {
      tips.push('Finish intense workouts at least 3 hours before bedtime');
    }

    // Goal-specific tips
    if (user.fitnessGoal === 'Gain Muscle') {
      tips.push('Growth hormone peaks during deep sleep - prioritize sleep quality');
    } else if (user.fitnessGoal === 'Lose Weight') {
      tips.push('Poor sleep affects hunger hormones - maintain consistent sleep');
    }

    return tips;
  }

  /**
   * Generate sleep reminders
   */
  private generateSleepReminders(): string[] {
    return [
      'Set a bedtime alarm to remind you to start winding down',
      'Prepare your bedroom environment before bedtime',
      'Practice relaxation techniques if you have trouble falling asleep',
      'Track your sleep patterns to identify improvements',
      'Avoid large meals and alcohol close to bedtime'
    ];
  }

  /**
   * Generate personalized sleep tips
   */
  private generatePersonalizedSleepTips(user: IUser): string[] {
    const tips: string[] = [];
    const age = user.age || 30;

    // Age-specific tips
    if (age < 25) {
      tips.push('Young adults benefit from consistent sleep schedules for brain development');
    } else if (age > 65) {
      tips.push('Older adults may experience lighter sleep - focus on sleep quality');
    }

    // Health condition tips
    if (user.healthConditions?.includes('Hypertension')) {
      tips.push('Good sleep helps regulate blood pressure');
    }

    if (user.healthConditions?.includes('Diabetes')) {
      tips.push('Consistent sleep helps regulate blood sugar levels');
    }

    // Activity level tips
    if (user.activityLevel === 'Active') {
      tips.push('Athletes need extra sleep for recovery and performance');
    }

    return tips;
  }

  /**
   * Generate sleep description
   */
  private generateSleepDescription(user: IUser, optimalHours: number): string {
    const age = user.age || 30;
    const activityLevel = user.activityLevel || 'moderate';

    return `A personalized sleep plan recommending ${optimalHours} hours of sleep for a ${age}-year-old with ${activityLevel} activity levels.`;
  }

  /**
   * Generate recommendation ID
   */
  private generateRecommendationId(): string {
    return `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
