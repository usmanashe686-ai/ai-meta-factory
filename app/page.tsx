import Link from 'next/link';
import { ArrowRight, Zap, Database, Cloud, Code, GitBranch, Shield, Rocket } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meta Factory
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/builder" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">Builder</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">Marketplace</Link>
              <Link href="/docs" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">Docs</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">Pricing</Link>
              <Link
                href="/builder"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-shadow whitespace-nowrap"
              >
                Launch Builder
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Generate <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Full-Stack Applications</span> with AI
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            From components to complete projects with database integration, Git deployment, and production-ready code.
            The future of development is here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/builder"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Launch Builder
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-800 font-semibold rounded-xl hover:border-blue-500 transition-all"
            >
              View Documentation
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border overflow-hidden">
              <div className="bg-gray-900 p-4 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-sm ml-4">ai-meta-factory.com/builder</div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <div className="text-2xl font-bold text-blue-600 mb-2">Next.js</div>
                    <div className="text-gray-600">Tech Stack</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <div className="text-2xl font-bold text-green-600 mb-2">Supabase</div>
                    <div className="text-gray-600">Database</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <div className="text-2xl font-bold text-gray-800 mb-2">GitHub</div>
                    <div className="text-gray-600">Git Provider</div>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Code className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-500">AI Component Generator Interface</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AI Meta Factory?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Professional-grade AI development platform built for modern teams</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Structured AI Pipeline</h3>
              <p className="text-gray-600 mb-4">
                Idea → Structure → Code. Our AI analyzes your prompt, creates a structured blueprint, then generates production-ready code.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Multi-model AI analysis</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>TypeScript-first generation</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Best practices enforcement</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Full-Stack Ready</h3>
              <p className="text-gray-600 mb-4">
                Support for Next.js, React, Flutter, Node.js, Python with database integration and deployment configuration.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'React', 'Flutter', 'Node.js', 'Python', 'Supabase', 'Firebase', 'MongoDB'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Cloud className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">One-Click Deployment</h3>
              <p className="text-gray-600 mb-4">
                Export to GitHub, deploy to Vercel/Netlify, or download as ZIP. Complete projects ready for production.
              </p>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <GitBranch className="w-5 h-5 text-gray-700" />
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Rocket className="w-5 h-5 text-gray-700" />
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Technologies Grid */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Supported Technologies</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
              {[
                { name: 'Next.js', color: 'bg-black text-white' },
                { name: 'React', color: 'bg-blue-600 text-white' },
                { name: 'Flutter', color: 'bg-blue-400 text-white' },
                { name: 'Node.js', color: 'bg-green-600 text-white' },
                { name: 'Python', color: 'bg-yellow-500 text-white' },
                { name: 'Supabase', color: 'bg-green-500 text-white' },
                { name: 'Firebase', color: 'bg-orange-500 text-white' },
                { name: 'MongoDB', color: 'bg-green-700 text-white' },
                { name: 'GitHub', color: 'bg-gray-800 text-white' },
                { name: 'Vercel', color: 'bg-black text-white' },
              ].map((tech) => (
                <div key={tech.name} className={`p-4 rounded-xl font-semibold ${tech.color} shadow-md`}>
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Development Workflow?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers building faster with AI Meta Factory
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/builder"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Start Building Free
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-blue-100">Components Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold">2,000+</div>
              <div className="text-blue-100">Projects Built</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="font-bold">AI</span>
                </div>
                <span className="text-xl font-bold">AI Meta Factory</span>
              </div>
              <p className="text-gray-400">Full-Stack AI Development Platform</p>
              <p className="text-gray-500 text-sm mt-2">Built with Next.js, TypeScript, and Gemini AI</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="px-3 py-1 bg-gray-800 rounded-full text-sm">▲ Vercel</div>
                <div className="px-3 py-1 bg-gray-800 rounded-full text-sm">🚀 Production Ready</div>
              </div>
            </div>
            <div className="flex gap-8">
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/builder" className="hover:text-white">Builder</Link></li>
                  <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
                  <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                  <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/culture" className="hover:text-white">Culture</Link></li>
                  <li><Link href="/sufism" className="hover:text-white">Sufism</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© 2025 AI Meta Factory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
