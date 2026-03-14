import Link from 'next/link';
import { 
  Book, Code, Rocket, Settings, Users, Shield, Download, FileText, 
  Zap, Brain, Globe, Database, GitBranch, Cloud, Sparkles, Box, Terminal
} from 'lucide-react';

export default function DocsPage() {
  const sections = [
    {
      title: 'Getting Started',
      icon: <Rocket className="w-6 h-6" />,
      links: [
        { name: 'Quick Start Guide', href: '/docs/quick-start' },
        { name: 'Installation', href: '/docs/installation' },
        { name: 'Your First Project', href: '/docs/first-project' },
        { name: 'Project Templates', href: '/docs/templates' },
      ]
    },
    {
      title: 'Studio Guide',
      icon: <Box className="w-6 h-6" />,
      links: [
        { name: 'Interface Overview', href: '/docs/studio/overview' },
        { name: 'File Explorer', href: '/docs/studio/file-explorer' },
        { name: 'Code Editor', href: '/docs/studio/editor' },
        { name: 'Live Preview', href: '/docs/studio/preview' },
        { name: 'Terminal / Console', href: '/docs/studio/console' },
      ]
    },
    {
      title: 'Local AI Setup',
      icon: <Terminal className="w-6 h-6" />,
      links: [
        { name: 'Running llama.cpp on Termux', href: '/docs/ai/local-setup' },
        { name: 'Using Your Own Models', href: '/docs/ai/own-models' },
        { name: 'Flask Proxy Configuration', href: '/docs/ai/proxy' },
        { name: 'Troubleshooting', href: '/docs/ai/troubleshooting' },
      ]
    },
    {
      title: 'AI Features',
      icon: <Brain className="w-6 h-6" />,
      links: [
        { name: 'AI Assistant', href: '/docs/ai/assistant' },
        { name: 'Pair Programming', href: '/docs/ai/pair-programming' },
        { name: 'Code Generation', href: '/docs/ai/code-generation' },
        { name: 'Model Selection', href: '/docs/ai/models' },
        { name: 'Fine‑tuning', href: '/docs/ai/fine-tuning' },
      ]
    },
    {
      title: 'Export & Deployment',
      icon: <Globe className="w-6 h-6" />,
      links: [
        { name: 'ZIP Export', href: '/docs/export/zip' },
        { name: 'APK (Android)', href: '/docs/export/apk' },
        { name: 'GitHub Push', href: '/docs/export/github' },
        { name: 'Vercel Deployment', href: '/docs/export/vercel' },
        { name: 'iOS (IPA)', href: '/docs/export/ios' },
        { name: 'Desktop Apps', href: '/docs/export/desktop' },
      ]
    },
    {
      title: 'Project Docs',
      icon: <FileText className="w-6 h-6" />,
      links: [
        { name: 'Creating Docs', href: '/docs/project-docs/create' },
        { name: 'Using Docs as Context', href: '/docs/project-docs/context' },
        { name: 'Organizing Ideas', href: '/docs/project-docs/organize' },
      ]
    },
    {
      title: 'Backup & Sessions',
      icon: <Database className="w-6 h-6" />,
      links: [
        { name: 'Auto‑save', href: '/docs/backup/autosave' },
        { name: 'Managing Backups', href: '/docs/backup/manager' },
        { name: 'Restoring Projects', href: '/docs/backup/restore' },
        { name: 'Session Settings', href: '/docs/backup/session' },
      ]
    },
    {
      title: 'API Reference',
      icon: <Code className="w-6 h-6" />,
      links: [
        { name: 'REST API', href: '/docs/api/rest' },
        { name: 'WebSocket', href: '/docs/api/websocket' },
        { name: 'Authentication', href: '/docs/api/auth' },
        { name: 'Rate Limits', href: '/docs/api/rate-limits' },
      ]
    },
    {
      title: 'Deployment',
      icon: <Cloud className="w-6 h-6" />,
      links: [
        { name: 'Self‑Hosting', href: '/docs/deployment/self-hosting' },
        { name: 'Docker', href: '/docs/deployment/docker' },
        { name: 'Kubernetes', href: '/docs/deployment/kubernetes' },
        { name: 'Production Checklist', href: '/docs/deployment/checklist' },
      ]
    },
    {
      title: 'Contributing',
      icon: <Users className="w-6 h-6" />,
      links: [
        { name: 'Development Setup', href: '/docs/contributing/dev' },
        { name: 'Testing', href: '/docs/contributing/testing' },
        { name: 'Pull Requests', href: '/docs/contributing/pr' },
        { name: 'Code of Conduct', href: '/docs/contributing/coc' },
      ]
    },
    {
      title: 'Architecture',
      icon: <Settings className="w-6 h-6" />,
      links: [
        { name: 'Overview', href: '/docs/architecture/overview' },
        { name: 'Frontend', href: '/docs/architecture/frontend' },
        { name: 'Backend', href: '/docs/architecture/backend' },
        { name: 'Database', href: '/docs/architecture/database' },
        { name: 'AI Service', href: '/docs/architecture/ai' },
      ]
    },
    {
      title: 'Security',
      icon: <Shield className="w-6 h-6" />,
      links: [
        { name: 'Overview', href: '/docs/security/overview' },
        { name: 'Authentication', href: '/docs/security/auth' },
        { name: 'Data Privacy', href: '/docs/security/privacy' },
        { name: 'Compliance', href: '/docs/security/compliance' },
      ]
    },
    {
      title: 'Community',
      icon: <Users className="w-6 h-6" />,
      links: [
        { name: 'GitHub', href: 'https://github.com/usmanashe686-ai/ai-meta-factory' },
        { name: 'Discord', href: '/community/discord' },
        { name: 'Forum', href: '/community/forum' },
        { name: 'Blog', href: '/blog' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Meta Factory Documentation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your complete guide to building full‑stack applications with local AI. Learn how to use the studio, harness AI, and export your projects.
          </p>
        </div>

        {/* Studio Overview Section */}
        <div className="mb-16 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-8 h-8" /> AI Meta Factory Studio
          </h2>
          <p className="text-lg mb-6 opacity-90">
            The AI Meta Factory Studio is your all‑in‑one development environment that runs entirely in your browser, powered by local AI models on your device. No data ever leaves your machine.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 p-4 rounded-xl">
              <Zap className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Blazing Fast</h3>
              <p className="text-sm opacity-80">Local models mean instant responses and total privacy.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <Brain className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">AI‑Powered</h3>
              <p className="text-sm opacity-80">Chat, generate code, fix bugs, and pair‑program with your own AI.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <GitBranch className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Full‑Stack Ready</h3>
              <p className="text-sm opacity-80">Build websites, mobile apps, desktop apps, games, and IoT.</p>
            </div>
          </div>
        </div>

        {/* Local AI Server Section */}
        <div className="mb-16 p-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="w-8 h-8" /> Local AI Server (Termux / Any Device)
          </h2>
          <p className="text-lg mb-4">
            To use AI features, you need to run a local AI server on your device. This can be done on Android via Termux, on Linux, macOS, or even Windows.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">📱 On Termux (Android)</h3>
              <p className="text-sm opacity-90 mb-2">
                1. Install Termux and dependencies.<br/>
                2. Clone and compile llama.cpp.<br/>
                3. Download a model (e.g., TinyLlama).<br/>
                4. Run the Flask proxy.<br/>
                <Link href="/docs/ai/local-setup" className="text-blue-300 underline">Full guide →</Link>
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">💻 On Linux/macOS</h3>
              <p className="text-sm opacity-90 mb-2">
                Use the same llama.cpp + Flask setup. You can also run the build service for APK exports.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-80">
            The AI server runs on <code className="bg-black/30 px-2 py-1 rounded">ai-meta-factory.onrender.com</code> and communicates with the frontend. You can use any GGUF model – just place it in the models directory.
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="mb-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Quick Start</h2>
            <ol className="space-y-4 list-decimal list-inside text-gray-700">
              <li><strong>Start your local AI server</strong> (see section above).</li>
              <li>Open the <Link href="/builder" className="text-blue-600 hover:underline">Builder</Link> – a blank project is auto‑created.</li>
              <li>Use the file explorer to add new files (right‑click or use the + button).</li>
              <li>Edit code in the Monaco editor with syntax highlighting.</li>
              <li>Click the <strong>Run</strong> button to refresh the live preview.</li>
              <li>Ask the AI Assistant (brain icon) for help – it uses your local model.</li>
              <li>Export your project as a ZIP or try APK (requires build service).</li>
            </ol>
          </div>
          <div className="bg-white rounded-xl shadow-lg border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Key Features</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span><strong>Local AI:</strong> Models run on your device (llama.cpp, TinyLlama).</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span><strong>VS Code‑like IDE:</strong> File explorer, resizable panels, mobile tabs.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span><strong>Project Docs:</strong> Store ideas, structure, and notes; AI can use them as context.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span><strong>Auto‑backup:</strong> Every 60 seconds, with restore from backup manager.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span><strong>Multi‑export:</strong> ZIP, APK, GitHub (coming), Vercel (coming).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Documentation Navigation Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Browse Documentation</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 flex items-center gap-2 text-sm"
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Join our community or open an issue on GitHub.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="https://github.com/usmanashe686-ai/ai-meta-factory/issues"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              GitHub Issues
            </Link>
            <Link
              href="/community"
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-lg hover:border-blue-500"
            >
              Community Forum
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-lg hover:border-blue-500"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
