import { gql } from 'apollo-server-express';

export const authTypeDefs = gql`
  # User Types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    dateOfBirth: String
    gender: Gender
    height: Float
    weight: Float
    fitnessLevel: FitnessLevel
    activityLevel: ActivityLevel
    fitnessGoals: [String!]
    healthConditions: [String!]
    injuries: [String!]
    dietaryPreferences: DietaryPreference
    dietaryRestrictions: [String!]
    preferredWorkoutTypes: [String!]
    isEmailVerified: Boolean!
    isProfileComplete: Boolean!
    notificationSettings: NotificationSettings!
    createdAt: String!
    updatedAt: String!
    lastLoginAt: String
    age: Int
    bmi: Float
  }

  type NotificationSettings {
    workoutReminders: Boolean!
    nutritionTips: Boolean!
    progressUpdates: Boolean!
    emailNotifications: Boolean!
  }

  type AuthResponse {
    user: User!
    token: String!
  }

  type UserStats {
    totalUsers: Int!
    verifiedUsers: Int!
    completeProfiles: Int!
    recentSignups: Int!
  }

  # Enums
  enum Gender {
    male
    female
    other
  }

  enum FitnessLevel {
    beginner
    intermediate
    advanced
  }

  enum ActivityLevel {
    sedentary
    light
    moderate
    active
    very_active
  }

  enum DietaryPreference {
    none
    vegetarian
    vegan
    keto
    paleo
    mediterranean
  }

  # Input Types
  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    dateOfBirth: String
    gender: Gender
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    dateOfBirth: String
    gender: Gender
    height: Float
    weight: Float
    fitnessLevel: FitnessLevel
    activityLevel: ActivityLevel
    fitnessGoals: [String!]
    healthConditions: [String!]
    injuries: [String!]
    dietaryPreferences: DietaryPreference
    dietaryRestrictions: [String!]
    preferredWorkoutTypes: [String!]
  }

  input UpdateNotificationSettingsInput {
    workoutReminders: Boolean
    nutritionTips: Boolean
    progressUpdates: Boolean
    emailNotifications: Boolean
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  # Queries
  extend type Query {
    # Get current user profile
    me: User

    # Get user statistics (admin only)
    userStats: UserStats
  }

  # Mutations
  extend type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!

    # Profile management
    updateProfile(input: UpdateProfileInput!): User!
    updateNotificationSettings(input: UpdateNotificationSettingsInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!

    # Account management
    deleteAccount: Boolean!
  }
`;
