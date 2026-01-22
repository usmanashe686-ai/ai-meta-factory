import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, templateId, customizations, name } = body
    
    if (!userId || !templateId || !customizations || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const customRef = collection(db, 'user_customizations')
    const newCustomization = {
      userId,
      templateId,
      customizations,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    }
    
    const docRef = await addDoc(customRef, newCustomization)
    
    // Increment template customization count
    const templateRef = doc(db, 'templates', templateId)
    await updateDoc(templateRef, {
      customizationCount: increment(1)
    })
    
    return NextResponse.json({
      success: true,
      data: { 
        customizationId: docRef.id,
        ...newCustomization
      }
    })
    
  } catch (error) {
    console.error('Error saving customization:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save customization' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const templateId = searchParams.get('templateId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }
    
    let q = query(
      collection(db, 'user_customizations'),
      where('userId', '==', userId)
    )
    
    if (templateId) {
      q = query(q, where('templateId', '==', templateId))
    }
    
    const snapshot = await getDocs(q)
    const customizations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({
      success: true,
      data: { customizations }
    })
    
  } catch (error) {
    console.error('Error fetching customizations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customizations' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { customizationId, customizations, name } = body
    
    if (!customizationId) {
      return NextResponse.json(
        { success: false, error: 'Customization ID required' },
        { status: 400 }
      )
    }
    
    const customizationRef = doc(db, 'user_customizations', customizationId)
    await updateDoc(customizationRef, {
      customizations,
      name,
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: { message: 'Customization updated' }
    })
    
  } catch (error) {
    console.error('Error updating customization:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customization' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customizationId = searchParams.get('id')
    
    if (!customizationId) {
      return NextResponse.json(
        { success: false, error: 'Customization ID required' },
        { status: 400 }
      )
    }
    
    const customizationRef = doc(db, 'user_customizations', customizationId)
    await deleteDoc(customizationRef)
    
    return NextResponse.json({
      success: true,
      data: { message: 'Customization deleted' }
    })
    
  } catch (error) {
    console.error('Error deleting customization:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customization' },
      { status: 500 }
    )
  }
}

import { deleteDoc } from 'firebase/firestore'
