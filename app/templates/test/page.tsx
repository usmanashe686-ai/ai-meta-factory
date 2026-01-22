export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Day 3 Setup Complete! ✅</h1>
        <p className="text-gray-600 mb-8">AI Template Generation system is ready.</p>
        <div className="space-y-4">
          <a href="/templates/generate" className="block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Go to Template Generator →
          </a>
          <a href="/" className="block px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
