import { gql } from 'apollo-server-express';

export const recommendationTypeDefs = gql`
  type Recommendation {
    id: ID!
    category: String! # 'workout' | 'nutrition' | 'hydration' | 'rest'
    title: String!
    description: String!
    image: String
    steps: [Step]
    tips: [String]
    articles: [Article]
    macros: Macros
    calories: Int
    reminders: [String]
    dailyGoalMl: Int
    sleepGoalHours: Float
    calculatedCalories: Int
    difficultyLevel: String
    estimatedDuration: Int
    personalizedTips: [String]
    createdAt: String
    source: String # 'exercisedb' | 'wger' | 'generated'
    hasWorkingImage: Boolean # true if images are working, false if placeholders
  }

  type Step {
    title: String!
    description: String!
    media: [StepMedia]
    duration: Int
  }

  type StepMedia {
    type: String! # 'image' | 'gif' | 'video'
    url: String!
    thumbnailUrl: String
    caption: String
  }

  type Article {
    title: String!
    url: String!
    summary: String
  }

  type Macros {
    protein: MacroNutrient
    carbohydrates: MacroNutrient
    fats: MacroNutrient
  }

  type MacroNutrient {
    grams: Int
    calories: Int
    percentage: Int
  }

  type UserMetrics {
    bmr: Int!
    tdee: Int!
    dailyCalorieGoal: Int!
    dailyWaterGoal: Int!
    recommendedSleepHours: Float!
    activityMultiplier: Float!
    bmi: Float!
    bmiCategory: String!
    idealWeightRange: WeightRange!
  }

  type WeightRange {
    min: Int!
    max: Int!
  }

  type ApiHealthStatus {
    status: String!
    exerciseDB: ExerciseDBHealth!
    cache: CacheHealth!
    timestamp: String!
  }

  type ExerciseDBHealth {
    configured: Boolean!
    rateLimiter: RateLimiterStatus!
    lastCheck: String
  }

  type RateLimiterStatus {
    requestsThisMinute: Int!
    requestsToday: Int!
    minuteLimit: Int!
    dailyLimit: Int!
  }

  type CacheHealth {
    totalEntries: Int!
    totalSize: Int!
    hitRate: Float!
    missRate: Float!
  }

  input RecommendationFilter {
    category: String
    difficultyLevel: String
    maxDuration: Int
    includeEquipment: [String]
    excludeHealthConditions: [String]
  }

  type Query {
    # Get personalized recommendations for the authenticated user
    getRecommendations(filter: RecommendationFilter): [Recommendation!]!
    
    # Get specific recommendation by ID
    getRecommendation(id: ID!): Recommendation
    
    # Get user's calculated metrics
    getUserMetrics: UserMetrics!
    
    # Get API health status
    getApiHealth: ApiHealthStatus!
    
    # Get available body parts for workouts
    getBodyParts: [String!]!
    
    # Get available equipment types
    getEquipmentTypes: [String!]!
  }

  type Mutation {
    # Refresh recommendations for the authenticated user
    refreshRecommendations(categories: [String]): [Recommendation!]!
    
    # Rate a recommendation
    rateRecommendation(id: ID!, rating: Int!): Boolean!
    
    # Mark recommendation as completed
    completeRecommendation(id: ID!, feedback: String): Boolean!
  }

  type Subscription {
    # Subscribe to new recommendations for the authenticated user
    recommendationUpdated: Recommendation!
  }
`;
