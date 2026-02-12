// Device Sizes for Preview
export type DeviceSize = 
  | 'mobile'    // 375x667
  | 'tablet'    // 768x1024
  | 'laptop'    // 1366x768
  | 'desktop'   // 1920x1080
  | 'responsive'; // Auto

// Preview Log Entry
export interface PreviewLog {
  id: string;
  timestamp: Date;
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
  line?: number;
  column?: number;
}

// Preview Error
export interface PreviewError {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  isFatal: boolean;
}

// Preview State
export interface PreviewState {
  isRunning: boolean;
  isLoading: boolean;
  url: string | null;
  logs: PreviewLog[];
  errors: PreviewError[];
  warnings: PreviewError[];
  device: DeviceSize;
  zoom: number;
  isAutoRefresh: boolean;
  refreshInterval: number;
  lastRefresh: Date | null;
  consoleOpen: boolean;
  networkLogs: boolean;
  performanceMetrics: {
    loadTime: number | null;
    memoryUsage: number | null;
    fps: number | null;
  };
}

// Sandpack Configuration
export interface SandpackConfig {
  template: 
    | 'react' 
    | 'react-ts' 
    | 'vue' 
    | 'vue-ts' 
    | 'vanilla' 
    | 'vanilla-ts'
    | 'nextjs'
    | 'angular'
    | 'svelte';
  files: Record<string, string | { code: string; hidden?: boolean }>;
  customSetup?: {
    dependencies: Record<string, string>;
    entry: string;
    environment: 'node' | 'browser';
  };
  options: {
    visibleFiles?: string[];
    activeFile?: string;
    editorHeight?: number | string;
    editorWidthPercentage?: number;
    showTabs?: boolean;
    showLineNumbers?: boolean;
    showInlineErrors?: boolean;
    showNavigator?: boolean;
    showRefreshButton?: boolean;
    showConsole?: boolean;
    showConsoleButton?: boolean;
    bundlerURL?: string;
    startRoute?: string;
    externalResources?: string[];
  };
}

// Preview Event
export type PreviewEvent =
  | { type: 'PREVIEW_STARTED' }
  | { type: 'PREVIEW_STOPPED' }
  | { type: 'PREVIEW_REFRESHED'; payload?: { manual: boolean } }
  | { type: 'LOG_ADDED'; payload: PreviewLog }
  | { type: 'ERROR_ADDED'; payload: PreviewError }
  | { type: 'CLEAR_LOGS' }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'DEVICE_CHANGED'; payload: DeviceSize }
  | { type: 'ZOOM_CHANGED'; payload: number }
  | { type: 'AUTO_REFRESH_TOGGLED'; payload: boolean }
  | { type: 'CONSOLE_TOGGLED'; payload: boolean };

// Build Information
export interface BuildInfo {
  buildId: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  bundleSize: number;
  assetCount: number;
  warnings: number;
  errors: number;
}

// Network Request Log
export interface NetworkLog {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  status: number;
  duration: number;
  size: number;
  type: string;
}
