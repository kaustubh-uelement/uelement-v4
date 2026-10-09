import type { MetadataRoute } from 'next';
import { company, nav } from '@/lib/site';
import { platforms, industries, solutionAreas, services } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>(['/', '/platforms/', '/solutions/', '/solutions/industries/', '/services/', '/why-uelement/', '/contact/', '/privacy/', '/terms/']);
  platforms.forEach((p) => {
    paths.add(`/platforms/${p.slug}/`);
    p.products.forEach((x) => paths.add(`/platforms/${p.slug}/${x.slug}/`));
  });
  solutionAreas.forEach((a) => paths.add(`/solutions/${a.slug}/`));
  industries.forEach((i) => paths.add(`/solutions/industries/${i.slug}/`));
  services.forEach((s) => paths.add(`/services/${s.slug}/`));
  nav.forEach((m) => m.groups.forEach((g) => { if (g.href) paths.add(g.href); g.links.forEach((l) => paths.add(l.href)); }));
  return [...paths].map((p) => ({ url: company.site + p, changeFrequency: 'monthly', priority: p === '/' ? 1 : 0.7 }));
}
