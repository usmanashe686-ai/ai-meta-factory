import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, userId } = body
    
    if (!templateId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Template ID and User ID required' },
        { status: 400 }
      )
    }
    
    // Check if already favorited
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('templateId', '==', templateId),
      where('userId', '==', userId)
    )
    
    const existingFavorites = await getDocs(favoritesQuery)
    
    if (!existingFavorites.empty) {
      // Remove from favorites
      const favoriteDoc = existingFavorites.docs[0]
      await deleteDoc(favoriteDoc.ref)
      
      return NextResponse.json({
        success: true,
        data: { message: 'Removed from favorites', isFavorited: false }
      })
    }
    
    // Add to favorites
    const favoritesRef = collection(db, 'favorites')
    await addDoc(favoritesRef, {
      templateId,
      userId,
      favoritedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: { message: 'Added to favorites', isFavorited: true }
    })
    
  } catch (error) {
    console.error('Error favoriting template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to favorite template' },
      { status: 500 }
    )
  }
}
