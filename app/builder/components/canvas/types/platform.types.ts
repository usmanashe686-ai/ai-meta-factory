// ============================================================================
// AI Meta Factory – Platform & Core Domain Types
// ============================================================================

/** All project types the platform can build */
export type ProjectType =
  | 'website'
  | 'webapp'
  | 'mobile'
  | 'desktop'
  | 'api'
  | 'bot'
  | 'game'
  | 'iot';

/** Human‑readable metadata for each ProjectType */
export interface ProjectTypeInfo {
  id: ProjectType;
  name: string;
  icon: string;
  description: string;
  color: string; // Tailwind gradient, e.g. "from-blue-500 to-cyan-500"
  category: 'web' | 'mobile' | 'desktop' | 'backend' | 'automation' | 'embedded';
  complexity: 1 | 2 | 3;
  templates: string[];
}

export const PROJECT_TYPE_REGISTRY: Record<ProjectType, ProjectTypeInfo> = {
  website: {
    id: 'website',
    name: 'Website',
    icon: '🌐',
    description: 'Landing pages, blogs, portfolios',
    color: 'from-blue-500 to-cyan-500',
    category: 'web',
    complexity: 1,
    templates: ['landing', 'blog', 'portfolio'],
  },
  webapp: {
    id: 'webapp',
    name: 'Web App',
    icon: '💻',
    description: 'Dashboards, SaaS, admin panels',
    color: 'from-purple-500 to-pink-500',
    category: 'web',
    complexity: 2,
    templates: ['dashboard', 'crm', 'saas'],
  },
  mobile: {
    id: 'mobile',
    name: 'Mobile App',
    icon: '📱',
    description: 'Android, iOS, cross‑platform',
    color: 'from-green-500 to-emerald-500',
    category: 'mobile',
    complexity: 2,
    templates: ['social', 'productivity', 'game'],
  },
  desktop: {
    id: 'desktop',
    name: 'Desktop App',
    icon: '🖥️',
    description: 'Windows, Mac, Linux',
    color: 'from-orange-500 to-red-500',
    category: 'desktop',
    complexity: 2,
    templates: ['editor', 'utility'],
  },
  api: {
    id: 'api',
    name: 'API / Backend',
    icon: '🔌',
    description: 'REST, GraphQL, microservices',
    color: 'from-indigo-500 to-blue-500',
    category: 'backend',
    complexity: 2,
    templates: ['rest-api', 'graphql-api', 'websocket'],
  },
  bot: {
    id: 'bot',
    name: 'Chatbot',
    icon: '🤖',
    description: 'Discord, Slack, Telegram bots',
    color: 'from-yellow-500 to-orange-500',
    category: 'automation',
    complexity: 1,
    templates: ['discord-bot', 'slack-bot', 'telegram-bot'],
  },
  game: {
    id: 'game',
    name: 'Game',
    icon: '🎮',
    description: '2D, 3D, mobile, web games',
    color: 'from-pink-500 to-rose-500',
    category: 'web',
    complexity: 3,
    templates: ['platformer', 'puzzle', 'arcade'],
  },
  iot: {
    id: 'iot',
    name: 'IoT',
    icon: '⚡',
    description: 'Arduino, Raspberry Pi, sensors',
    color: 'from-gray-700 to-gray-900',
    category: 'embedded',
    complexity: 2,
    templates: ['smart-home', 'weather-station'],
  },
} as const;

/** Supported frameworks / engines */
export type Framework =
  | 'react' | 'vue' | 'svelte' | 'next' | 'nuxt' | 'sveltekit' | 'astro' | 'static-html'
  | 'react-native' | 'flutter' | 'ionic' | 'capacitor'
  | 'electron' | 'tauri' | 'flutter-desktop'
  | 'phaser' | 'threejs' | 'babylon'
  | 'discordjs' | 'python-telegram'
  | 'arduino' | 'raspberry-pi' | 'esp32'
  | 'express' | 'fastify'; // Added missing frameworks

/** Export formats / build outputs */
export type ExportFormat =
  | 'zip' | 'apk' | 'ipa' | 'exe' | 'dmg' | 'appimage'
  | 'docker' | 'pwa' | 'static' | 'vercel' | 'netlify' | 'github';

/** Build statuses */
export type BuildStatus =
  | 'pending' | 'downloading' | 'analyzing' | 'generating'
  | 'compiling' | 'packaging' | 'uploading' | 'completed'
  | 'failed' | 'cancelled';

/** Device capabilities (for progressive enhancement) */
export interface DeviceCapabilities {
  hasWebGPU: boolean;
  hasWasm: boolean;
  memoryMB: number;
  hasServiceWorker: boolean;
  hasIndexedDB: boolean;
  platform: 'mobile' | 'tablet' | 'desktop';
  browser: string;
}

/** Result of a build/export operation */
export interface BuildResult {
  success: boolean;
  format: ExportFormat;
  data: Blob | Buffer | string; // file or URL
  fileName?: string;
  logs?: string;
  instructions?: string;
  communityBuildUrl?: string;
  method: 'browser-full' | 'browser-light' | 'project-zip' | 'community';
}
