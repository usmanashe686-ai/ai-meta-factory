import { NextRequest, NextResponse } from 'next/server'
import { TemplateService } from '@/lib/templates/template.service'
import { TemplateSearchFilters } from '@/lib/templates/template.types'

const templateService = new TemplateService()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse filters from query params
    const filters: TemplateSearchFilters = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      price: searchParams.get('price') as any || 'all',
      difficulty: searchParams.get('difficulty') || undefined,
      tags: searchParams.get('tags')?.split(','),
      sortBy: searchParams.get('sortBy') as any || 'popular',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
      framework: searchParams.get('framework') || undefined,
      featured: searchParams.get('featured') === 'true'
    }

    const result = await templateService.searchTemplates(filters)

    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error: any) {
    console.error('Error in templates API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch templates' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateData, userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      )
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'components', 'category']
    for (const field of requiredFields) {
      if (!templateData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const templateId = await templateService.createTemplate(templateData, userId)

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Failed to create template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { templateId }
    })

  } catch (error: any) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create template' 
      },
      { status: 500 }
    )
  }
}
