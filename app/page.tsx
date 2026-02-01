import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="text-6xl">🏭</div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              AI Meta Factory
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Generate complete full-stack applications with AI. 
              From components to complete projects with database integration, 
              Git deployment, and production-ready code.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/builder"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition text-lg"
              >
                🚀 Launch Builder
              </Link>
              
              <a 
                href="#"
                className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition text-lg"
              >
                📚 View Documentation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why AI Meta Factory?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-3">Structured AI Pipeline</h3>
            <p className="text-gray-600">
              Idea → Structure → Code. Our AI analyzes your prompt, creates a structured blueprint, then generates production-ready code.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🏭</div>
            <h3 className="text-xl font-bold mb-3">Full-Stack Ready</h3>
            <p className="text-gray-600">
              Support for Next.js, React, Flutter, Node.js, Python with database integration and deployment configuration.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">One-Click Deployment</h3>
            <p className="text-gray-600">
              Export to GitHub, deploy to Vercel/Netlify, or download as ZIP. Complete projects ready for production.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Supported Technologies</h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          {['Next.js', 'React', 'Flutter', 'Node.js', 'Python', 'Supabase', 'Firebase', 'MongoDB', 'GitHub', 'Vercel'].map((tech) => (
            <div key={tech} className="px-6 py-3 bg-white border rounded-xl">
              <span className="font-bold">{tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-2">AI Meta Factory - Full-Stack AI Development Platform</p>
          <p className="text-gray-400">
            Generate complete applications with AI. Built with Next.js, TypeScript, and Gemini AI.
          </p>
          <div className="mt-4 text-gray-400">
            <span>Deployed on ▲ Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
