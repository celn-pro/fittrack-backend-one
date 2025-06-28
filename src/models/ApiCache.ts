// New caching model for API responses and recommendations
import { CacheEntry } from '../services/CacheService';

/**
 * API Cache Model - Persistent cache storage
 */
export class ApiCache {
  id: string;
  key: string;
  data: any;
  ttl: number; // Time to live in seconds
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
  tags: string[]; // For cache invalidation by tags
  size: number; // Size in bytes
  compressed: boolean;
  metadata: CacheMetadata;

  constructor(data: {
    id?: string;
    key: string;
    data: any;
    ttl: number;
    tags?: string[];
    metadata?: Partial<CacheMetadata>;
  }) {
    this.id = data.id || this.generateId();
    this.key = data.key;
    this.data = data.data;
    this.ttl = data.ttl;
    this.createdAt = new Date();
    this.expiresAt = new Date(Date.now() + (data.ttl * 1000));
    this.accessCount = 0;
    this.lastAccessedAt = new Date();
    this.tags = data.tags || [];
    this.size = this.calculateSize(data.data);
    this.compressed = false;
    this.metadata = {
      source: 'api',
      version: '1.0',
      ...data.metadata
    };
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if cache entry is valid (not expired and has data)
   */
  isValid(): boolean {
    return !this.isExpired() && this.data !== null && this.data !== undefined;
  }

  /**
   * Access the cached data (updates access statistics)
   */
  access(): any {
    if (!this.isValid()) {
      return null;
    }

    this.accessCount++;
    this.lastAccessedAt = new Date();
    return this.data;
  }

  /**
   * Update the cached data and reset TTL
   */
  update(newData: any, newTtl?: number): void {
    this.data = newData;
    this.size = this.calculateSize(newData);
    
    if (newTtl) {
      this.ttl = newTtl;
      this.expiresAt = new Date(Date.now() + (newTtl * 1000));
    }
    
    this.metadata.lastUpdated = new Date();
  }

  /**
   * Extend the TTL of the cache entry
   */
  extend(additionalSeconds: number): void {
    this.ttl += additionalSeconds;
    this.expiresAt = new Date(this.expiresAt.getTime() + (additionalSeconds * 1000));
  }

  /**
   * Get remaining TTL in seconds
   */
  getRemainingTTL(): number {
    const remaining = Math.floor((this.expiresAt.getTime() - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  /**
   * Add tags for cache invalidation
   */
  addTags(tags: string[]): void {
    this.tags = [...new Set([...this.tags, ...tags])];
  }

  /**
   * Remove tags
   */
  removeTags(tags: string[]): void {
    this.tags = this.tags.filter(tag => !tags.includes(tag));
  }

  /**
   * Check if cache entry has any of the specified tags
   */
  hasTags(tags: string[]): boolean {
    return tags.some(tag => this.tags.includes(tag));
  }

  /**
   * Compress the cached data (placeholder for actual compression)
   */
  compress(): void {
    if (!this.compressed && this.size > 1024) { // Only compress if > 1KB
      // In a real implementation, you would use a compression library
      // this.data = compress(this.data);
      this.compressed = true;
      this.metadata.compressionRatio = 0.7; // Placeholder
    }
  }

  /**
   * Decompress the cached data (placeholder for actual decompression)
   */
  decompress(): any {
    if (this.compressed) {
      // In a real implementation, you would decompress the data
      // return decompress(this.data);
      return this.data;
    }
    return this.data;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      id: this.id,
      key: this.key,
      size: this.size,
      accessCount: this.accessCount,
      hitRate: this.accessCount > 0 ? 1 : 0, // Simplified calculation
      createdAt: this.createdAt,
      lastAccessedAt: this.lastAccessedAt,
      expiresAt: this.expiresAt,
      remainingTTL: this.getRemainingTTL(),
      tags: this.tags,
      compressed: this.compressed
    };
  }

  /**
   * Serialize for storage
   */
  toJSON(): CacheRecord {
    return {
      id: this.id,
      key: this.key,
      data: this.data,
      ttl: this.ttl,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      accessCount: this.accessCount,
      lastAccessedAt: this.lastAccessedAt,
      tags: this.tags,
      size: this.size,
      compressed: this.compressed,
      metadata: this.metadata
    };
  }

  /**
   * Create from stored record
   */
  static fromJSON(record: CacheRecord): ApiCache {
    const cache = new ApiCache({
      key: record.key,
      data: record.data,
      ttl: record.ttl,
      tags: record.tags,
      metadata: record.metadata
    });

    // Restore stored properties
    cache.id = record.id;
    cache.createdAt = new Date(record.createdAt);
    cache.expiresAt = new Date(record.expiresAt);
    cache.accessCount = record.accessCount;
    cache.lastAccessedAt = new Date(record.lastAccessedAt);
    cache.size = record.size;
    cache.compressed = record.compressed;

    return cache;
  }

  /**
   * Create cache key from components
   */
  static createKey(components: string[]): string {
    return components.join(':');
  }

  /**
   * Create cache key for user-specific data
   */
  static createUserKey(userId: string, type: string, ...params: string[]): string {
    return this.createKey(['user', userId, type, ...params]);
  }

  /**
   * Create cache key for API responses
   */
  static createApiKey(service: string, endpoint: string, ...params: string[]): string {
    return this.createKey(['api', service, endpoint, ...params]);
  }

  /**
   * Create cache key for recommendations
   */
  static createRecommendationKey(userId: string, type: string, profileHash: string): string {
    return this.createKey(['recommendation', userId, type, profileHash]);
  }

  private generateId(): string {
    return `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSize(data: any): number {
    // Simple size calculation - in production, use a more accurate method
    return JSON.stringify(data).length;
  }
}

/**
 * Cache Metadata Interface
 */
export interface CacheMetadata {
  source: 'api' | 'database' | 'computation' | 'user_input';
  version: string;
  lastUpdated?: Date;
  compressionRatio?: number;
  dependencies?: string[]; // Other cache keys this depends on
  invalidationRules?: string[]; // Rules for when to invalidate
  priority?: 'low' | 'medium' | 'high'; // Cache priority for eviction
  category?: string; // Category for grouping
}

/**
 * Cache Record Interface (for persistence)
 */
export interface CacheRecord {
  id: string;
  key: string;
  data: any;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
  tags: string[];
  size: number;
  compressed: boolean;
  metadata: CacheMetadata;
}

/**
 * Cache Statistics Interface
 */
export interface CacheStats {
  id: string;
  key: string;
  size: number;
  accessCount: number;
  hitRate: number;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
  remainingTTL: number;
  tags: string[];
  compressed: boolean;
}

/**
 * Cache Manager for handling multiple cache instances
 */
export class CacheManager {
  private caches: Map<string, ApiCache> = new Map();
  private maxSize: number;
  private currentSize: number = 0;

  constructor(maxSize: number = 100 * 1024 * 1024) { // 100MB default
    this.maxSize = maxSize;
  }

  /**
   * Set cache entry
   */
  set(key: string, data: any, ttl: number, tags?: string[]): void {
    // Remove existing entry if it exists
    if (this.caches.has(key)) {
      const existing = this.caches.get(key)!;
      this.currentSize -= existing.size;
    }

    const cache = new ApiCache({ key, data, ttl, tags });
    
    // Check if we need to evict entries
    this.evictIfNeeded(cache.size);
    
    this.caches.set(key, cache);
    this.currentSize += cache.size;
  }

  /**
   * Get cache entry
   */
  get(key: string): any {
    const cache = this.caches.get(key);
    if (!cache || !cache.isValid()) {
      if (cache) {
        this.delete(key);
      }
      return null;
    }

    return cache.access();
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const cache = this.caches.get(key);
    if (cache) {
      this.currentSize -= cache.size;
      return this.caches.delete(key);
    }
    return false;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.caches.clear();
    this.currentSize = 0;
  }

  /**
   * Invalidate cache entries by tags
   */
  invalidateByTags(tags: string[]): number {
    let deletedCount = 0;
    
    for (const [key, cache] of this.caches.entries()) {
      if (cache.hasTags(tags)) {
        this.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    totalSize: number;
    maxSize: number;
    utilizationPercentage: number;
    entries: CacheStats[];
  } {
    const entries = Array.from(this.caches.values()).map(cache => cache.getStats());
    
    return {
      totalEntries: this.caches.size,
      totalSize: this.currentSize,
      maxSize: this.maxSize,
      utilizationPercentage: (this.currentSize / this.maxSize) * 100,
      entries
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let deletedCount = 0;
    
    for (const [key, cache] of this.caches.entries()) {
      if (cache.isExpired()) {
        this.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  private evictIfNeeded(newEntrySize: number): void {
    // Simple LRU eviction strategy
    while (this.currentSize + newEntrySize > this.maxSize && this.caches.size > 0) {
      let oldestKey = '';
      let oldestTime = Date.now();
      
      for (const [key, cache] of this.caches.entries()) {
        if (cache.lastAccessedAt.getTime() < oldestTime) {
          oldestTime = cache.lastAccessedAt.getTime();
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.delete(oldestKey);
      } else {
        break;
      }
    }
  }
}
