import EnhancedCanvasPanel from './components/canvas/EnhancedCanvasPanel';

export default function BuilderPage() {
  const stack = {
    frontend: 'nextjs' as const,
    backend: 'node' as const,
    database: 'postgresql' as const,
  };

  return (
    <div className="h-screen">
      <EnhancedCanvasPanel
        projectName="AI Meta Factory"
        stack={stack}
        initialFiles={{
          'src/App.tsx': `export default function App() {
  return (
    <div>
      <h1>Welcome to AI Meta Factory</h1>
    </div>
  );
}`,
          'README.md': '# AI Meta Factory\n\nBuild and deploy AI-powered applications.',
        }}
      />
    </div>
  );
}
