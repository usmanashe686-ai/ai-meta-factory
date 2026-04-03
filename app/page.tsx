'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Database, Cloud, Code, GitBranch, Shield, Rocket, Menu, X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation (same as before) */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base sm:text-xl">AI</span>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meta Factory
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/builder" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">Builder</Link>
              <Link href="/marketplace" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">Marketplace</Link>
              <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">Admin</Link>
              <Link href="/docs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">Docs</Link>
              <Link href="/culture" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">Culture</Link>
              <Link href="/sufism" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition">Sufism</Link>
              <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <Link href="/builder" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all hover:scale-105">
                Launch Builder
              </Link>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg py-4 px-4 flex flex-col gap-3 z-40">
              <Link href="/builder" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Builder</Link>
              <Link href="/marketplace" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
              <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Admin</Link>
              <Link href="/docs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Docs</Link>
              <Link href="/culture" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Culture</Link>
              <Link href="/sufism" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Sufism</Link>
              <Link href="/builder" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg text-center" onClick={() => setIsMenuOpen(false)}>
                Launch Builder
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section (unchanged, same as before but keeping it concise) */}
      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium backdrop-blur-sm">
            ✨ AI-Powered Development
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 sm:mb-6">
            Generate <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Full-Stack Applications</span> with AI
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 max-w-3xl mx-auto px-2">
            From components to complete projects with database integration, Git deployment, and production-ready code.
            The future of development is here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-20">
            <Link href="/builder" className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105">
              Launch Builder <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link href="/docs" className="px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all text-center">
              View Documentation
            </Link>
          </div>
          <div className="relative max-w-5xl mx-auto px-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 dark:opacity-50"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-900/90 dark:bg-black/50 p-3 sm:p-4 flex items-center gap-2">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-xs sm:text-sm ml-2 sm:ml-4 truncate">ai-meta-factory.com/builder</div>
              </div>
              <div className="p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">Next.js</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Tech Stack</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-1 sm:mb-2">Supabase</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Database</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">GitHub</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Git Provider</div>
                  </div>
                </div>
                <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <div className="text-center px-2">
                    <Code className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 mx-auto mb-1 sm:mb-2" />
                    <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">AI Component Generator Interface</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section (unchanged) */}
      <div className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Why Choose AI Meta Factory?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">Professional-grade AI development platform built for modern teams</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Structured AI Pipeline</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">Idea → Structure → Code. Our AI analyzes your prompt, creates a structured blueprint, then generates production-ready code.</p>
              <ul className="space-y-1.5 sm:space-y-2">
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full"></div><span>Multi-model AI analysis</span></li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full"></div><span>TypeScript-first generation</span></li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full"></div><span>Best practices enforcement</span></li>
              </ul>
            </div>
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Full-Stack Ready</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">Support for Next.js, React, Flutter, Node.js, Python with database integration and deployment configuration.</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {['Next.js', 'React', 'Flutter', 'Node.js', 'Python', 'Supabase', 'Firebase', 'MongoDB'].map((tech) => (
                  <span key={tech} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm">{tech}</span>
                ))}
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition">
                <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">One-Click Deployment</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">Export to GitHub, deploy to Vercel/Netlify, or download as ZIP. Complete projects ready for production.</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"><GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" /></div>
                <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"><Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" /></div>
                <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"><Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" /></div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">Supported Technologies</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 max-w-5xl mx-auto">
              {[
                { name: 'Next.js', color: 'bg-black text-white dark:bg-gray-900' },
                { name: 'React', color: 'bg-blue-600 text-white' },
                { name: 'Flutter', color: 'bg-blue-400 text-white' },
                { name: 'Node.js', color: 'bg-green-600 text-white' },
                { name: 'Python', color: 'bg-yellow-500 text-white' },
                { name: 'Supabase', color: 'bg-green-500 text-white' },
                { name: 'Firebase', color: 'bg-orange-500 text-white' },
                { name: 'MongoDB', color: 'bg-green-700 text-white' },
                { name: 'GitHub', color: 'bg-gray-800 text-white dark:bg-gray-700' },
                { name: 'Vercel', color: 'bg-black text-white dark:bg-gray-900' },
              ].map((tech) => (
                <div key={tech.name} className={`p-2 sm:p-4 rounded-xl font-semibold text-sm sm:text-base ${tech.color} shadow-md hover:scale-105 transition-transform`}>
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Transform Your Development Workflow?</h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90">Join thousands of developers building faster with AI Meta Factory</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/builder" className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors hover:scale-105">Start Building Free</Link>
            <Link href="/docs" className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">Schedule Demo</Link>
          </div>
          <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 text-center">
            <div><div className="text-xl sm:text-3xl font-bold">10,000+</div><div className="text-blue-100 text-xs sm:text-sm">Components Generated</div></div>
            <div><div className="text-xl sm:text-3xl font-bold">2,000+</div><div className="text-blue-100 text-xs sm:text-sm">Projects Built</div></div>
            <div><div className="text-xl sm:text-3xl font-bold">99.9%</div><div className="text-blue-100 text-xs sm:text-sm">Uptime</div></div>
          </div>
        </div>
      </div>

      {/* Footer with added Khalifa Ararsa */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-sm sm:text-base">AI</span>
                </div>
                <span className="text-lg sm:text-xl font-bold">AI Meta Factory</span>
              </div>
              <p className="text-gray-400 text-sm">Full-Stack AI Development Platform</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-xs mx-auto md:mx-0">
                O Prophet ﷺ, mercy to the worlds so bright,<br />
                Your light guides hearts through darkest night.<br />
                Wisdom, love, and peace you bring,<br />
                In every soul, Your praises sing.<br />
              </p>
              {/* Credits with Khalifa Ararsa */}
              <div className="mt-4 pt-3 border-t border-gray-800 text-center md:text-left">
                <p className="text-gray-400 text-xs sm:text-sm">
                  <span className="font-semibold text-blue-400">Khalifa Ararsa</span> (Big Brother) ❤️ | 
                  Created with 🧠 by <span className="font-semibold text-purple-400">Usman Ashebir</span> & <span className="font-semibold text-purple-400">Umer Ashebir</span>
                </p>
                <p className="text-gray-500 text-xs mt-1">Powered by Sufi's World ❤ | Guided by faith and innovation</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-3 sm:mt-4">
                <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-800 rounded-full text-xs">▲ Vercel</div>
                <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-800 rounded-full text-xs">🚀 Production Ready</div>
              </div>
            </div>
            <div className="flex gap-6 sm:gap-8 text-center md:text-left">
              <div>
                <h4 className="font-bold mb-2 sm:mb-4 text-sm sm:text-base">Product</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                  <li><Link href="/builder" className="hover:text-white">Builder</Link></li>
                  <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
                  <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 sm:mb-4 text-sm sm:text-base">Company</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                  <li><Link href="/culture" className="hover:text-white">Culture</Link></li>
                  <li><Link href="/sufism" className="hover:text-white">Sufism</Link></li>
                  <li><Link href="/admin" className="hover:text-white">Admin</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
            <p>© 2024 AI Meta Factory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
