import NodeRedis from "./NodeRedis";
import IoRedis from "./IoRedis";
import Redis from "./Redis";

interface RedisClientLoader {
  load(): Redis<any>
}

const redisClients: Record<string, RedisClientLoader>= {
  "node_redis": { load() { return new NodeRedis()}},
  "ioredis": { load() { return new IoRedis()}},
  "default": { load() { return new IoRedis()}}
}

export default redisClients[<string>process.env.REDIS_CLIENT_LIB || "default"].load();
