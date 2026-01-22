'use client'

import { ReactNode, useEffect } from 'react'
import { useProjectStore } from '../../lib/store/project-store'

export default function StoreProvider({ children }: { children: ReactNode }) {
  // Initialize store with saved data or defaults
  const { setProject, components } = useProjectStore()
  
  useEffect(() => {
    // Load initial project if none exists
    if (components.length === 0) {
      setProject('default-project', 'My First Project')
    }
  }, [setProject, components.length])
  
  return <>{children}</>
}
