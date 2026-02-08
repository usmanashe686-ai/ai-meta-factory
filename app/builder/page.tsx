"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Code, Database, GitBranch,
  Cloud, Zap, ChevronRight, Check,
  Settings, Download, Layout,
  Package, User, LogOut
} from "lucide-react";
import Link from "next/link";
import HonestAIPipeline from "./components/HonestAIPipeline";
import FullStackFactory from "./components/FullStackFactory";
import EnhancedCanvasPanel from "./components/canvas/EnhancedCanvasPanel";
import { StackConfig } from "./components/canvas/types";

type TabType = "component" | "fullstack" | "canvas" | "export";
type ModeType = "nextjs" | "react" | "flutter" | "node" | "python";
type DatabaseType = "supabase" | "firebase" | "mongodb" | "planetscale" | "none";
type GitProviderType = "github" | "gitlab" | "bitbucket";

export default function BuilderPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("component");
  const [mode, setMode] = useState<ModeType>("nextjs");
  const [database, setDatabase] = useState<DatabaseType>("supabase");
  const [gitProvider, setGitProvider] = useState<GitProviderType>("github");
  const [baseFiles, setBaseFiles] = useState<Record<string, string>>({});
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});

  const modeConfigs = {
    nextjs: { name: "Next.js", icon: "⚡", color: "bg-black", textColor: "text-white" },
    react: { name: "React", icon: "⚛️", color: "bg-blue-600", textColor: "text-white" },
    flutter: { name: "Flutter", icon: "📱", color: "bg-blue-400", textColor: "text-white" },
    node: { name: "Node.js", icon: "🟢", color: "bg-green-600", textColor: "text-white" },
    python: { name: "Python", icon: "🐍", color: "bg-gradient-to-r from-yellow-500 to-blue-500", textColor: "text-white" },
  } as const;

  const databaseConfigs = {
    supabase: { name: "Supabase", icon: "🟢", color: "bg-green-500", textColor: "text-white" },
    firebase: { name: "Firebase", icon: "🔥", color: "bg-orange-500", textColor: "text-white" },
    mongodb: { name: "MongoDB", icon: "🍃", color: "bg-green-700", textColor: "text-white" },
    planetscale: { name: "PlanetScale", icon: "🪐", color: "bg-purple-600", textColor: "text-white" },
    none: { name: "No Database", icon: "⚪", color: "bg-gray-300", textColor: "text-gray-700" },
  } as const;

  const gitConfigs = {
    github: { name: "GitHub", icon: "🐙", color: "bg-gray-800", textColor: "text-white" },
    gitlab: { name: "GitLab", icon: "🦊", color: "bg-orange-600", textColor: "text-white" },
    bitbucket: { name: "BitBucket", icon: "🐋", color: "bg-blue-700", textColor: "text-white" },
  } as const;

  const getStackConfig = (): StackConfig => {
    let frontend: "nextjs" | "react" | "flutter" = "nextjs";
    let backend: "nodejs" | "python" | "none" = "nodejs";

    switch (mode) {
      case "nextjs": frontend = "nextjs"; backend = "nodejs"; break;
      case "react": frontend = "react"; backend = "nodejs"; break;
      case "flutter": frontend = "flutter"; backend = "none"; break;
      case "node": frontend = "nextjs"; backend = "nodejs"; break;
      case "python": frontend = "nextjs"; backend = "python"; break;
    }
    return { frontend, backend, database, gitProvider };
  };

  const stackConfig = getStackConfig();

  const handleGenerateComponents = () => {
    const mockFiles = {
      "src/components/Button.tsx": "// AI generated button component",
      "src/components/Card.tsx": "// AI generated card component",
      "README.md": "# AI Meta Factory Project\n\nGenerated files.",
    };
    setGeneratedFiles(mockFiles);
    setTimeout(() => setBaseFiles(mockFiles), 500);
  };

  const handleFileChange = (fileName: string, content: string) => {
    setGeneratedFiles((prev) => ({ ...prev, [fileName]: content }));
  };

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    { id: "component", label: "AI Component Generator", icon: <Zap className="w-4 h-4" /> },
    { id: "fullstack", label: "Full-Stack Factory", icon: <Package className="w-4 h-4" /> },
    { id: "canvas", label: "Canvas", icon: <Layout className="w-4 h-4" /> },
    { id: "export", label: "Export & Deploy", icon: <Cloud className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">AI</div>
            <div>
              <h1 className="font-bold text-gray-900">AI Meta Factory</h1>
              <p className="text-xs text-gray-500">Builder Interface</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <img src={session.user?.image || ""} alt={session.user?.name || ""} className="w-8 h-8 rounded-full" />
                <span className="text-sm text-gray-700">{session.user?.name}</span>
                <Link href="/api/auth/signout" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg">
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <Link href="/api/auth/signin" className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-black flex items-center gap-2">
                <User className="w-4 h-4" /> Sign in
              </Link>
            )}
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="flex max-w-7xl mx-auto px-6 mt-4 border-b gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors relative ${activeTab === tab.id ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            >
              {tab.icon} <span>{tab.label}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {activeTab === "component" && (
          <div className="space-y-8">
            <HonestAIPipeline />
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl border text-center">
                <div className={`text-2xl font-bold ${modeConfigs[mode].textColor} ${modeConfigs[mode].color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {modeConfigs[mode].icon}
                </div>
                <div className="font-bold text-gray-900">{modeConfigs[mode].name}</div>
                <div className="text-sm text-gray-600">Tech Stack</div>
              </div>
              <div className="bg-white p-6 rounded-xl border text-center">
                <div className={`text-2xl font-bold ${databaseConfigs[database].textColor} ${databaseConfigs[database].color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {databaseConfigs[database].icon}
                </div>
                <div className="font-bold text-gray-900">{databaseConfigs[database].name}</div>
                <div className="text-sm text-gray-600">Database</div>
              </div>
              <div className="bg-white p-6 rounded-xl border text-center">
                <button onClick={handleGenerateComponents} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:opacity-90">
                  🚀 Generate Components
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "fullstack" && (
          <FullStackFactory
            selectedStack={mode}
            selectedDatabase={database}
            selectedGitProvider={gitProvider}
            isGitConnected={!!session}
            onExport={() => alert("Export handled via Canvas/FullStackFactory")}
          />
        )}

        {activeTab === "canvas" && (
          <div className="min-h-[600px]">
            <EnhancedCanvasPanel
              stack={stackConfig}
              projectName="ai-meta-factory-project"
              initialFiles={{ ...baseFiles, ...generatedFiles }}
              onFilesChange={setGeneratedFiles}
              session={session}
            />
          </div>
        )}

        {activeTab === "export" && (
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">📦 Export & Deploy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Download ZIP</h3>
                <button onClick={() => alert("ZIP export handled by Canvas")} className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black">
                  Download Project
                </button>
              </div>
              <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Deploy to Vercel</h3>
                <button className="w-full py-3 bg-black text-white font-medium rounded-lg hover:opacity-90">Deploy Now</button>
              </div>
              <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
                <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Push to GitHub</h3>
                <button onClick={() => (session ? alert("Push to GitHub handled by Canvas") : alert("Sign in required"))} className={`w-full py-3 font-medium rounded-lg ${session ? "bg-gray-800 text-white hover:bg-black" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                  {session ? "Push to GitHub" : "Sign in Required"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
