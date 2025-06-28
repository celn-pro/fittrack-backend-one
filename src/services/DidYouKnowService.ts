// Did You Know Facts Service - Provides interesting facts with external API integration
import { 
  DidYouKnowFact, 
  FactCategory, 
  FactSource,
  DailyDidYouKnowFacts, 
  DidYouKnowFilter,
  CuratedDidYouKnowFact,
  NumbersApiResponse,
  CatFactsApiResponse,
  UselessFactsApiResponse
} from '../types/didYouKnow.types';
import { CURATED_DID_YOU_KNOW_FACTS, getFactsByCategory } from '../data/didYouKnowDatabase';
import { CacheService } from './CacheService';

export class DidYouKnowService {
  private cacheService: CacheService;

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService();
  }

  /**
   * Get daily did you know facts (mix of curated and API facts)
   */
  async getDailyDidYouKnowFacts(date?: string, count: number = 3): Promise<DailyDidYouKnowFacts> {
    const targetDate = date || this.getCurrentDateString();
    const cacheKey = `did_you_know:daily:${targetDate}:${count}`;

    // Try cache first
    const cached = await this.cacheService.get<DailyDidYouKnowFacts>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached daily did you know facts for ${targetDate}`);
      return cached;
    }

    console.log(`🔄 Generating new daily did you know facts for ${targetDate}`);

    // Generate mix of curated and API facts
    const dailyFacts = await this.generateDailyFacts(targetDate, count);

    // Cache for 24 hours (until next day)
    const cacheUntilMidnight = this.getCacheTimeUntilMidnight();
    await this.cacheService.set(cacheKey, dailyFacts, cacheUntilMidnight);

    return dailyFacts;
  }

  /**
   * Generate daily facts mixing curated and external API sources
   */
  private async generateDailyFacts(date: string, count: number): Promise<DailyDidYouKnowFacts> {
    const seed = this.getDateSeed(date);
    const facts: DidYouKnowFact[] = [];
    const usedCategories: FactCategory[] = [];

    // Get 60% curated facts, 40% from APIs
    const curatedCount = Math.ceil(count * 0.6);
    const apiCount = count - curatedCount;

    // Get curated facts
    const curatedFacts = this.getCuratedFactsForDay(date, curatedCount);
    facts.push(...curatedFacts);
    
    // Track categories used
    curatedFacts.forEach(fact => {
      if (!usedCategories.includes(fact.category)) {
        usedCategories.push(fact.category);
      }
    });

    // Get facts from external APIs
    const apiFacts = await this.getApiFactsForDay(apiCount);
    facts.push(...apiFacts);

    // Track API fact categories
    apiFacts.forEach(fact => {
      if (!usedCategories.includes(fact.category)) {
        usedCategories.push(fact.category);
      }
    });

    return {
      date,
      facts,
      totalFacts: facts.length,
      categories: usedCategories
    };
  }

  /**
   * Get curated facts for a specific day
   */
  private getCuratedFactsForDay(date: string, count: number): DidYouKnowFact[] {
    const seed = this.getDateSeed(date);
    const shuffledFacts = this.shuffleArrayWithSeed([...CURATED_DID_YOU_KNOW_FACTS], seed);
    
    return shuffledFacts
      .slice(0, count)
      .map((fact, index) => this.convertToDidYouKnowFact(fact, `${date}_curated_${index}`, FactSource.CURATED));
  }

  /**
   * Get facts from external APIs
   */
  private async getApiFactsForDay(count: number): Promise<DidYouKnowFact[]> {
    const facts: DidYouKnowFact[] = [];
    const apiSources = [
      { source: FactSource.NUMBERS_API, method: this.getNumbersFact.bind(this) },
      { source: FactSource.CAT_FACTS_API, method: this.getCatFact.bind(this) },
      { source: FactSource.USELESS_FACTS_API, method: this.getUselessFact.bind(this) }
    ];

    for (let i = 0; i < count && i < apiSources.length; i++) {
      try {
        const apiSource = apiSources[i % apiSources.length];
        const fact = await apiSource.method();
        if (fact) {
          facts.push(fact);
        }
      } catch (error) {
        console.warn(`Failed to get fact from API:`, error);
        // Fallback to curated fact
        const fallbackFact = this.getFallbackCuratedFact(i);
        if (fallbackFact) {
          facts.push(fallbackFact);
        }
      }
    }

    return facts;
  }

  /**
   * Get fact from Numbers API
   */
  private async getNumbersFact(): Promise<DidYouKnowFact | null> {
    try {
      const response = await fetch('http://numbersapi.com/random/trivia');
      const text = await response.text();
      
      if (text && text.length > 0) {
        return {
          id: `numbers_api_${Date.now()}`,
          fact: `Did you know that ${text}`,
          category: FactCategory.NUMBERS,
          source: FactSource.NUMBERS_API,
          tags: ['numbers', 'trivia', 'mathematics'],
          isVerified: false,
          difficulty: 'easy',
          estimatedReadTime: Math.max(8, Math.ceil(text.length / 10)),
          createdAt: new Date(),
          isActive: true
        };
      }
    } catch (error) {
      console.warn('Numbers API failed:', error);
    }
    return null;
  }

  /**
   * Get fact from Cat Facts API
   */
  private async getCatFact(): Promise<DidYouKnowFact | null> {
    try {
      const response = await fetch('https://catfact.ninja/fact');
      const data: CatFactsApiResponse = await response.json();
      
      if (data.fact) {
        return {
          id: `cat_facts_${Date.now()}`,
          fact: `Did you know that ${data.fact}`,
          category: FactCategory.ANIMALS,
          source: FactSource.CAT_FACTS_API,
          tags: ['cats', 'animals', 'pets'],
          isVerified: false,
          difficulty: 'easy',
          estimatedReadTime: Math.max(8, Math.ceil(data.fact.length / 10)),
          createdAt: new Date(),
          isActive: true
        };
      }
    } catch (error) {
      console.warn('Cat Facts API failed:', error);
    }
    return null;
  }

  /**
   * Get fact from Useless Facts API
   */
  private async getUselessFact(): Promise<DidYouKnowFact | null> {
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
      const data: UselessFactsApiResponse = await response.json();
      
      if (data.text) {
        return {
          id: `useless_facts_${Date.now()}`,
          fact: `Did you know that ${data.text}`,
          category: FactCategory.GENERAL,
          source: FactSource.USELESS_FACTS_API,
          tags: ['general', 'trivia', 'random'],
          isVerified: false,
          difficulty: 'easy',
          estimatedReadTime: Math.max(8, Math.ceil(data.text.length / 10)),
          createdAt: new Date(),
          isActive: true
        };
      }
    } catch (error) {
      console.warn('Useless Facts API failed:', error);
    }
    return null;
  }

  /**
   * Get fallback curated fact when API fails
   */
  private getFallbackCuratedFact(index: number): DidYouKnowFact | null {
    if (index < CURATED_DID_YOU_KNOW_FACTS.length) {
      const fact = CURATED_DID_YOU_KNOW_FACTS[index];
      return this.convertToDidYouKnowFact(fact, `fallback_${index}_${Date.now()}`, FactSource.CURATED);
    }
    return null;
  }

  /**
   * Get facts with filtering options
   */
  async getDidYouKnowFacts(filter: DidYouKnowFilter = {}): Promise<DidYouKnowFact[]> {
    const { category, source, difficulty, tags, limit = 10 } = filter;
    
    let filteredFacts = [...CURATED_DID_YOU_KNOW_FACTS];

    // Filter by category
    if (category) {
      filteredFacts = filteredFacts.filter(fact => fact.category === category);
    }

    // Filter by difficulty
    if (difficulty) {
      filteredFacts = filteredFacts.filter(fact => fact.difficulty === difficulty);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filteredFacts = filteredFacts.filter(fact => 
        tags.some(tag => fact.tags.includes(tag))
      );
    }

    // Convert to DidYouKnowFact format and limit results
    let facts = filteredFacts
      .slice(0, limit)
      .map((fact, index) => this.convertToDidYouKnowFact(fact, `filter_${index}_${Date.now()}`, FactSource.CURATED));

    // If source filter includes API sources and we have room, add API facts
    if (source && source !== FactSource.CURATED && facts.length < limit) {
      const remainingCount = limit - facts.length;
      const apiFacts = await this.getApiFactsForDay(remainingCount);
      facts = [...facts, ...apiFacts];
    }

    return facts;
  }

  /**
   * Search facts by keyword
   */
  async searchDidYouKnowFacts(query: string, limit: number = 10): Promise<DidYouKnowFact[]> {
    const searchTerm = query.toLowerCase();
    
    const matchingFacts = CURATED_DID_YOU_KNOW_FACTS.filter(fact => 
      fact.fact.toLowerCase().includes(searchTerm) ||
      fact.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    return matchingFacts
      .slice(0, limit)
      .map((fact, index) => this.convertToDidYouKnowFact(fact, `search_${index}_${Date.now()}`, FactSource.CURATED));
  }

  /**
   * Convert CuratedDidYouKnowFact to DidYouKnowFact
   */
  private convertToDidYouKnowFact(curatedFact: CuratedDidYouKnowFact, id: string, source: FactSource): DidYouKnowFact {
    return {
      id,
      fact: curatedFact.fact,
      category: curatedFact.category,
      source,
      tags: curatedFact.tags,
      isVerified: curatedFact.isVerified,
      difficulty: curatedFact.difficulty,
      estimatedReadTime: curatedFact.estimatedReadTime,
      createdAt: new Date(),
      isActive: true
    };
  }

  /**
   * Utility methods (similar to HealthTipsService)
   */
  private getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDateSeed(date: string): number {
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
      const char = date.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    const seededRandom = this.createSeededRandom(seed);

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(seededRandom() * currentIndex);
      currentIndex--;
      [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return function() {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  private getCacheTimeUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }

  /**
   * Get available categories
   */
  getAvailableCategories(): FactCategory[] {
    return Object.values(FactCategory);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const categories = this.getAvailableCategories();
    const stats = categories.map(category => ({
      category,
      count: getFactsByCategory(category).length
    }));

    return {
      totalFacts: CURATED_DID_YOU_KNOW_FACTS.length,
      categoriesCount: categories.length,
      categoryBreakdown: stats
    };
  }
}
