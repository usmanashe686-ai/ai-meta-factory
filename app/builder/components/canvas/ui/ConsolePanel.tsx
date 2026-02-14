"use client";

import { useState, useRef, useEffect } from 'react';
import { Terminal, X, Copy, Trash2, Play, AlertCircle, CheckCircle, Bot, Command, Filter } from 'lucide-react';
import { useProjectStore } from '../state/project-store';

export function ConsolePanel() {
  const {
    consoleOutput,
    clearConsole,
    consoleHistory,
    addToConsoleHistory,
    isConsoleRunning,
    setConsoleRunning
  } = useProjectStore();

  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'error' | 'success' | 'ai' | 'command'>('all');
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [consoleOutput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add to console history
    addToConsoleHistory(input);

    // Add command to console output (timestamp added by store)
    useProjectStore.getState().addToConsole({
      type: 'command',
      message: `> ${input}`,
    });

    // Simulate command execution
    setConsoleRunning(true);

    setTimeout(() => {
      // Simulate different responses based on input
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('error')) {
        useProjectStore.getState().addToConsole({
          type: 'error',
          message: 'Command failed: This is a simulated error.',
        });
      } else if (lowerInput.includes('build') || lowerInput.includes('start')) {
        useProjectStore.getState().addToConsole({
          type: 'success',
          message: 'Build completed successfully!',
        });
      } else if (lowerInput.includes('ai')) {
        useProjectStore.getState().addToConsole({
          type: 'ai',
          message: 'AI agent activated: Processing your request...',
        });
      } else {
        useProjectStore.getState().addToConsole({
          type: 'log',
          message: `Executed: ${input}`,
        });
      }

      setConsoleRunning(false);
    }, 1000);

    setInput('');
  };

  const handleClear = () => {
    clearConsole();
  };

  const handleCopy = () => {
    const text = consoleOutput.map((entry: any) => `[${entry.type.toUpperCase()}] ${entry.message}`).join('\n');
    navigator.clipboard.writeText(text);

    // Add success message (timestamp added by store)
    useProjectStore.getState().addToConsole({
      type: 'success',
      message: 'Console output copied to clipboard!',
    });
  };

  const handleRunCommand = (command: string) => {
    setInput(command);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'ai':
        return <Bot className="w-3 h-3 text-purple-400" />;
      case 'command':
        return <Command className="w-3 h-3 text-blue-400" />;
      default:
        return <Terminal className="w-3 h-3 text-gray-400" />;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'ai':
        return 'text-purple-400';
      case 'command':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  const filteredOutput = filter === 'all'
    ? consoleOutput
    : consoleOutput.filter((entry: any) => entry.type === filter);

  const commonCommands = [
    'npm install',
    'npm run dev',
    'npm run build',
    'npm test',
    'git status',
    'git add .',
    'git commit -m "Update"'
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Console Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold">Console</h3>
          <div className="flex items-center gap-2 ml-4">
            <div className={`w-2 h-2 rounded-full ${isConsoleRunning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-xs text-gray-400">
              {isConsoleRunning ? 'Running...' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs ${filter === 'all' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            >
              All ({consoleOutput.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-3 py-1 text-xs flex items-center gap-1 ${filter === 'error' ? 'bg-red-500/20' : 'hover:bg-gray-800'}`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>({consoleOutput.filter((e: any) => e.type === 'error').length})</span>
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-3 py-1 text-xs flex items-center gap-1 ${filter === 'success' ? 'bg-green-500/20' : 'hover:bg-gray-800'}`}
            >
              <CheckCircle className="w-3 h-3" />
              <span>({consoleOutput.filter((e: any) => e.type === 'success').length})</span>
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`px-3 py-1 text-xs flex items-center gap-1 ${filter === 'ai' ? 'bg-purple-500/20' : 'hover:bg-gray-800'}`}
            >
              <Bot className="w-3 h-3" />
              <span>({consoleOutput.filter((e: any) => e.type === 'ai').length})</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-800 rounded"
            title="Copy console output"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 hover:bg-gray-800 rounded"
            title="Clear console"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Console Output */}
      <div className="flex-1 overflow-y-auto font-mono text-sm">
        <div className="p-4 space-y-2">
          {filteredOutput.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No console output yet. Run a command to see output here.
            </div>
          ) : (
            filteredOutput.map((entry: any, index: number) => (
              <div key={index} className="flex gap-3 hover:bg-gray-800/50 p-2 rounded">
                <div className="flex-shrink-0 w-4 mt-1">
                  {getEntryIcon(entry.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className={`${getEntryColor(entry.type)}`}>
                      {entry.message}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>

      {/* Quick Commands */}
      <div className="px-4 py-2 border-t border-gray-800">
        <div className="text-xs text-gray-400 mb-2">Quick Commands</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleRunCommand(cmd)}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-full flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Console Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Terminal className="w-4 h-4 text-green-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              disabled={isConsoleRunning}
            />
          </div>
          <button
            type="submit"
            disabled={isConsoleRunning || !input.trim()}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center gap-2"
          >
            {isConsoleRunning ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run
          </button>
        </div>

        {consoleHistory.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-400 mb-1">History (↑↓ to navigate)</div>
            <div className="text-xs text-gray-500 space-y-1">
              {consoleHistory.slice(-5).map((cmd, index) => (
                <div key={index} className="hover:text-gray-300 cursor-pointer" onClick={() => setInput(cmd)}>
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
