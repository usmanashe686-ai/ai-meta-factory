// AI Provider Types
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'local' | 'custom';

// AI Model Types
export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  contextWindow: number;
  maxTokens: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  pricePerToken?: number;
  description?: string;
}

// AI Action Types
export type AIActionType =
  | 'generate_component'
  | 'generate_project'
  | 'explain_code'
  | 'optimize_code'
  | 'refactor_code'
  | 'fix_errors'
  | 'add_tests'
  | 'add_documentation'
  | 'convert_language'
  | 'debug_issue'
  | 'generate_readme'
  | 'review_code';

// AI Request Payload
export interface AIRequest {
  id: string;
  action: AIActionType;
  prompt: string;
  context: {
    currentFile?: string;
    selectedCode?: string;
    projectStructure?: string[];
    stack?: string;
    language?: string;
    requirements?: string[];
  };
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userId?: string;
  sessionId?: string;
}

// AI Response
export interface AIResponse {
  id: string;
  requestId: string;
  content: string;
  files?: GeneratedFile[];
  suggestions?: AISuggestion[];
  explanations?: Explanation[];
  errors?: AIError[];
  metadata: {
    model: string;
    tokensUsed: number;
    timestamp: Date;
    duration: number;
    cost?: number;
  };
}

// Generated File from AI
export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  description?: string;
  isNew: boolean;
  changes?: FileChange[];
}

// File Change (for modifications)
export interface FileChange {
  type: 'insert' | 'update' | 'delete';
  line: number;
  content: string;
  previousContent?: string;
}

// AI Suggestion
export interface AISuggestion {
  type: 'code' | 'comment' | 'import' | 'structure' | 'performance' | 'security';
  title: string;
  description: string;
  code?: string;
  severity: 'info' | 'warning' | 'critical';
  file?: string;
  line?: number;
}

// Explanation for Code
export interface Explanation {
  section: string;
  explanation: string;
  codeSnippet?: string;
}

// AI Error
export interface AIError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion?: string;
  retryable: boolean;
}

// AI Conversation
export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  isPinned: boolean;
  tags: string[];
}

// AI Message
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: string[];
  suggestions?: AISuggestion[];
  metadata?: Record<string, any>;
}

// AI Settings/Configuration
export interface AISettings {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature: number;
  maxTokens: number;
  contextWindow: number;
  autoSuggest: boolean;
  autoExplain: boolean;
  autoFix: boolean;
  codeReview: boolean;
  securityScan: boolean;
  rateLimit: number;
  useProjectContext: boolean;
  useWebSearch: boolean;
}

// AI Context for Requests
export interface AIContext {
  project: {
    name: string;
    stack: string;
    files: string[];
    activeFile?: string;
  };
  editor: {
    language: string;
    cursorPosition?: {
      line: number;
      column: number;
    };
    selectedText?: string;
  };
  conversation?: {
    history: AIMessage[];
    lastResponse?: AIResponse;
  };
  user?: {
    preferences: Record<string, any>;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}

// AI Event Types
export type AIEvent =
  | { type: 'AI_REQUEST_SENT'; payload: AIRequest }
  | { type: 'AI_RESPONSE_RECEIVED'; payload: AIResponse }
  | { type: 'AI_ERROR'; payload: AIError }
  | { type: 'SUGGESTION_APPLIED'; payload: { suggestionId: string; filePath: string } }
  | { type: 'CONVERSATION_STARTED'; payload: AIConversation }
  | { type: 'CONVERSATION_UPDATED'; payload: { conversationId: string; message: AIMessage } }
  | { type: 'SETTINGS_UPDATED'; payload: Partial<AISettings> };

// AI Cost Tracking
export interface AICost {
  id: string;
  date: Date;
  provider: AIProvider;
  model: string;
  tokensUsed: number;
  estimatedCost: number;
  requests: number;
  userId?: string;
  projectId?: string;
}
