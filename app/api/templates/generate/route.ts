import { NextRequest, NextResponse } from 'next/server'
import { AITemplateGenerator } from '@/lib/ai/template-generator'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      category, 
      description, 
      complexity, 
      style, 
      features,
      imageUrl 
    } = body

    // Validate required fields
    if (!description || !category) {
      return NextResponse.json(
        { success: false, error: 'Description and category are required' },
        { status: 400 }
      )
    }

    const generator = new AITemplateGenerator()
    let template

    if (imageUrl) {
      // Generate from image
      template = await generator.generateFromImage(imageUrl)
    } else {
      // Generate from description
      template = await generator.generateTemplate({
        category,
        description,
        complexity: complexity || 'moderate',
        style: style || 'modern',
        features: features || []
      })
    }

    // Save to database
    const templateRef = collection(db, 'templates')
    const docRef = await addDoc(templateRef, {
      ...template,
      authorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'published',
      visibility: 'public',
      likes: 0,
      downloads: 0
    })

    // Also save to user's generated templates
    const userTemplatesRef = collection(db, 'user_templates')
    await addDoc(userTemplatesRef, {
      userId,
      templateId: docRef.id,
      generatedAt: serverTimestamp(),
      parameters: { category, description, complexity, style, features },
      type: imageUrl ? 'image' : 'text'
    })

    return NextResponse.json({
      success: true,
      data: {
        templateId: docRef.id,
        template: {
          ...template,
          id: docRef.id
        }
      }
    })

  } catch (error: any) {
    console.error('Template generation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate template',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
