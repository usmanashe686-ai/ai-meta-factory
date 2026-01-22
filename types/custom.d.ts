// Custom TypeScript declarations for packages without @types
declare module 'react-hot-toast' {
  const toast: any;
  export default toast;
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'openai' {
  export class OpenAI {
    constructor(config: any);
  }
}

declare module '@ai-sdk/openai' {
  export const createOpenAI: any;
}

declare module 'zustand/middleware' {
  export const persist: any;
}

declare module 'lodash.debounce' {
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: any
  ): T;
}

declare module 'vitest/config' {
  export const defineConfig: any;
}

declare module '@vitejs/plugin-react' {
  const plugin: any;
  export default plugin;
}

declare module 'next-auth/react' {
  export const useSession: any;
}

declare module '@/store/project-store' {
  export const useProjectStore: any;
}

declare module '@/context/AuthContext' {
  export const useAuth: any;
}

declare module '@/components/ui/separator' {
  export const Separator: any;
}

declare module '@/components/editor/CodeEditor' {
  export const CodeEditor: any;
}

declare module '@/components/ai/AiChat' {
  export const AiChat: any;
}

declare module '@/components/analytics/Chart' {
  export const Chart: any;
}

declare module '@/components/editor/MarkdownEditor' {
  export const MarkdownEditor: any;
}

declare module '@/components/export/ExportOptions' {
  export const ExportOptions: any;
}

declare module '@/components/templates/TemplateGallery' {
  export const TemplateGallery: any;
}

declare module './InviteMemberDialog' {
  export const InviteMemberDialog: any;
}
