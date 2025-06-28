// In-memory caching service for Railway compatibility
import { API_CONFIG } from '../config/apiConfig';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  oldestEntry: number;
  newestEntry: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout;
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize: number = API_CONFIG.CACHE.MAX_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;

    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Store data in cache with TTL and LRU eviction
   */
  async set<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    const ttl = ttlMs || API_CONFIG.CACHE.TTL.RECOMMENDATIONS;

    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
  }

  /**
   * Retrieve data from cache with hit/miss tracking
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;

    return entry.data as T;
  }

  /**
   * Check if key exists in cache and is not expired
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get detailed cache statistics (async version with expired entries count)
   */
  async getDetailedStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    expiredEntries: number;
  }> {
    const totalEntries = this.cache.size;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [, entry] of this.cache.entries()) {
      // Calculate approximate size
      totalSize += JSON.stringify(entry).length;
      
      // Count expired entries
      if (Date.now() - entry.timestamp > entry.ttl) {
        expiredEntries++;
      }
    }

    return {
      totalEntries,
      totalSize,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      expiredEntries
    };
  }

  /**
   * Invalidate cache entries for a specific user
   */
  async invalidateUserCache(userId: string): Promise<number> {
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      if (this.cache.delete(key)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let deletedCount = 0;
    const keysToDelete: string[] = [];
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      if (this.cache.delete(key)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Get cache entries by pattern
   */
  async getByPattern<T>(pattern: string): Promise<Array<{ key: string; data: T }>> {
    const results: Array<{ key: string; data: T }> = [];
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(key)) {
        // Check if entry has expired
        if (Date.now() - entry.timestamp <= entry.ttl) {
          results.push({ key, data: entry.data as T });
        } else {
          // Clean up expired entry
          this.cache.delete(key);
        }
      }
    }

    return results;
  }

  /**
   * Set cache entry with custom expiration time
   */
  async setWithExpiration<T>(key: string, data: T, expirationDate: Date): Promise<void> {
    const ttl = expirationDate.getTime() - Date.now();
    
    if (ttl <= 0) {
      throw new Error('Expiration date must be in the future');
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now
    };

    this.cache.set(key, entry);
  }

  /**
   * Extend TTL for existing cache entry
   */
  async extendTTL(key: string, additionalSeconds: number): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    // Extend TTL
    entry.ttl += additionalSeconds * 1000;
    this.cache.set(key, entry);
    
    return true;
  }

  /**
   * Get remaining TTL for a cache entry
   */
  async getRemainingTTL(key: string): Promise<number | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const elapsed = Date.now() - entry.timestamp;
    const remaining = entry.ttl - elapsed;

    if (remaining <= 0) {
      this.cache.delete(key);
      return null;
    }

    return Math.floor(remaining / 1000); // Return in seconds
  }

  /**
   * LRU eviction - remove least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    let oldestEntry = Date.now();
    let newestEntry = 0;

    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldestEntry) oldestEntry = entry.timestamp;
      if (entry.timestamp > newestEntry) newestEntry = entry.timestamp;
    }

    return {
      totalEntries: this.cache.size,
      totalSize: this.getApproximateSize(),
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.misses / totalRequests : 0,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Get approximate memory usage
   */
  private getApproximateSize(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length + JSON.stringify(entry.data).length;
    }
    return size;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });

    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }



  /**
   * Destroy cache service and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}
