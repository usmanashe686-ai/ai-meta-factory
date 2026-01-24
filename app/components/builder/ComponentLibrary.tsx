"use client";

import { useBuilder } from '@/contexts/BuilderContext';
import { useState } from 'react';

const componentTypes = [
  { type: 'text' as const, label: 'Text', icon: '📝', color: 'bg-blue-100' },
  { type: 'button' as const, label: 'Button', icon: '🔼', color: 'bg-green-100' },
  { type: 'card' as const, label: 'Card', icon: '🃏', color: 'bg-purple-100' },
  { type: 'input' as const, label: 'Input', icon: '⌨️', color: 'bg-yellow-100' },
  { type: 'image' as const, label: 'Image', icon: '🖼️', color: 'bg-pink-100' },
];

export default function ComponentLibrary() {
  const { addComponent, generateAIComponent } = useBuilder();
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await generateAIComponent(aiPrompt);
      setAiPrompt('');
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg">Component Library</h3>
        <p className="text-sm text-gray-600">Drag components to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {componentTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => addComponent(item.type)}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-500">Click to add to canvas</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* AI Generator */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <span>✨</span> AI Generator
          </h4>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe a component (e.g., 'A blue login button')"
            className="w-full h-28 p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {isGenerating ? 'Generating...' : '✨ Generate with AI'}
          </button>
        </div>
      </div>
    </div>
  );
}
