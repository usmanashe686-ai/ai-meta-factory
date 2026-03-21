'use client';

import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Send, Bot, User, Sparkles, Copy, Check, Trash2, FileText } from 'lucide-react';
import { useProjectStore } from '../state/project-store';
import { usePlatformStore } from '../state/platform-store';
import { useDocsStore } from '../state/docs-store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ModelInfo {
  id: string;
  name: string;
  size: string;
}

export const AIChatSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your local AI assistant. I can help you generate components, fix bugs, and follow project docs.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [includeDocs, setIncludeDocs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { docs, selectedDocId, loadDocs } = useDocsStore();

  const AI_API_URL = API_BASE_URL;

  useEffect(() => {
    fetch(`${AI_API_URL}/models`)
      .then(res => res.json())
      .then(data => {
        setAvailableModels(data);
        if (data.length > 0) setSelectedModel(data[0]);
      })
      .catch(err => console.error('Failed to fetch models:', err));
    loadDocs();
  }, [AI_API_URL, loadDocs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating || !selectedModel) return;

    let contextPrompt = '';
    if (includeDocs && docs.length > 0) {
      const selectedDoc = docs.find(d => d.id === selectedDocId) || docs[0];
      contextPrompt = `Project Documents:\nTitle: ${selectedDoc.title}\nContent:\n${selectedDoc.content}\n\n`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      const fullPrompt = contextPrompt + `User: ${input}\n\nAssistant:`;
      const response = await fetch(`${AI_API_URL}/generate-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: selectedModel.id,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                accumulatedContent += data.token;
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
                ));
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Connection Error to Local AI.', timestamp: new Date() }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f]">
      {/* Mini Model Picker */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between gap-2">
        <select 
          value={selectedModel?.id}
          onChange={(e) => setSelectedModel(availableModels.find(m => m.id === e.target.value) || null)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-zinc-300"
        >
          {availableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button onClick={() => setMessages([])} className="p-2 text-zinc-500 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isGenerating && <div className="text-xs text-zinc-500 animate-pulse">AI is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-zinc-800 bg-[#141414]">
        <div className="flex items-center gap-2 mb-2">
           <input type="checkbox" checked={includeDocs} onChange={(e) => setIncludeDocs(e.target.checked)} className="rounded bg-zinc-800" />
           <span className="text-[10px] text-zinc-500">Include Docs</span>
        </div>
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
            placeholder="Ask anything..."
          />
          <button type="submit" className="absolute right-2 bottom-2 p-2 bg-blue-600 rounded-lg">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
