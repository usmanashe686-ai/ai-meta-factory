"use client";

import { useState } from 'react';
import { X, Download, Upload, ExternalLink, CheckCircle } from 'lucide-react';
import { ExportEngine } from './ExportEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'deploy' | 'settings'>('export');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold">Export & Deploy</h2>
            <p className="text-gray-400">Export your project or deploy it to the cloud</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${
              activeTab === 'deploy'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Deploy
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Settings
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'export' && <ExportEngine />}
          
          {activeTab === 'deploy' && (
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Deployment Options</h3>
                <p className="text-gray-400">Choose a platform to deploy your project</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vercel */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-black rounded-lg">
                      <svg className="w-8 h-8" viewBox="0 0 283 64" fill="white">
                        <path d="M141 16c-11 0-19 7-19 18s9 18 20 18c7 0 13-3 16-7l-7-5c-2 3-6 4-9 4-5 0-9-3-10-7h28v-3c0-11-8-18-19-18zm-9 15c1-4 4-7 9-7s8 3 9 7h-18zm117-15c-11 0-19 7-19 18s9 18 20 18c6 0 12-3 16-7l-8-5c-2 3-5 4-8 4-5 0-9-3-10-7h28l1-3c0-11-8-18-19-18zm-10 15c2-4 5-7 10-7s8 3 9 7h-19zm-39 3c0 6 4 10 10 10 4 0 7-2 9-5l8 5c-3 5-9 8-17 8-11 0-19-7-19-18s8-18 19-18c8 0 14 3 17 8l-8 5c-2-3-5-5-9-5-6 0-10 4-10 10zm83-29v46h-9V5h9zM37 0l37 64H0L37 0zm92 5-27 48L74 5h10l18 30 17-30h10zm59 12v10l-3-1c-6 0-10 4-10 10v15h-9V17h9v9c0-5 6-9 13-9z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Vercel</h4>
                      <p className="text-sm text-gray-400">Global edge network</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Automatic SSL certificates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Instant global deployments
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Built-in CI/CD
                    </li>
                  </ul>
                  <button className="w-full py-3 bg-black hover:bg-gray-900 rounded-lg font-medium">
                    Deploy to Vercel
                  </button>
                </div>
                
                {/* Netlify */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24">
                        <path d="M4.5 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM3 10.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5zM14.25 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM13.5 10.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5z"/>
                        <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3v13.5a3 3 0 01-3 3H5.25a3 3 0 01-3-3V5.25zm3-1.5a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H5.25z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Netlify</h4>
                      <p className="text-sm text-gray-400">Web hosting platform</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Continuous deployment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Serverless functions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      Form handling
                    </li>
                  </ul>
                  <button className="w-full py-3 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg font-medium">
                    Deploy to Netlify
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Export Settings</h3>
                <p className="text-gray-400">Configure your export preferences</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium mb-2 block">Project Name</span>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      placeholder="my-awesome-project"
                    />
                  </label>
                  
                  <label className="block">
                    <span className="text-sm font-medium mb-2 block">Version</span>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                      placeholder="1.0.0"
                    />
                  </label>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Include in export:</span>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">README.md</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">.gitignore</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">LICENSE</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Test files</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium">
              Export Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
