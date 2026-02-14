// ============================================================================
// AI Meta Factory – Editor Store (Zustand)
// Manages the Monaco editor UI state: open files, cursor, theme, etc.
// ============================================================================

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ----------------------------------------------------------------------------
// Editor theme options
// ----------------------------------------------------------------------------
export type EditorTheme = 'vs-dark' | 'light' | 'hc-black';

// ----------------------------------------------------------------------------
// Editor UI state
// ----------------------------------------------------------------------------
export interface EditorTab {
  path: string;       // file path
  isDirty: boolean;   // unsaved changes
  scrollPosition?: number;
  cursorPosition?: {
    lineNumber: number;
    column: number;
  };
}

// ----------------------------------------------------------------------------
// Editor store interface
// ----------------------------------------------------------------------------
interface EditorStore {
  // Currently open files (tabs)
  tabs: EditorTab[];
  activeTabPath: string | null;

  // Editor preferences
  theme: EditorTheme;
  fontSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  minimapEnabled: boolean;
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';

  // UI state
  isSidebarOpen: boolean;
  isFileExplorerOpen: boolean;
  isAIPanelOpen: boolean;
  isTerminalOpen: boolean;

  // Search/replace
  searchQuery: string;
  replaceQuery: string;
  isCaseSensitive: boolean;
  isRegex: boolean;
  searchResults: Array<{ path: string; line: number; content: string }>;

  // Actions
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (path: string) => void;
  markDirty: (path: string, isDirty: boolean) => void;
  updateCursorPosition: (path: string, lineNumber: number, column: number) => void;

  // Preferences
  setTheme: (theme: EditorTheme) => void;
  setFontSize: (size: number) => void;
  setWordWrap: (wrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded') => void;
  toggleMinimap: () => void;
  toggleLineNumbers: () => void;

  // UI panels
  toggleSidebar: () => void;
  toggleFileExplorer: () => void;
  toggleAIPanel: () => void;
  toggleTerminal: () => void;

  // Search
  setSearchQuery: (query: string) => void;
  setReplaceQuery: (query: string) => void;
  setSearchOptions: (options: { caseSensitive?: boolean; regex?: boolean }) => void;
  performSearch: (files: Record<string, any>) => void;
  clearSearch: () => void;
}

// ----------------------------------------------------------------------------
// Create the store
// ----------------------------------------------------------------------------
export const useEditorStore = create<EditorStore>()(
  immer(
    devtools(
      persist(
        (set, get) => ({
          // ------------------------------------------------------------------
          // Initial state
          // ------------------------------------------------------------------
          tabs: [],
          activeTabPath: null,

          theme: 'vs-dark',
          fontSize: 14,
          wordWrap: 'on',
          minimapEnabled: true,
          lineNumbers: 'on',

          isSidebarOpen: true,
          isFileExplorerOpen: true,
          isAIPanelOpen: false,
          isTerminalOpen: false,

          searchQuery: '',
          replaceQuery: '',
          isCaseSensitive: false,
          isRegex: false,
          searchResults: [],

          // ------------------------------------------------------------------
          // Tab management
          // ------------------------------------------------------------------
          openFile: (path) => {
            set((state) => {
              // Check if already open – explicitly type the callback parameter
              const existing = state.tabs.find((t: EditorTab) => t.path === path);
              if (!existing) {
                state.tabs.push({
                  path,
                  isDirty: false,
                });
              }
              state.activeTabPath = path;
            });
          },

          closeTab: (path) => {
            set((state) => {
              state.tabs = state.tabs.filter(t => t.path !== path);

              // If closed tab was active, activate another tab
              if (state.activeTabPath === path) {
                state.activeTabPath = state.tabs.length > 0
                  ? state.tabs[state.tabs.length - 1].path
                  : null;
              }
            });
          },

          closeAllTabs: () => {
            set({ tabs: [], activeTabPath: null });
          },

          setActiveTab: (path) => {
            set({ activeTabPath: path });
          },

          markDirty: (path, isDirty) => {
            set((state) => {
              const tab = state.tabs.find(t => t.path === path);
              if (tab) {
                tab.isDirty = isDirty;
              }
            });
          },

          updateCursorPosition: (path, lineNumber, column) => {
            set((state) => {
              const tab = state.tabs.find(t => t.path === path);
              if (tab) {
                tab.cursorPosition = { lineNumber, column };
              }
            });
          },

          // ------------------------------------------------------------------
          // Editor preferences
          // ------------------------------------------------------------------
          setTheme: (theme) => set({ theme }),
          setFontSize: (fontSize) => set({ fontSize }),
          setWordWrap: (wordWrap) => set({ wordWrap }),
          toggleMinimap: () => set((state) => ({ minimapEnabled: !state.minimapEnabled })),
          toggleLineNumbers: () => set((state) => ({
            lineNumbers: state.lineNumbers === 'on' ? 'off' : 'on'
          })),

          // ------------------------------------------------------------------
          // UI panels
          // ------------------------------------------------------------------
          toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
          toggleFileExplorer: () => set((state) => ({
            isFileExplorerOpen: !state.isFileExplorerOpen
          })),
          toggleAIPanel: () => set((state) => ({
            isAIPanelOpen: !state.isAIPanelOpen
          })),
          toggleTerminal: () => set((state) => ({
            isTerminalOpen: !state.isTerminalOpen
          })),

          // ------------------------------------------------------------------
          // Search
          // ------------------------------------------------------------------
          setSearchQuery: (query) => set({ searchQuery: query }),
          setReplaceQuery: (query) => set({ replaceQuery: query }),
          setSearchOptions: ({ caseSensitive, regex }) => {
            set((state) => {
              if (caseSensitive !== undefined) state.isCaseSensitive = caseSensitive;
              if (regex !== undefined) state.isRegex = regex;
            });
          },

          performSearch: (files) => {
            const { searchQuery, isCaseSensitive, isRegex } = get();
            if (!searchQuery.trim()) {
              set({ searchResults: [] });
              return;
            }

            const results: Array<{ path: string; line: number; content: string }> = [];

            Object.entries(files).forEach(([path, file]: [string, any]) => {
              if (file.type === 'directory' || typeof file.content !== 'string') return;

              const lines = file.content.split('\n');
              lines.forEach((line: string, idx: number) => {
                let match = false;
                if (isRegex) {
                  try {
                    const flags = isCaseSensitive ? 'g' : 'gi';
                    const regex = new RegExp(searchQuery, flags);
                    match = regex.test(line);
                  } catch {
                    match = line.includes(searchQuery);
                  }
                } else {
                  match = isCaseSensitive
                    ? line.includes(searchQuery)
                    : line.toLowerCase().includes(searchQuery.toLowerCase());
                }

                if (match) {
                  results.push({
                    path,
                    line: idx + 1,
                    content: line.trim(),
                  });
                }
              });
            });

            set({ searchResults: results });
          },

          clearSearch: () => {
            set({ searchQuery: '', replaceQuery: '', searchResults: [] });
          },
        }),
        {
          name: 'ai-meta-factory-editor',
          partialize: (state) => ({
            theme: state.theme,
            fontSize: state.fontSize,
            wordWrap: state.wordWrap,
            minimapEnabled: state.minimapEnabled,
            lineNumbers: state.lineNumbers,
            isSidebarOpen: state.isSidebarOpen,
            isFileExplorerOpen: state.isFileExplorerOpen,
            // Don't persist tabs or search results
          }),
        }
      ),
      { name: 'EditorStore' }
    )
  )
);
