// Did You Know Facts Types and Interfaces
export interface DidYouKnowFact {
  id: string;
  fact: string;
  category: FactCategory;
  source: FactSource;
  tags: string[];
  isVerified: boolean;
  difficulty: 'easy' | 'moderate' | 'advanced';
  estimatedReadTime: number; // in seconds
  createdAt: Date;
  isActive: boolean;
}

export enum FactCategory {
  SCIENCE = 'science',
  HISTORY = 'history',
  NATURE = 'nature',
  TECHNOLOGY = 'technology',
  HEALTH = 'health',
  SPACE = 'space',
  ANIMALS = 'animals',
  FOOD = 'food',
  SPORTS = 'sports',
  GENERAL = 'general',
  NUMBERS = 'numbers',
  HUMAN_BODY = 'human_body'
}

export enum FactSource {
  CURATED = 'curated',
  NUMBERS_API = 'numbers_api',
  CAT_FACTS_API = 'cat_facts_api',
  USELESS_FACTS_API = 'useless_facts_api',
  EXTERNAL_API = 'external_api'
}

export interface DailyDidYouKnowFacts {
  date: string; // YYYY-MM-DD format
  facts: DidYouKnowFact[];
  totalFacts: number;
  categories: FactCategory[];
}

export interface DidYouKnowFilter {
  category?: FactCategory;
  source?: FactSource;
  difficulty?: 'easy' | 'moderate' | 'advanced';
  tags?: string[];
  limit?: number;
}

export interface DidYouKnowResponse {
  success: boolean;
  data: DidYouKnowFact[] | DailyDidYouKnowFacts;
  message?: string;
  cached?: boolean;
}

// For curated facts database
export interface CuratedDidYouKnowFact {
  fact: string;
  category: FactCategory;
  tags: string[];
  difficulty: 'easy' | 'moderate' | 'advanced';
  estimatedReadTime: number;
  isVerified: boolean;
}

// External API response types
export interface NumbersApiResponse {
  text: string;
  found: boolean;
  type: string;
}

export interface CatFactsApiResponse {
  fact: string;
  length: number;
}

export interface UselessFactsApiResponse {
  id: string;
  text: string;
  source: string;
  source_url: string;
  language: string;
  permalink: string;
}

// Generic external API response
export interface ExternalFactResponse {
  success: boolean;
  data: {
    fact: string;
    category?: string;
    source?: string;
  };
  error?: string;
}
