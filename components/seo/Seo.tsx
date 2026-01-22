'use client';

import { NextSeo } from 'next-seo'
import { usePathname, useSearchParams } from 'next/navigation'
import { DEFAULT_SEO, pageSeo } from '@/lib/seo/config'

interface SeoProps {
  title?: string
  description?: string
  image?: string
  noindex?: boolean
}

export default function Seo({
  title,
  description,
  image,
  noindex = false,
}: SeoProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const path = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
  
  const seoConfig = title 
    ? pageSeo(title, description, path, image)
    : DEFAULT_SEO

  return (
    <NextSeo
      {...seoConfig}
      noindex={noindex}
      nofollow={noindex}
    />
  )
}
