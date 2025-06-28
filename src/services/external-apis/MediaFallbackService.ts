import axios, { AxiosResponse } from 'axios';
import { CacheService } from '../CacheService';
import { GifFallbackService, GifResult } from './GifFallbackService';

export interface MediaResult {
  id: string;
  url: string;
  type: 'image' | 'gif' | 'video';
  title: string;
  width: number;
  height: number;
  size?: number;
  source: 'unsplash' | 'giphy' | 'tenor' | 'exercisedb' | 'placeholder';
  thumbnailUrl?: string;
  caption?: string;
  quality: 'high' | 'medium' | 'low';
}

export interface MediaSearchResponse {
  data: MediaResult[];
  success: boolean;
  primarySource: string;
}

/**
 * Comprehensive media service that intelligently selects the best media type and source
 * for different workout content needs
 */
export class MediaFallbackService {
  private cacheService: CacheService;
  private gifFallbackService: GifFallbackService;
  private unsplashApiKey: string;
  private unsplashBaseUrl = 'https://api.unsplash.com';

  constructor(cacheService?: CacheService) {
    this.cacheService = cacheService || new CacheService();
    this.gifFallbackService = new GifFallbackService(this.cacheService);
    this.unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY || '';
  }

  /**
   * Get the best media for a workout step based on exercise type and content
   */
  async getStepMedia(
    exerciseName: string,
    bodyParts: string[] = [],
    preferredType: 'auto' | 'image' | 'gif' | 'video' = 'auto',
    originalUrl?: string
  ): Promise<MediaResult[]> {
    const cacheKey = `step_media:${exerciseName}:${bodyParts.join(',').toLowerCase()}:${preferredType}`;

    // Try cache first
    const cached = await this.cacheService.get<MediaResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let mediaResults: MediaResult[] = [];

      // Determine the best media type if auto
      const targetType = preferredType === 'auto' ? this.determineOptimalMediaType(exerciseName, bodyParts) : preferredType;

      switch (targetType) {
        case 'gif':
          mediaResults = await this.getExerciseGifs(exerciseName, bodyParts, originalUrl);
          break;
        case 'image':
          mediaResults = await this.getExerciseImages(exerciseName, bodyParts);
          break;
        case 'video':
          // For now, fallback to GIFs for video requests
          mediaResults = await this.getExerciseGifs(exerciseName, bodyParts, originalUrl);
          break;
      }

      // If primary type fails, try fallbacks
      if (mediaResults.length === 0) {
        console.log(`🔄 Primary media type ${targetType} failed for "${exerciseName}", trying fallbacks...`);
        mediaResults = await this.getFallbackMedia(exerciseName, bodyParts, targetType);
      }

      // Cache successful results
      if (mediaResults.length > 0) {
        await this.cacheService.set(cacheKey, mediaResults, 3600000); // 1 hour cache
      }

      return mediaResults;
    } catch (error) {
      console.error('Error getting step media:', error);
      return [this.getPlaceholderMedia(exerciseName, 'gif')];
    }
  }

  /**
   * Get high-quality images for workout overview/thumbnails
   */
  async getWorkoutOverviewImage(
    workoutType: string,
    bodyParts: string[] = [],
    fitnessGoal?: string
  ): Promise<MediaResult | null> {
    const cacheKey = `workout_overview:${workoutType}:${bodyParts.join(',').toLowerCase()}:${fitnessGoal}`;

    // Try cache first
    const cached = await this.cacheService.get<MediaResult>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Build search query for workout overview
      const searchQuery = this.buildWorkoutImageQuery(workoutType, bodyParts, fitnessGoal);
      
      // Try Unsplash for high-quality workout images
      const unsplashResult = await this.searchUnsplash(searchQuery, 1);
      
      if (unsplashResult.length > 0) {
        const result = unsplashResult[0];
        await this.cacheService.set(cacheKey, result, 7200000); // 2 hour cache
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error getting workout overview image:', error);
      return null;
    }
  }

  /**
   * Get exercise demonstration GIFs
   */
  private async getExerciseGifs(
    exerciseName: string,
    bodyParts: string[],
    originalUrl?: string
  ): Promise<MediaResult[]> {
    // First, check if original URL is working
    if (originalUrl && await this.isUrlWorking(originalUrl)) {
      return [{
        id: `original_${Date.now()}`,
        url: originalUrl,
        type: 'gif',
        title: exerciseName,
        width: 480,
        height: 270,
        source: 'exercisedb',
        quality: 'high'
      }];
    }

    // Use GIF fallback service
    const gifResult = await this.gifFallbackService.searchExerciseGifs(exerciseName, bodyParts, 2);
    
    if (gifResult.success && gifResult.data.length > 0) {
      return gifResult.data.map(gif => ({
        id: gif.id,
        url: gif.url,
        type: 'gif' as const,
        title: gif.title,
        width: gif.width,
        height: gif.height,
        size: gif.size,
        source: gif.source,
        thumbnailUrl: gif.previewUrl,
        quality: 'medium'
      }));
    }

    return [];
  }

  /**
   * Get high-quality exercise images from Unsplash
   */
  private async getExerciseImages(exerciseName: string, bodyParts: string[]): Promise<MediaResult[]> {
    if (!this.unsplashApiKey) {
      console.warn('Unsplash API key not configured');
      return [];
    }

    const searchQuery = this.buildExerciseImageQuery(exerciseName, bodyParts);
    return await this.searchUnsplash(searchQuery, 2);
  }

  /**
   * Search Unsplash for high-quality images
   */
  private async searchUnsplash(query: string, limit: number): Promise<MediaResult[]> {
    if (!this.unsplashApiKey) {
      return [];
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.unsplashBaseUrl}/search/photos`, {
        params: {
          query,
          per_page: limit,
          orientation: 'landscape',
          content_filter: 'high'
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashApiKey}`
        },
        timeout: 5000
      });

      if (response.data && response.data.results) {
        return response.data.results.map((photo: any) => ({
          id: photo.id,
          url: photo.urls.regular,
          type: 'image' as const,
          title: photo.alt_description || query,
          width: photo.width,
          height: photo.height,
          source: 'unsplash' as const,
          thumbnailUrl: photo.urls.thumb,
          caption: photo.description || photo.alt_description,
          quality: 'high' as const
        }));
      }

      return [];
    } catch (error) {
      console.error('Unsplash API error:', error);
      return [];
    }
  }

  /**
   * Determine the optimal media type based on exercise characteristics
   */
  private determineOptimalMediaType(exerciseName: string, bodyParts: string[]): 'image' | 'gif' | 'video' {
    const name = exerciseName.toLowerCase();
    
    // Complex movements benefit from GIFs
    if (name.includes('squat') || name.includes('deadlift') || name.includes('press') || 
        name.includes('curl') || name.includes('row') || name.includes('pull') ||
        bodyParts.some(part => ['chest', 'back', 'upper arms', 'upper legs'].includes(part))) {
      return 'gif';
    }
    
    // Static/isometric exercises can use images
    if (name.includes('plank') || name.includes('hold') || name.includes('isometric') ||
        name.includes('stretch') || name.includes('pose')) {
      return 'image';
    }
    
    // Cardio and dynamic movements prefer GIFs
    if (bodyParts.includes('cardio') || name.includes('jump') || name.includes('run')) {
      return 'gif';
    }
    
    // Default to GIF for exercise demonstrations
    return 'gif';
  }

  /**
   * Get fallback media when primary type fails
   */
  private async getFallbackMedia(
    exerciseName: string,
    bodyParts: string[],
    failedType: string
  ): Promise<MediaResult[]> {
    console.log(`🔄 Trying fallback media for "${exerciseName}" (${failedType} failed)`);
    
    // Try GIFs if images failed
    if (failedType === 'image') {
      const gifs = await this.getExerciseGifs(exerciseName, bodyParts);
      if (gifs.length > 0) return gifs;
    }
    
    // Try images if GIFs failed
    if (failedType === 'gif') {
      const images = await this.getExerciseImages(exerciseName, bodyParts);
      if (images.length > 0) return images;
    }
    
    // Final fallback: placeholder
    return [this.getPlaceholderMedia(exerciseName, failedType as any)];
  }

  /**
   * Build search query for exercise images
   */
  private buildExerciseImageQuery(exerciseName: string, bodyParts: string[]): string {
    const cleanedName = exerciseName.toLowerCase()
      .replace(/\b(exercise|workout|training|fitness)\b/g, '')
      .trim();

    const relevantBodyParts = bodyParts
      .filter(part => part && part.length > 2)
      .slice(0, 2);

    return [cleanedName, ...relevantBodyParts, 'fitness', 'exercise']
      .filter(term => term && term.length > 0)
      .join(' ');
  }

  /**
   * Build search query for workout overview images
   */
  private buildWorkoutImageQuery(workoutType: string, bodyParts: string[], fitnessGoal?: string): string {
    const terms = [workoutType, 'workout', 'fitness'];
    
    if (fitnessGoal) {
      terms.push(fitnessGoal.replace('_', ' '));
    }
    
    if (bodyParts.length > 0) {
      terms.push(bodyParts[0]);
    }
    
    return terms.join(' ');
  }

  /**
   * Check if a URL is working
   */
  private async isUrlWorking(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get placeholder media
   */
  private getPlaceholderMedia(exerciseName: string, type: 'image' | 'gif' | 'video'): MediaResult {
    const placeholderUrls = {
      image: 'https://via.placeholder.com/480x270/4A90E2/FFFFFF?text=Exercise+Image',
      gif: 'https://via.placeholder.com/480x270/E24A4A/FFFFFF?text=Exercise+GIF',
      video: 'https://via.placeholder.com/480x270/4AE24A/FFFFFF?text=Exercise+Video'
    };

    return {
      id: `placeholder_${Date.now()}`,
      url: placeholderUrls[type],
      type,
      title: exerciseName,
      width: 480,
      height: 270,
      source: 'placeholder',
      quality: 'low'
    };
  }

  /**
   * Health check for media APIs
   */
  async healthCheck(): Promise<{ unsplash: boolean; giphy: boolean; tenor: boolean }> {
    const gifHealth = await this.gifFallbackService.healthCheck();
    
    return {
      unsplash: !!this.unsplashApiKey,
      giphy: gifHealth.giphy,
      tenor: gifHealth.tenor
    };
  }
}
