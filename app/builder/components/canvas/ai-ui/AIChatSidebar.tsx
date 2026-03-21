import React, { useState, useRef, useEffect } from 'react';
import { useLocalAIStore } from '../state/local-ai-store';
import ModelDownloader from './ModelDownloader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChatSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showDownloader, setShowDownloader] = useState(false);
  const [provider, setProvider] = useState('auto'); // ✅ NEW

  const { currentModel, generate, isLoading } = useLocalAIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const result = await generate(input, provider); // ✅ pass provider

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat generation failed:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-sm text-gray-400">
          Model: {currentModel?.name || 'Not selected'}
        </p>

        <button
          onClick={() => setShowDownloader(true)}
          className="mt-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
        >
          Get AI Models
        </button>
      </div>

      {/* PROVIDER SELECTOR */}
      <div className="p-3 border-b border-gray-700">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm"
        >
          <option value="auto">Auto (Smart Router)</option>
          <option value="local">Local AI</option>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
          <option value="deepseek">DeepSeek</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </div>

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI something..."
            className="flex-1 px-3 py-2 bg-gray-800 rounded border border-gray-600 focus:border-blue-500"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* MODEL DOWNLOADER */}
      {showDownloader && (
        <ModelDownloader
          onClose={() => setShowDownloader(false)}
          onModelDownloaded={() => console.log('Model downloaded')}
        />
      )}
    </div>
  );
};
