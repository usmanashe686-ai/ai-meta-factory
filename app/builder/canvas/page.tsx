import EnhancedCanvasPanel from '../components/canvas/EnhancedCanvasPanel';
import { StackConfig } from '../components/canvas/types';

export default function CanvasPage() {
  const stack: StackConfig = {
    frontend: "nextjs",
    backend: "node",
    database: "supabase",
    gitProvider: "github"  // Added missing gitProvider
  };

  return (
    <EnhancedCanvasPanel
      projectName="AI Meta Factory"
      stack={stack}
      initialFiles={{
        'src/App.tsx': `export default function App() {
  return (
    <div className="App">
      <h1>AI Meta Factory Project</h1>
    </div>
  );
}`,
        'README.md': '# AI Meta Factory\nA project built with the AI Meta Factory.'
      }}
      onFilesChange={(files) => console.log('Files changed:', files)}
      session={null}
    />
  );
}
