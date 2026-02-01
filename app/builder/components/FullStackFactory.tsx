"use client";

import { useState, useEffect } from 'react';

interface FullStackFactoryProps {
  selectedStack: string;
  selectedDatabase: string;
  selectedGitProvider: string;
  isGitConnected: boolean;
  onExport: () => void;
}

type FactoryStatus = 'idle' | 'analyzing' | 'generating' | 'building' | 'complete' | 'error';

export default function FullStackFactory({
  selectedStack,
  selectedDatabase,
  selectedGitProvider,
  isGitConnected,
  onExport
}: FullStackFactoryProps) {
  const [prompt, setPrompt] = useState('Create a modern e-commerce dashboard with analytics and product management');
  const [status, setStatus] = useState<FactoryStatus>('idle');
  const [result, setResult] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [showProjectFiles, setShowProjectFiles] = useState(false);

  const stackIcons: Record<string, string> = {
    nextjs: '⚡',
    react: '⚛️',
    flutter: '📱',
    node: '🟢',
    python: '🐍'
  };

  const databaseIcons: Record<string, string> = {
    supabase: '🟢',
    firebase: '🟠',
    mongodb: '🟩',
    planetscale: '🟣',
    none: '⚪'
  };

  const generateFullStackProject = async () => {
    if (!prompt.trim()) {
      alert('Please enter a project description');
      return;
    }

    setStatus('analyzing');
    setResult(null);
    setProjectData(null);

    try {
      // Step 1: Analyze requirements
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('generating');

      // Step 2: Generate project
      const response = await fetch('/api/factory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          stack: selectedStack,
          database: selectedDatabase,
          gitProvider: selectedGitProvider
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('building');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus('complete');
        setResult(data);
        setProjectData(data.project);
        
        alert(`🏭 Project "${data.project?.name}" generated successfully!`);
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: any) {
      setStatus('error');
      alert(`❌ Error: ${error.message}`);
    }
  };

  const getStatusColor = (status: FactoryStatus) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'generating':
      case 'building':
      case 'analyzing': return 'bg-blue-100 text-blue-800 animate-pulse';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: FactoryStatus) => {
    switch (status) {
      case 'complete': return '✅';
      case 'error': return '❌';
      case 'generating': return '⚡';
      case 'building': return '🏗️';
      case 'analyzing': return '🔍';
      default: return '⏳';
    }
  };

  const factorySteps = [
    { id: 1, name: 'Analyze Requirements', status: status === 'analyzing' ? 'active' : (status === 'idle' ? 'pending' : 'complete') },
    { id: 2, name: 'Generate Architecture', status: status === 'generating' ? 'active' : (status === 'idle' || status === 'analyzing' ? 'pending' : 'complete') },
    { id: 3, name: 'Build Project', status: status === 'building' ? 'active' : (['idle', 'analyzing', 'generating'].includes(status) ? 'pending' : 'complete') },
    { id: 4, name: 'Complete', status: status === 'complete' ? 'active' : (status === 'error' ? 'error' : 'pending') },
  ];

  const samplePrompts = [
    'E-commerce admin dashboard',
    'Social media platform',
    'Task management app',
    'Real-time chat application',
    'Analytics dashboard with charts',
    'User authentication system'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏭 Full-Stack Factory</h2>
          <p className="text-gray-600">Generate complete applications with AI</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg ${getStatusColor(status)} font-bold`}>
            {getStatusIcon(status)} {status.toUpperCase()}
          </div>
          <button
            onClick={generateFullStackProject}
            disabled={status !== 'idle' && status !== 'complete'}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {status === 'idle' ? '🚀 Generate Full Project' : 
             status === 'complete' ? '🔄 Regenerate' : 'Generating...'}
          </button>
        </div>
      </div>

      {/* Current Configuration */}
      <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span>⚙️</span>
          Factory Configuration
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl mb-2">{stackIcons[selectedStack] || '⚙️'}</div>
            <div className="font-bold">{selectedStack.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Stack</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl mb-2">{databaseIcons[selectedDatabase] || '🗄️'}</div>
            <div className="font-bold">{selectedDatabase.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Database</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-bold">{selectedGitProvider.toUpperCase()}</div>
            <div className={`text-sm ${isGitConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isGitConnected ? '✅ Connected' : '❌ Not Connected'}
            </div>
          </div>
        </div>
      </div>

      {/* Factory Pipeline Visualization */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {factorySteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  step.status === 'complete' ? 'bg-green-500' :
                  step.status === 'active' ? 'bg-purple-500 animate-pulse' :
                  step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                }`}>
                  <span className="text-white text-xl">
                    {step.status === 'complete' ? '✓' :
                     step.status === 'active' ? '⟳' :
                     step.status === 'error' ? '✗' : step.id}
                  </span>
                </div>
                <div className="font-bold text-sm">Step {step.id}</div>
                <div className="text-xs text-gray-600">{step.name}</div>
              </div>
              
              {index < factorySteps.length - 1 && (
                <div className="flex-1 h-2 bg-gray-200 mx-4">
                  <div className={`h-full ${
                    step.status === 'complete' ? 'bg-green-500 w-full' :
                    step.status === 'active' ? 'bg-purple-500 w-1/2' :
                    'bg-gray-200 w-0'
                  } transition-all duration-500`}></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {selectedStack.toUpperCase()} + {selectedDatabase.toUpperCase()} + {selectedGitProvider.toUpperCase()}
        </div>
      </div>

      {/* Project Description Input */}
      <div className="mb-8">
        <label className="block font-bold mb-2">Describe your full-stack project:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-40 p-4 border-2 border-gray-300 rounded-xl"
          placeholder="Example: A modern e-commerce dashboard with user authentication, product management, order tracking, and analytics charts..."
        />
        <div className="flex gap-2 mt-3 flex-wrap">
          {samplePrompts.map((sample) => (
            <button
              key={sample}
              onClick={() => setPrompt(sample)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-8 p-6 rounded-xl border-2 border-green-500 bg-green-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">🎉 Full-Stack Project Generated!</h3>
            <div className="text-sm">
              {result.metadata?.generatedAt ? new Date(result.metadata.generatedAt).toLocaleTimeString() : 'Now'}
            </div>
          </div>

          <div className="mb-4">
            <div className="font-bold text-lg">{result.project?.name || 'AI Project'}</div>
            <div className="text-sm text-gray-600">
              {result.configuration?.stack} • {result.configuration?.database} • {result.configuration?.gitProvider}
            </div>
            <div className={`text-xs mt-1 ${result.configuration?.compatibility?.includes('✅') ? 'text-green-600' : 'text-yellow-600'}`}>
              {result.configuration?.compatibility}
            </div>
          </div>

          {/* Project Files Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowProjectFiles(!showProjectFiles)}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              <span>{showProjectFiles ? '▼' : '▶'}</span>
              {showProjectFiles ? 'Hide Project Structure' : 'Show Project Structure'}
            </button>
            
            {showProjectFiles && projectData && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg text-white">
                  <h4 className="font-semibold text-lg mb-3">📁 Project Structure</h4>
                  <div className="text-sm bg-gray-900 p-4 rounded overflow-x-auto">
                    <pre className="text-green-400">
                      {JSON.stringify(projectData.structure || ['No structure generated'], null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-lg mb-3">🚀 Setup Instructions</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {result.setup?.instructions || 'No setup instructions provided.'}
                  </div>
                </div>

                {/* Environment Variables */}
                {result.setup?.environmentVariables && result.setup.environmentVariables.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-lg mb-3">🔐 Environment Variables</h4>
                    <div className="text-sm">
                      {result.setup.environmentVariables.map((env: string, index: number) => (
                        <div key={index} className="font-mono bg-white px-3 py-1 rounded border mb-1">
                          {env}=your_value_here
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                alert('Project data copied to clipboard!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Copy Project Data
            </button>
            
            <button
              onClick={onExport}
              disabled={!isGitConnected}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              {isGitConnected ? '🚀 Export to GitHub' : '🔗 Connect GitHub First'}
            </button>
            
            <button
              onClick={() => {
                setResult(null);
                setStatus('idle');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Generate Another
            </button>
          </div>

          {/* Next Steps */}
          {result.nextSteps && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold mb-2">📋 Next Steps:</h4>
              <ul className="text-sm space-y-1">
                {result.nextSteps.map((step: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {status === 'idle' && !result && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>💡</span>
            How Full-Stack Factory Works
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-bold">1. Analysis</div>
              <div>AI analyzes your prompt and requirements</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold">2. Architecture</div>
              <div>Creates project structure and database schema</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold">3. Generation</div>
              <div>Generates all necessary files and code</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold">4. Export</div>
              <div>Ready for Git push or deployment</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
