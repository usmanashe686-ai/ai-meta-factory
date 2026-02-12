'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Copy, Check, Trash2 } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

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
      content: 'Hello! I\'m your AI development assistant. I can help you generate components, fix bugs, explain code, and build complete applications. What would you like to create?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectFiles = useProjectStore((state) => state.files);
  const stack = useProjectStore((state) => state.stack);
  
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
    
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1500);
  };
  
  const generateAIResponse = (prompt: string): string => {
    const responses = [
      `I'll help you with "${prompt}". Here's a suggested implementation:\n\n\`\`\`tsx\n// Generated component based on your request\nexport default function GeneratedComponent() {\n  return (\n    <div className="p-4">\n      <h1>Your Component</h1>\n    </div>\n  );\n}\n\`\`\``,
      
      `Based on your project (${stack.frontend}), I recommend:\n1. Create a structured component\n2. Add TypeScript interfaces\n3. Implement proper error handling\n\nWould you like me to generate the code?`,
      
      `I analyzed your project structure. Here are some improvements:\n• Add proper error boundaries\n• Implement loading states\n• Add accessibility features\n\nI can implement these for you.`,
      
      `Great idea! Here's how we can implement that:\n\`\`\`tsx\n// Smart implementation with best practices\ninterface Props {\n  // Your props here\n}\n\`\`\``,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
        content: 'Hello! I\'m your AI development assistant. How can I help you today?',
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
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-gray-400">Powered by GPT-4</p>
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
              <span>AI can generate code, fix bugs, and explain concepts</span>
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
