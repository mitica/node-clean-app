import { BaseEntity, Entity, EntityConstructor, EntityData } from "./entity";

export type CacheStorageExecuteCachedOptions = {
  entityBuilder?: EntityConstructor<EntityData, BaseEntity>;
  omit?: boolean;
  nullTtl?: number;
  remove?: boolean;
};

type KeyType = (
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number | boolean | null | undefined)[]
)[];

/* eslint-disable @typescript-eslint/ban-types */
export interface CacheStorage {
  getCacheValue<T = {}>(key: string): Promise<T | undefined>;

  setCacheValue<T>(key: string, value: T, ttlSeconds: number): Promise<void>;

  removeCacheValue(key: string[]): Promise<void>;

  /** formats key by concatinating input strings */
  formatKey(input: KeyType): string;

  executeCached<T>(
    key: string,
    ttlSeconds: number,
    fn: () => Promise<T>,
    options?: CacheStorageExecuteCachedOptions
  ): Promise<T>;
}

export abstract class BaseCacheStorage implements CacheStorage {
  constructor(private prefix: string) {}
  abstract getCacheValue<T = {}>(key: string): Promise<T | undefined>;

  abstract setCacheValue<T>(
    key: string,
    value: T,
    ttlSeconds: number
  ): Promise<void>;

  abstract removeCacheValue(key: string[]): Promise<void>;

  formatKey(input: KeyType): string {
    return `${this.prefix}_${input.join("_")}`;
  }

  private toEntity<T>(
    data: T,
    { entityBuilder }: CacheStorageExecuteCachedOptions
  ): T {
    if (data && entityBuilder) {
      return Array.isArray(data)
        ? (data.map((it) => new entityBuilder(it as never)) as never)
        : (new entityBuilder(data as never) as never);
    }
    return data;
  }

  private toJson<T>(data: T): T {
    if (data) {
      return Array.isArray(data)
        ? (data.map((it) => this.toJson(it as never)) as never)
        : data instanceof BaseEntity
        ? ((data as Entity).getData() as never)
        : data;
    }
    return data;
  }

  async executeCached<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>,
    options: CacheStorageExecuteCachedOptions = {}
  ): Promise<T> {
    if (ttl < 10) return fn();
    if (options.remove === true) {
      // console.log("removing cache value", key);
      await this.removeCacheValue([key]);
      return fn();
    }

    if (options.omit === true) {
      // logger.warn(
      //   `IGNORE_CACHE flag is set. Ignoring cache for key=${key}, ttl=${ttl}`
      // );
      return fn();
    }

    const cacheData = await this.getCacheValue<T>(key);

    if (cacheData !== undefined) {
      // logger.debug(
      //   `Cache hit for key=${key}, ttl=${ttl}, data=${JSON.stringify(
      //     cacheData
      //   )}`
      // );
      return this.toEntity(cacheData, options);
    }

    const data = await fn();

    const omitValues = options.nullTtl === 0 ? [undefined, null] : [undefined];

    if (!omitValues.includes(data as never) && ttl > 10) {
      // logger.debug(
      //   `Cache miss for key=${key}, ttl=${ttl}, data=${JSON.stringify(
      //     this.toJson(data)
      //   )}`
      // );
      await this.setCacheValue(key, this.toJson(data), ttl);
    }

    return data;
  }
}
