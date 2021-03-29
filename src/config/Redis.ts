import redis from "redis";
import { promisify } from "util";

export default class Redis {
  private static readonly redisConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  };

  private static readonly promisifyCommands: Array<keyof redis.Commands<boolean>> = [
    "set",
    "SET",
    "get",
    "GET",
    "del",
    "DEL",
    "expire",
    "EXPIRE",
  ];

  private static client: redis.RedisClient | undefined;

  static createConnection() {
    return new Promise<void>((resolve, reject) => {
      try {
        Redis.client = redis.createClient(Redis.redisConfig);

        Redis.client.on("error", (err) => {
          reject(err);
        });
        Redis.client.on("ready", () => {
          Redis.promisifyRedis();
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

  private static promisifyRedis(){
    console.log("Promisifying Redis commands...");
    const client = Redis.getClient();
    
    // Overwrite functions(Redis Commands)
    for (const property of Redis.promisifyCommands) {
      client[property] = promisify(client[property]).bind(client);
    }
  }
}
