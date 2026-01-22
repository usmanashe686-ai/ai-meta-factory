import { NextRequest, NextResponse } from 'next/server'
import { TemplateService } from '@/lib/templates/template.service'

const templateService = new TemplateService()

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    const body = await request.json()
    const { userId, action } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      )
    }

    // Validate action
    const validActions = ['like', 'bookmark', 'download', 'use']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Track the interaction
    await templateService.trackInteraction(userId, id, action as any)

    return NextResponse.json({
      success: true,
      data: { action, templateId: id }
    })

  } catch (error: any) {
    console.error('Error performing template action:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to perform action' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      )
    }

    // Check if user has interacted with this template
    const interactionsRef = collection(db, 'template_interactions')
    const interactionsQuery = query(
      interactionsRef,
      where('templateId', '==', id),
      where('userId', '==', userId)
    )
    
    const snapshot = await getDocs(interactionsQuery)
    const interactions = snapshot.docs.map(doc => doc.data().type)

    return NextResponse.json({
      success: true,
      data: {
        liked: interactions.includes('like'),
        bookmarked: interactions.includes('bookmark'),
        downloaded: interactions.includes('download'),
        used: interactions.includes('use')
      }
    })

  } catch (error: any) {
    console.error('Error getting user interactions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get interactions' 
      },
      { status: 500 }
    )
  }
}
