import type { MetadataRoute } from 'next';
import { env } from '@/env';

const robots = (): MetadataRoute.Robots => ({
  rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
  sitemap: `${env.SITE_URL.replace(/\/$/, '')}/sitemap.xml`,
});

export default robots;
