// Editor Theme Types
export type EditorTheme = 'vs-dark' | 'light' | 'hc-black' | 'github-dark' | 'monokai';

// Editor Tab
export interface EditorTab {
  id: string;
  path: string;
  name: string;
  isDirty: boolean;
  isPinned: boolean;
  lastAccessed: Date;
  language: string;
  icon?: string;
}

// Cursor Position
export interface CursorPosition {
  lineNumber: number;
  column: number;
}

// Selection Range
export interface SelectionRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

// Editor State
export interface EditorState {
  tabs: EditorTab[];
  activeTab: string | null;
  cursorPosition: CursorPosition;
  selection: SelectionRange | null;
  theme: EditorTheme;
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: 'on' | 'off' | 'relative';
  folding: boolean;
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
  autoClosingPairs: boolean;
  autoIndent: boolean;
  formatOnSave: boolean;
  formatOnPaste: boolean;
  suggestions: boolean;
  parameterHints: boolean;
  snippetSuggestions: 'top' | 'bottom' | 'inline' | 'none';
  quickSuggestions: boolean;
  hover: boolean;
}

// Monaco Editor Configuration
export interface MonacoConfig {
  value: string;
  language: string;
  theme: EditorTheme;
  options: MonacoOptions;
  onChange?: (value: string) => void;
  onMount?: (editor: any) => void;
}

// Monaco Options (subset)
export interface MonacoOptions {
  fontSize?: number;
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  minimap?: { enabled: boolean };
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  folding?: boolean;
  renderWhitespace?: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
  autoClosingBrackets?: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  autoClosingQuotes?: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  autoIndent?: 'none' | 'keep' | 'brackets' | 'advanced' | 'full';
  formatOnPaste?: boolean;
  formatOnType?: boolean;
  suggestOnTriggerCharacters?: boolean;
  acceptSuggestionOnEnter?: 'on' | 'smart' | 'off';
  quickSuggestions?: boolean | { other: boolean; comments: boolean; strings: boolean };
  parameterHints?: { enabled: boolean; cycle: boolean };
  hover?: { enabled: boolean; delay: number };
}

// Editor Events
export type EditorEvent =
  | { type: 'TAB_OPENED'; payload: string }
  | { type: 'TAB_CLOSED'; payload: string }
  | { type: 'TAB_SWITCHED'; payload: string }
  | { type: 'CONTENT_CHANGED'; payload: { path: string; content: string } }
  | { type: 'CURSOR_MOVED'; payload: CursorPosition }
  | { type: 'SELECTION_CHANGED'; payload: SelectionRange | null }
  | { type: 'THEME_CHANGED'; payload: EditorTheme }
  | { type: 'SETTINGS_UPDATED'; payload: Partial<EditorState> };

// Language Configuration
export interface LanguageConfig {
  id: string;
  extensions: string[];
  aliases: string[];
  mimetypes: string[];
  icon: string;
  color: string;
  monacoLanguage: string;
}

// Suggestion Item (for AI/IntelliSense)
export interface SuggestionItem {
  label: string;
  kind: number; // Monaco CompletionItemKind
  detail?: string;
  documentation?: string;
  insertText: string;
  range?: any;
  sortText?: string;
  filterText?: string;
  commitCharacters?: string[];
  additionalTextEdits?: any[];
}
