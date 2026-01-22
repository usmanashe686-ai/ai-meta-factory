import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './client'

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return { success: false, error: error.message }
  }
}

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      name: name,
      createdAt: new Date().toISOString(),
      plan: 'free',
      credits: 1000,
      lastLogin: new Date().toISOString(),
    })
    
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return { success: false, error: error.message }
  }
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', result.user.uid))
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || 'User',
        createdAt: new Date().toISOString(),
        plan: 'free',
        credits: 1000,
        lastLogin: new Date().toISOString(),
      })
    } else {
      // Update last login
      await setDoc(doc(db, 'users', result.user.uid), {
        lastLogin: new Date().toISOString(),
      }, { merge: true })
    }
    
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Google sign in error:', error)
    return { success: false, error: error.message }
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
