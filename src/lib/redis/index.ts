import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

export const getRedisClient = (): Redis => {
  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    globalForRedis.redisClient.on("error", (err) => {
      console.warn("[Redis Connection Warning]", err.message);
    });
  }

  return globalForRedis.redisClient;
};

export const redisConnectionOptions = {
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
};
