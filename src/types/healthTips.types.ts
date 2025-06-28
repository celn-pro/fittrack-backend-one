// Health Tips Types and Interfaces
export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: HealthTipCategory;
  tags: string[];
  difficulty: 'easy' | 'moderate' | 'advanced';
  estimatedReadTime: number; // in seconds
  source?: string;
  createdAt: Date;
  isActive: boolean;
}

export enum HealthTipCategory {
  FITNESS = 'fitness',
  NUTRITION = 'nutrition',
  MENTAL_HEALTH = 'mental_health',
  SLEEP = 'sleep',
  HYDRATION = 'hydration',
  GENERAL_WELLNESS = 'general_wellness',
  INJURY_PREVENTION = 'injury_prevention',
  RECOVERY = 'recovery'
}

export interface DailyHealthTips {
  date: string; // YYYY-MM-DD format
  tips: HealthTip[];
  totalTips: number;
  categories: HealthTipCategory[];
}

export interface HealthTipFilter {
  category?: HealthTipCategory;
  difficulty?: 'easy' | 'moderate' | 'advanced';
  tags?: string[];
  limit?: number;
}

export interface HealthTipResponse {
  success: boolean;
  data: HealthTip[] | DailyHealthTips;
  message?: string;
  cached?: boolean;
}

// For curated tips database
export interface CuratedHealthTip {
  title: string;
  content: string;
  category: HealthTipCategory;
  tags: string[];
  difficulty: 'easy' | 'moderate' | 'advanced';
  estimatedReadTime: number;
  source?: string;
}

// For external API integration (if needed)
export interface ExternalHealthTipResponse {
  success: boolean;
  data: {
    tips: Array<{
      title: string;
      description: string;
      category?: string;
      tags?: string[];
    }>;
  };
}
