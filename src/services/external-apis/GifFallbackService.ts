import axios, { AxiosResponse } from 'axios';
import { CacheService } from '../CacheService';

export interface GifResult {
  id: string;
  url: string;
  title: string;
  width: number;
  height: number;
  size?: number;
  source: 'giphy' | 'tenor';
  previewUrl?: string;
}

export interface GifSearchResponse {
  data: GifResult[];
  success: boolean;
  source: 'giphy' | 'tenor';
}

/**
 * Service to fetch exercise-related GIFs from GIPHY and Tenor APIs
 * as fallback when ExerciseDB GIFs are broken
 */
export class GifFallbackService {
  private cacheService: CacheService;
  private giphyApiKey: string;
  private tenorApiKey: string;
  private giphyBaseUrl = 'https://api.giphy.com/v1';
  private tenorBaseUrl = 'https://g.tenor.com/v1';

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService();
    // Use demo key if no env key is set (for testing purposes)
    this.giphyApiKey = process.env.GIPHY_API_KEY || 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65';
    this.tenorApiKey = process.env.TENOR_API_KEY || '';
  }

  /**
   * Search for exercise-related GIFs using exercise name and body parts
   */
  async searchExerciseGifs(
    exerciseName: string,
    bodyParts: string[] = [],
    limit: number = 3
  ): Promise<GifSearchResponse> {
    const cacheKey = `gif_fallback:${exerciseName}:${bodyParts.join(',').toLowerCase()}:${limit}`;

    // Try cache first
    const cached = await this.cacheService.get<GifResult[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        success: true,
        source: cached[0]?.source || 'giphy'
      };
    }

    try {
      // Create search query combining exercise name and body parts
      const searchQuery = this.buildSearchQuery(exerciseName, bodyParts);
      
      // Try GIPHY first, then Tenor as fallback
      let result = await this.searchGiphy(searchQuery, limit);
      
      if (!result.success || result.data.length === 0) {
        console.log('GIPHY search failed or returned no results, trying Tenor...');
        result = await this.searchTenor(searchQuery, limit);
      }

      // Cache successful results
      if (result.success && result.data.length > 0) {
        await this.cacheService.set(cacheKey, result.data, 3600000); // 1 hour cache
      }

      return result;
    } catch (error) {
      console.error('Error searching for exercise GIFs:', error);
      return {
        data: [],
        success: false,
        source: 'giphy'
      };
    }
  }

  /**
   * Search GIPHY for exercise GIFs
   */
  private async searchGiphy(query: string, limit: number): Promise<GifSearchResponse> {
    if (!this.giphyApiKey) {
      console.warn('GIPHY API key not configured');
      return { data: [], success: false, source: 'giphy' };
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.giphyBaseUrl}/gifs/search`, {
        params: {
          api_key: this.giphyApiKey,
          q: query,
          limit,
          rating: 'g', // Safe content only
          lang: 'en'
        },
        timeout: 5000
      });

      if (response.data && response.data.data) {
        const gifs: GifResult[] = response.data.data.map((gif: any) => ({
          id: gif.id,
          url: gif.images?.fixed_height?.url || gif.images?.original?.url,
          title: gif.title || query,
          width: parseInt(gif.images?.fixed_height?.width || gif.images?.original?.width || '200'),
          height: parseInt(gif.images?.fixed_height?.height || gif.images?.original?.height || '200'),
          size: parseInt(gif.images?.fixed_height?.size || gif.images?.original?.size || '0'),
          source: 'giphy' as const,
          previewUrl: gif.images?.fixed_height_still?.url || gif.images?.original_still?.url
        }));

        return {
          data: gifs.filter(gif => gif.url), // Filter out any without URLs
          success: true,
          source: 'giphy'
        };
      }

      return { data: [], success: false, source: 'giphy' };
    } catch (error) {
      console.error('GIPHY API error:', error);
      return { data: [], success: false, source: 'giphy' };
    }
  }

  /**
   * Search Tenor for exercise GIFs
   */
  private async searchTenor(query: string, limit: number): Promise<GifSearchResponse> {
    if (!this.tenorApiKey) {
      console.warn('Tenor API key not configured');
      return { data: [], success: false, source: 'tenor' };
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.tenorBaseUrl}/search`, {
        params: {
          key: this.tenorApiKey,
          q: query,
          limit,
          contentfilter: 'high', // Safe content only
          media_filter: 'minimal', // Reduce response size
          locale: 'en_US'
        },
        timeout: 5000
      });

      if (response.data && response.data.results) {
        const gifs: GifResult[] = response.data.results.map((gif: any) => {
          const media = gif.media?.[0];
          const gifFormat = media?.gif || media?.tinygif;
          const previewFormat = media?.nanogif || media?.tinygif;

          return {
            id: gif.id,
            url: gifFormat?.url,
            title: gif.title || query,
            width: gifFormat?.dims?.[0] || 200,
            height: gifFormat?.dims?.[1] || 200,
            size: gifFormat?.size || 0,
            source: 'tenor' as const,
            previewUrl: previewFormat?.url
          };
        });

        return {
          data: gifs.filter(gif => gif.url), // Filter out any without URLs
          success: true,
          source: 'tenor'
        };
      }

      return { data: [], success: false, source: 'tenor' };
    } catch (error) {
      console.error('Tenor API error:', error);
      return { data: [], success: false, source: 'tenor' };
    }
  }

  /**
   * Build search query from exercise name and body parts
   */
  private buildSearchQuery(exerciseName: string, bodyParts: string[]): string {
    // Clean exercise name - remove common words and focus on key terms
    const cleanedName = exerciseName
      .toLowerCase()
      .replace(/\b(exercise|workout|training|fitness)\b/g, '')
      .trim();

    // Combine with relevant body parts for better search results
    const relevantBodyParts = bodyParts
      .filter(part => part && part.length > 2)
      .slice(0, 2); // Limit to 2 most relevant body parts

    const searchTerms = [cleanedName, ...relevantBodyParts, 'exercise']
      .filter(term => term && term.length > 0)
      .join(' ');

    return searchTerms;
  }

  /**
   * Health check for GIF APIs
   */
  async healthCheck(): Promise<{ giphy: boolean; tenor: boolean }> {
    const giphyHealthy = !!this.giphyApiKey;
    const tenorHealthy = !!this.tenorApiKey;

    return {
      giphy: giphyHealthy,
      tenor: tenorHealthy
    };
  }
}
