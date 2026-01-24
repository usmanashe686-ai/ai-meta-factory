import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏭 Meta Factory</h1>
            <p className="text-gray-600">AI Builder Platform</p>
          </div>
          <Link 
            href="/builder" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Launch Builder
          </Link>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Build Apps with <span className="text-blue-600">AI</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Describe your app in plain English. Our AI generates the code, components, 
            and even deploys it for you. No coding required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/builder"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-xl"
            >
              🚀 Start Building
            </Link>
            <button className="px-8 py-4 bg-white border text-gray-700 text-lg font-bold rounded-xl hover:shadow-xl">
              📚 View Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-4">AI-Powered Generation</h3>
            <p className="text-gray-600">
              Describe what you want in plain English. Our AI writes the code, designs the UI, and builds the logic.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-4">Visual Builder</h3>
            <p className="text-gray-600">
              Drag-and-drop interface to customize every component. Edit properties in real-time.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-4">One-Click Deploy</h3>
            <p className="text-gray-600">
              Export as React code, APK, or deploy directly to Vercel. Your app goes live instantly.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-8 text-center">Platform Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="text-gray-600">Active Projects</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">156</div>
              <div className="text-gray-600">AI Generations</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">8</div>
              <div className="text-gray-600">Apps Deployed</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600">$1,234</div>
              <div className="text-gray-600">Revenue Generated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
