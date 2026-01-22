import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './client'
import { toast } from 'react-hot-toast'

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    toast.success('Signed in successfully!')
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Sign in error:', error)
    toast.error(error.message || 'Sign in failed')
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
    
    toast.success('Account created successfully!')
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Sign up error:', error)
    toast.error(error.message || 'Sign up failed')
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
    
    toast.success('Signed in with Google!')
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Google sign in error:', error)
    toast.error(error.message || 'Google sign in failed')
    return { success: false, error: error.message }
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    toast.success('Logged out successfully')
    return { success: true }
  } catch (error: any) {
    toast.error(error.message || 'Logout failed')
    return { success: false, error: error.message }
  }
}
