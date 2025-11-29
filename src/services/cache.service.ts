import { createClient, type RedisClientType } from 'redis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL is not set');
}

const redisClient: RedisClientType = createClient({ url: redisUrl });
let connectPromise: Promise<RedisClientType> | null = null;

redisClient.on('error', (err) => {
  console.error('Redis client error', err);
});

export async function ensureCacheConnection(): Promise<void> {
  if (redisClient.isOpen) {
    return;
  }

  if (!connectPromise) {
    connectPromise = redisClient.connect();
  }

  await connectPromise;
}

export async function getCache<T>(key: string): Promise<T | null> {
  await ensureCacheConnection();
  const raw = await redisClient.get(key);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await ensureCacheConnection();
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
}

export async function disconnectCache(): Promise<void> {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }

  connectPromise = null;
}

export default redisClient;
