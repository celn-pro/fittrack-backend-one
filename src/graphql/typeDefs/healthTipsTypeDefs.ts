// GraphQL Type Definitions for Health Tips
import { gql } from 'apollo-server-express';

export const healthTipsTypeDefs = gql`
  # Health Tip Categories
  enum HealthTipCategory {
    FITNESS
    NUTRITION
    MENTAL_HEALTH
    SLEEP
    HYDRATION
    GENERAL_WELLNESS
    INJURY_PREVENTION
    RECOVERY
  }

  # Difficulty levels
  enum HealthTipDifficulty {
    EASY
    MODERATE
    ADVANCED
  }

  # Individual Health Tip
  type HealthTip {
    id: ID!
    title: String!
    content: String!
    category: HealthTipCategory!
    tags: [String!]!
    difficulty: HealthTipDifficulty!
    estimatedReadTime: Int!
    source: String
    createdAt: String!
    isActive: Boolean!
  }

  # Daily Health Tips Collection
  type DailyHealthTips {
    date: String!
    tips: [HealthTip!]!
    totalTips: Int!
    categories: [HealthTipCategory!]!
  }

  # Health Tips Filter Input
  input HealthTipFilter {
    category: HealthTipCategory
    difficulty: HealthTipDifficulty
    tags: [String!]
    limit: Int
  }

  # Health Tips Statistics
  type HealthTipCategoryStats {
    category: HealthTipCategory!
    count: Int!
  }

  type HealthTipsStatistics {
    totalTips: Int!
    categoriesCount: Int!
    categoryBreakdown: [HealthTipCategoryStats!]!
  }

  # Queries
  extend type Query {
    # Get daily health tips (4 tips with category diversity)
    getDailyHealthTips(date: String): DailyHealthTips!
    
    # Get health tips with filtering options
    getHealthTips(filter: HealthTipFilter): [HealthTip!]!
    
    # Get tips by specific category
    getHealthTipsByCategory(category: HealthTipCategory!, limit: Int): [HealthTip!]!
    
    # Search health tips by keyword
    searchHealthTips(query: String!, limit: Int): [HealthTip!]!
    
    # Get available categories
    getHealthTipCategories: [HealthTipCategory!]!
    
    # Get health tips statistics
    getHealthTipsStatistics: HealthTipsStatistics!
  }
`;
