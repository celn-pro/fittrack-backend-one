// Sleep recommendations utility
export interface SleepFactors {
  age: number;
  activityLevel: string;
  stressLevel?: 'low' | 'moderate' | 'high';
  workSchedule?: 'regular' | 'shift' | 'irregular';
  screenTime?: number; // hours per day
  caffeineIntake?: number; // mg per day
  alcoholConsumption?: number; // drinks per week
  medicalConditions?: string[];
  currentSleepIssues?: string[];
}

export interface SleepRecommendation {
  optimalDuration: number; // hours
  sleepDebt?: number; // hours
  bedtimeWindow: { earliest: string; latest: string };
  wakeTimeWindow: { earliest: string; latest: string };
  sleepEfficiencyTarget: number; // percentage
  recommendations: string[];
  sleepStages: {
    lightSleep: number; // percentage
    deepSleep: number; // percentage
    remSleep: number; // percentage
  };
}

export class SleepCalculator {
  /**
   * Calculate optimal sleep duration based on age and activity level
   */
  calculateOptimalSleepDuration(age: number, activityLevel: string, goals?: string[]): number {
    // Base sleep needs by age (hours)
    let baseSleep: number;
    
    if (age < 18) {
      baseSleep = 9; // Teenagers need more sleep
    } else if (age < 26) {
      baseSleep = 8.5; // Young adults
    } else if (age < 65) {
      baseSleep = 8; // Adults
    } else {
      baseSleep = 7.5; // Older adults
    }
    
    // Adjust for activity level
    const activityAdjustment = this.getActivityAdjustment(activityLevel);
    
    // Adjust for goals
    const goalAdjustment = this.getGoalAdjustment(goals || []);
    
    const totalSleep = baseSleep + activityAdjustment + goalAdjustment;
    
    // Ensure reasonable bounds (6-10 hours)
    return Math.max(6, Math.min(10, totalSleep));
  }

  /**
   * Calculate comprehensive sleep recommendations
   */
  calculateSleepRecommendations(factors: SleepFactors, goals?: string[]): SleepRecommendation {
    const optimalDuration = this.calculateOptimalSleepDuration(
      factors.age,
      factors.activityLevel,
      goals
    );
    
    const recommendations: string[] = [];
    
    // Generate bedtime and wake time windows
    const sleepWindows = this.calculateSleepWindows(factors, optimalDuration);
    
    // Calculate sleep efficiency target
    const sleepEfficiencyTarget = this.calculateSleepEfficiencyTarget(factors);
    
    // Generate recommendations based on factors
    recommendations.push(...this.generateRecommendations(factors, goals));
    
    // Calculate ideal sleep stage distribution
    const sleepStages = this.calculateSleepStages(factors.age);
    
    return {
      optimalDuration,
      bedtimeWindow: sleepWindows.bedtime,
      wakeTimeWindow: sleepWindows.wakeTime,
      sleepEfficiencyTarget,
      recommendations,
      sleepStages
    };
  }

  /**
   * Calculate sleep debt based on recent sleep patterns
   */
  calculateSleepDebt(
    recentSleepHours: number[],
    optimalDuration: number
  ): number {
    const totalDeficit = recentSleepHours.reduce((debt, hours) => {
      return debt + Math.max(0, optimalDuration - hours);
    }, 0);
    
    return Math.round(totalDeficit * 10) / 10;
  }

  /**
   * Calculate optimal bedtime based on desired wake time
   */
  calculateOptimalBedtime(
    wakeTime: string,
    sleepDuration: number,
    fallAsleepTime: number = 20 // minutes to fall asleep
  ): string {
    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
    const wakeTimeMinutes = wakeHour * 60 + wakeMinute;
    
    const sleepDurationMinutes = sleepDuration * 60;
    const bedtimeMinutes = wakeTimeMinutes - sleepDurationMinutes - fallAsleepTime;
    
    // Handle negative values (previous day)
    const adjustedBedtimeMinutes = bedtimeMinutes < 0 ? 
      bedtimeMinutes + (24 * 60) : bedtimeMinutes;
    
    const bedtimeHour = Math.floor(adjustedBedtimeMinutes / 60) % 24;
    const bedtimeMinute = adjustedBedtimeMinutes % 60;
    
    return `${bedtimeHour.toString().padStart(2, '0')}:${bedtimeMinute.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate sleep quality score based on various factors
   */
  calculateSleepQualityScore(
    actualSleep: number,
    optimalSleep: number,
    sleepEfficiency: number,
    wakeUpCount: number,
    timeToFallAsleep: number
  ): number {
    let score = 100;
    
    // Duration score (40% weight)
    const durationRatio = actualSleep / optimalSleep;
    if (durationRatio < 0.8 || durationRatio > 1.2) {
      score -= 20;
    } else if (durationRatio < 0.9 || durationRatio > 1.1) {
      score -= 10;
    }
    
    // Efficiency score (30% weight)
    if (sleepEfficiency < 85) {
      score -= 15;
    } else if (sleepEfficiency < 90) {
      score -= 8;
    }
    
    // Wake up count (20% weight)
    if (wakeUpCount > 3) {
      score -= 15;
    } else if (wakeUpCount > 1) {
      score -= 8;
    }
    
    // Time to fall asleep (10% weight)
    if (timeToFallAsleep > 30) {
      score -= 10;
    } else if (timeToFallAsleep > 20) {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate sleep hygiene recommendations
   */
  generateSleepHygieneRecommendations(factors: SleepFactors): string[] {
    const recommendations: string[] = [
      'Maintain a consistent sleep schedule, even on weekends',
      'Create a relaxing bedtime routine',
      'Keep your bedroom cool, dark, and quiet',
      'Avoid screens 1-2 hours before bedtime'
    ];
    
    if (factors.caffeineIntake && factors.caffeineIntake > 200) {
      recommendations.push('Limit caffeine intake, especially after 2 PM');
    }
    
    if (factors.alcoholConsumption && factors.alcoholConsumption > 7) {
      recommendations.push('Limit alcohol consumption, especially before bedtime');
    }
    
    if (factors.screenTime && factors.screenTime > 8) {
      recommendations.push('Reduce overall screen time and use blue light filters');
    }
    
    if (factors.stressLevel === 'high') {
      recommendations.push('Practice stress-reduction techniques like meditation or deep breathing');
      recommendations.push('Consider keeping a worry journal to clear your mind before bed');
    }
    
    if (factors.activityLevel === 'very_active' || factors.activityLevel === 'extremely_active') {
      recommendations.push('Finish intense workouts at least 3 hours before bedtime');
      recommendations.push('Consider gentle stretching or yoga before bed');
    }
    
    return recommendations;
  }

  /**
   * Calculate chronotype (morning/evening preference)
   */
  calculateChronotype(
    naturalBedtime: string,
    naturalWakeTime: string,
    age: number
  ): 'morning' | 'evening' | 'intermediate' {
    const [bedHour] = naturalBedtime.split(':').map(Number);
    const [wakeHour] = naturalWakeTime.split(':').map(Number);
    
    // Adjust for age (teenagers tend to be more evening-oriented)
    let adjustment = 0;
    if (age < 25) adjustment = 1;
    if (age > 50) adjustment = -1;
    
    const adjustedBedHour = bedHour + adjustment;
    
    if (adjustedBedHour <= 22 && wakeHour <= 7) {
      return 'morning';
    } else if (adjustedBedHour >= 24 && wakeHour >= 8) {
      return 'evening';
    } else {
      return 'intermediate';
    }
  }

  private getActivityAdjustment(activityLevel: string): number {
    const adjustments: Record<string, number> = {
      'sedentary': 0,
      'lightly_active': 0,
      'moderately_active': 0.25,
      'very_active': 0.5,
      'extremely_active': 0.75
    };
    
    return adjustments[activityLevel] || 0;
  }

  private getGoalAdjustment(goals: string[]): number {
    let adjustment = 0;
    
    if (goals.includes('muscle_gain')) {
      adjustment += 0.25; // Growth hormone release during sleep
    }
    
    if (goals.includes('weight_loss')) {
      adjustment += 0.25; // Sleep affects hunger hormones
    }
    
    if (goals.includes('endurance')) {
      adjustment += 0.5; // Recovery is crucial for endurance athletes
    }
    
    if (goals.includes('strength')) {
      adjustment += 0.25; // Recovery for strength gains
    }
    
    return Math.min(1, adjustment); // Cap at 1 hour additional
  }

  private calculateSleepWindows(
    factors: SleepFactors,
    optimalDuration: number
  ): {
    bedtime: { earliest: string; latest: string };
    wakeTime: { earliest: string; latest: string };
  } {
    // Default wake time based on work schedule
    let baseWakeTime = '07:00';
    
    if (factors.workSchedule === 'shift') {
      baseWakeTime = '06:00';
    } else if (factors.workSchedule === 'irregular') {
      baseWakeTime = '08:00';
    }
    
    const [wakeHour, wakeMinute] = baseWakeTime.split(':').map(Number);
    
    // Calculate bedtime range
    const optimalBedtimeMinutes = (wakeHour * 60 + wakeMinute) - (optimalDuration * 60) - 20;
    const adjustedBedtimeMinutes = optimalBedtimeMinutes < 0 ? 
      optimalBedtimeMinutes + (24 * 60) : optimalBedtimeMinutes;
    
    const bedtimeHour = Math.floor(adjustedBedtimeMinutes / 60) % 24;
    const bedtimeMinute = adjustedBedtimeMinutes % 60;
    
    const earliestBedtime = `${((bedtimeHour - 1 + 24) % 24).toString().padStart(2, '0')}:${bedtimeMinute.toString().padStart(2, '0')}`;
    const latestBedtime = `${((bedtimeHour + 1) % 24).toString().padStart(2, '0')}:${bedtimeMinute.toString().padStart(2, '0')}`;
    
    const earliestWakeTime = `${((wakeHour - 1 + 24) % 24).toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
    const latestWakeTime = `${((wakeHour + 1) % 24).toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
    
    return {
      bedtime: { earliest: earliestBedtime, latest: latestBedtime },
      wakeTime: { earliest: earliestWakeTime, latest: latestWakeTime }
    };
  }

  private calculateSleepEfficiencyTarget(factors: SleepFactors): number {
    let target = 90; // Base target of 90%
    
    // Adjust for age
    if (factors.age > 65) target -= 5;
    if (factors.age > 75) target -= 5;
    
    // Adjust for health conditions
    if (factors.medicalConditions?.length) {
      target -= factors.medicalConditions.length * 2;
    }
    
    // Adjust for stress
    if (factors.stressLevel === 'high') target -= 5;
    
    return Math.max(75, target);
  }

  private generateRecommendations(factors: SleepFactors, goals?: string[]): string[] {
    const recommendations: string[] = [];
    
    // Age-specific recommendations
    if (factors.age < 25) {
      recommendations.push('Young adults need consistent sleep schedules to support brain development');
    } else if (factors.age > 65) {
      recommendations.push('Older adults may benefit from short afternoon naps (20-30 minutes)');
    }
    
    // Activity-specific recommendations
    if (factors.activityLevel === 'very_active' || factors.activityLevel === 'extremely_active') {
      recommendations.push('Athletes need extra sleep for recovery and performance');
    }
    
    // Goal-specific recommendations
    if (goals?.includes('muscle_gain')) {
      recommendations.push('Growth hormone peaks during deep sleep - prioritize sleep quality');
    }
    
    if (goals?.includes('weight_loss')) {
      recommendations.push('Poor sleep affects hunger hormones - maintain consistent sleep for weight management');
    }
    
    return recommendations;
  }

  private calculateSleepStages(age: number): {
    lightSleep: number;
    deepSleep: number;
    remSleep: number;
  } {
    // Sleep stage percentages change with age
    let lightSleep = 50;
    let deepSleep = 25;
    let remSleep = 25;
    
    if (age > 65) {
      lightSleep = 55;
      deepSleep = 20;
      remSleep = 25;
    } else if (age < 25) {
      lightSleep = 45;
      deepSleep = 30;
      remSleep = 25;
    }
    
    return { lightSleep, deepSleep, remSleep };
  }
}

// Export singleton instance
export const sleepCalculator = new SleepCalculator();
