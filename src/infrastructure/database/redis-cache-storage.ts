import { BaseCacheStorage } from "domain/base/cache-storage";
import { Redis } from "ioredis";

export default class RedisCacheStorage extends BaseCacheStorage {
  constructor(private redis: Redis) {
    super("c0");
  }

  async removeCacheValue(key: string[]): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Get a value from Cache by key.
   * @param key Cache key
   */
  async getCacheValue<T = unknown>(key: string) {
    const value = await this.redis.get(key);
    if (typeof value !== "string") return undefined;

    return JSON.parse(value) as T;
  }

  async setCacheValue<T>(key: string, value: T, ttlSeconds: number) {
    if (value === undefined) return;
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }
}
