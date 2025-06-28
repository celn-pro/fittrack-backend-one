// Your existing user model (modified for hybrid approach)
import { UserProfile as RecommendationUserProfile, PhysicalStats, WorkoutGoal, FitnessLevel, ActivityLevel } from '../types/recommendation.types';
import { User as UserType, UserProfile, UserPreferences, UserSubscription, PrivacySettings, NotificationSettings } from '../types/user.types';

/**
 * User Model - Core user entity with fitness profile integration
 */
export class User implements UserType {
  id: string;
  email: string;
  username?: string;
  profile: UserProfile;
  preferences: UserPreferences;
  subscription: UserSubscription;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  isVerified: boolean;

  // Fitness-specific properties
  fitnessProfile?: FitnessProfile;
  healthMetrics?: HealthMetrics;
  goals: WorkoutGoal[];
  currentPrograms: string[]; // IDs of active programs

  constructor(userData: Partial<UserType> & { id: string; email: string }) {
    this.id = userData.id;
    this.email = userData.email;
    if (userData.username !== undefined) {
      this.username = userData.username;
    }
    this.profile = userData.profile || this.getDefaultProfile();
    this.preferences = userData.preferences || this.getDefaultPreferences();
    this.subscription = userData.subscription || this.getDefaultSubscription();
    this.privacy = userData.privacy || this.getDefaultPrivacySettings();
    this.notifications = userData.notifications || this.getDefaultNotificationSettings();
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
    if (userData.lastLoginAt !== undefined) {
      this.lastLoginAt = userData.lastLoginAt;
    }
    this.isActive = userData.isActive ?? true;
    this.isVerified = userData.isVerified ?? false;
    
    // Initialize fitness-specific properties
    this.goals = [];
    this.currentPrograms = [];
  }

  /**
   * Convert user data to UserProfile format for recommendations
   */
  toRecommendationProfile(): RecommendationUserProfile {
    const age = this.calculateAge();
    
    return {
      userId: this.id,
      age,
      physicalStats: this.getPhysicalStats(),
      goals: this.goals,
      fitnessLevel: this.getFitnessLevel(),
      activityLevel: this.getActivityLevel(),
      dietaryRestrictions: this.preferences.nutrition.dietaryRestrictions as any[], // Type conversion needed
      preferences: {
        preferredExercises: this.preferences.fitness.workoutTypes,
        dislikedExercises: [],
        availableEquipment: this.preferences.fitness.equipmentAccess,
        workoutEnvironment: this.preferences.fitness.workoutEnvironment,
        intensityPreference: this.preferences.fitness.preferredIntensity
      },
      timeConstraints: {
        preferredDuration: this.mapDurationToCategory(this.preferences.fitness.preferredDuration),
        availableDays: this.preferences.fitness.workoutDays,
        preferredTimes: this.preferences.fitness.workoutTimes
      },
      lifestyle: {
        stressLevel: this.fitnessProfile?.stressLevel || 'moderate',
        sleepQuality: this.fitnessProfile?.sleepQuality || 'fair',
        workSchedule: this.fitnessProfile?.workSchedule || 'regular'
      },
      environment: {
        ...(this.fitnessProfile?.climate && { climate: this.fitnessProfile.climate }),
        ...(this.fitnessProfile?.altitude && { altitude: this.fitnessProfile.altitude })
      }
    };
  }

  /**
   * Update fitness profile
   */
  updateFitnessProfile(updates: Partial<FitnessProfile>): void {
    if (!this.fitnessProfile) {
      // Initialize with required properties if not exists
      this.fitnessProfile = {
        physicalStats: this.getPhysicalStats(),
        fitnessLevel: this.getFitnessLevel(),
        activityLevel: this.getActivityLevel(),
        ...updates
      };
    } else {
      this.fitnessProfile = {
        ...this.fitnessProfile,
        ...updates
      };
    }
    this.updatedAt = new Date();
  }

  /**
   * Update health metrics
   */
  updateHealthMetrics(metrics: Partial<HealthMetrics>): void {
    this.healthMetrics = {
      ...this.healthMetrics,
      ...metrics,
      lastUpdated: new Date()
    };
    this.updatedAt = new Date();
  }

  /**
   * Add or update goals
   */
  updateGoals(goals: WorkoutGoal[]): void {
    this.goals = goals;
    this.updatedAt = new Date();
  }

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription(): boolean {
    return this.subscription.status === 'active' || this.subscription.status === 'trial';
  }

  /**
   * Check if user has access to feature
   */
  hasFeatureAccess(feature: keyof UserSubscription['features']): boolean {
    return this.subscription.features[feature] === true;
  }

  /**
   * Get user's BMI
   */
  getBMI(): number | null {
    const physicalStats = this.getPhysicalStats();
    if (!physicalStats.weight || !physicalStats.height) return null;
    
    const heightInMeters = physicalStats.height / 100;
    return physicalStats.weight / (heightInMeters * heightInMeters);
  }

  /**
   * Get user's age
   */
  calculateAge(): number {
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validate user data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }
    
    if (!this.profile.firstName || this.profile.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!this.profile.lastName || this.profile.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!this.profile.dateOfBirth || this.calculateAge() < 13) {
      errors.push('User must be at least 13 years old');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Serialize user for API response (excluding sensitive data)
   */
  toPublicJSON(): Partial<UserType> {
    return {
      id: this.id,
      ...(this.username && { username: this.username }),
      profile: {
        ...this.profile,
        // Exclude sensitive information
      },
      preferences: this.preferences,
      subscription: {
        plan: this.subscription.plan,
        status: this.subscription.status,
        startDate: this.subscription.startDate,
        features: this.subscription.features,
        billingHistory: [] // Don't expose billing history in public JSON
      },
      createdAt: this.createdAt,
      isActive: this.isActive,
      isVerified: this.isVerified
    };
  }

  // Private helper methods
  private getPhysicalStats(): PhysicalStats {
    return this.fitnessProfile?.physicalStats || {
      weight: 70, // Default values
      height: 170,
      gender: 'other'
    };
  }

  private getFitnessLevel(): FitnessLevel {
    return this.fitnessProfile?.fitnessLevel || 'beginner';
  }

  private getActivityLevel(): ActivityLevel {
    return this.fitnessProfile?.activityLevel || 'moderately_active';
  }

  private mapDurationToCategory(duration: number): 'short' | 'medium' | 'long' {
    if (duration <= 30) return 'short';
    if (duration <= 60) return 'medium';
    return 'long';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getDefaultProfile(): UserProfile {
    return {
      firstName: '',
      lastName: '',
      dateOfBirth: new Date(),
      gender: 'prefer_not_to_say',
      timezone: 'UTC',
      language: 'en',
      units: {
        weight: 'kg',
        height: 'cm',
        distance: 'km',
        temperature: 'celsius',
        liquid: 'liters'
      }
    };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      fitness: {
        workoutTypes: [],
        preferredDuration: 60,
        preferredIntensity: 'moderate',
        workoutDays: [],
        workoutTimes: [],
        restDayPreferences: [],
        equipmentAccess: [],
        workoutEnvironment: 'mixed',
        musicDuringWorkout: true,
        workoutReminders: true
      },
      nutrition: {
        dietaryRestrictions: [],
        allergies: [],
        dislikedFoods: [],
        preferredCuisines: [],
        mealPlanningStyle: 'flexible',
        cookingSkillLevel: 'intermediate',
        mealPrepTime: 'moderate',
        budgetRange: 'moderate',
        organicPreference: false,
        supplementsOpen: false
      },
      communication: {
        language: 'en',
        communicationStyle: 'casual',
        feedbackFrequency: 'weekly',
        progressReports: true,
        socialSharing: false,
        communityParticipation: false
      },
      accessibility: {
        visualImpairment: false,
        hearingImpairment: false,
        mobilityLimitations: [],
        cognitiveSupport: false,
        largeText: false,
        highContrast: false,
        screenReader: false,
        voiceCommands: false
      }
    };
  }

  private getDefaultSubscription(): UserSubscription {
    return {
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      billingHistory: [],
      features: {
        maxRecommendations: 5,
        personalizedPlans: false,
        advancedAnalytics: false,
        nutritionTracking: false,
        sleepTracking: false,
        communityAccess: false,
        expertConsultation: false,
        apiAccess: false,
        dataExport: false,
        prioritySupport: false
      }
    };
  }

  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      profileVisibility: 'private',
      dataSharing: {
        shareWithPartners: false,
        shareForResearch: false,
        shareAggregatedData: false,
        shareWithHealthProviders: false,
        thirdPartyIntegrations: []
      },
      activityVisibility: {
        workouts: 'private',
        nutrition: 'private',
        progress: 'private',
        achievements: 'private',
        goals: 'private'
      },
      searchability: false,
      analyticsOptOut: false,
      marketingOptOut: false,
      dataRetention: {
        retainData: true,
        retentionPeriod: 24,
        autoDelete: false,
        exportBeforeDelete: false
      }
    };
  }

  private getDefaultNotificationSettings(): NotificationSettings {
    return {
      email: {
        enabled: true,
        workoutReminders: true,
        progressReports: true,
        goalAchievements: true,
        weeklyDigest: true,
        monthlyReport: false,
        productUpdates: false,
        marketingEmails: false,
        securityAlerts: true
      },
      push: {
        enabled: true,
        workoutReminders: true,
        hydrationReminders: false,
        sleepReminders: false,
        goalDeadlines: true,
        socialUpdates: false,
        achievements: true,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        }
      },
      sms: {
        enabled: false,
        workoutReminders: false,
        emergencyAlerts: false,
        securityAlerts: false
      },
      inApp: {
        enabled: true,
        showBadges: true,
        soundEnabled: true,
        vibrationEnabled: true,
        bannerStyle: 'detailed'
      },
      frequency: {
        workoutReminders: 'workout_days_only',
        progressUpdates: 'weekly',
        motivationalMessages: 'weekly',
        socialUpdates: 'never'
      }
    };
  }
}

// Additional interfaces for fitness-specific data
export interface FitnessProfile {
  physicalStats: PhysicalStats;
  fitnessLevel: FitnessLevel;
  activityLevel: ActivityLevel;
  stressLevel?: 'low' | 'moderate' | 'high';
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  workSchedule?: 'regular' | 'shift' | 'irregular';
  climate?: 'temperate' | 'tropical' | 'arid' | 'cold';
  altitude?: number;
  injuries?: string[];
  medicalConditions?: string[];
  lastFitnessAssessment?: Date;
}

export interface HealthMetrics {
  restingHeartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  bodyFatPercentage?: number;
  muscleMass?: number;
  vo2Max?: number;
  flexibility?: number; // 1-10 scale
  strength?: number; // 1-10 scale
  endurance?: number; // 1-10 scale
  lastUpdated: Date;
}
