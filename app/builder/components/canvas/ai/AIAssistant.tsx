"use client";

import { useState } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you generate code, explain concepts, or debug issues.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addToConsole } = useProjectStore();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add user message to console
    addToConsole({
      type: 'command',
      message: `User: ${input}`,
      timestamp: Date.now()
    });

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiResponse = `I received your message: "${input}". This is a simulated response. In a real implementation, I would connect to an AI API.`;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add AI response to console
      addToConsole({
        type: 'ai',
        message: `AI: ${aiResponse}`,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('AI request failed:', error);

      addToConsole({
        type: 'error',
        message: 'AI request failed. Please try again.',
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const quickPrompts = [
    'Create a React component for a login form',
    'How do I connect to a MongoDB database?',
    'Generate a Next.js API route for user authentication',
    'Explain the difference between useEffect and useMemo'
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900/50">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold">AI Assistant</h3>
          <div className="ml-auto flex items-center gap-1 text-xs text-green-400">
            <Sparkles className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Ask for code generation, explanations, or debugging help.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'assistant' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
              {message.role === 'assistant' ? (
                <Bot className="w-4 h-4 text-green-400" />
              ) : (
                <User className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'assistant' ? 'bg-gray-800 text-gray-100' : 'bg-blue-500 text-white'}`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-50 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-500/20">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div className="rounded-lg px-4 py-2 bg-gray-800">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-2">Quick Prompts</div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the AI assistant..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
