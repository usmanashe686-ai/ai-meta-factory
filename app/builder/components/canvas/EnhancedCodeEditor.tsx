"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChevronRight, ChevronDown, File, FileCode, FileText, FileJson, 
  FileImage, Database, Settings, Package, Layout, Folder, FolderOpen,
  AlertCircle, CheckCircle, Lightbulb, Sparkles, Wand2, Brain,
  Copy, Download, Upload, GitBranch, Zap, Eye, EyeOff
} from 'lucide-react';
import SimpleCodeEditor from 'react-simple-code-editor';

interface EnhancedCodeEditorProps {
  files: Record<string, string>;
  onFileChange: (fileName: string, content: string) => void;
  activeFile?: string | null;
  onActiveFileChange?: (fileName: string | null) => void;
  aiSuggestions?: any[];
}

interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  line: number;
  message: string;
  code?: string;
}

export const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({
  files,
  onFileChange,
  activeFile,
  onActiveFileChange,
  aiSuggestions = []
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(activeFile || null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components', 'lib']));
  const [editorContent, setEditorContent] = useState<string>('');
  const [codeIssues, setCodeIssues] = useState<CodeIssue[]>([]);
  const [showIssues, setShowIssues] = useState(true);
  const [showDiff, setShowDiff] = useState(false);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Initialize with first file
  useEffect(() => {
    const fileKeys = Object.keys(files);
    if (fileKeys.length > 0 && !selectedFile) {
      const firstFile = fileKeys[0];
      handleFileSelect(firstFile, false);
    }
  }, [files]);
  
  // Sync with activeFile prop
  useEffect(() => {
    if (activeFile && files[activeFile] && selectedFile !== activeFile) {
      handleFileSelect(activeFile, false);
    }
  }, [activeFile, files]);
  
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };
  
  const getFileIcon = (filename: string, isDirectory: boolean): React.ReactNode => {
    if (isDirectory) {
      return expandedFolders.has(filename) ? 
        <FolderOpen className="w-4 h-4 text-blue-400" /> : 
        <Folder className="w-4 h-4 text-blue-400" />;
    }
    
    const ext = getFileExtension(filename);
    const iconClass = "w-4 h-4";
    
    switch (ext) {
      case 'ts': case 'tsx': 
        return <FileCode className={`${iconClass} text-blue-500`} />;
      case 'js': case 'jsx': 
        return <FileCode className={`${iconClass} text-yellow-500`} />;
      case 'json':
        return <FileJson className={`${iconClass} text-yellow-600`} />;
      case 'css': case 'scss': case 'sass':
        return <FileText className={`${iconClass} text-purple-500`} />;
      case 'html': case 'htm':
        return <FileText className={`${iconClass} text-orange-500`} />;
      case 'md':
        return <FileText className={`${iconClass} text-blue-400`} />;
      case 'py':
        return <FileCode className={`${iconClass} text-green-500`} />;
      case 'java':
        return <FileCode className={`${iconClass} text-red-500`} />;
      case 'yml': case 'yaml':
        return <Settings className={`${iconClass} text-cyan-500`} />;
      case 'svg': case 'png': case 'jpg': case 'jpeg': case 'gif':
        return <FileImage className={`${iconClass} text-green-400`} />;
      case 'db': case 'sql':
        return <Database className={`${iconClass} text-teal-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };
  
  const buildFileTree = useCallback((): FileTreeNode[] => {
    const root: FileTreeNode[] = [];
    const nodes = new Map<string, FileTreeNode>();
    
    Object.keys(files).sort().forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const isFile = i === parts.length - 1;
        const name = parts[i];
        currentPath = currentPath ? `${currentPath}/${name}` : name;
        
        if (!nodes.has(currentPath)) {
          const node: FileTreeNode = {
            id: `node-${currentPath}`,
            name,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            children: []
          };
          nodes.set(currentPath, node);
          
          const parentPath = parts.slice(0, i).join('/');
          if (i === 0) {
            root.push(node);
          } else {
            const parent = nodes.get(parentPath);
            if (parent) {
              parent.children!.push(node);
              parent.children!.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
              });
            }
          }
        }
      }
    });
    
    return root;
  }, [files]);
  
  const handleFileSelect = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      const newExpanded = new Set(expandedFolders);
      if (newExpanded.has(fileName)) {
        newExpanded.delete(fileName);
      } else {
        newExpanded.add(fileName);
      }
      setExpandedFolders(newExpanded);
    } else {
      setSelectedFile(fileName);
      const content = files[fileName] || '';
      setEditorContent(content);
      setOriginalContent(content);
      analyzeCode(content);
      
      if (onActiveFileChange) {
        onActiveFileChange(fileName);
      }
    }
  };
  
  const handleContentChange = (content: string) => {
    setEditorContent(content);
    if (selectedFile) {
      onFileChange(selectedFile, content);
      analyzeCode(content);
    }
  };
  
  const analyzeCode = (code: string) => {
    setIsAnalyzing(true);
    
    // Simple code analysis
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for common issues
      if (line.includes('any)')) {
        issues.push({
          type: 'warning',
          line: lineNum,
          message: 'Avoid using "any" type, use specific types instead',
          code: line.trim()
        });
      }
      
      if (line.includes('console.log(') && !line.includes('// DEBUG')) {
        issues.push({
          type: 'suggestion',
          line: lineNum,
          message: 'Consider removing console.log for production',
          code: line.trim()
        });
      }
      
      if (line.includes('setTimeout(') && line.includes('=>')) {
        issues.push({
          type: 'warning',
          line: lineNum,
          message: 'Remember to clear timeout to prevent memory leaks',
          code: line.trim()
        });
      }
      
      if (line.trim().endsWith(';') && getFileExtension(selectedFile || '') === 'tsx') {
        issues.push({
          type: 'suggestion',
          line: lineNum,
          message: 'Semicolons are optional in JSX/TSX',
          code: line.trim()
        });
      }
    });
    
    // Check for missing error handling in async functions
    const asyncFunctionRegex = /async\s+(\w+)\s*\(/g;
    let match;
    while ((match = asyncFunctionRegex.exec(code)) !== null) {
      const linesAfter = code.substring(match.index).split('\n').slice(0, 10);
      const hasTryCatch = linesAfter.some(l => l.includes('try') || l.includes('catch'));
      
      if (!hasTryCatch) {
        const lineNum = code.substring(0, match.index).split('\n').length;
        issues.push({
          type: 'suggestion',
          line: lineNum,
          message: `Async function "${match[1]}" should have error handling`,
          code: lines[lineNum - 1]?.trim() || ''
        });
      }
    }
    
    setCodeIssues(issues);
    setIsAnalyzing(false);
  };
  
  const highlightCode = (code: string): string => {
    const keywords = {
      typescript: [
        'const', 'let', 'var', 'function', 'return', 'import', 'export', 'from',
        'interface', 'type', 'class', 'extends', 'implements', 'async', 'await',
        'try', 'catch', 'throw', 'new', 'this', 'super', 'constructor',
        'public', 'private', 'protected', 'readonly', 'static', 'abstract',
        'namespace', 'module', 'declare', 'any', 'string', 'number', 'boolean',
        'object', 'void', 'null', 'undefined', 'true', 'false', 'if', 'else',
        'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue',
        'in', 'of', 'typeof', 'instanceof', 'keyof'
      ],
      javascript: [
        'const', 'let', 'var', 'function', 'return', 'import', 'export', 'from',
        'class', 'extends', 'async', 'await', 'try', 'catch', 'throw', 'new',
        'this', 'super', 'constructor', 'if', 'else', 'for', 'while', 'do',
        'switch', 'case', 'default', 'break', 'continue', 'in', 'of', 'typeof',
        'instanceof', 'true', 'false', 'null', 'undefined'
      ]
    };
    
    const ext = selectedFile ? getFileExtension(selectedFile) : '';
    const language = ext === 'ts' || ext === 'tsx' ? 'typescript' : 
                    ext === 'js' || ext === 'jsx' ? 'javascript' : 'plain';
    
    const langKeywords = keywords[language as keyof typeof keywords] || [];
    
    return code.split('\n').map((line, lineIndex) => {
      let highlighted = line;
      
      // Highlight keywords
      langKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="token keyword">${keyword}</span>`);
      });
      
      // Highlight strings
      highlighted = highlighted.replace(/(["'`].*?["'`])/g, '<span class="token string">$1</span>');
      
      // Highlight comments
      highlighted = highlighted.replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>');
      
      // Highlight numbers
      highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');
      
      // Highlight function names
      highlighted = highlighted.replace(/\b(function|class|interface|type|enum)\b/g, '<span class="token keyword">$1</span>');
      
      // Highlight console methods
      highlighted = highlighted.replace(/\b(console|log|warn|error|info)\b/g, '<span class="token function">$1</span>');
      
      // Highlight React hooks and components
      if (ext === 'tsx' || ext === 'jsx') {
        highlighted = highlighted.replace(/\b(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|useImperativeHandle|useLayoutEffect|useDebugValue)\b/g, 
          '<span class="token hook">$1</span>');
        highlighted = highlighted.replace(/\b(React|Fragment|Component|PureComponent|createElement|cloneElement|createContext|createRef|forwardRef|lazy|memo|Suspense)\b/g,
          '<span class="token react">$1</span>');
      }
      
      // Add line number with issue indicator
      const lineIssues = codeIssues.filter(issue => issue.line === lineIndex + 1);
      const issueIcon = lineIssues.length > 0 ? 
        `<span class="inline-block w-3 h-3 ml-1 ${lineIssues[0].type === 'error' ? 'text-red-500' : lineIssues[0].type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}">●</span>` : 
        '';
      
      return `<div class="flex"><span class="line-number text-gray-600 pr-4 text-right select-none w-12">${lineIndex + 1}${issueIcon}</span><span>${highlighted}</span></div>`;
    }).join('\n');
  };
  
  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map(node => {
      const isSelected = node.type === 'file' && selectedFile === node.path;
      const isExpanded = node.type === 'folder' && expandedFolders.has(node.path);
      
      return (
        <div key={node.id}>
          <div
            onClick={() => handleFileSelect(node.path, node.type === 'folder')}
            className={`flex items-center px-4 py-2 cursor-pointer transition-colors group ${
              isSelected 
                ? 'bg-blue-900/30 border-r-2 border-blue-500' 
                : 'hover:bg-gray-800'
            }`}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
          >
            <div className="flex items-center flex-1">
              {node.type === 'folder' && (
                <span className="mr-1">
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  )}
                </span>
              )}
              
              <span className="mr-2">
                {getFileIcon(node.name, node.type === 'folder')}
              </span>
              
              <span className={`text-sm truncate ${
                isSelected ? 'text-white' : 'text-gray-300'
              }`}>
                {node.name}
              </span>
            </div>
            
            {node.type === 'file' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(files[node.path] || '');
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                title="Copy file content"
              >
                <Copy className="w-3 h-3 text-gray-500 hover:text-gray-300" />
              </button>
            )}
          </div>
          
          {node.type === 'folder' && isExpanded && node.children && node.children.length > 0 && (
            <div>
              {renderFileTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };
  
  const fileTree = buildFileTree();
  const currentFileIssues = codeIssues.filter(issue => 
    !selectedFile || issue.line <= editorContent.split('\n').length
  );
  
  return (
    <div className="h-full flex">
      {/* File Tree Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-300">Files</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowDiff(!showDiff)}
                className={`p-1 rounded ${showDiff ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                title="Show Diff View"
              >
                <Eye className={`w-4 h-4 ${showDiff ? 'text-blue-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={() => setShowIssues(!showIssues)}
                className={`p-1 rounded ${showIssues ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                title="Toggle Issues Panel"
              >
                <AlertCircle className={`w-4 h-4 ${showIssues ? 'text-yellow-400' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {Object.keys(files).length} files • {editorContent.split('\n').length} lines
          </div>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          {fileTree.length > 0 ? (
            renderFileTree(fileTree)
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              <FileCode className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No files generated</p>
            </div>
          )}
        </div>
        
        {/* AI Suggestions Summary */}
        {aiSuggestions.length > 0 && (
          <div className="p-3 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">AI Suggestions</span>
            </div>
            <div className="space-y-1">
              {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-400 truncate p-1 hover:bg-gray-800 rounded cursor-pointer"
                  title={suggestion.suggestion || suggestion.explanation}
                >
                  {suggestion.suggestion || suggestion.explanation}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Header */}
        {selectedFile && (
          <div className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile, false)}
              <span className="font-mono text-sm text-white">{selectedFile}</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                  {getFileExtension(selectedFile).toUpperCase()}
                </span>
                {currentFileIssues.length > 0 && (
                  <span className={`px-2 py-1 text-xs rounded ${
                    currentFileIssues.some(i => i.type === 'error') 
                      ? 'bg-red-900/30 text-red-400'
                      : currentFileIssues.some(i => i.type === 'warning')
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-blue-900/30 text-blue-400'
                  }`}>
                    {currentFileIssues.filter(i => i.type === 'error').length} errors • 
                    {currentFileIssues.filter(i => i.type === 'warning').length} warnings • 
                    {currentFileIssues.filter(i => i.type === 'suggestion').length} suggestions
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAnalyzing && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </div>
              )}
              
              <button
                onClick={() => {
                  const content = files[selectedFile] || '';
                  navigator.clipboard.writeText(content);
                }}
                className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
          </div>
        )}
        
        {/* Editor & Issues Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor */}
          <div className={`${showIssues ? 'flex-1' : 'flex-1'} overflow-auto bg-gray-950`}>
            <style jsx>{`
              .token.keyword { color: #60a5fa; font-weight: bold; }
              .token.string { color: #34d399; }
              .token.comment { color: #6b7280; font-style: italic; }
              .token.number { color: #f472b6; }
              .token.function { color: #fbbf24; }
              .token.hook { color: #c084fc; font-weight: bold; }
              .token.react { color: #38bdf8; }
              .line-number { font-family: 'Fira Code', monospace; }
            `}</style>
            
            {selectedFile ? (
              <div ref={editorRef} className="min-h-full">
                <SimpleCodeEditor
                  value={editorContent}
                  onValueChange={handleContentChange}
                  highlight={highlightCode}
                  padding={16}
                  className="font-mono text-sm"
                  style={{
                    fontSize: '14px',
                    fontFamily: '"Fira Code", "Consolas", monospace',
                    backgroundColor: '#0a0a0a',
                    color: '#e4e4e7',
                    minHeight: '100%',
                    outline: 'none'
                  }}
                  textareaClassName="focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileCode className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                  <p className="text-lg">Select a file to start editing</p>
                  <p className="text-sm mt-2">Click on any file in the sidebar</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Issues Panel */}
          {showIssues && (
            <div className="w-80 border-l border-gray-800 bg-gray-900 flex flex-col">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Code Issues
                    {currentFileIssues.length > 0 && (
                      <span className="px-2 py-0.5 bg-gray-800 text-xs rounded">
                        {currentFileIssues.length}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setShowIssues(false)}
                    className="p-1 hover:bg-gray-800 rounded"
                  >
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                {currentFileIssues.length > 0 ? (
                  <div className="space-y-3">
                    {currentFileIssues.map((issue, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          issue.type === 'error'
                            ? 'border-red-800/50 bg-red-900/20'
                            : issue.type === 'warning'
                            ? 'border-yellow-800/50 bg-yellow-900/20'
                            : 'border-blue-800/50 bg-blue-900/20'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {issue.type === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          ) : issue.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                          ) : (
                            <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm text-gray-300">
                              {issue.message}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Line {issue.line}
                            </div>
                            {issue.code && (
                              <div className="mt-2 font-mono text-xs bg-black/50 p-2 rounded border border-gray-800">
                                {issue.code}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No issues found</p>
                    <p className="text-sm mt-1">Your code looks good!</p>
                  </div>
                )}
                
                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Recommendations
                    </h4>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                        >
                          <div className="text-sm text-gray-300">
                            {suggestion.suggestion || suggestion.explanation}
                          </div>
                          {suggestion.confidence && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 mb-1">
                                Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-purple-600 h-1.5 rounded-full"
                                  style={{ width: `${suggestion.confidence * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
