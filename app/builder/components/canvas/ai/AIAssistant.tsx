"use client";

import { useState } from 'react';
import { Send, Sparkles, Wand2, Bug, Zap, Brain, Terminal } from 'lucide-react';
import { useProjectStore, consoleAPI } from '../state/project-store';

export function AIAssistant() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage = input;
    setInput('');
    setIsProcessing(true);
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Log AI request to console
    consoleAPI.ai(`User request: ${userMessage}`);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = 'I\'m your AI assistant. I can help you generate code, fix bugs, and improve your project.';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse 
      }]);
      
      // Log AI response to console
      consoleAPI.ai(`AI response: ${aiResponse}`);
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      consoleAPI.error('AI Assistant encountered an error. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const quickCommands = [
    { 
      icon: <Wand2 className="w-4 h-4" />, 
      label: 'Improve this code', 
      action: 'improve',
      description: 'Optimize and improve current file'
    },
    { 
      icon: <Bug className="w-4 h-4" />, 
      label: 'Find and fix bugs', 
      action: 'debug',
      description: 'Analyze code for bugs'
    },
    { 
      icon: <Zap className="w-4 h-4" />, 
      label: 'Make responsive', 
      action: 'responsive',
      description: 'Add responsive design'
    },
    { 
      icon: <Brain className="w-4 h-4" />, 
      label: 'Add TypeScript', 
      action: 'typescript',
      description: 'Convert to TypeScript'
    },
  ];
  
  const handleQuickCommand = (action: string) => {
    consoleAPI.ai(`Executing AI command: ${action}`);
    consoleAPI.info('AI is processing your request...');
    
    // Simulate AI working
    setTimeout(() => {
      consoleAPI.success('AI completed the task successfully!');
    }, 2000);
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-900/50 border-l border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-gray-400">Powered by GPT-4</p>
          </div>
          <button
            onClick={() => consoleAPI.ai('Test AI message from console')}
            className="ml-auto p-1.5 hover:bg-gray-800 rounded"
            title="Test Console Integration"
          >
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-3 border-b border-gray-800">
        <div className="grid grid-cols-2 gap-2">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickCommand(cmd.action)}
              className="flex flex-col p-2 text-xs bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {cmd.icon}
                <span className="truncate">{cmd.label}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 truncate">{cmd.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500/10 ml-4' : 'bg-gray-800/50 mr-4'}`}
          >
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
      </div>
      
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
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg disabled:opacity-50"
          >
            {isProcessing ? '...' : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
