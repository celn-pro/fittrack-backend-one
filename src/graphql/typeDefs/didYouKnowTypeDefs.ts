// GraphQL Type Definitions for Did You Know Facts
import { gql } from 'apollo-server-express';

export const didYouKnowTypeDefs = gql`
  # Fact Categories
  enum FactCategory {
    SCIENCE
    HISTORY
    NATURE
    TECHNOLOGY
    HEALTH
    SPACE
    ANIMALS
    FOOD
    SPORTS
    GENERAL
    NUMBERS
    HUMAN_BODY
  }

  # Fact Sources
  enum FactSource {
    CURATED
    NUMBERS_API
    CAT_FACTS_API
    USELESS_FACTS_API
    EXTERNAL_API
  }

  # Difficulty levels
  enum FactDifficulty {
    EASY
    MODERATE
    ADVANCED
  }

  # Individual Did You Know Fact
  type DidYouKnowFact {
    id: ID!
    fact: String!
    category: FactCategory!
    source: FactSource!
    tags: [String!]!
    isVerified: Boolean!
    difficulty: FactDifficulty!
    estimatedReadTime: Int!
    createdAt: String!
    isActive: Boolean!
  }

  # Daily Did You Know Facts Collection
  type DailyDidYouKnowFacts {
    date: String!
    facts: [DidYouKnowFact!]!
    totalFacts: Int!
    categories: [FactCategory!]!
  }

  # Did You Know Facts Filter Input
  input DidYouKnowFilter {
    category: FactCategory
    source: FactSource
    difficulty: FactDifficulty
    tags: [String!]
    limit: Int
  }

  # Did You Know Facts Statistics
  type DidYouKnowCategoryStats {
    category: FactCategory!
    count: Int!
  }

  type DidYouKnowStatistics {
    totalFacts: Int!
    categoriesCount: Int!
    categoryBreakdown: [DidYouKnowCategoryStats!]!
  }

  # Queries
  extend type Query {
    # Get daily did you know facts (mix of curated and API facts)
    getDailyDidYouKnowFacts(date: String, count: Int): DailyDidYouKnowFacts!
    
    # Get did you know facts with filtering options
    getDidYouKnowFacts(filter: DidYouKnowFilter): [DidYouKnowFact!]!
    
    # Get facts by specific category
    getDidYouKnowFactsByCategory(category: FactCategory!, limit: Int): [DidYouKnowFact!]!
    
    # Search did you know facts by keyword
    searchDidYouKnowFacts(query: String!, limit: Int): [DidYouKnowFact!]!
    
    # Get available fact categories
    getDidYouKnowCategories: [FactCategory!]!
    
    # Get did you know facts statistics
    getDidYouKnowStatistics: DidYouKnowStatistics!
  }
`;
