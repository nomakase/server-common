import redis from "redis";

export default class Redis {
  private static readonly redisConfig = {
    password: process.env.REDIS_PASSWORD,
  };

  private static client: redis.RedisClient | undefined;

  static createConnection() {
    return new Promise<void>((resolve, reject) => {
      try {
        Redis.client = redis.createClient(Redis.redisConfig);

        Redis.client.on("error", (err) => {
          reject(err);
        });
        Redis.client.on("ready", () => {
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  static getClient() {
    if (!Redis.client) {
      throw new Error("Not connected to Redis.");
    }
    return Redis.client;
  }
}
