'use client';

import { ReactNode, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page view
    const url = pathname + searchParams.toString()
    console.log('📊 Page viewed:', url)
    
    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-XXXXXXXXXX', {
        page_path: url,
      })
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
