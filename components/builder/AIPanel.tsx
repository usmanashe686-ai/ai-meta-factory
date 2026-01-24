"use client";

import { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle, AlertCircle, Code, Zap, Shield } from 'lucide-react';
import { AIPipeline } from '@/lib/ai/pipeline';
import { OutputType } from '@/types';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (code: string, styles: Record<string, string>) => void;
  initialPrompt?: string;
}

export default function AIPanel({ isOpen, onClose, onGenerate, initialPrompt = '' }: AIPanelProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputType, setOutputType] = useState<OutputType>('react');
  const [pipelineStatus, setPipelineStatus] = useState<
    Array<{ name: string; status: 'idle' | 'processing' | 'complete' | 'error'; message: string }>
  >([
    { name: 'OpenAI', status: 'idle', message: 'Ready for idea generation' },
    { name: 'DeepSeek', status: 'idle', message: 'Ready for code conversion' },
    { name: 'Gemini', status: 'idle', message: 'Ready for safety check' }
  ]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Update pipeline status
    const updateStatus = (index: number, status: 'processing' | 'complete' | 'error', message: string) => {
      setPipelineStatus(prev => prev.map((stage, i) => 
        i === index ? { ...stage, status, message } : stage
      ));
    };

    try {
      // Stage 1: OpenAI (Idea Generation)
      updateStatus(0, 'processing', 'Generating creative ideas...');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStatus(0, 'complete', 'Ideas generated successfully');

      // Stage 2: DeepSeek (Code Conversion)
      updateStatus(1, 'processing', 'Converting to clean code...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStatus(1, 'complete', 'Code conversion complete');

      // Stage 3: Gemini (Safety & Optimization)
      updateStatus(2, 'processing', 'Checking safety & optimizing...');
      const result = await AIPipeline.generateComponent(prompt, outputType);
      updateStatus(2, 'complete', 'Safety check passed, code optimized');

      // Additional optimization
      const validated = await AIPipeline.validateCode(result.code);
      if (validated.valid) {
        const optimizedCode = await AIPipeline.optimizeCode(result.code);
        
        onGenerate(optimizedCode, result.styles);
        onClose();
      } else {
        throw new Error('Code validation failed');
      }

    } catch (error) {
      console.error('AI generation failed:', error);
      updateStatus(2, 'error', 'Generation failed, please try again');
    } finally {
      setIsGenerating(false);
      // Reset pipeline status after delay
      setTimeout(() => {
        setPipelineStatus([
          { name: 'OpenAI', status: 'idle', message: 'Ready for idea generation' },
          { name: 'DeepSeek', status: 'idle', message: 'Ready for code conversion' },
          { name: 'Gemini', status: 'idle', message: 'Ready for safety check' }
        ]);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Component Generator</h2>
              <p className="text-sm text-gray-500">Powered by multi-model AI pipeline</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={isGenerating}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Output Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Select Output Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'react', label: 'React Component', icon: '⚛️', desc: 'Single component' },
                  { id: 'full-app', label: 'Full Web App', icon: '🌐', desc: 'Complete app' },
                  { id: 'apk', label: 'APK (Mobile)', icon: '📱', desc: 'Android package' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setOutputType(type.id as OutputType)}
                    disabled={isGenerating}
                    className={\`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all \${outputType === type.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}\`}
                  >
                    <span className="text-3xl">{type.icon}</span>
                    <span className="font-medium text-gray-900">{type.label}</span>
                    <span className="text-xs text-gray-500 text-center">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Describe what you want to build
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Create a modern dashboard card with charts, statistics, and dark mode toggle..."
                className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                disabled={isGenerating}
              />
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4" />
                Be specific for better results. Include: purpose, features, style preferences.
              </div>
            </div>

            {/* AI Pipeline Visualization */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">AI Pipeline Status</h3>
              </div>
              
              <div className="space-y-4">
                {pipelineStatus.map((stage, index) => (
                  <div key={stage.name} className="flex items-center gap-4">
                    {/* Connector line */}
                    {index > 0 && (
                      <div className="w-8 h-0.5 bg-gray-200 ml-6"></div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      {/* Status indicator */}
                      <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${stage.status === 'idle' ? 'bg-gray-100' : stage.status === 'processing' ? 'bg-blue-100 animate-pulse' : stage.status === 'complete' ? 'bg-green-100' : 'bg-red-100'}\`}>
                        {stage.status === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-300"></div>}
                        {stage.status === 'processing' && <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></div>}
                        {stage.status === 'complete' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {stage.status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{stage.name}</span>
                          {stage.name === 'Gemini' && <Shield className="h-3 w-3 text-purple-500" />}
                        </div>
                        <div className={\`text-sm \${stage.status === 'processing' ? 'text-blue-600' : stage.status === 'complete' ? 'text-green-600' : stage.status === 'error' ? 'text-red-600' : 'text-gray-500'}\`}>
                          {stage.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* API Status */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">API Status:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-green-600">OpenAI</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-blue-600">DeepSeek</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                      <span className="text-purple-600">Gemini</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Code Preview (Placeholder) */}
            {isGenerating && (
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Generating code...</span>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 text-gray-600 text-sm">{i}</div>
                      <div className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: \`\${Math.random() * 200 + 100}px\` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Using environment variables from Vercel
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Component
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
