import { createHash } from 'node:crypto';
import { env } from '../env';

export const ipFromHeaders = (headers: Headers): string => {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() ?? '0.0.0.0';
  return headers.get('x-real-ip') ?? headers.get('cf-connecting-ip') ?? '0.0.0.0';
};

export const hashIp = (ip: string): string =>
  createHash('sha256').update(`${env.IP_HASH_SALT}:${ip}`).digest('hex');
