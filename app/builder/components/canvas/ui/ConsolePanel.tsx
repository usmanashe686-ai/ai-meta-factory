"use client";

import { useState, useRef, useEffect } from 'react';
import { Terminal, X, Play, Square, Trash2, Download, Copy, Filter } from 'lucide-react';
import { useProjectStore, consoleAPI } from '../state/project-store';

export function ConsolePanel() {
  const { 
    consoleOutput, 
    clearConsole, 
    consoleHistory,
    addToConsoleHistory,
    isConsoleRunning,
    setConsoleRunning
  } = useProjectStore();
  
  const [command, setCommand] = useState('');
  const [filter, setFilter] = useState<'all' | 'error' | 'success' | 'ai' | 'build'>('all');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages come in
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutput]);

  // Focus input when console is opened
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // Execute command
    executeCommand(command);
    setCommand('');
    setHistoryIndex(-1);
  };

  const executeCommand = (cmd: string) => {
    // Add to history
    addToConsoleHistory(cmd);
    
    // Show command in console
    consoleAPI.command(cmd);
    
    // Execute different commands
    const parts = cmd.toLowerCase().split(' ');
    const mainCmd = parts[0];
    
    switch (mainCmd) {
      case 'clear':
        clearConsole();
        break;
        
      case 'help':
        consoleAPI.info('Available commands:');
        consoleAPI.info('  clear          - Clear console');
        consoleAPI.info('  build          - Start build process');
        consoleAPI.info('  install        - Install dependencies');
        consoleAPI.info('  run dev        - Start development server');
        consoleAPI.info('  ls             - List files');
        consoleAPI.info('  status         - Check system status');
        break;
        
      case 'build':
        simulateBuild();
        break;
        
      case 'install':
        simulateInstall();
        break;
        
      case 'run':
        if (parts[1] === 'dev') {
          simulateDevServer();
        }
        break;
        
      case 'ls':
        listFiles();
        break;
        
      case 'status':
        consoleAPI.success('System: ✓ Running');
        consoleAPI.success('AI Assistant: ✓ Connected');
        consoleAPI.success('Preview: ✓ Live');
        break;
        
      default:
        consoleAPI.error(`Command not found: ${cmd}. Type 'help' for available commands.`);
    }
  };

  const simulateBuild = () => {
    setConsoleRunning(true);
    consoleAPI.build('Starting build process...');
    
    setTimeout(() => {
      consoleAPI.build('Installing dependencies...');
    }, 500);
    
    setTimeout(() => {
      consoleAPI.build('Compiling TypeScript...');
    }, 1500);
    
    setTimeout(() => {
      consoleAPI.build('Bundling assets...');
    }, 2500);
    
    setTimeout(() => {
      consoleAPI.success('Build completed successfully!');
      setConsoleRunning(false);
    }, 3500);
  };

  const simulateInstall = () => {
    setConsoleRunning(true);
    consoleAPI.build('Installing dependencies...');
    
    const packages = ['react', 'react-dom', 'typescript', 'tailwindcss', 'lucide-react'];
    
    packages.forEach((pkg, i) => {
      setTimeout(() => {
        consoleAPI.build(`Installed ${pkg}@latest`);
      }, i * 300);
    });
    
    setTimeout(() => {
      consoleAPI.success('All dependencies installed!');
      setConsoleRunning(false);
    }, packages.length * 300 + 500);
  };

  const simulateDevServer = () => {
    setConsoleRunning(true);
    consoleAPI.preview('Starting development server...');
    
    setTimeout(() => {
      consoleAPI.preview('Compiled successfully!');
    }, 1000);
    
    setTimeout(() => {
      consoleAPI.success('Ready on http://localhost:3000');
      setConsoleRunning(false);
    }, 2000);
  };

  const listFiles = () => {
    const { files } = useProjectStore.getState();
    consoleAPI.info('Project files:');
    Object.keys(files).forEach((path) => {
      if (!path.includes('.folder-marker')) {
        consoleAPI.log(`  ${path}`);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (consoleHistory.length > 0) {
        const newIndex = historyIndex < consoleHistory.length - 1 ? historyIndex + 1 : 0;
        setHistoryIndex(newIndex);
        setCommand(consoleHistory[consoleHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(consoleHistory[consoleHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const filteredOutput = filter === 'all' 
    ? consoleOutput 
    : consoleOutput.filter(entry => entry.type === filter);

  const copyConsole = () => {
    const text = consoleOutput.map(entry => `[${entry.type.toUpperCase()}] ${entry.message}`).join('\n');
    navigator.clipboard.writeText(text);
    consoleAPI.success('Console copied to clipboard');
  };

  const exportConsole = () => {
    const text = consoleOutput.map(entry => 
      `${new Date(entry.timestamp).toISOString()} [${entry.type.toUpperCase()}] ${entry.message}`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console_${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
    
    consoleAPI.success('Console exported');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-t border-gray-800">
      {/* Console Header */}
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-medium">Console</span>
          </div>
          
          {/* Status Indicator */}
          <div className={`w-2 h-2 rounded-full ${isConsoleRunning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          
          {/* Filter Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            >
              All ({consoleOutput.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${filter === 'error' ? 'bg-red-500/20 text-red-400' : 'hover:bg-gray-800/50 text-gray-400'}`}
            >
              <span>Errors</span>
              <span>({consoleOutput.filter(e => e.type === 'error').length})</span>
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${filter === 'success' ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-800/50 text-gray-400'}`}
            >
              Success ({consoleOutput.filter(e => e.type === 'success').length})
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${filter === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-gray-800/50 text-gray-400'}`}
            >
              AI ({consoleOutput.filter(e => e.type === 'ai').length})
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={executeCommand.bind(null, 'build')}
            disabled={isConsoleRunning}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1 disabled:opacity-50"
            title="Run Build"
          >
            <Play className="w-3 h-3" />
            Build
          </button>
          
          <button
            onClick={executeCommand.bind(null, 'run dev')}
            disabled={isConsoleRunning}
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded flex items-center gap-1 disabled:opacity-50"
            title="Start Dev Server"
          >
            <Play className="w-3 h-3" />
            Run Dev
          </button>
          
          <button
            onClick={copyConsole}
            className="p-1.5 hover:bg-gray-800 rounded"
            title="Copy Console"
          >
            <Copy className="w-3 h-3" />
          </button>
          
          <button
            onClick={exportConsole}
            className="p-1.5 hover:bg-gray-800 rounded"
            title="Export Console"
          >
            <Download className="w-3 h-3" />
          </button>
          
          <button
            onClick={clearConsole}
            className="p-1.5 hover:bg-gray-800 rounded"
            title="Clear Console"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          
          <button className="p-1.5 hover:bg-gray-800 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Console Output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
        {filteredOutput.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No console output. Try running a command.
          </div>
        ) : (
          filteredOutput.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-start gap-2 py-1 px-2 rounded hover:bg-gray-800/30 ${
                entry.type === 'error' ? 'text-red-400' :
                entry.type === 'success' ? 'text-green-400' :
                entry.type === 'warning' ? 'text-yellow-400' :
                entry.type === 'info' ? 'text-blue-400' :
                entry.type === 'ai' ? 'text-purple-400' :
                entry.type === 'command' ? 'text-cyan-400' :
                'text-gray-300'
              }`}
            >
              <span className="text-gray-500 text-xs min-w-[100px]">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              
              {entry.source && (
                <span className="px-1.5 py-0.5 text-[10px] bg-gray-800 rounded uppercase min-w-[60px] text-center">
                  {entry.source}
                </span>
              )}
              
              <span className="flex-1">{entry.message}</span>
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>
      
      {/* Command Input */}
      <div className="px-4 py-3 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="text-green-400 font-bold">$</div>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (try 'help' for options)..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-300 placeholder-gray-600"
            disabled={isConsoleRunning}
          />
          <button
            type="submit"
            disabled={!command.trim() || isConsoleRunning}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs disabled:opacity-50"
          >
            {isConsoleRunning ? 'Running...' : 'Run'}
          </button>
        </form>
        
        {/* Quick Commands */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">Quick:</span>
          {['help', 'clear', 'build', 'run dev', 'status'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setCommand(cmd);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
