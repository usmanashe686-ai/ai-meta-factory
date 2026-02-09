'use client';

import { useEffect, useState, useRef } from 'react';
import { StackConfig } from './types';
import { SandpackProvider, SandpackPreview as SPPreview, SandpackCodeEditor, SandpackFileExplorer } from '@codesandbox/sandpack-react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  Code, FileText, Folder, Search, Save, Download, Eye, EyeOff,
  Split, Maximize2, Minimize2, X, Plus, Settings, GitBranch,
  ChevronRight, ChevronDown, Trash2, Copy, Move, Type, Database,
  Zap, Layers, RefreshCw, Upload, Terminal, PanelLeft, PanelRight,
  Sparkles, Bot, Wand2, Brain, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

// Define interfaces
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
}

interface AIGenerationRequest {
  prompt: string;
  context: string;
  fileType: string;
}

interface EnhancedCanvasPanelProps {
  initialFiles: Record<string, string>;
  onFilesChange: (files: Record<string, string>) => void;
  stack: StackConfig;
  projectName: string;
  session: any;
}

export default function EnhancedCanvasPanel({
  initialFiles,
  onFilesChange,
  stack,
  projectName = 'AI-Meta-Factory Project',
  session
}: EnhancedCanvasPanelProps) {
  // State Management
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [activeFile, setActiveFile] = useState<string>('');
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [viewMode, setViewMode] = useState<'code' | 'split' | 'preview'>('split');
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('tsx');
  const [recentChanges, setRecentChanges] = useState<Array<{file: string, time: string}>>([]);
  const [editorLanguage, setEditorLanguage] = useState('typescript');

  const editorRef = useRef<any>(null);
  const aiTimerRef = useRef<NodeJS.Timeout>();

  // Initialize from props
  useEffect(() => {
    if (Object.keys(initialFiles).length > 0) {
      setFiles(initialFiles);
      const fileNames = Object.keys(initialFiles);
      const structure = buildFileStructure(fileNames);
      setFileStructure(structure);
      setActiveFile(fileNames[0] || '');
      setEditorLanguage(getLanguageFromFile(fileNames[0] || ''));
      
      // Initialize recent changes
      setRecentChanges([
        { file: fileNames[0] || '', time: 'Just now' },
        { file: 'Project initialized', time: '1 min ago' }
      ]);
    }
  }, [initialFiles]);

  // Sync changes with parent
  useEffect(() => {
    onFilesChange(files);
  }, [files, onFilesChange]);

  // AI Suggestions timer
  useEffect(() => {
    if (aiPrompt.length > 3 && !isGenerating) {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      aiTimerRef.current = setTimeout(() => {
        generateAiSuggestions(aiPrompt);
      }, 500);
    }

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [aiPrompt]);

  // Helper Functions
  const buildFileStructure = (filePaths: string[]): FileNode[] => {
    const structure: Record<string, any> = {};

    filePaths.forEach(path => {
      const parts = path.split('/');
      let current = structure;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1
            ? { name: part, type: 'file', path }
            : { name: part, type: 'folder', path: parts.slice(0, index + 1).join('/'), children: {} };
        }
        if (index < parts.length - 1) {
          current = current[part].children;
        }
      });
    });

    return Object.values(structure);
  };

  const getLanguageFromFile = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'js': 'javascript',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python'
    };
    return languageMap[ext] || 'plaintext';
  };

  const handleFileChange = (fileName: string, content: string) => {
    const updatedFiles = { ...files, [fileName]: content };
    setFiles(updatedFiles);
    
    // Track recent changes
    setRecentChanges(prev => [
      { file: fileName, time: 'Just now' },
      ...prev.slice(0, 4)
    ]);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      handleFileChange(activeFile, value);
    }
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;

    // Add custom commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSaveProject();
    });

    // Add AI suggestions provider
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        return {
          suggestions: [
            {
              label: 'AI Component',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `// AI-generated component\nfunction AIComponent() {\n  return (\n    <div>\n      {/* AI generated content */}\n    </div>\n  );\n}`,
              range: range
            }
          ]
        };
      }
    });
  };

  const handleSaveProject = async () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      const projectData = {
        name: projectName,
        files,
        stack,
        metadata: {
          savedAt: new Date().toISOString(),
          user: session?.user?.email || 'anonymous',
          fileCount: Object.keys(files).length
        }
      };

      console.log('Project saved:', projectData);

      // Create downloadable JSON
      const dataStr = JSON.stringify(projectData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      // Store in localStorage for persistence
      localStorage.setItem(`ai-meta-project-${projectName}`, dataStr);

      setIsSaving(false);
      // Show success toast
      console.log('✅ Project saved successfully');
    }, 800);
  };

  const handleExportProject = async () => {
    try {
      // Using JSZip for actual zip creation
      const projectData = {
        name: projectName,
        files,
        stack,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const dataStr = JSON.stringify(projectData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('📦 Project exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleAIGenerate = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // Simulate AI API call
      const response = await simulateAIGeneration(prompt, activeFile);

      if (response.success) {
        // Update the active file with AI-generated content
        handleFileChange(activeFile, response.content);

        // Add to recent changes
        setRecentChanges(prev => [
          { file: `AI: ${prompt.substring(0, 30)}...`, time: 'Just now' },
          ...prev
        ]);

        console.log('🤖 AI generation complete');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateAIGeneration = (prompt: string, contextFile: string): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const context = files[contextFile] || '';
        const aiResponse = generateAIContent(prompt, context);

        resolve({
          success: true,
          content: aiResponse,
          timestamp: new Date().toISOString(),
          model: 'gpt-4'
        });
      }, 1500);
    });
  };

  const generateAIContent = (prompt: string, context: string): string => {
    const baseComponent = `/**
 * AI-Generated Component
 * Created by AI Meta Factory
 * Prompt: "${prompt}"
 */

import React from 'react';

interface AIComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export default function AIComponent({ className = '', children }: AIComponentProps) {
  return (
    <div className={\`ai-generated-component \${className}\`}>
      <div className="ai-header">
        <h2 className="ai-title">AI Generated Component</h2>
        <div className="ai-badge">🤖 AI Powered</div>
      </div>

      <div className="ai-content">
        {children || (
          <>
            <p>This component was generated by AI based on your prompt:</p>
            <blockquote className="ai-quote">
              "${prompt}"
            </blockquote>
            <p>You can customize this component further using the editor.</p>
          </>
        )}
      </div>

      <style jsx>{\`
        .ai-generated-component {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .ai-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }

        .ai-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          backdrop-filter: blur(10px);
        }

        .ai-content {
          font-size: 1rem;
          line-height: 1.6;
        }

        .ai-quote {
          border-left: 4px solid rgba(255, 255, 255, 0.5);
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
      \`}</style>
    </div>
  );
}`;

    return context ? `${context}\n\n${baseComponent}` : baseComponent;
  };

  const generateAiSuggestions = (prompt: string) => {
    const suggestions = [
      `Create a responsive navbar component`,
      `Generate a user profile card with TypeScript`,
      `Build a modal component with animations`,
      `Create a data table with sorting and pagination`,
      `Generate a login form with validation`,
      `Build a dashboard layout with sidebar`,
      `Create a button component with multiple variants`,
      `Generate a card component with hover effects`
    ];

    // Filter suggestions based on prompt
    const filtered = suggestions
      .filter(s => s.toLowerCase().includes(prompt.toLowerCase()))
      .slice(0, 3);

    setAiSuggestions(filtered);
  };

  const addNewFile = () => {
    if (!newFileName.trim()) return;

    const fullPath = newFileName.includes('.')
      ? newFileName
      : `${newFileName}.${newFileType}`;
    const defaultContent = getDefaultContent(fullPath);
    const updatedFiles = { ...files, [fullPath]: defaultContent };

    setFiles(updatedFiles);
    setFileStructure(buildFileStructure(Object.keys(updatedFiles)));
    setActiveFile(fullPath);
    setEditorLanguage(getLanguageFromFile(fullPath));
    setShowCreateModal(false);
    setNewFileName('');
  };

  const getDefaultContent = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const componentName = fileName.split('/').pop()?.replace(/\.[^.]+$/, '') || 'Component';

    switch (ext) {
      case 'tsx':
      case 'jsx':
        return `import React from 'react';

export default function ${componentName}() {
  return (
    <div>
      <h2>${componentName}</h2>
      <p>Start editing this component.</p>
    </div>
  );
}`;
      case 'ts':
        return `// TypeScript file: ${fileName}
export function example(): string {
  return "Hello, TypeScript!";
}`;
      case 'css':
        return `/* Styles for ${fileName} */
.${componentName.toLowerCase()} {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}`;
      case 'json':
        return `{
  "name": "${componentName}",
  "version": "1.0.0"
}`;
      default:
        return `# ${componentName}\n\nEdit this file.`;
    }
  };

  const deleteFile = (fileName: string) => {
    if (Object.keys(files).length <= 1) {
      console.log('Cannot delete the last file');
      return;
    }

    const newFiles = { ...files };
    delete newFiles[fileName];

    setFiles(newFiles);
    setFileStructure(buildFileStructure(Object.keys(newFiles)));

    if (activeFile === fileName) {
      const remaining = Object.keys(newFiles);
      setActiveFile(remaining[0] || '');
    }
  };

  const duplicateFile = (fileName: string) => {
    const newName = `${fileName.replace(/\.[^.]+$/, '')}-copy${fileName.match(/\.[^.]+$/)?.[0] || ''}`;
    const updatedFiles = { ...files, [newName]: files[fileName] };

    setFiles(updatedFiles);
    setFileStructure(buildFileStructure(Object.keys(updatedFiles)));
    setActiveFile(newName);
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return (
      <div className="space-y-1">
        {nodes.map((node) => (
          <div key={node.path}>
            <div
              className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer ${
                activeFile === node.path ? 'bg-blue-50 border border-blue-200' : ''
              }`}
              style={{ paddingLeft: `${level * 20 + 12}px` }}
              onClick={() => {
                if (node.type === 'file') {
                  setActiveFile(node.path);
                  setEditorLanguage(getLanguageFromFile(node.path));
                }
              }}
            >
              {node.type === 'folder' ? (
                <Folder className="w-4 h-4 text-yellow-500" />
              ) : (
                <FileText className="w-4 h-4 text-blue-500" />
              )}
              <span className="text-sm truncate">{node.name}</span>
              {node.type === 'file' && (
                <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateFile(node.path);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(node.path);
                    }}
                    className="p-1 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              )}
            </div>
            {node.type === 'folder' && node.children && (
              <div className="ml-4">
                {renderFileTree(node.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPreview = () => {
    if (!activeFile || !files[activeFile]) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a file to preview</p>
          </div>
        </div>
      );
    }

    if (viewMode === 'code') {
      return (
        <Editor
          height="100%"
          language={editorLanguage}
          value={files[activeFile]}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            contextmenu: true
          }}
        />
      );
    } else if (viewMode === 'split') {
      return (
        <div className="flex h-full">
          <div className="flex-1 border-r border-gray-700">
            <Editor
              height="100%"
              language={editorLanguage}
              value={files[activeFile]}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: 'on'
              }}
            />
          </div>
          <div className="flex-1">
            <SandpackPreviewComponent />
          </div>
        </div>
      );
    } else {
      return <SandpackPreviewComponent />;
    }
  };

  // Fixed Sandpack Preview Component
  const SandpackPreviewComponent = () => (
    <div className="h-full">
      <SandpackProvider
        template="react-ts"
        files={files}
        activeFile={activeFile}
        theme="dark"
      >
        <SPPreview
          showRefreshButton={true}
          showOpenInCodeSandbox={false}
          className="h-full"
        />
      </SandpackProvider>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-900 text-gray-100 rounded-xl overflow-hidden border border-gray-800">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded">
              <Code className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">{projectName}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-gray-700 rounded">{stack.frontend}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="px-2 py-1 bg-gray-700 rounded">{stack.database}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="px-2 py-1 bg-gray-700 rounded">{stack.gitProvider}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                viewMode === 'code' ? 'bg-gray-600' : 'hover:bg-gray-600'
              }`}
            >
              <Type className="w-3 h-3" />
              Code
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                viewMode === 'split' ? 'bg-gray-600' : 'hover:bg-gray-600'
              }`}
            >
              <Split className="w-3 h-3" />
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                viewMode === 'preview' ? 'bg-gray-600' : 'hover:bg-gray-600'
              }`}
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
          </div>

          <button
            onClick={() => setExplorerOpen(!explorerOpen)}
            className="p-1.5 hover:bg-gray-700 rounded"
            title={explorerOpen ? 'Hide explorer' : 'Show explorer'}
          >
            {explorerOpen ? <PanelLeft className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        {explorerOpen && (
          <div className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">EXPLORER</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1 hover:bg-gray-800 rounded"
                    title="New File"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => console.log('Refresh')}
                    className="p-1 hover:bg-gray-800 rounded"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {fileStructure.length > 0 ? (
                renderFileTree(fileStructure)
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No files yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Create your first file
                  </button>
                </div>
              )}
            </div>

            {/* AI Assistant Panel */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-semibold">AI Assistant</h4>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to build..."
                  className="w-full pl-3 pr-8 py-2 bg-gray-800 border border-gray-700 rounded text-sm placeholder-gray-500"
                />
                <button
                  onClick={() => handleAIGenerate(aiPrompt)}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                    isGenerating ? 'text-gray-500' : 'text-purple-400 hover:text-purple-300'
                  }`}
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setAiPrompt(suggestion);
                        handleAIGenerate(suggestion);
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2"
                    >
                      <Wand2 className="w-3 h-3 text-purple-400" />
                      <span className="truncate">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs Bar */}
          <div className="flex items-center bg-gray-800 border-b border-gray-700 overflow-x-auto">
            {Object.keys(files).map((fileName) => (
              <div
                key={fileName}
                className={`flex items-center gap-2 px-4 py-2 border-r border-gray-700 cursor-pointer min-w-fit ${
                  activeFile === fileName ? 'bg-gray-900' : 'hover:bg-gray-800'
                }`}
                onClick={() => {
                  setActiveFile(fileName);
                  setEditorLanguage(getLanguageFromFile(fileName));
                }}
              >
                <FileText className="w-3 h-3" />
                <span className="text-sm truncate max-w-[120px]">
                  {fileName.split('/').pop()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(fileName);
                  }}
                  className="p-0.5 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <div className="flex-1 border-r border-gray-700"></div>

            <div className="flex items-center px-3 gap-2">
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                  isSaving ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Save className="w-3 h-3" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>

              <button
                onClick={handleExportProject}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>

          {/* Editor/Preview Area */}
          <div className="flex-1 overflow-hidden">
            {renderPreview()}
          </div>

          {/* Status Bar */}
          <div className="px-4 py-1.5 bg-gray-800 border-t border-gray-700 text-xs flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                <span>main</span>
              </div>

              {activeFile && (
                <>
                  <div className="text-gray-400">
                    {editorLanguage.toUpperCase()}
                  </div>
                  <div className="text-gray-400">
                    {files[activeFile]?.split('\n').length || 0} lines
                  </div>
                  <div className="text-gray-400">
                    {files[activeFile]?.length || 0} chars
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-gray-400">
                {Object.keys(files).length} files • {session ? `👤 ${session.user?.name}` : '🔒 Not signed in'}
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-3 h-3" />
                <span>Auto-save enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create File Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Create New File</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g., src/components/Button.tsx"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">File Type</label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                >
                  <option value="tsx">TypeScript React (.tsx)</option>
                  <option value="ts">TypeScript (.ts)</option>
                  <option value="jsx">JavaScript React (.jsx)</option>
                  <option value="js">JavaScript (.js)</option>
                  <option value="css">CSS (.css)</option>
                  <option value="scss">SCSS (.scss)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="md">Markdown (.md)</option>
                  <option value="html">HTML (.html)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addNewFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                disabled={!newFileName.trim()}
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
