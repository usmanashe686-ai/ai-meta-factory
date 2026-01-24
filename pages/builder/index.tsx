'use client'

import { useState, useEffect } from 'react'

// Define a simple component type
type ComponentType = {
  id: number
  type: string
}

export default function Builder() {
  // State for the canvas components
  const [components, setComponents] = useState<ComponentType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading canvas
  useEffect(() => {
    console.log("Builder mounted")
    const timer = setTimeout(() => setIsLoading(false), 500) // fake 0.5s load
    return () => clearTimeout(timer)
  }, [])

  // Handler for adding a new component
  const handleAddComponent = () => {
    console.log("Button clicked")
    setComponents(prev => [
      ...prev,
      { id: Date.now(), type: "Button" } // example type
    ])
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Builder</h1>

      {/* Add Component Button */}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        onClick={handleAddComponent}
      >
        Add Component
      </button>

      {/* Canvas */}
      <div className="border border-gray-300 h-64 p-2 flex flex-col gap-2">
        {isLoading ? (
          <div>Builder canvas loading...</div>
        ) : components.length === 0 ? (
          <div className="text-gray-400">No components yet</div>
        ) : (
          components.map(c => (
            <div
              key={c.id}
              className="border p-2 bg-gray-100 rounded"
            >
              {c.type} (id: {c.id})
            </div>
          ))
        )}
      </div>
    </div>
  )
}
