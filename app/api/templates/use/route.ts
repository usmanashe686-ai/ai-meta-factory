import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, userId, isCustomized = false, customizedData = null } = body
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID required' },
        { status: 400 }
      )
    }
    
    // Record template usage
    const usageRef = collection(db, 'template_usages')
    await addDoc(usageRef, {
      templateId,
      userId,
      isCustomized,
      customizedData,
      usedAt: new Date()
    })
    
    // Update template usage count
    const templateRef = doc(db, 'templates', templateId)
    await updateDoc(templateRef, {
      usageCount: increment(1),
      lastUsedAt: new Date()
    })
    
    // If user is logged in, add to their used templates
    if (userId) {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        usedTemplates: increment(1),
        lastTemplateUsed: new Date()
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Template usage recorded',
        templateId,
        isCustomized
      }
    })
    
  } catch (error) {
    console.error('Error recording template usage:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record template usage' },
      { status: 500 }
    )
  }
}
