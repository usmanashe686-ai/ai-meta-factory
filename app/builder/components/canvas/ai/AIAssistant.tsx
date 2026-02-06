"use client";

import { useState } from 'react';
import { Send, Sparkles, Wand2, Bug, Zap, Brain, MessageSquare } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function AIAssistant() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you generate, modify, or explain code. What would you like to build?',
      timestamp: new Date()
    }
  ]);
  const { files, activeFile, stack } = useProjectStore();
  
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);
    
    // Add user message
    const userMsg: Message = { role: 'user', content: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock AI response based on prompt
      let response = '';
      if (userMessage.toLowerCase().includes('component')) {
        response = 'I can help you create a component. Here\'s an example:\n\n```tsx\nimport React from \'react\';\n\nexport default function ExampleComponent() {\n  return (\n    <div className="p-4">\n      <h1>Example Component</h1>\n      <p>This is an AI-generated component.</p>\n    </div>\n  );\n}\n```\n\nWould you like me to add this to your project?';
      } else if (userMessage.toLowerCase().includes('fix') || userMessage.toLowerCase().includes('bug')) {
        response = 'I can help you fix bugs. Please share the specific code or error you\'re encountering.';
      } else if (userMessage.toLowerCase().includes('explain')) {
        response = 'I can explain code concepts. What specific part would you like me to explain?';
      } else {
        response = `I understand you want to "${userMessage}". For the ${stack.frontend} project, I can help you with:\n\n1. Generating new components\n2. Modifying existing code\n3. Debugging issues\n4. Optimizing performance\n\nCould you be more specific about what you'd like to accomplish?`;
      }
      
      const aiMsg: Message = { role: 'assistant', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const quickCommands = [
    { 
      icon: <Wand2 className="w-4 h-4" />, 
      label: 'Improve this code', 
      action: () => setInput('Can you improve the current code?') 
    },
    { 
      icon: <Bug className="w-4 h-4" />, 
      label: 'Find and fix bugs', 
      action: () => setInput('Find and fix any bugs in the current file') 
    },
    { 
      icon: <Zap className="w-4 h-4" />, 
      label: 'Make responsive', 
      action: () => setInput('Make the current component responsive') 
    },
    { 
      icon: <Brain className="w-4 h-4" />, 
      label: 'Add TypeScript', 
      action: () => setInput('Add TypeScript types to this code') 
    },
  ];
  
  const formatContent = (content: string) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // Code block
        return (
          <pre key={index} className="bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto">
            <code className="text-sm">{part}</code>
          </pre>
        );
      }
      return part.split('\n').map((line, lineIndex) => (
        <p key={`${index}-${lineIndex}`} className="mb-1">{line}</p>
      ));
    });
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-900/50 border-l border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-gray-400">Powered by GPT-4</p>
          </div>
        </div>
      </div>
      
      {/* Quick Commands */}
      <div className="p-3 border-b border-gray-800">
        <div className="grid grid-cols-2 gap-2">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={cmd.action}
              className="flex items-center gap-2 p-2 text-xs bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {cmd.icon}
              <span className="truncate">{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500/10 ml-8' : 'bg-gray-800/50 mr-8'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1 rounded ${msg.role === 'user' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                {msg.role === 'user' ? (
                  <MessageSquare className="w-3 h-3" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </div>
              <span className="text-xs font-medium">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {formatContent(msg.content)}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="p-3 rounded-lg bg-gray-800/50 mr-8">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-purple-500/20">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI to modify code..."
            className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg disabled:opacity-50 transition-all"
            title="Send message"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Ask for code generation, improvements, or explanations
        </p>
      </div>
    </div>
  );
}
