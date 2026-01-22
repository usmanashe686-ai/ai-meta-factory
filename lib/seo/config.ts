import { NextSeoProps } from 'next-seo'

const SITE_URL = 'https://usman-umer.web.app'
const SITE_NAME = 'AI Meta-Software Factory'
const SITE_DESCRIPTION = 'Build web and mobile applications instantly with AI. No coding required.'
const TWITTER_HANDLE = '@ai_meta_factory'

export const DEFAULT_SEO: NextSeoProps = {
  titleTemplate: `%s | ${SITE_NAME}`,
  defaultTitle: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    site_name: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    handle: TWITTER_HANDLE,
    site: TWITTER_HANDLE,
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=5',
    },
    {
      name: 'theme-color',
      content: '#10B981',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
}

export function pageSeo(
  title: string,
  description?: string,
  path?: string,
  image?: string
): NextSeoProps {
  const url = path ? `${SITE_URL}${path}` : SITE_URL
  const seoDescription = description || DEFAULT_SEO.description!

  return {
    title,
    description: seoDescription,
    canonical: url,
    openGraph: {
      ...DEFAULT_SEO.openGraph,
      url,
      title,
      description: seoDescription,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: title }]
        : DEFAULT_SEO.openGraph!.images,
    },
  }
}
