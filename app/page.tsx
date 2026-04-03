'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Database, Cloud, Code, Sun, Moon, Star, Trophy, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      {/* Navigation with proper Next.js Links */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Meta Factory</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/builder" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Builder</Link>
              <Link href="/marketplace" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Marketplace</Link>
              <Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Docs</Link>
              <Link href="/culture" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Culture</Link>
              <Link href="/sufism" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Sufism</Link>
              <button onClick={toggleTheme} className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
            <div className="flex md:hidden items-center gap-3">
              <button onClick={toggleTheme} className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <Link href="/builder" className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg shadow-md">Launch</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Glow */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 blur-3xl"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 px-4 py-1.5 rounded-full text-sm text-blue-700 dark:text-blue-300 mb-6 backdrop-blur-sm shadow-sm">
            <Sparkles size={14} /> AI-Powered Full-Stack Development
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Generate <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Full-Stack Apps</span> with AI
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Build production-ready applications with database integration, GitHub deployment, and AI-generated components in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/builder" className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105">
              Launch Builder <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/docs" className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition backdrop-blur-sm">
              View Documentation
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full shadow-sm"><Star size={14} className="text-yellow-500" /> 10,000+ Components</div>
            <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full shadow-sm"><Trophy size={14} className="text-purple-500" /> 2,000+ Projects</div>
            <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full shadow-sm"><Zap size={14} className="text-blue-500" /> 99.9% Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Grid (unchanged) */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Why AI Meta Factory?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Professional-grade AI development platform built for modern teams</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Structured AI Pipeline</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Idea → Structure → Code. Multi-model analysis, TypeScript-first, best practices enforced.</p>
            </div>
            <div className="group bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Full-Stack Ready</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Next.js, React, Flutter, Node.js, Python with Supabase, Firebase, MongoDB.</p>
            </div>
            <div className="group bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Cloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">One-Click Deployment</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Export to GitHub, deploy to Vercel/Netlify, or download as ZIP.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400">From idea to deployed app in minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-md">1</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Describe Your Idea</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tell the AI what you want to build</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-md">2</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Generates Code</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Full-stack application with best practices</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-md">3</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Deploy & Ship</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">One-click deployment to production</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 px-4 border-t border-b border-gray-200 dark:border-gray-800 bg-white/30 dark:bg-gray-900/30">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Trusted by developers building with</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-80">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Next.js</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">React</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Supabase</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">GitHub</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Vercel</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to build faster?</h2>
          <p className="text-lg mb-6 opacity-90">Start generating full-stack applications with AI today</p>
          <Link href="/builder" className="inline-block px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition hover:scale-105">
            Start Building Free
          </Link>
        </div>
      </section>

      {/* Footer with collapsible credits */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2026 AI Meta Factory. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <Link href="/culture" className="hover:text-gray-700 dark:hover:text-gray-300">Culture</Link>
            <Link href="/sufism" className="hover:text-gray-700 dark:hover:text-gray-300">Sufism</Link>
          </div>
          <details className="mt-6 text-center text-gray-400 text-xs">
            <summary className="cursor-pointer hover:text-gray-500 dark:hover:text-gray-300 transition">Inspiration & Credits</summary>
            <p className="mt-3 leading-relaxed">
              O Prophet ﷺ, mercy to the worlds so bright,<br/>
              Your light guides hearts through darkest night.<br/>
              Wisdom, love, and peace you bring,<br/>
              In every soul, Your praises sing.
            </p>
            <p className="mt-2">❤️ Khalifa Ararsa, Usman Ashebir & Umer Ashebir</p>
          </details>
        </div>
      </footer>
    </div>
  );
}
