import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/game', '/lobby'],
    },
    sitemap: 'https://panhelquiz.vercel.app/sitemap.xml',
  }
}