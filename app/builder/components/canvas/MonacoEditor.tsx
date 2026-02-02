"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// IMPORTANT: dynamic import with ssr:false and explicit default export
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-600">Loading Monaco Editor...</p>
          <p className="text-sm text-gray-500 mt-1">Powered by VS Code engine</p>
        </div>
      </div>
    )
  }
);

interface EditorWrapperProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  height?: string;
  theme?: string;
}

export default function EditorWrapper({ 
  value, 
  language = "typescript", 
  onChange,
  height = "100%",
  theme = "vs-dark"
}: EditorWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
        <p className="text-gray-600">Initializing editor...</p>
      </div>
    </div>
  );

  return (
    <MonacoEditor
      height={height}
      theme={theme}
      language={language}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        automaticLayout: true,
        wordWrap: "on",
        formatOnPaste: true,
        formatOnType: true,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        readOnly: false,
      }}
    />
  );
}
