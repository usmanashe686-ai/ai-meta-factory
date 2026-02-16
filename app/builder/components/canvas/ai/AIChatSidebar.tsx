'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Copy, Check, Trash2 } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChatSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your local AI assistant running on your device. I can help you generate components, fix bugs, explain code, and build complete applications – all without sending your data to the cloud. What would you like to create?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectFiles = useProjectStore((state) => state.files);
  const { platform, stack } = usePlatformStore();

  // Local AI endpoint (your Flask proxy on phone)
  const AI_API_URL = 'http://localhost:8000/generate';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      // Build prompt with context (optional: include current file content)
      const context = projectFiles.length > 0 
        ? `Current project has ${projectFiles.length} files.`
        : 'No files yet.';

      const fullPrompt = `Context: ${context}\n\nUser: ${input}\n\nAssistant:`;

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'tinyllama-1.1b', // or 'qwen2-0.5b' – you can make this configurable
          prompt: fullPrompt,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('AI service error');

      const data = await response.json();
      const aiText = data.text || data.generated_text || 'Sorry, I could not generate a response.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI request failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error connecting to local AI. Make sure your Flask server is running on port 8000.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your local AI assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  };

  const quickPrompts = [
    'Create a navbar component',
    'Add authentication',
    'Fix TypeScript errors',
    'Generate API routes',
    'Optimize performance',
    'Add dark mode',
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 border-l border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Local AI Assistant</h3>
              <p className="text-xs text-gray-400">Running on your device</p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-600"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  {message.role === 'assistant' ? (
                    <Bot size={12} className="text-green-400" />
                  ) : (
                    <User size={12} className="text-blue-300" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(message.content, message.id)}
                  className="p-1 hover:bg-black/20 rounded"
                >
                  {copiedId === message.id ? (
                    <Check size={12} className="text-green-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>
              <div className="text-xs opacity-50 mt-2 text-right">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg p-3 bg-gray-800">
              <div className="flex items-center space-x-2">
                <Bot size={12} className="text-green-400" />
                <span className="text-xs">AI is thinking</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to build..."
              rows={3}
              className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className={`absolute right-3 bottom-3 p-2 rounded-lg ${
                isGenerating || !input.trim()
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'
              }`}
            >
              <Send size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Sparkles size={12} />
              <span>Local AI – your data stays on device</span>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
              onClick={() => {
                // This would open AI settings/options
              }}
            >
              Options
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
