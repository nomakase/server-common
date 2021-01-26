import redis from "redis";

export default function connectRedis() {
  return new Promise<void>((resolve, reject) => {
    try {
      const client = redis.createClient(redisConfig);
      
      client.on("error", (err)=> { reject(err); });
      client.on("ready", () => { resolve(); });
      
    } catch (err) {
      reject(err);
    }
  });
}

const redisConfig = {
  password: process.env.REDIS_PASSWORD,
};
