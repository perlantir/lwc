import type { MetadataRoute } from 'next';
import { env } from '@/env';

const sitemap = (): MetadataRoute.Sitemap => {
  const base = env.SITE_URL.replace(/\/$/, '');
  const routes = ['/', '/about', '/schedule', '/results', '/gallery', '/contact', '/register'];
  const now = new Date();
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: r === '/' ? 1 : 0.7,
  }));
};

export default sitemap;
