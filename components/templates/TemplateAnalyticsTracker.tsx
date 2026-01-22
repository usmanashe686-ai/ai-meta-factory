'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { templateAnalytics } from '@/lib/analytics/template-analytics'

interface TemplateAnalyticsTrackerProps {
  templateId: string
  projectId?: string
  trackView?: boolean
  trackUse?: boolean
}

export default function TemplateAnalyticsTracker({
  templateId,
  projectId,
  trackView = true,
  trackUse = false
}: TemplateAnalyticsTrackerProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  useEffect(() => {
    if (trackView && templateId) {
      // Track view with delay to avoid multiple rapid calls
      const timer = setTimeout(() => {
        templateAnalytics.trackTemplateView(templateId, userId)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [templateId, trackView, userId])

  useEffect(() => {
    if (trackUse && templateId && userId && projectId) {
      templateAnalytics.trackTemplateUse(templateId, userId, projectId)
    }
  }, [templateId, trackUse, userId, projectId])

  return null // This is a tracking component, no UI
}
