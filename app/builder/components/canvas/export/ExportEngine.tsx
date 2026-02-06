"use client";

import { useState } from 'react';
import { Download, Upload, Github, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function ExportEngine() {
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'uploading' | 'complete'>('idle');
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const { files, stack, name } = useProjectStore();

  const generateConfigFiles = () => {
    const configs: Record<string, string> = {};
    
    // Package.json for React/Next.js
    if (stack.frontend === 'nextjs') {
      configs['package.json'] = JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        },
        dependencies: {
          'next': '14.0.0',
          'react': '18.2.0',
          'react-dom': '18.2.0',
          ...(stack.database === 'supabase' ? { '@supabase/supabase-js': '^2.38.0' } : {}),
          ...(stack.database === 'firebase' ? { 'firebase': '^10.7.0' } : {})
        },
        devDependencies: {
          '@types/node': '20.10.0',
          '@types/react': '18.2.0',
          '@types/react-dom': '18.2.0',
          'autoprefixer': '10.4.16',
          'eslint': '8.55.0',
          'eslint-config-next': '14.0.0',
          'postcss': '8.4.32',
          'tailwindcss': '3.3.6',
          'typescript': '5.3.0'
        }
      }, null, 2);
    }
    
    // requirements.txt for Python
    if (stack.backend === 'python') {
      configs['requirements.txt'] = `fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
${stack.database === 'mongodb' ? 'pymongo==4.6.0' : ''}
${stack.database === 'supabase' ? 'supabase==1.1.1' : ''}`;
      
      configs['main.py'] = `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="${name}")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello from ${name}"}

@app.get("/health")
async def health():
    return {"status": "healthy"}`;
    }
    
    // Flutter pubspec.yaml
    if (stack.frontend === 'flutter') {
      configs['pubspec.yaml'] = `name: ${name.toLowerCase().replace(/\s+/g, '_')}
description: A new Flutter project.
version: 0.1.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter

flutter:
  uses-material-design: true`;
    }
    
    // .gitignore
    configs['.gitignore'] = `# Dependencies
node_modules/
.pnp
.pnp.js
.yarn/install-state.gz

# Testing
coverage/

# Production
build/
dist/
out/

# Environment variables
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db`;
    
    // Next.js config
    if (stack.frontend === 'nextjs') {
      configs['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`;
      
      configs['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
    }

    return configs;
  };

  const exportAsZip = async () => {
    setExporting(true);
    setExportStatus('exporting');
    
    try {
      const zip = new JSZip();
      
      // Add all project files
      Object.entries(files).forEach(([path, file]) => {
        // Skip folder markers
        if (path.includes('.folder-marker')) return;
        
        // Ensure proper path format
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        zip.file(cleanPath, file.content);
      });
      
      // Add configuration files
      const configFiles = generateConfigFiles();
      Object.entries(configFiles).forEach(([path, content]) => {
        zip.file(path, content);
      });
      
      // Generate zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      setExportStatus('complete');
      
      // Download
      saveAs(content, `${name.toLowerCase().replace(/\s+/g, '-')}.zip`);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setExportStatus('idle');
        setExporting(false);
      }, 3000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('idle');
      setExporting(false);
    }
  };

  const pushToGitHub = async () => {
    setExporting(true);
    setExportStatus('uploading');
    
    try {
      // Prepare project data
      const projectData = {
        name,
        files,
        stack,
        timestamp: new Date().toISOString()
      };
      
      // Call your backend API to push to GitHub
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      
      const result = await response.json();
      
      if (result.success && result.url) {
        setGithubUrl(result.url);
        setExportStatus('complete');
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setExportStatus('idle');
          setExporting(false);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to push to GitHub');
      }
      
    } catch (error) {
      console.error('GitHub push failed:', error);
      setExportStatus('idle');
      setExporting(false);
    }
  };

  const deployToVercel = async () => {
    if (!githubUrl) {
      alert('Please push to GitHub first');
      return;
    }
    
    setExporting(true);
    setExportStatus('uploading');
    
    try {
      const response = await fetch('/api/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl })
      });
      
      const result = await response.json();
      
      if (result.success && result.url) {
        setDeployUrl(result.url);
        setExportStatus('complete');
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setExportStatus('idle');
          setExporting(false);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to deploy');
      }
      
    } catch (error) {
      console.error('Deployment failed:', error);
      setExportStatus('idle');
      setExporting(false);
    }
  };

  const getStatusIcon = () => {
    switch (exportStatus) {
      case 'exporting':
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Export & Deploy</h2>
        <p className="text-gray-400">Export your project or deploy it directly</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Export */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Local Export</h3>
                <p className="text-sm text-gray-400">Download as ZIP file</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm">
              <p className="text-gray-300 mb-2">Includes:</p>
              <ul className="space-y-1 text-gray-400">
                <li>• All project files</li>
                <li>• Configuration files (package.json, etc.)</li>
                <li>• Dependencies setup</li>
                <li>• Build scripts</li>
              </ul>
            </div>
            
            <button
              onClick={exportAsZip}
              disabled={exporting}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {getStatusIcon()}
              {exportStatus === 'exporting' ? 'Creating ZIP...' : 
               exportStatus === 'complete' ? 'Downloaded!' : 'Download as ZIP'}
            </button>
          </div>
        </div>
        
        {/* GitHub Integration */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-500/20 rounded-lg">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">GitHub</h3>
                <p className="text-sm text-gray-400">Push to repository</p>
              </div>
            </div>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="text-sm">
              <p className="text-gray-300 mb-2">Features:</p>
              <ul className="space-y-1 text-gray-400">
                <li>• Create new repository</li>
                <li>• Push all files</li>
                <li>• Set up .gitignore</li>
                <li>• Automatic commits</li>
              </ul>
            </div>
            
            <button
              onClick={pushToGitHub}
              disabled={exporting || !files || Object.keys(files).length === 0}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {exportStatus === 'uploading' ? 'Pushing to GitHub...' : 'Push to GitHub'}
            </button>
          </div>
        </div>
        
        {/* Deployment */}
        <div className="md:col-span-2 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <ExternalLink className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Deploy</h3>
                <p className="text-sm text-gray-400">Deploy to cloud platform</p>
              </div>
            </div>
            {deployUrl && (
              <a
                href={deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
              >
                Open App <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={deployToVercel}
              disabled={exporting || !githubUrl}
              className="py-3 bg-black hover:bg-gray-900 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 283 64" fill="white">
                <path d="M141 16c-11 0-19 7-19 18s9 18 20 18c7 0 13-3 16-7l-7-5c-2 3-6 4-9 4-5 0-9-3-10-7h28v-3c0-11-8-18-19-18zm-9 15c1-4 4-7 9-7s8 3 9 7h-18zm117-15c-11 0-19 7-19 18s9 18 20 18c6 0 12-3 16-7l-8-5c-2 3-5 4-8 4-5 0-9-3-10-7h28l1-3c0-11-8-18-19-18zm-10 15c2-4 5-7 10-7s8 3 9 7h-19zm-39 3c0 6 4 10 10 10 4 0 7-2 9-5l8 5c-3 5-9 8-17 8-11 0-19-7-19-18s8-18 19-18c8 0 14 3 17 8l-8 5c-2-3-5-5-9-5-6 0-10 4-10 10zm83-29v46h-9V5h9zM37 0l37 64H0L37 0zm92 5-27 48L74 5h10l18 30 17-30h10zm59 12v10l-3-1c-6 0-10 4-10 10v15h-9V17h9v9c0-5 6-9 13-9z"/>
              </svg>
              Vercel
            </button>
            
            <button
              disabled={exporting || !githubUrl}
              className="py-3 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Pages
            </button>
            
            <button
              disabled={exporting || !githubUrl}
              className="py-3 bg-orange-500/20 hover:bg-orange-500/30 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M4.5 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM3 10.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5zM14.25 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM13.5 10.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5z"/>
                <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3v13.5a3 3 0 01-3 3H5.25a3 3 0 01-3-3V5.25zm3-1.5a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H5.25z" clipRule="evenodd"/>
              </svg>
              Netlify
            </button>
          </div>
        </div>
      </div>
      
      {/* Project Stats */}
      <div className="mt-8 p-6 bg-gray-900/30 rounded-xl">
        <h4 className="font-medium mb-4">Project Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Object.keys(files).filter(p => !p.includes('.folder-marker')).length}
            </div>
            <div className="text-sm text-gray-400">Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stack.frontend}</div>
            <div className="text-sm text-gray-400">Frontend</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stack.backend}</div>
            <div className="text-sm text-gray-400">Backend</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stack.database}</div>
            <div className="text-sm text-gray-400">Database</div>
          </div>
        </div>
      </div>
    </div>
  );
}
