import { NextRequest, NextResponse } from 'next/server'
import { templateAnalytics } from '@/lib/analytics/template-analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      templateId, 
      userId, 
      userName, 
      rating, 
      review, 
      pros = [], 
      cons = [] 
    } = body
    
    if (!templateId || !userId || !userName || !rating || !review) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    await templateAnalytics.addTemplateReview(
      templateId,
      userId,
      userName,
      rating,
      review,
      pros,
      cons
    )
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully'
    })
    
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const templateId = searchParams.get('templateId')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }
    
    // In a real implementation, you would query Firestore here
    // For now, returning mock data
    const mockReviews = [
      {
        id: '1',
        userName: 'Alex Johnson',
        rating: 5,
        comment: 'Excellent template! Saved me hours of development time.',
        pros: ['Clean code', 'Responsive design', 'Good documentation'],
        cons: ['Could use more examples'],
        createdAt: '2024-01-15',
        helpfulCount: 12
      },
      {
        id: '2',
        userName: 'Sam Wilson',
        rating: 4,
        comment: 'Very useful for my project. Some minor issues but overall great.',
        pros: ['Easy to customize', 'Modern design'],
        cons: ['Some components need optimization'],
        createdAt: '2024-01-14',
        helpfulCount: 8
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: {
        reviews: mockReviews,
        average: 4.5,
        total: mockReviews.length
      }
    })
    
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
