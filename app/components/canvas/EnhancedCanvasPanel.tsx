'use client';

import { useEffect, useState, useRef } from 'react';
import { StackConfig } from './types';
import { SandpackProvider, SandpackPreview, SandpackCodeEditor, SandpackFileExplorer } from '@codesandbox/sandpack-react';
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
