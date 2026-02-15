import React, { useState } from 'react';
import { IdeaAnalyzer, IdeaAnalysis } from './IdeaAnalyzer';
import { useLocalAIStore } from '../state/local-ai-store';

export const ProductManagerTab: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { generate, isLoading: storeLoading, error } = useLocalAIStore();

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      // Use AI to analyze if available, else fallback to static analyzer
      if (generate) {
        const prompt = `Analyze this project idea and provide a feasibility score (0-100), complexity, estimated time, tech stack, core features, and challenges. Idea: ${idea}`;
        const result = await generate(prompt);
        // Parse result (simplified - in reality you'd need structured output)
        console.log('AI analysis:', result.text);
      }
      // Still use static analysis for now
      const result = await IdeaAnalyzer.analyze(idea);
      setAnalysis(result);
      const steps = await IdeaAnalyzer.generateRoadmap(idea);
      setRoadmap(steps);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Product Manager</h2>
      <textarea
        className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
        rows={4}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Enter your project idea..."
      />
      <button
        onClick={handleAnalyze}
        disabled={!idea.trim() || loading}
        className="mt-3 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze Idea'}
      </button>

      {analysis && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold">Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <span className="text-gray-400">Feasibility</span>
              <div className="text-2xl">{analysis.feasibility}%</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <span className="text-gray-400">Complexity</span>
              <div className="text-2xl capitalize">{analysis.complexity}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <span className="text-gray-400">Estimated Time</span>
              <div className="text-2xl">{analysis.estimatedTime}</div>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <h4 className="font-medium mb-2">Suggested Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.suggestedTechStack.map(tech => (
                <span key={tech} className="px-2 py-1 bg-gray-700 rounded text-sm">{tech}</span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <h4 className="font-medium mb-2">Core Features</h4>
            <ul className="list-disc list-inside space-y-1">
              {analysis.coreFeatures.map(f => <li key={f}>{f}</li>)}
            </ul>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <h4 className="font-medium mb-2">Roadmap</h4>
            <ul className="list-decimal list-inside space-y-1">
              {roadmap.map(step => <li key={step}>{step}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
