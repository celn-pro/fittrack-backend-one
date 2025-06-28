// User-related types

/**
 * Core User Types
 */
export interface User {
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
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profilePicture?: string;
  bio?: string;
  location?: UserLocation;
  timezone: string;
  language: string;
  units: UnitPreferences;
}

export interface UserLocation {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UnitPreferences {
  weight: 'kg' | 'lbs';
  height: 'cm' | 'ft_in';
  distance: 'km' | 'miles';
  temperature: 'celsius' | 'fahrenheit';
  liquid: 'liters' | 'fl_oz';
}

export interface UserPreferences {
  fitness: FitnessPreferences;
  nutrition: NutritionPreferences;
  communication: CommunicationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface FitnessPreferences {
  workoutTypes: string[];
  preferredDuration: number; // minutes
  preferredIntensity: 'low' | 'moderate' | 'high' | 'varied';
  workoutDays: string[]; // ['monday', 'wednesday', 'friday']
  workoutTimes: string[]; // ['morning', 'evening']
  restDayPreferences: string[];
  equipmentAccess: string[];
  workoutEnvironment: 'home' | 'gym' | 'outdoor' | 'mixed';
  musicDuringWorkout: boolean;
  workoutReminders: boolean;
}

export interface NutritionPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  dislikedFoods: string[];
  preferredCuisines: string[];
  mealPlanningStyle: 'detailed' | 'flexible' | 'minimal';
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  mealPrepTime: 'quick' | 'moderate' | 'elaborate';
  budgetRange: 'low' | 'moderate' | 'high';
  organicPreference: boolean;
  supplementsOpen: boolean;
}

export interface CommunicationPreferences {
  language: string;
  communicationStyle: 'formal' | 'casual' | 'motivational';
  feedbackFrequency: 'daily' | 'weekly' | 'monthly';
  progressReports: boolean;
  socialSharing: boolean;
  communityParticipation: boolean;
}

export interface AccessibilityPreferences {
  visualImpairment: boolean;
  hearingImpairment: boolean;
  mobilityLimitations: string[];
  cognitiveSupport: boolean;
  largeText: boolean;
  highContrast: boolean;
  screenReader: boolean;
  voiceCommands: boolean;
}

/**
 * Subscription and Billing Types
 */
export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  paymentMethod?: PaymentMethod;
  billingHistory: BillingRecord[];
  features: SubscriptionFeatures;
}

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

export type SubscriptionStatus = 
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'expired'
  | 'trial'
  | 'suspended';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
}

export interface BillingRecord {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoiceUrl?: string;
}

export interface SubscriptionFeatures {
  maxRecommendations: number;
  personalizedPlans: boolean;
  advancedAnalytics: boolean;
  nutritionTracking: boolean;
  sleepTracking: boolean;
  communityAccess: boolean;
  expertConsultation: boolean;
  apiAccess: boolean;
  dataExport: boolean;
  prioritySupport: boolean;
}

/**
 * Privacy and Security Types
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  dataSharing: DataSharingSettings;
  activityVisibility: ActivityVisibilitySettings;
  searchability: boolean;
  analyticsOptOut: boolean;
  marketingOptOut: boolean;
  dataRetention: DataRetentionSettings;
}

export interface DataSharingSettings {
  shareWithPartners: boolean;
  shareForResearch: boolean;
  shareAggregatedData: boolean;
  shareWithHealthProviders: boolean;
  thirdPartyIntegrations: string[];
}

export interface ActivityVisibilitySettings {
  workouts: 'public' | 'friends' | 'private';
  nutrition: 'public' | 'friends' | 'private';
  progress: 'public' | 'friends' | 'private';
  achievements: 'public' | 'friends' | 'private';
  goals: 'public' | 'friends' | 'private';
}

export interface DataRetentionSettings {
  retainData: boolean;
  retentionPeriod: number; // months
  autoDelete: boolean;
  exportBeforeDelete: boolean;
}

/**
 * Notification Types
 */
export interface NotificationSettings {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  sms: SmsNotificationSettings;
  inApp: InAppNotificationSettings;
  frequency: NotificationFrequency;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  workoutReminders: boolean;
  progressReports: boolean;
  goalAchievements: boolean;
  weeklyDigest: boolean;
  monthlyReport: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  workoutReminders: boolean;
  hydrationReminders: boolean;
  sleepReminders: boolean;
  goalDeadlines: boolean;
  socialUpdates: boolean;
  achievements: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // '22:00'
    end: string; // '07:00'
  };
}

export interface SmsNotificationSettings {
  enabled: boolean;
  phoneNumber?: string;
  workoutReminders: boolean;
  emergencyAlerts: boolean;
  securityAlerts: boolean;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  showBadges: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  bannerStyle: 'minimal' | 'detailed';
}

export interface NotificationFrequency {
  workoutReminders: 'never' | 'daily' | 'workout_days_only';
  progressUpdates: 'never' | 'weekly' | 'monthly';
  motivationalMessages: 'never' | 'daily' | 'weekly';
  socialUpdates: 'never' | 'immediate' | 'daily_digest';
}

/**
 * User Activity and Engagement Types
 */
export interface UserActivity {
  userId: string;
  sessionId: string;
  timestamp: Date;
  action: UserAction;
  context: ActivityContext;
  metadata?: Record<string, any>;
}

export type UserAction = 
  | 'login'
  | 'logout'
  | 'view_recommendation'
  | 'start_workout'
  | 'complete_workout'
  | 'log_nutrition'
  | 'update_profile'
  | 'share_achievement'
  | 'join_community'
  | 'rate_recommendation'
  | 'provide_feedback';

export interface ActivityContext {
  platform: 'web' | 'mobile' | 'api';
  device?: string;
  location?: string;
  referrer?: string;
  userAgent?: string;
}

export interface UserEngagement {
  userId: string;
  period: 'day' | 'week' | 'month';
  metrics: EngagementMetrics;
  trends: EngagementTrends;
  lastUpdated: Date;
}

export interface EngagementMetrics {
  sessionsCount: number;
  totalTimeSpent: number; // minutes
  averageSessionDuration: number; // minutes
  workoutsCompleted: number;
  recommendationsViewed: number;
  featuresUsed: string[];
  achievementsUnlocked: number;
  socialInteractions: number;
}

export interface EngagementTrends {
  activityTrend: 'increasing' | 'stable' | 'decreasing';
  engagementScore: number; // 0-100
  riskOfChurn: 'low' | 'medium' | 'high';
  recommendedActions: string[];
}

/**
 * User Relationships and Social Types
 */
export interface UserRelationship {
  id: string;
  userId: string;
  relatedUserId: string;
  type: RelationshipType;
  status: RelationshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type RelationshipType = 
  | 'friend'
  | 'workout_buddy'
  | 'coach'
  | 'trainee'
  | 'family'
  | 'blocked';

export type RelationshipStatus = 
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'blocked';

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  type: 'workout_group' | 'challenge' | 'support_group' | 'family';
  privacy: 'public' | 'private' | 'invite_only';
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

/**
 * User Support and Help Types
 */
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: SupportCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: SupportMessage[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export type SupportCategory = 
  | 'technical_issue'
  | 'billing'
  | 'feature_request'
  | 'account_help'
  | 'data_privacy'
  | 'general_inquiry';

export interface SupportMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'support_agent' | 'system';
  message: string;
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
}
