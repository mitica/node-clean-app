import RedisClass, { Redis } from "ioredis";
import { config } from "../../config";

let instance: Redis;
let publisherRedisInstance: Redis;
let subscriberRedisInstance: Redis;

export const redisInstance = (redis?: Redis): Redis => {
  if (redis) instance = redis;
  if (!instance) instance = new RedisClass(config.redis.url);

  return instance;
};

export const publisherInstance = (redis?: Redis): Redis => {
  if (redis) publisherRedisInstance = redis;
  if (!publisherRedisInstance)
    publisherRedisInstance = new RedisClass(config.redis.url);

  return publisherRedisInstance;
};

export const subscriberInstance = (redis?: Redis): Redis => {
  if (redis) subscriberRedisInstance = redis;
  if (!subscriberRedisInstance)
    subscriberRedisInstance = new RedisClass(config.redis.url);

  return subscriberRedisInstance;
};
