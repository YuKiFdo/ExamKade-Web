import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const categories = [
    'past-papers',
    'model-papers',
    'term-test-papers',
    'syllabus',
    'teacher-guides',
    'text-books',
  ];
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...categories.map((slug) => ({
      url: `${base}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
