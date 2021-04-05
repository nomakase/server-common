import ioRedis from "ioredis";
import Redis from "./Redis";
import { IoRedisOptions } from "@custom-types/redis";

export default class IoRedis extends Redis<ioRedis.Redis> {
    private static readonly redisConfig: IoRedisOptions = {
      connectionName: "Nomakase Server Application",
      host: process.env.DB_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        console.log("Redis connection is lost with somehow reason.");
        console.log("attempt: " + times);
        if (times > 5) {
          return undefined;
        }
  
        return Math.min(times * 2000, 5000);
      },
      commandTimeout: 5000,
      dropBufferSupport: true
      
    };
  
    createConnection() {
      return new Promise<void>((resolve, reject) => {
        try {
          Redis.client = new ioRedis(IoRedis.redisConfig);
          Redis.client.on("error", (err) => {
            console.log("error on connecting to Redis.")
            reject(err);
          });
  
          Redis.client.on("ready", () => {
            console.log("redis_lib: ioredis.")
            resolve();
          });
  
          Redis.client.on("reconnecting", (delay) => {
            console.log("Reconnecting to Redis is just started.")
            console.log("delayed:" + delay);
          });
  
          Redis.client.on("close", () => {
            console.log("Redis connection is lost.");
          });
  
        } catch (err) {
          reject(err);
        }
      });
    }
}