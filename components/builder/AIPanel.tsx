'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { AIOrchestrator } from '@/lib/ai/orchestrator/pipeline';
import { toast } from 'react-hot-toast';

interface AIPanelProps {
  onComponentGenerated: (code: string) => void;
  projectId: string;
}

export default function AIPanel({ onComponentGenerated, projectId }: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<string[]>([]);
  const [orchestrator] = useState(() => new AIOrchestrator());

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setGenerating(true);
    setPipelineStatus(['🚀 Starting AI pipeline...']);

    try {
      // Update status as pipeline progresses
      const statusUpdates = [
        '🎨 Generating creative design (OpenAI)...',
        '🏗️ Structuring code (DeepSeek)...',
        '🛡️ Verifying safety (Gemini)...',
        '✨ Finalizing component...'
      ];

      statusUpdates.forEach((status, i) => {
        setTimeout(() => {
          setPipelineStatus(prev => [...prev, status]);
        }, i * 1000);
      });

      // Execute pipeline
      const result = await orchestrator.processPipeline(prompt, {
        projectId,
        framework: 'nextjs',
        style: 'modern'
      });

      // Show results
      setPipelineStatus(prev => [
        ...prev,
        `✅ Pipeline completed in ${result.metadata.timeTaken}ms`,
        `📊 Tokens used: ${result.metadata.totalTokens}`,
        `💰 Estimated cost: $${result.metadata.estimatedCost.toFixed(4)}`
      ]);

      // Send to parent
      onComponentGenerated(result.finalOutput);
      
      toast.success('Component generated successfully!');

    } catch (error) {
      console.error('Generation failed:', error);
      setPipelineStatus(prev => [...prev, '❌ Pipeline failed']);
      toast.error('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 h-full">
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          AI Component Generator
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Describe what you want. We'll handle the AI magic internally.
        </p>
      </div>

      {/* Simple Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your component
          </label>
          <Input
            placeholder="e.g., 'A login form with social buttons and validation'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Component
            </>
          )}
        </Button>
      </div>

      {/* Pipeline Status (Collapsible) */}
      {pipelineStatus.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              AI Pipeline Status
            </summary>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {pipelineStatus.map((status, index) => (
                <div
                  key={index}
                  className="flex items-start text-sm p-2 rounded bg-gray-50"
                >
                  {status.includes('✅') || status.includes('completed') ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                  ) : status.includes('❌') ? (
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600 mt-0.5" />
                  ) : (
                    <Loader2 className="w-4 h-4 mr-2 text-blue-600 animate-spin mt-0.5" />
                  )}
                  <span className={status.includes('❌') ? 'text-red-700' : ''}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Cost Display */}
      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p>
          <span className="font-medium">Internal AI Pipeline:</span>{' '}
          OpenAI → DeepSeek → Gemini
        </p>
        <p className="mt-1">
          You only see the result. The AI orchestration happens automatically.
        </p>
      </div>
    </div>
  );
}
