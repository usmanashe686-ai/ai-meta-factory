import { NextRequest, NextResponse } from 'next/server'
import { templateAnalytics } from '@/lib/analytics/template-analytics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const templateId = searchParams.get('templateId')
    const timeRange = searchParams.get('range') || '30d'
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }
    
    const insights = await templateAnalytics.getTemplateInsights(templateId, timeRange)
    
    if (!insights) {
      return NextResponse.json(
        { success: false, error: 'Failed to get insights' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: insights
    })
    
  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, templateId, userId, projectId } = body
    
    if (!action || !templateId) {
      return NextResponse.json(
        { success: false, error: 'Action and templateId are required' },
        { status: 400 }
      )
    }
    
    switch (action) {
      case 'trackView':
        await templateAnalytics.trackTemplateView(templateId, userId)
        break
        
      case 'trackUse':
        if (!userId || !projectId) {
          return NextResponse.json(
            { success: false, error: 'userId and projectId are required for trackUse' },
            { status: 400 }
          )
        }
        await templateAnalytics.trackTemplateUse(templateId, userId, projectId)
        break
        
      case 'trackDownload':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'userId is required for trackDownload' },
            { status: 400 }
          )
        }
        await templateAnalytics.trackTemplateDownload(templateId, userId)
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Analytics tracked successfully'
    })
    
  } catch (error) {
    console.error('Error in analytics tracking:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
