export const sitemap = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chat-with-geogebra.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
      alternates: {
        languages: {
          'zh-CN': `${baseUrl}/zh-CN`,
          'en-US': `${baseUrl}/en-US`,
        },
      },
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: {
        languages: {
          'zh-CN': `${baseUrl}/zh-CN/chat`,
          'en-US': `${baseUrl}/en-US/chat`,
        },
      },
    },
  ]
}

export default sitemap
