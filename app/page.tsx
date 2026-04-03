'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Database, Cloud, Code, Sun, Moon, Star, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
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
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Simple Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Meta Factory</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/builder" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Builder</Link>
              <Link href="/marketplace" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:inline">Marketplace</Link>
              <Link href="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:inline">Docs</Link>
              <button onClick={toggleTheme} className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm mb-4">
            AI-Powered Full-Stack Development
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Generate Full-Stack Apps with AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Build production-ready applications with database integration, GitHub deployment, and AI-generated components in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/builder" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-md transition">
              Launch Builder <ArrowRight size={16} />
            </Link>
            <Link href="/docs" className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              View Documentation
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> 10,000+ Components</div>
            <div className="flex items-center gap-1"><Trophy size={14} className="text-purple-500" /> 2,000+ Projects</div>
          </div>
        </div>

        {/* Why Choose */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">Why AI Meta Factory?</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10">Professional-grade AI development platform built for modern teams</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-sm">
              <Zap className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Structured AI Pipeline</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Idea → Structure → Code. Multi-model analysis, TypeScript-first, best practices enforced.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-sm">
              <Database className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Full-Stack Ready</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next.js, React, Flutter, Node.js, Python with Supabase, Firebase, MongoDB.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-sm">
              <Cloud className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">One-Click Deployment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Export to GitHub, deploy to Vercel/Netlify, or download as ZIP.</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold mx-auto mb-3">1</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Describe Your Idea</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tell the AI what you want to build</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold mx-auto mb-3">2</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Generates Code</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Full-stack application with best practices</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold mx-auto mb-3">3</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Deploy & Ship</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">One-click deployment to production</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center py-6 border-t border-b border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Supported Technologies</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Next.js</span> <span>React</span> <span>Supabase</span> <span>GitHub</span> <span>Vercel</span>
          </div>
        </div>
      </main>

      {/* Footer with collapsible Inspiration & Credits */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2026 AI Meta Factory. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <Link href="/culture" className="hover:text-gray-700 dark:hover:text-gray-300">Culture</Link>
            <Link href="/sufism" className="hover:text-gray-700 dark:hover:text-gray-300">Sufism</Link>
          </div>

          {/* Collapsible Credits Section */}
          <details className="mt-6 text-center text-gray-400 text-xs">
            <summary className="cursor-pointer hover:text-gray-500 dark:hover:text-gray-300 transition">
              Inspiration & Credits
            </summary>
            <p className="mt-3 leading-relaxed">
              O Prophet ﷺ, mercy to the worlds so bright,<br/>
              Your light guides hearts through darkest night.<br/>
              Wisdom, love, and peace you bring,<br/>
              In every soul, Your praises sing.
            </p>
            <p className="mt-2">
              ❤️ Khalifa Ararsa, Usman Ashebir & Umer Ashebir
            </p>
          </details>
        </div>
      </footer>
    </div>
  );
}
