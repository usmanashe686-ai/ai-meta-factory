"use client";

import { useState } from 'react';

export default function BuilderPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏭 Meta Factory AI Builder
          </h1>
          <p className="text-xl text-gray-600">
            Drag-and-drop interface loading...
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-8 border-2 border-dashed border-blue-300 rounded-xl">
              <div className="text-5xl mb-6">🎨</div>
              <h3 className="text-xl font-bold mb-4">Visual Builder</h3>
              <p className="text-gray-600">
                Drag components, edit properties in real-time
              </p>
            </div>
            
            <div className="text-center p-8 border-2 border-dashed border-purple-300 rounded-xl">
              <div className="text-5xl mb-6">✨</div>
              <h3 className="text-xl font-bold mb-4">AI Generation</h3>
              <p className="text-gray-600">
                Describe what you want, AI creates components
              </p>
            </div>
            
            <div className="text-center p-8 border-2 border-dashed border-green-300 rounded-xl">
              <div className="text-5xl mb-6">🚀</div>
              <h3 className="text-xl font-bold mb-4">Export & Deploy</h3>
              <p className="text-gray-600">
                Download code or deploy directly to Vercel
              </p>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="text-center border-t pt-12">
            <h3 className="text-2xl font-bold mb-6">Interactive Preview</h3>
            <div className="inline-flex items-center gap-8 mb-8">
              <button
                onClick={() => setCount(c => c - 1)}
                className="px-8 py-4 bg-red-500 text-white text-lg font-bold rounded-xl hover:bg-red-600"
              >
                Decrease
              </button>
              
              <div className="text-6xl font-bold text-blue-600 min-w-[120px]">
                {count}
              </div>
              
              <button
                onClick={() => setCount(c => c + 1)}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700"
              >
                Increase
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              This interactive demo proves React is working!
            </p>
            <p className="text-sm text-gray-500">
              Full drag-and-drop builder coming in next update
            </p>
          </div>

          {/* Status */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex justify-center items-center gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Builder Status: Ready for Phase 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
