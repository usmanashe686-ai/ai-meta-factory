import { Template } from '../TemplateLibrary';

export const textEditorTemplate: Template = {
  id: 'desktop-text-editor',
  name: 'Text Editor (Electron)',
  description: 'A simple text editor built with Electron and React.',
  category: 'desktop',
  stack: ['Electron', 'React', 'TypeScript'],
  files: {
    'package.json': `{
  "name": "text-editor",
  "version": "1.0.0",
  "main": "dist/main.js",
  "scripts": {
    "start": "electron .",
    "build": "tsc",
    "watch": "tsc -w"
  },
  "dependencies": {
    "electron": "^27.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0"
  }
}`,
    'src/main.ts': `import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});`,
    'src/preload.ts': `window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(\`\${type}-version\`, process.versions[type as keyof NodeJS.ProcessVersions] || '');
  }
});`,
    'src/renderer.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);`,
    'src/App.tsx': `import React, { useState } from 'react';

function App() {
  const [content, setContent] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Text Editor</h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', height: '400px', fontFamily: 'monospace' }}
        placeholder="Start typing..."
      />
    </div>
  );
}

export default App;`,
    'index.html': `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Text Editor</title>
</head>
<body>
    <div id="root"></div>
    <script src="./dist/renderer.js"></script>
</body>
</html>`,
    'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "jsx": "react",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}`,
  },
};
