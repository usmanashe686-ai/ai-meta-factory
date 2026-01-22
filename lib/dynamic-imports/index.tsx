import dynamic from 'next/dynamic';

// Heavy components loaded only when needed
export const DynamicCodeEditor = dynamic(
  () => import('@/components/editor/CodeEditor'),
  {
    loading: () => <div className="h-full flex items-center justify-center bg-gray-50">Loading editor...</div>,
    ssr: false, // No SSR for code editor
  }
);

export const DynamicAiChat = dynamic(
  () => import('@/components/ai/AiChat'),
  {
    loading: () => <div className="p-4">Loading AI assistant...</div>,
  }
);

export const DynamicChart = dynamic(
  () => import('@/components/analytics/Chart'),
  {
    loading: () => <div className="h-64 flex items-center justify-center bg-gray-50">Loading chart...</div>,
  }
);

export const DynamicMarkdownEditor = dynamic(
  () => import('@/components/editor/MarkdownEditor'),
  {
    loading: () => <div className="h-32 bg-gray-50 animate-pulse rounded"></div>,
  }
);

export const DynamicExportOptions = dynamic(
  () => import('@/components/export/ExportOptions'),
  {
    loading: () => <div className="space-y-2">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>,
  }
);
