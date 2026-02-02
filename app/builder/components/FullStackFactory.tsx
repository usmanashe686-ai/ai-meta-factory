"use client";

import { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

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

  const generateFullStackProject = async () => {
    if (!prompt.trim()) {
      alert('Please enter a project description');
      return;
    }

    setStatus('analyzing');
    setResult(null);
    setProjectData(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('generating');

      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('building');

      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('complete');

      // Mock result
      const mockResult = {
        success: true,
        project: {
          name: 'ai-ecommerce-dashboard',
          structure: [
            'app/',
            'app/layout.tsx',
            'app/page.tsx',
            'components/',
            'components/Dashboard.tsx',
            'components/Navigation.tsx',
            'components/ProductTable.tsx',
            'lib/',
            'lib/database.ts',
            'public/',
            'package.json',
            'tailwind.config.ts',
            'tsconfig.json'
          ]
        },
        configuration: {
          stack: selectedStack,
          database: selectedDatabase,
          gitProvider: selectedGitProvider,
          compatibility: '✅ Compatible'
        },
        setup: {
          instructions: '1. Install dependencies: npm install\n2. Set up environment variables\n3. Run development server: npm run dev\n4. Build for production: npm run build',
          environmentVariables: ['DATABASE_URL', 'API_KEY', 'NEXT_PUBLIC_APP_URL']
        },
        nextSteps: [
          '1. Review generated project structure',
          '2. Set up environment variables',
          '3. Install dependencies',
          '4. Configure database connection',
          '5. Run the project'
        ]
      };

      setResult(mockResult);
      setProjectData(mockResult.project);
      
      alert(`🏭 Project "${mockResult.project.name}" generated successfully!`);
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
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: FactoryStatus) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'generating': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'building': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'analyzing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4" />;
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
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🏭 Full-Stack Factory</h2>
          <p className="text-gray-600 text-sm">Generate complete applications with AI</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg ${getStatusColor(status)} font-medium text-sm flex items-center gap-2`}>
            {getStatusIcon(status)}
            {status.toUpperCase()}
          </div>
          <button
            onClick={generateFullStackProject}
            disabled={status !== 'idle' && status !== 'complete'}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {status === 'idle' ? 'Generate Full Project' : 
             status === 'complete' ? 'Regenerate' : 'Generating...'}
          </button>
        </div>
      </div>

      {/* Current Configuration */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border">
        <h3 className="font-medium text-gray-900 mb-4">Factory Configuration</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-lg font-bold mb-2">{selectedStack.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Stack</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-lg font-bold mb-2">{selectedDatabase.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Database</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-lg font-bold mb-2">{selectedGitProvider.toUpperCase()}</div>
            <div className={`text-sm ${isGitConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isGitConnected ? 'Connected' : 'Not Connected'}
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
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  step.status === 'complete' ? 'bg-green-500' :
                  step.status === 'active' ? 'bg-blue-500 animate-pulse' :
                  step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                }`}>
                  {step.status === 'complete' ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : step.status === 'active' ? (
                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  ) : step.status === 'error' ? (
                    <XCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-medium">{step.id}</span>
                  )}
                </div>
                <div className="text-xs font-medium">{step.name}</div>
                <div className="text-xs text-gray-600">Step {step.id}</div>
              </div>
              
              {index < factorySteps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                  <div className={`h-full ${
                    step.status === 'complete' ? 'bg-green-500 w-full' :
                    step.status === 'active' ? 'bg-blue-500 w-1/2' :
                    'bg-gray-200 w-0'
                  } transition-all duration-500`}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Project Description Input */}
      <div className="mb-8">
        <label className="block font-medium text-gray-900 mb-3">Describe your full-stack project:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Example: A modern e-commerce dashboard with user authentication, product management, order tracking, and analytics charts..."
        />
        <div className="flex gap-2 mt-3 flex-wrap">
          {samplePrompts.map((sample) => (
            <button
              key={sample}
              onClick={() => setPrompt(sample)}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
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
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Full-Stack Project Generated!
            </h3>
          </div>

          <div className="mb-4">
            <div className="font-bold text-lg">{result.project?.name || 'AI Project'}</div>
            <div className="text-sm text-gray-600">
              {result.configuration?.stack} • {result.configuration?.database} • {result.configuration?.gitProvider}
            </div>
          </div>

          {/* Project Files Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowProjectFiles(!showProjectFiles)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {showProjectFiles ? 'Hide' : 'Show'} Project Structure
            </button>
            
            {showProjectFiles && projectData && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h4 className="font-medium text-white mb-3">📁 Project Structure</h4>
                  <div className="text-sm bg-gray-800 p-4 rounded overflow-x-auto">
                    <pre className="text-green-400">
                      {JSON.stringify(projectData.structure || ['No structure generated'], null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-3">🚀 Setup Instructions</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {result.setup?.instructions || 'No setup instructions provided.'}
                  </div>
                </div>

                {/* Environment Variables */}
                {result.setup?.environmentVariables && result.setup.environmentVariables.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-gray-900 mb-3">🔐 Environment Variables</h4>
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
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Copy Project Data
            </button>
            
            <button
              onClick={onExport}
              disabled={!isGitConnected}
              className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              {isGitConnected ? 'Export to GitHub' : 'Connect GitHub First'}
            </button>
            
            <button
              onClick={() => {
                setResult(null);
                setStatus('idle');
              }}
              className="px-4 py-2 border border-gray-300 font-medium rounded-lg hover:bg-gray-50"
            >
              Generate Another
            </button>
          </div>

          {/* Next Steps */}
          {result.nextSteps && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📋 Next Steps:</h4>
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
        <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-medium text-gray-900 mb-3">💡 How Full-Stack Factory Works</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium">1. Analysis</div>
              <div className="text-gray-600">AI analyzes your prompt and requirements</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">2. Architecture</div>
              <div className="text-gray-600">Creates project structure and database schema</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">3. Generation</div>
              <div className="text-gray-600">Generates all necessary files and code</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">4. Export</div>
              <div className="text-gray-600">Ready for Git push or deployment</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
