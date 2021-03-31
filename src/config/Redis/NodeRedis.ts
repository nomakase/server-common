import Redis from "./Redis";
import nodeRedis from "redis";
import { promisify } from "util";

export default class NodeRedis extends Redis<nodeRedis.RedisClient> {
    private isPromisified: boolean = false;
  
    private static readonly promisifyCommands: Array<keyof nodeRedis.Commands<boolean>> = [
      "set",
      "SET",
      "get",
      "GET",
      "del",
      "DEL",
      "expire",
      "EXPIRE",
    ];
  
    private static readonly redisConfig: nodeRedis.ClientOpts = {
      host: process.env.DB_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      socket_keepalive: true,
      retry_strategy: (options) => {
        if (options.error) {
          console.log("Redis connection is lost with somehow reason.");
          console.log("code: " + options.error.code);
        }
        console.log("attempt: " + options.attempt);
        console.log("total retry time(ms): " + options.total_retry_time);
  
        if (options.attempt > 10) {
          return undefined;
        }
  
        return Math.min(options.attempt * 100, 3000);
      }
    };
  
    createConnection() {
      return new Promise<void>((resolve, reject) => {
        try {
          Redis.client = nodeRedis.createClient(NodeRedis.redisConfig);

          Redis.client.on("error", (err) => {
            reject(err);
          });
  
          Redis.client.on("ready", () => {
            this.promisifyRedis();
            console.log("redis_lib: node_redis")
            resolve();
          });
  
          Redis.client.on("reconnecting", (e) => {
            console.log("[" + e.attempt + "]Reconnecting to Redis is just started.")
            console.log("delayed:" + e.delay);
          });
  
          Redis.client.on("end", () => {
            console.log("Redis connection is lost.");
          });
  
        } catch (err) {
          reject(err);
        }
      });
    }
  
    private promisifyRedis(){
      if (this.isPromisified) { return; }
  
      console.log("Promisifying Redis commands...");
      const client = this.getClient() as nodeRedis.RedisClient;
      
      // Overwrite functions(Redis Commands)
      for (const property of NodeRedis.promisifyCommands) {
        client[property] = promisify(client[property]).bind(client);
      }
  
      this.isPromisified = true;
    }
  }