import nodeRedis from "redis";
import ioRedis from "ioredis";

export type RedisClient = nodeRedis.RedisClient | ioRedis.Redis;

export type IoRedisOptions = ioRedis.RedisOptions & { commandTimeout?: number };