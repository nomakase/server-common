import { RedisClient } from "@custom-types/redis";

export default abstract class Redis<T extends RedisClient> {
    static client: RedisClient | undefined;
  
    abstract createConnection(): Promise<void>;
  
    getClient(): T {
      if (!Redis.client) {
        throw new Error("Not connected to Redis.");
      }

      return Redis.client as T;
    };
  }