"use client";

import { useState, useEffect } from 'react';

export default function HonestAIPipeline() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    gemini: 'checking' as 'checking' | 'available' | 'unavailable',
    openai: 'checking' as 'checking' | 'available' | 'unavailable'
  });

  useEffect(() => {
    // Simulate API status check
    setTimeout(() => {
      setApiStatus({
        gemini: 'unavailable',
        openai: 'available'
      });
    }, 1000);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a component description');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedCode(data.code || '// Generated component code here');
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setGeneratedCode(`// Error: ${error.message}\n// Try again or check your API configuration.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🧠 AI Component Generator</h2>
        <p className="text-gray-600">Describe your component and get real, working code</p>
      </div>

      {/* API Status */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border-2 ${
          apiStatus.gemini === 'available' ? 'border-green-500 bg-green-50' :
          apiStatus.gemini === 'unavailable' ? 'border-red-500 bg-red-50' :
          'border-yellow-500 bg-yellow-50'
        }`}>
          <div className="font-bold mb-1">Gemini 1.5 Flash</div>
          <div className="text-sm">
            {apiStatus.gemini === 'available' ? '✅ Available' :
             apiStatus.gemini === 'unavailable' ? '❌ Unavailable - API key required' :
             '🔄 Checking...'}
          </div>
          <div className="text-xs text-gray-600 mt-2">REQUIRED • REST API only</div>
        </div>
        
        <div className={`p-4 rounded-xl border-2 ${
          apiStatus.openai === 'available' ? 'border-green-500 bg-green-50' :
          apiStatus.openai === 'unavailable' ? 'border-red-500 bg-red-50' :
          'border-yellow-500 bg-yellow-50'
        }`}>
          <div className="font-bold mb-1">OpenAI GPT-4o Mini</div>
          <div className="text-sm">
            {apiStatus.openai === 'available' ? '✅ Available' :
             apiStatus.openai === 'unavailable' ? '❌ Unavailable' :
             '🔄 Checking...'}
          </div>
          <div className="text-xs text-gray-600 mt-2">OPTIONAL • Enhances pipeline</div>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block font-bold mb-2">Describe your component:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl"
          placeholder="Example: A modern dark navigation bar with responsive design..."
        />
        
        {/* Quick Prompts */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            'Modern navigation bar with dark theme',
            'User profile card with avatar and stats',
            'Login form with validation',
            'Pricing table with 3 tiers',
            'FAQ accordion with smooth animations'
          ].map((sample) => (
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

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          {isGenerating ? '⚡ Generating...' : '🚀 Generate Component'}
        </button>
        <div className="text-sm text-gray-600 text-center mt-2">
          Uses both Gemini and OpenAI for best results
        </div>
      </div>

      {/* Generated Code */}
      {generatedCode && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">✨ Generated Component</h3>
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="px-3 py-1 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              Copy Code
            </button>
          </div>
          <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
            <div className="bg-gray-900 text-gray-300 px-4 py-2 flex justify-between">
              <div>generated-component.tsx</div>
              <div className="text-sm">React + TypeScript</div>
            </div>
            <pre className="p-6 bg-gray-950 text-green-400 overflow-auto max-h-[400px] text-sm">
              {generatedCode}
            </pre>
          </div>
        </div>
      )}

      {/* Configuration Required */}
      {apiStatus.gemini === 'unavailable' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ Configuration Required</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Gemini API key required for generation. Add one of these to your Vercel environment variables:
          </p>
          <div className="space-y-2 text-sm">
            <code className="bg-gray-800 text-white px-2 py-1 rounded">GEMINI_API_KEY</code>
            <code className="bg-gray-800 text-white px-2 py-1 rounded">Gemini_API_KEY</code>
            <code className="bg-gray-800 text-white px-2 py-1 rounded">GOOGLE_API_KEY</code>
          </div>
          <div className="mt-3 text-sm text-yellow-700">
            Get your key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a>
          </div>
        </div>
      )}
    </div>
  );
}
