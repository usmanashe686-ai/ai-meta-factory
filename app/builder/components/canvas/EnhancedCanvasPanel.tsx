"use client";

import { useState, useEffect } from 'react';
import { ProjectExporter } from '@/lib/export/project-exporter';
import { GitHubService } from '@/lib/github/github-service';
import EnhancedFileTree from './EnhancedFileTree';
import AIDiffTool from './AIDiffTool';
import { 
  Layout, Package, Zap, Download, RefreshCw, 
  FileText, FileCode, Folder, GitBranch, Cloud,
  Upload, Check, AlertCircle, Settings, Play, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EnhancedCanvasPanelProps {
  baseFiles: Record<string, string>;
  generatedFiles: Record<string, string>;
  projectName?: string;
  stack?: string;
  database?: string;
  gitProvider?: string;
  onGenerateComponents: () => void;
  onFileChange: (fileName: string, content: string) => void;
  onExportZip: () => void;
}

export default function EnhancedCanvasPanel({
  baseFiles = {},
  generatedFiles = {},
  projectName = 'ai-meta-project',
  stack = 'nextjs',
  database = 'supabase',
  gitProvider = 'github',
  onGenerateComponents,
  onFileChange,
  onExportZip
}: EnhancedCanvasPanelProps) {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [gitHubToken, setGitHubToken] = useState<string>('');
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [showAIDiff, setShowAIDiff] = useState(false);
  const [originalFiles, setOriginalFiles] = useState<Record<string, string>>({});
  const [fileHistory, setFileHistory] = useState<Array<Record<string, string>>>([]);

  // Initialize with generated files
  useEffect(() => {
    if (Object.keys(generatedFiles).length > 0) {
      setOriginalFiles(generatedFiles);
      setFileHistory([generatedFiles]);
    }
  }, [generatedFiles]);

  const allFiles = { ...baseFiles, ...generatedFiles };
  const fileCount = Object.keys(allFiles).length;
  const totalLines = Object.values(allFiles)
    .reduce((sum, content) => sum + content.split('\n').length, 0);

  // Enhanced export with ZIP
  const handleEnhancedExport = async () => {
    setIsExporting(true);
    
    try {
      const exportConfig = {
        projectName,
        stack,
        database,
        gitProvider,
        files: allFiles
      };
      
      const success = await ProjectExporter.exportAsZip(exportConfig);
      
      if (success) {
        toast.success('Project exported successfully as ZIP!', {
          duration: 4000,
          position: 'top-right'
        });
      } else {
        toast.error('Export failed. Please try again.', {
          duration: 4000,
          position: 'top-right'
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.', {
        duration: 4000,
        position: 'top-right'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // GitHub push
  const handleGitHubPush = async () => {
    if (!gitHubToken) {
      toast.error('Please connect GitHub first', {
        duration: 4000,
        position: 'top-right'
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const githubService = new GitHubService({
        accessToken: gitHubToken,
        owner: 'your-username', // In production, get from OAuth
        repo: projectName
      });
      
      const result = await githubService.pushFiles(allFiles);
      
      if (result.success) {
        toast.success('Successfully pushed to GitHub!', {
          duration: 4000,
          position: 'top-right',
          icon: '🚀'
        });
      } else {
        toast.error(`GitHub push failed: ${result.error}`, {
          duration: 4000,
          position: 'top-right'
        });
      }
    } catch (error) {
      console.error('GitHub push error:', error);
      toast.error('Failed to push to GitHub', {
        duration: 4000,
        position: 'top-right'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // GitHub OAuth connect (simulated)
  const connectGitHub = () => {
    setIsExporting(true);
    
    // Simulate OAuth flow
    setTimeout(() => {
      setGitHubToken('simulated-token-' + Math.random().toString(36).substr(2));
      setIsGitHubConnected(true);
      setIsExporting(false);
      
      toast.success('GitHub connected successfully!', {
        duration: 4000,
        position: 'top-right',
        icon: '🔗'
      });
    }, 2000);
  };

  // Handle file operations
  const handleFileDelete = (filePath: string) => {
    const newFiles = { ...allFiles };
    delete newFiles[filePath];
    onFileChange(filePath, '');
    
    if (activeFile === filePath) {
      setActiveFile(null);
    }
    
    toast.success(`Deleted ${filePath}`, {
      duration: 3000,
      position: 'top-right'
    });
  };

  const handleFileCreate = (filePath: string, isFolder: boolean) => {
    const newPath = isFolder ? `${filePath}/` : filePath;
    const newContent = isFolder ? '' : `// New ${filePath.split('.').pop()?.toUpperCase()} file\n// Created at ${new Date().toISOString()}\n\nexport default function NewComponent() {\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}\n`;
    
    onFileChange(newPath, newContent);
    
    if (!isFolder) {
      setActiveFile(newPath);
    }
    
    toast.success(`Created ${isFolder ? 'folder' : 'file'}: ${filePath}`, {
      duration: 3000,
      position: 'top-right'
    });
  };

  const handleFileRename = (oldPath: string, newPath: string) => {
    const content = allFiles[oldPath];
    const newFiles = { ...allFiles };
    delete newFiles[oldPath];
    newFiles[newPath] = content;
    
    onFileChange(newPath, content);
    
    if (activeFile === oldPath) {
      setActiveFile(newPath);
    }
    
    toast.success(`Renamed ${oldPath} to ${newPath}`, {
      duration: 3000,
      position: 'top-right'
    });
  };

  // AI regeneration
  const handleAIRegenerate = async (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const improvedCode = `// AI-Regenerated: ${activeFile}
// Generated at ${new Date().toISOString()}
// AI improvements applied

${allFiles[activeFile!]?.replace(/\/\/ TODO:.*\n/g, '')}`;
        resolve(improvedCode);
      }, 1500);
    });
  };

  const handleAIImprovement = async (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const improvedCode = `// AI-Improved: ${activeFile}
// Generated at ${new Date().toISOString()}
// Optimized for performance and readability

import React from 'react';

interface Props {
  // Props interface
}

export default function ImprovedComponent({}: Props) {
  // AI-suggested improvements
  return (
    <div className="p-4 bg-gradient-to-br from-gray-900 to-black text-white rounded-lg">
      <h2 className="text-xl font-bold mb-3">AI-Optimized Component</h2>
      <p className="text-gray-300">
        This component has been optimized by AI for better performance and maintainability.
      </p>
    </div>
  );
}`;
        resolve(improvedCode);
      }, 2000);
    });
  };

  const handleAcceptAIImprovement = (newCode: string) => {
    if (activeFile) {
      onFileChange(activeFile, newCode);
      setShowAIDiff(false);
      
      toast.success('AI improvements applied!', {
        duration: 3000,
        position: 'top-right',
        icon: '🤖'
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Enhanced Canvas</h2>
              <p className="text-xs text-gray-400">
                Drag & Drop • AI Diff • GitHub • Export
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="px-3 py-1 bg-gray-800 rounded-full text-gray-300">
              <span className="font-medium">{fileCount}</span> files
            </div>
            <div className="px-3 py-1 bg-gray-800 rounded-full text-gray-300">
              <span className="font-medium">{totalLines}</span> lines
            </div>
            <div className="px-3 py-1 bg-blue-900/30 rounded-full text-blue-400">
              <span className="font-medium">{stack}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isGitHubConnected ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-800 rounded-lg">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">GitHub Connected</span>
            </div>
          ) : (
            <button
              onClick={connectGitHub}
              disabled={isExporting}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4" />
                  Connect GitHub
                </>
              )}
            </button>
          )}
          
          <button
            onClick={onGenerateComponents}
            disabled={isGenerating}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Components
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Enhanced File Tree */}
        <div className="w-80 border-r border-gray-800">
          <EnhancedFileTree
            files={allFiles}
            selectedFile={activeFile}
            onFileSelect={setActiveFile}
            onFilesChange={(files) => {
              // Handle bulk file changes if needed
            }}
            onFileContentChange={onFileChange}
            onFileDelete={handleFileDelete}
            onFileCreate={handleFileCreate}
            onFileRename={handleFileRename}
          />
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-800 p-3 bg-gray-900">
            {activeFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-mono text-white">{activeFile}</span>
                  <button
                    onClick={() => setShowAIDiff(!showAIDiff)}
                    className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                  >
                    {showAIDiff ? 'Hide AI Diff' : 'Show AI Diff'}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{allFiles[activeFile]?.split('\n').length || 0} lines</span>
                  <span>•</span>
                  <span>{allFiles[activeFile]?.length || 0} chars</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                Select a file to edit
              </div>
            )}
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 p-4 bg-gray-950 overflow-auto">
            {activeFile ? (
              <textarea
                value={allFiles[activeFile] || ''}
                onChange={(e) => onFileChange(activeFile, e.target.value)}
                className="w-full h-full font-mono text-sm bg-transparent text-gray-200 resize-none focus:outline-none"
                spellCheck="false"
                placeholder="Start editing..."
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No File Selected</h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                    Select a file from the tree or generate new components to start editing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Tools & Export */}
        <div className="w-64 border-l border-gray-800 bg-gray-900 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Export Tools
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleEnhancedExport}
                  disabled={fileCount === 0 || isExporting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Download ZIP Project
                </button>
                
                <button
                  onClick={handleGitHubPush}
                  disabled={!isGitHubConnected || fileCount === 0 || isExporting}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Push to GitHub
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Project Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-gray-400">Stack</div>
                  <div className="text-white font-medium">{stack}</div>
                </div>
                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-gray-400">Database</div>
                  <div className="text-white font-medium">{database}</div>
                </div>
                <div className="p-3 bg-gray-800 rounded">
                  <div className="text-gray-400">Files</div>
                  <div className="text-white font-medium">{fileCount} files, {totalLines} lines</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const fileName = prompt('New file name (e.g., component.tsx):');
                    if (fileName) handleFileCreate(fileName, false);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded flex items-center gap-2 hover:bg-gray-700"
                >
                  <FileCode className="w-4 h-4" />
                  New File
                </button>
                <button
                  onClick={() => {
                    const folderName = prompt('New folder name:');
                    if (folderName) handleFileCreate(folderName, true);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded flex items-center gap-2 hover:bg-gray-700"
                >
                  <Folder className="w-4 h-4" />
                  New Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Diff Panel */}
      {showAIDiff && activeFile && allFiles[activeFile] && originalFiles[activeFile] && (
        <AIDiffTool
          originalCode={originalFiles[activeFile]}
          currentCode={allFiles[activeFile]}
          fileName={activeFile}
          onAccept={handleAcceptAIImprovement}
          onReject={() => setShowAIDiff(false)}
          onGenerateImprovement={handleAIImprovement}
          onRegenerate={handleAIRegenerate}
        />
      )}

      {/* Enhanced Footer */}
      <div className="border-t border-gray-800 bg-gray-900 p-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${fileCount > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>{fileCount > 0 ? 'Ready for Export' : 'No Files'}</span>
            </div>
            <span>•</span>
            <span>UTF-8 • LF</span>
            <span>•</span>
            <span>Powered by AI Meta Factory</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // Show history
                toast('File history feature coming soon!', {
                  icon: '🕒',
                  duration: 3000
                });
              }}
              className="text-gray-400 hover:text-white"
            >
              History
            </button>
            <button
              onClick={() => {
                // Show version info
                toast('Version 1.0.0 • AI Enhanced', {
                  icon: '🤖',
                  duration: 3000
                });
              }}
              className="text-gray-400 hover:text-white"
            >
              v1.0.0
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
