import { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Monitor your platform performance and user activity',
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </ErrorBoundary>
  )
}
