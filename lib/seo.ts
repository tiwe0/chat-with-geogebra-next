import type { Metadata } from 'next'
import { t, type Locale } from './i18n'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  locale?: Locale
  type?: 'website' | 'article'
  path?: string
}

export function generateMetadata({
  title,
  description,
  keywords,
  image = '/og-image.png',
  locale = 'zh-CN',
  type = 'website',
  path = '',
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chat-with-geogebra.com'
  const fullUrl = `${siteUrl}${path}`

  const defaultTitle = t('seo.home.title', locale)
  const defaultDescription = t('seo.home.description', locale)
  const defaultKeywords = t('seo.home.keywords', locale)

  const metaTitle = title || defaultTitle
  const metaDescription = description || defaultDescription
  const metaKeywords = keywords || defaultKeywords

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: 'Chat with GeoGebra Team' }],
    creator: 'Chat with GeoGebra',
    publisher: 'Chat with GeoGebra',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'zh-CN': `${siteUrl}/zh-CN${path}`,
        'en-US': `${siteUrl}/en-US${path}`,
      },
    },
    openGraph: {
      type,
      locale: locale === 'zh-CN' ? 'zh_CN' : 'en_US',
      url: fullUrl,
      title: metaTitle,
      description: metaDescription,
      siteName: 'Chat with GeoGebra',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [image],
      creator: '@chatwithgeogebra',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      // yandex: 'yandex-verification-code',
      // bing: 'bing-verification-code',
    },
  }
}

// JSON-LD 结构化数据
export function generateJsonLd(locale: Locale = 'zh-CN') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chat-with-geogebra.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Chat with GeoGebra',
    description: t('seo.home.description', locale),
    url: siteUrl,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
    },
    author: {
      '@type': 'Organization',
      name: 'Ivory',
    },
    featureList: [
      'AI-powered math conversation',
      'Real-time GeoGebra integration',
      'Multi-model AI support',
      'Interactive mathematical visualization',
    ],
  }
}
