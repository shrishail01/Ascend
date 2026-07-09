import logger from '../utils/logger';

/**
 * Mock in-memory caching service to abstract Redis integrations.
 * Can be swapped with redis client connections in Phase 3.
 */
class CacheService {
  private memoryCache = new Map<string, { value: any; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    logger.debug(`CACHE: [GET] Key: ${key}`);
    const record = this.memoryCache.get(key);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return record.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    logger.debug(`CACHE: [SET] Key: ${key}, TTL: ${ttlSeconds}s`);
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    logger.debug(`CACHE: [DEL] Key: ${key}`);
    this.memoryCache.delete(key);
  }
}

export const cacheService = new CacheService();
export default cacheService;
