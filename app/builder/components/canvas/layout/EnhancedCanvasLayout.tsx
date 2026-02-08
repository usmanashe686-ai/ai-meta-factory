"use client";

export function EnhancedCanvasLayout() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-4">🎨 AI Meta Factory Canvas</h1>
        <p className="text-gray-400 text-lg mb-6">Build, preview, and deploy AI-powered applications</p>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-blue-400 font-bold mb-2">📝 Code Editor</div>
            <p className="text-sm text-gray-400">Edit files in real-time</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-green-400 font-bold mb-2">👀 Live Preview</div>
            <p className="text-sm text-gray-400">Instant preview of changes</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-purple-400 font-bold mb-2">🚀 Deploy</div>
            <p className="text-sm text-gray-400">One-click deployment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
