import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id
    
    const templateRef = doc(db, 'templates', templateId)
    const templateDoc = await getDoc(templateRef)
    
    if (!templateDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }
    
    const template = {
      id: templateDoc.id,
      ...templateDoc.data()
    }
    
    // Increment view count
    await updateDoc(templateRef, {
      viewCount: increment(1)
    })
    
    return NextResponse.json({
      success: true,
      data: template
    })
    
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}
