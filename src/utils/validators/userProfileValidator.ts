// Validate user data utility
import { UserProfile } from '../../types/recommendation.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationOptions {
  strict?: boolean; // If true, warnings become errors
  allowPartial?: boolean; // If true, allows partial profiles for updates
}

export class UserProfileValidator {
  /**
   * Validate complete user profile
   */
  validate(userProfile: UserProfile, options: ValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields validation
    if (!options.allowPartial) {
      this.validateRequiredFields(userProfile, errors);
    }
    
    // Individual field validations
    this.validateUserId(userProfile.userId, errors);
    this.validateAge(userProfile.age, errors, warnings);
    this.validatePhysicalStats(userProfile.physicalStats, errors, warnings);
    this.validateGoals(userProfile.goals, errors, warnings);
    this.validateFitnessLevel(userProfile.fitnessLevel, errors);
    this.validateActivityLevel(userProfile.activityLevel, errors);
    this.validateDietaryRestrictions(userProfile.dietaryRestrictions, warnings);
    this.validatePreferences(userProfile.preferences, warnings);
    this.validateTimeConstraints(userProfile.timeConstraints, warnings);
    this.validateLifestyle(userProfile.lifestyle, warnings);
    
    // Convert warnings to errors if strict mode
    if (options.strict) {
      errors.push(...warnings);
      warnings.length = 0;
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate specific field
   */
  validateField(fieldName: string, value: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    switch (fieldName) {
      case 'userId':
        this.validateUserId(value, errors);
        break;
      case 'age':
        this.validateAge(value, errors, warnings);
        break;
      case 'physicalStats':
        this.validatePhysicalStats(value, errors, warnings);
        break;
      case 'goals':
        this.validateGoals(value, errors, warnings);
        break;
      case 'fitnessLevel':
        this.validateFitnessLevel(value, errors);
        break;
      case 'activityLevel':
        this.validateActivityLevel(value, errors);
        break;
      case 'dietaryRestrictions':
        this.validateDietaryRestrictions(value, warnings);
        break;
      default:
        errors.push(`Unknown field: ${fieldName}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize user input
   */
  sanitize(userProfile: Partial<UserProfile>): Partial<UserProfile> {
    const sanitized: Partial<UserProfile> = {};
    
    // Copy and sanitize each field
    if (userProfile.userId) {
      sanitized.userId = this.sanitizeString(userProfile.userId);
    }
    
    if (userProfile.age !== undefined) {
      sanitized.age = this.sanitizeNumber(userProfile.age, 13, 120);
    }
    
    if (userProfile.physicalStats) {
      sanitized.physicalStats = this.sanitizePhysicalStats(userProfile.physicalStats);
    }
    
    if (userProfile.goals) {
      sanitized.goals = this.sanitizeGoals(userProfile.goals);
    }
    
    if (userProfile.fitnessLevel) {
      sanitized.fitnessLevel = this.sanitizeFitnessLevel(userProfile.fitnessLevel);
    }
    
    if (userProfile.activityLevel) {
      sanitized.activityLevel = this.sanitizeActivityLevel(userProfile.activityLevel);
    }
    
    if (userProfile.dietaryRestrictions) {
      sanitized.dietaryRestrictions = this.sanitizeDietaryRestrictions(userProfile.dietaryRestrictions);
    }
    
    return sanitized;
  }

  private validateRequiredFields(userProfile: UserProfile, errors: string[]): void {
    const requiredFields = ['userId', 'age', 'physicalStats', 'goals', 'fitnessLevel', 'activityLevel'];
    
    requiredFields.forEach(field => {
      if (!userProfile[field as keyof UserProfile]) {
        errors.push(`${field} is required`);
      }
    });
  }

  private validateUserId(userId: string, errors: string[]): void {
    if (!userId) {
      errors.push('User ID is required');
      return;
    }
    
    if (typeof userId !== 'string') {
      errors.push('User ID must be a string');
      return;
    }
    
    if (userId.length < 1 || userId.length > 100) {
      errors.push('User ID must be between 1 and 100 characters');
    }
    
    // Check for valid characters (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      errors.push('User ID can only contain letters, numbers, hyphens, and underscores');
    }
  }

  private validateAge(age: number, errors: string[], warnings: string[]): void {
    if (age === undefined || age === null) {
      errors.push('Age is required');
      return;
    }
    
    if (typeof age !== 'number' || !Number.isInteger(age)) {
      errors.push('Age must be a whole number');
      return;
    }
    
    if (age < 13) {
      errors.push('Age must be at least 13 years old');
    } else if (age > 120) {
      errors.push('Age must be less than 120 years old');
    }
    
    if (age < 18) {
      warnings.push('Users under 18 should consult with a healthcare provider before starting any fitness program');
    }
    
    if (age > 65) {
      warnings.push('Users over 65 should consult with a healthcare provider before starting any new fitness program');
    }
  }

  private validatePhysicalStats(physicalStats: any, errors: string[], warnings: string[]): void {
    if (!physicalStats) {
      errors.push('Physical stats are required');
      return;
    }
    
    // Validate weight
    if (typeof physicalStats.weight !== 'number') {
      errors.push('Weight must be a number');
    } else if (physicalStats.weight < 30 || physicalStats.weight > 300) {
      errors.push('Weight must be between 30 and 300 kg');
    }
    
    // Validate height
    if (typeof physicalStats.height !== 'number') {
      errors.push('Height must be a number');
    } else if (physicalStats.height < 100 || physicalStats.height > 250) {
      errors.push('Height must be between 100 and 250 cm');
    }
    
    // Validate gender
    if (!['male', 'female', 'other'].includes(physicalStats.gender)) {
      errors.push('Gender must be male, female, or other');
    }
    
    // Validate body fat percentage (optional)
    if (physicalStats.bodyFatPercentage !== undefined) {
      if (typeof physicalStats.bodyFatPercentage !== 'number') {
        warnings.push('Body fat percentage must be a number');
      } else if (physicalStats.bodyFatPercentage < 3 || physicalStats.bodyFatPercentage > 50) {
        warnings.push('Body fat percentage should be between 3% and 50%');
      }
    }
    
    // Calculate and validate BMI
    if (physicalStats.weight && physicalStats.height) {
      const bmi = physicalStats.weight / Math.pow(physicalStats.height / 100, 2);
      if (bmi < 16) {
        warnings.push('BMI indicates severe underweight - please consult a healthcare provider');
      } else if (bmi > 40) {
        warnings.push('BMI indicates severe obesity - please consult a healthcare provider');
      }
    }
  }

  private validateGoals(goals: string[], errors: string[], warnings: string[]): void {
    if (!Array.isArray(goals)) {
      errors.push('Goals must be an array');
      return;
    }
    
    if (goals.length === 0) {
      errors.push('At least one goal is required');
      return;
    }
    
    const validGoals = [
      'weight_loss', 'muscle_gain', 'strength', 'endurance', 
      'flexibility', 'general_fitness', 'rehabilitation', 'sports_performance'
    ];
    
    const invalidGoals = goals.filter(goal => !validGoals.includes(goal));
    if (invalidGoals.length > 0) {
      errors.push(`Invalid goals: ${invalidGoals.join(', ')}`);
    }
    
    if (goals.length > 3) {
      warnings.push('Having more than 3 goals may reduce recommendation effectiveness');
    }
    
    // Check for conflicting goals
    if (goals.includes('weight_loss') && goals.includes('muscle_gain')) {
      warnings.push('Weight loss and muscle gain goals may conflict - consider prioritizing one');
    }
  }

  private validateFitnessLevel(fitnessLevel: string, errors: string[]): void {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    
    if (!validLevels.includes(fitnessLevel)) {
      errors.push(`Fitness level must be one of: ${validLevels.join(', ')}`);
    }
  }

  private validateActivityLevel(activityLevel: string, errors: string[]): void {
    const validLevels = [
      'sedentary', 'lightly_active', 'moderately_active', 
      'very_active', 'extremely_active'
    ];
    
    if (!validLevels.includes(activityLevel)) {
      errors.push(`Activity level must be one of: ${validLevels.join(', ')}`);
    }
  }

  private validateDietaryRestrictions(dietaryRestrictions: string[] | undefined, warnings: string[]): void {
    if (!dietaryRestrictions) return;
    
    if (!Array.isArray(dietaryRestrictions)) {
      warnings.push('Dietary restrictions must be an array');
      return;
    }
    
    const validRestrictions = [
      'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free',
      'low_carb', 'keto', 'paleo', 'mediterranean', 'halal', 'kosher'
    ];
    
    const invalidRestrictions = dietaryRestrictions.filter(
      restriction => !validRestrictions.includes(restriction)
    );
    
    if (invalidRestrictions.length > 0) {
      warnings.push(`Unknown dietary restrictions: ${invalidRestrictions.join(', ')}`);
    }
  }

  private validatePreferences(preferences: any, warnings: string[]): void {
    if (!preferences) return;
    
    // Validate preferred exercises
    if (preferences.preferredExercises && !Array.isArray(preferences.preferredExercises)) {
      warnings.push('Preferred exercises must be an array');
    }
    
    // Validate disliked exercises
    if (preferences.dislikedExercises && !Array.isArray(preferences.dislikedExercises)) {
      warnings.push('Disliked exercises must be an array');
    }
    
    // Validate available equipment
    if (preferences.availableEquipment && !Array.isArray(preferences.availableEquipment)) {
      warnings.push('Available equipment must be an array');
    }
  }

  private validateTimeConstraints(timeConstraints: any, warnings: string[]): void {
    if (!timeConstraints) return;
    
    if (timeConstraints.preferredDuration) {
      const validDurations = ['short', 'medium', 'long'];
      if (!validDurations.includes(timeConstraints.preferredDuration)) {
        warnings.push(`Preferred duration must be one of: ${validDurations.join(', ')}`);
      }
    }
    
    if (timeConstraints.availableDays && !Array.isArray(timeConstraints.availableDays)) {
      warnings.push('Available days must be an array');
    }
  }

  private validateLifestyle(lifestyle: any, warnings: string[]): void {
    if (!lifestyle) return;
    
    if (lifestyle.stressLevel) {
      const validStressLevels = ['low', 'moderate', 'high'];
      if (!validStressLevels.includes(lifestyle.stressLevel)) {
        warnings.push(`Stress level must be one of: ${validStressLevels.join(', ')}`);
      }
    }
    
    if (lifestyle.sleepQuality) {
      const validSleepQualities = ['poor', 'fair', 'good', 'excellent'];
      if (!validSleepQualities.includes(lifestyle.sleepQuality)) {
        warnings.push(`Sleep quality must be one of: ${validSleepQualities.join(', ')}`);
      }
    }
  }

  // Sanitization methods
  private sanitizeString(value: string): string {
    return value.trim().slice(0, 100);
  }

  private sanitizeNumber(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  private sanitizePhysicalStats(stats: any): any {
    return {
      weight: this.sanitizeNumber(stats.weight, 30, 300),
      height: this.sanitizeNumber(stats.height, 100, 250),
      gender: ['male', 'female', 'other'].includes(stats.gender) ? stats.gender : 'other',
      bodyFatPercentage: stats.bodyFatPercentage ? 
        this.sanitizeNumber(stats.bodyFatPercentage, 3, 50) : undefined
    };
  }

  private sanitizeGoals(goals: string[]): string[] {
    const validGoals = [
      'weight_loss', 'muscle_gain', 'strength', 'endurance', 
      'flexibility', 'general_fitness', 'rehabilitation', 'sports_performance'
    ];
    
    return goals.filter(goal => validGoals.includes(goal)).slice(0, 3);
  }

  private sanitizeFitnessLevel(level: string): string {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    return validLevels.includes(level) ? level : 'beginner';
  }

  private sanitizeActivityLevel(level: string): string {
    const validLevels = [
      'sedentary', 'lightly_active', 'moderately_active', 
      'very_active', 'extremely_active'
    ];
    return validLevels.includes(level) ? level : 'moderately_active';
  }

  private sanitizeDietaryRestrictions(restrictions: string[]): string[] {
    const validRestrictions = [
      'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free',
      'low_carb', 'keto', 'paleo', 'mediterranean', 'halal', 'kosher'
    ];
    
    return restrictions.filter(restriction => validRestrictions.includes(restriction));
  }
}

// Export singleton instance
export const userProfileValidator = new UserProfileValidator();
