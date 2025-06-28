// Health Tips Service - Provides daily health tips with rotation and caching
import { 
  HealthTip, 
  HealthTipCategory, 
  DailyHealthTips, 
  HealthTipFilter,
  CuratedHealthTip 
} from '../types/healthTips.types';
import { CURATED_HEALTH_TIPS, getTipsByCategory } from '../data/healthTipsDatabase';
import { CacheService } from './CacheService';

export class HealthTipsService {
  private cacheService: CacheService;

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService();
  }

  /**
   * Get daily health tips (4 tips with category diversity)
   */
  async getDailyHealthTips(date?: string): Promise<DailyHealthTips> {
    const targetDate = date || this.getCurrentDateString();
    const cacheKey = `health_tips:daily:${targetDate}`;

    // Try cache first
    const cached = await this.cacheService.get<DailyHealthTips>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached daily health tips for ${targetDate}`);
      return cached;
    }

    console.log(`🔄 Generating new daily health tips for ${targetDate}`);

    // Generate 4 diverse tips for the day
    const dailyTips = this.generateDailyTips(targetDate);

    // Cache for 24 hours (until next day)
    const cacheUntilMidnight = this.getCacheTimeUntilMidnight();
    await this.cacheService.set(cacheKey, dailyTips, cacheUntilMidnight);

    return dailyTips;
  }

  /**
   * Generate 4 diverse daily tips ensuring variety across categories
   */
  private generateDailyTips(date: string): DailyHealthTips {
    // Use date as seed for consistent daily selection
    const seed = this.getDateSeed(date);
    
    // Define priority categories for balanced daily tips
    const priorityCategories = [
      HealthTipCategory.FITNESS,
      HealthTipCategory.NUTRITION,
      HealthTipCategory.MENTAL_HEALTH,
      HealthTipCategory.HYDRATION,
      HealthTipCategory.SLEEP,
      HealthTipCategory.GENERAL_WELLNESS,
      HealthTipCategory.INJURY_PREVENTION,
      HealthTipCategory.RECOVERY
    ];

    // Shuffle categories based on date seed for variety
    const shuffledCategories = this.shuffleArrayWithSeed(priorityCategories, seed);
    
    const selectedTips: HealthTip[] = [];
    const usedCategories: HealthTipCategory[] = [];

    // Select one tip from each of the first 4 categories
    for (let i = 0; i < 4 && i < shuffledCategories.length; i++) {
      const category = shuffledCategories[i];
      const categoryTips = getTipsByCategory(category);
      
      if (categoryTips.length > 0) {
        // Select tip based on date seed to ensure consistency
        const tipIndex = (seed + i) % categoryTips.length;
        const selectedTip = this.convertToHealthTip(categoryTips[tipIndex], `${date}_${category}_${tipIndex}`);
        
        selectedTips.push(selectedTip);
        usedCategories.push(category);
      }
    }

    // If we don't have 4 tips, fill with random tips from unused categories
    while (selectedTips.length < 4) {
      const remainingCategories = priorityCategories.filter(cat => !usedCategories.includes(cat));
      if (remainingCategories.length === 0) break;

      const randomCategory = remainingCategories[selectedTips.length % remainingCategories.length];
      const categoryTips = getTipsByCategory(randomCategory);
      
      if (categoryTips.length > 0) {
        const tipIndex = (seed + selectedTips.length) % categoryTips.length;
        const selectedTip = this.convertToHealthTip(categoryTips[tipIndex], `${date}_${randomCategory}_${tipIndex}`);
        
        selectedTips.push(selectedTip);
        usedCategories.push(randomCategory);
      }
    }

    return {
      date,
      tips: selectedTips,
      totalTips: selectedTips.length,
      categories: usedCategories
    };
  }

  /**
   * Get health tips by filter criteria
   */
  async getHealthTips(filter: HealthTipFilter = {}): Promise<HealthTip[]> {
    const { category, difficulty, tags, limit = 10 } = filter;
    
    let filteredTips = [...CURATED_HEALTH_TIPS];

    // Filter by category
    if (category) {
      filteredTips = filteredTips.filter(tip => tip.category === category);
    }

    // Filter by difficulty
    if (difficulty) {
      filteredTips = filteredTips.filter(tip => tip.difficulty === difficulty);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filteredTips = filteredTips.filter(tip => 
        tags.some(tag => tip.tags.includes(tag))
      );
    }

    // Convert to HealthTip format and limit results
    const healthTips = filteredTips
      .slice(0, limit)
      .map((tip, index) => this.convertToHealthTip(tip, `filter_${index}_${Date.now()}`));

    return healthTips;
  }

  /**
   * Get tips by specific category
   */
  async getTipsByCategory(category: HealthTipCategory, limit: number = 5): Promise<HealthTip[]> {
    const categoryTips = getTipsByCategory(category);
    return categoryTips
      .slice(0, limit)
      .map((tip, index) => this.convertToHealthTip(tip, `${category}_${index}_${Date.now()}`));
  }

  /**
   * Search health tips by keyword
   */
  async searchHealthTips(query: string, limit: number = 10): Promise<HealthTip[]> {
    const searchTerm = query.toLowerCase();
    
    const matchingTips = CURATED_HEALTH_TIPS.filter(tip => 
      tip.title.toLowerCase().includes(searchTerm) ||
      tip.content.toLowerCase().includes(searchTerm) ||
      tip.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    return matchingTips
      .slice(0, limit)
      .map((tip, index) => this.convertToHealthTip(tip, `search_${index}_${Date.now()}`));
  }

  /**
   * Convert CuratedHealthTip to HealthTip
   */
  private convertToHealthTip(curatedTip: CuratedHealthTip, id: string): HealthTip {
    return {
      id,
      title: curatedTip.title,
      content: curatedTip.content,
      category: curatedTip.category,
      tags: curatedTip.tags,
      difficulty: curatedTip.difficulty,
      estimatedReadTime: curatedTip.estimatedReadTime,
      source: curatedTip.source,
      createdAt: new Date(),
      isActive: true
    };
  }

  /**
   * Get current date string in YYYY-MM-DD format
   */
  private getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Generate a numeric seed from date string for consistent randomization
   */
  private getDateSeed(date: string): number {
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
      const char = date.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Shuffle array with seed for consistent randomization
   */
  private shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let randomIndex: number;

    // Use seeded random for consistent results
    const seededRandom = this.createSeededRandom(seed);

    while (currentIndex !== 0) {
      randomIndex = Math.floor(seededRandom() * currentIndex);
      currentIndex--;

      [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
  }

  /**
   * Create a seeded random number generator
   */
  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return function() {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * Calculate cache time until midnight (for daily tips)
   */
  private getCacheTimeUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    return midnight.getTime() - now.getTime(); // Milliseconds until midnight
  }

  /**
   * Get available categories
   */
  getAvailableCategories(): HealthTipCategory[] {
    return Object.values(HealthTipCategory);
  }

  /**
   * Get statistics about the tips database
   */
  getStatistics() {
    const categories = this.getAvailableCategories();
    const stats = categories.map(category => ({
      category,
      count: getTipsByCategory(category).length
    }));

    return {
      totalTips: CURATED_HEALTH_TIPS.length,
      categoriesCount: categories.length,
      categoryBreakdown: stats
    };
  }
}
