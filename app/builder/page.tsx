"use client";

import { useState } from 'react';

export default function BuilderPage() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏭 Meta Factory AI Builder
          </h1>
          <p className="text-xl text-gray-600">
            Phase 0 - Building Foundation
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 border-2 border-dashed border-blue-300 rounded-xl text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-bold mb-2">Visual Builder</h3>
              <p className="text-gray-600 text-sm">
                Drag-and-drop interface coming soon
              </p>
            </div>
            
            <div className="p-6 border-2 border-dashed border-purple-300 rounded-xl text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-bold mb-2">AI Generation</h3>
              <p className="text-gray-600 text-sm">
                AI-powered component generation
              </p>
            </div>
            
            <div className="p-6 border-2 border-dashed border-green-300 rounded-xl text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-bold mb-2">Export & Deploy</h3>
              <p className="text-gray-600 text-sm">
                One-click deployment to Vercel
              </p>
            </div>
          </div>
          
          {/* Interactive Section */}
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
            <h3 className="text-2xl font-bold mb-6">Interactive Demo</h3>
            <div className="inline-flex items-center gap-6 mb-6">
              <button
                onClick={() => setCount(count - 1)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Decrease
              </button>
              
              <div className="text-4xl font-bold text-blue-600 min-w-[80px]">
                {count}
              </div>
              
              <button
                onClick={() => setCount(count + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Increase
              </button>
            </div>
            <p className="text-gray-600">
              This proves React hooks are working! Next: Add drag-and-drop components.
            </p>
          </div>
          
          {/* Next Steps */}
          <div className="mt-8 pt-8 border-t text-center">
            <h4 className="text-lg font-bold mb-4">Next Steps</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-bold">Phase 1</div>
                <div className="text-gray-600">Component Library</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="font-bold">Phase 2</div>
                <div className="text-gray-600">AI Integration</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-bold">Phase 3</div>
                <div className="text-gray-600">Export & Deploy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
