import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '../env';

const isConfigured =
  Boolean(env.UPSTASH_REDIS_REST_URL) && Boolean(env.UPSTASH_REDIS_REST_TOKEN);

const redis = isConfigured
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL ?? '',
      token: env.UPSTASH_REDIS_REST_TOKEN ?? '',
    })
  : null;

const memoryStore = new Map<string, { count: number; resetAt: number }>();

interface LimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

const memoryLimit = (key: string, max: number, windowMs: number): LimitResult => {
  const now = Date.now();
  const cur = memoryStore.get(key);
  if (!cur || cur.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, reset: now + windowMs };
  }
  cur.count += 1;
  if (cur.count > max) return { success: false, remaining: 0, reset: cur.resetAt };
  return { success: true, remaining: max - cur.count, reset: cur.resetAt };
};

const contactLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, '1 h'), prefix: 'rl:contact' })
  : null;

const registerLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(3, '1 h'), prefix: 'rl:register' })
  : null;

const adminLoginLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(10, '1 h'), prefix: 'rl:adminlogin' })
  : null;

const limitWithLib = async (lim: Ratelimit, id: string): Promise<LimitResult> => {
  const { success, remaining, reset } = await lim.limit(id);
  return { success, remaining, reset };
};

export const limitContact = async (id: string, perHour = 5): Promise<LimitResult> => {
  if (contactLimiter && perHour === 5) return limitWithLib(contactLimiter, id);
  if (redis) {
    const ad = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(perHour, '1 h'), prefix: 'rl:contact:custom' });
    return limitWithLib(ad, id);
  }
  return memoryLimit(`contact:${id}`, perHour, 60 * 60 * 1000);
};

export const limitRegister = async (id: string, perHour = 3): Promise<LimitResult> => {
  if (registerLimiter && perHour === 3) return limitWithLib(registerLimiter, id);
  if (redis) {
    const ad = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(perHour, '1 h'), prefix: 'rl:register:custom' });
    return limitWithLib(ad, id);
  }
  return memoryLimit(`register:${id}`, perHour, 60 * 60 * 1000);
};

export const limitAdminLogin = async (id: string): Promise<LimitResult> => {
  if (adminLoginLimiter) return limitWithLib(adminLoginLimiter, id);
  return memoryLimit(`adminlogin:${id}`, 10, 60 * 60 * 1000);
};
