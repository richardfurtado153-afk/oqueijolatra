import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/conta/',
          '/checkout/',
          '/carrinho/',
          '/api/',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://oqueijolatra.com.br/sitemap.xml',
  }
}
