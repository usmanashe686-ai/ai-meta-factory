'use client';
import { NextSeo } from 'next-seo';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { DEFAULT_SEO, pageSeo } from '@/lib/seo/config';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
}

function SeoContent({ title, description, image, noindex }: SeoProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Your existing SEO logic here
  // For example:
  const seo = pageSeo[pathname] || DEFAULT_SEO;
  
  return (
    <NextSeo
      title={title || seo.title}
      description={description || seo.description}
      openGraph={{
        images: image ? [{ url: image }] : seo.images,
      }}
      noindex={noindex}
    />
  );
}

export default function Seo(props: SeoProps) {
  return (
    <Suspense fallback={null}>
      <SeoContent {...props} />
    </Suspense>
  );
}
