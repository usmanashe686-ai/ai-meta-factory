"use client";

import { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, XCircle, 
  RefreshCw, Play, Copy, Download,
  Sparkles, Cpu, Zap, Code as CodeIcon
} from 'lucide-react';

type HealthStatus = {
  system: {
    status: string;
    message: string;
  };
  openai: {
    configured: boolean;
    status: string;
  };
  gemini: {
    configured: boolean;
    keyFound: boolean;
    keySource: string;
    status: string;
  };
};

type PipelineStep = {
  id: number;
  name: string;
  model: string;
  status: 'waiting' | 'running' | 'success' | 'failed' | 'skipped' | 'not-configured';
  output?: string;
  time?: string;
};

export default function HonestAIPipeline() {
  const [prompt, setPrompt] = useState('A modern dark navigation bar with responsive design');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [showStructuredIdea, setShowStructuredIdea] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (health) {
      const hasOpenAI = health.openai.status.includes('✅');
      const hasGemini = health.gemini.status.includes('✅');
      
      if (hasGemini && hasOpenAI) {
        setSteps([
          { id: 1, name: 'Analysis', model: 'Gemini 1.5', status: 'waiting' },
          { id: 2, name: 'Structure', model: 'Gemini 1.5', status: 'waiting' },
          { id: 3, name: 'Code Gen', model: 'Gemini 1.5', status: 'waiting' },
          { id: 4, name: 'Review', model: 'GPT-4o', status: 'waiting' },
          { id: 5, name: 'Optimize', model: 'System', status: 'waiting' },
        ]);
      } else if (hasGemini) {
        setSteps([
          { id: 1, name: 'Analysis', model: 'Gemini 1.5', status: 'waiting' },
          { id: 2, name: 'Code Gen', model: 'Gemini 1.5', status: 'waiting' },
          { id: 3, name: 'Review', model: 'System', status: 'waiting' },
        ]);
      }
    }
  }, [health]);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoadingHealth(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status.includes('❌')) return <XCircle className="w-4 h-4 text-red-500" />;
    if (status.includes('⚠️')) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return null;
  };

  const generateComponent = async () => {
    if (!prompt.trim()) return;
    if (!health?.system.status.includes('🚀 READY')) return;

    setGenerating(true);
    setResult(null);
    setSteps(prev => prev.map(step => ({ ...step, status: 'waiting' })));

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      setResult(data);

      if (data.steps) {
        const updatedSteps = [...steps];
        data.steps.forEach((step: any, index: number) => {
          if (index < updatedSteps.length) {
            updatedSteps[index].status = 
              step.status.includes('✅') ? 'success' :
              step.status.includes('❌') ? 'failed' :
              step.status.includes('⚠️') ? 'skipped' :
              step.status.includes('⏭️') ? 'not-configured' : 'running';
            updatedSteps[index].time = step.time;
          }
        });
        setSteps(updatedSteps);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (result?.component?.code) {
      navigator.clipboard.writeText(result.component.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSystemReady = health?.system.status.includes('🚀 READY');
  const hasOpenAI = health?.openai.status.includes('✅');
  const hasGemini = health?.gemini.status.includes('✅');

  const samplePrompts = [
    'Modern navigation bar with dark theme',
    'User profile card with avatar and stats',
    'Login form with validation',
    'Pricing table with 3 tiers',
    'FAQ accordion with smooth animations'
  ];

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Component Generator
            </h2>
            <p className="text-gray-600 text-sm">Describe your component and get real, working code</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={checkHealth}
              disabled={loadingHealth}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </button>
            <button
              onClick={generateComponent}
              disabled={!isSystemReady || generating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate Component
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* API Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">API Status</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSystemReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {health?.system.status || 'Checking...'}
            </div>
          </div>

          {loadingHealth ? (
            <div className="text-center py-4 text-gray-500">Loading API status...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${
                hasGemini ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Cpu className={`w-5 h-5 ${hasGemini ? 'text-green-600' : 'text-red-600'}`} />
                  <div className="font-medium">Gemini 1.5 Flash</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${hasGemini ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {hasGemini ? 'REQUIRED' : 'REQUIRED'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{health?.gemini.status}</div>
              </div>

              <div className={`p-4 rounded-xl border ${
                hasOpenAI ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className={`w-5 h-5 ${hasOpenAI ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div className="font-medium">OpenAI GPT-4o Mini</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${hasOpenAI ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                    {hasOpenAI ? 'OPTIONAL' : 'OPTIONAL'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{health?.openai.status}</div>
              </div>
            </div>
          )}

          {health && !isSystemReady && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800 mb-2">Configuration Required</div>
                  <div className="text-sm text-yellow-700 mb-2">
                    {health.system.message}
                  </div>
                  <div className="text-xs space-y-1">
                    <div>1. Add <code className="bg-yellow-100 px-1 rounded">GEMINI_API_KEY</code> to Vercel</div>
                    <div>2. Get key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 underline">Google AI Studio</a></div>
                    <div>3. (Optional) Add <code className="bg-yellow-100 px-1 rounded">OPENAI_API_KEY</code></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Visualization */}
        {steps.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      step.status === 'success' ? 'bg-green-500' :
                      step.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      step.status === 'failed' ? 'bg-red-500' :
                      step.status === 'skipped' ? 'bg-yellow-500' :
                      step.status === 'not-configured' ? 'bg-gray-300' : 'bg-gray-200'
                    }`}>
                      {step.status === 'success' ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : step.status === 'running' ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : step.status === 'failed' ? (
                        <XCircle className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-white font-medium">{step.id}</span>
                      )}
                    </div>
                    <div className="text-xs font-medium">{step.model}</div>
                    <div className="text-xs text-gray-600">{step.name}</div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                      <div className={`h-full ${
                        step.status === 'success' ? 'bg-green-500 w-full' :
                        step.status === 'running' ? 'bg-blue-500 w-1/2' :
                        'bg-gray-200 w-0'
                      } transition-all duration-500`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-8">
          <label className="block font-medium text-gray-900 mb-3">Describe your component:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Example: A modern dark navigation bar with logo and responsive menu"
            disabled={!isSystemReady}
          />
          <div className="flex gap-2 mt-3 flex-wrap">
            {samplePrompts.map((sample) => (
              <button
                key={sample}
                onClick={() => setPrompt(sample)}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                disabled={!isSystemReady}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-xl border-2 ${
            result.success ? (result.honesty?.usedFallback ? 'border-yellow-500' : 'border-green-500') : 'border-red-500'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {result.success ? (
                      result.honesty?.usedFallback ? (
                        <>
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          Generated with Fallback
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Generated Successfully
                        </>
                      )
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        Generation Failed
                      </>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{result.component?.name}</p>
                </div>
                <div className="text-sm text-gray-500">{result.metrics?.totalTime}</div>
              </div>

              {/* Structured Idea Toggle */}
              {result.structuredIdea && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowStructuredIdea(!showStructuredIdea)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {showStructuredIdea ? 'Hide' : 'Show'} AI Analysis
                  </button>
                  
                  {showStructuredIdea && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                      <pre className="text-green-400 text-sm overflow-auto">
                        {JSON.stringify(result.structuredIdea, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Generated Code */}
              {result.component?.code && (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-medium text-gray-900">Generated Code</div>
                      <button
                        onClick={copyCode}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-900 text-gray-300 px-4 py-2 text-sm font-mono">
                        generated-component.tsx
                      </div>
                      <pre className="p-4 bg-gray-950 text-gray-100 text-sm overflow-auto max-h-96">
                        {result.component.code}
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={copyCode}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="px-4 py-2 border font-medium rounded-lg hover:bg-gray-50"
                    >
                      Generate Another
                    </button>
                  </div>
                </>
              )}

              {!result.success && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-red-800 font-medium mb-2">Generation Issues</div>
                  <div className="text-sm text-red-700">
                    {result.message}
                    {result.help && (
                      <div className="mt-2">
                        {result.help}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
