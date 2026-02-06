const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for client-side errors...\n');

// 1. Check for missing dependencies in package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'next', 'react', 'react-dom', '@octokit/rest', 'openai', 
  'jszip', 'file-saver', 'react-hot-toast', 'next-auth'
];

console.log('📦 Checking dependencies:');
requiredDeps.forEach(dep => {
  const hasDep = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
  console.log(`${hasDep ? '✅' : '❌'} ${dep}`);
});

// 2. Check for critical files
const criticalFiles = [
  'lib/ai/openai-service.ts',
  'lib/github/real-handler.ts',
  'lib/export/enhanced-exporter.ts',
  'app/builder/components/canvas/EnhancedCanvasPanel.tsx',
  '.env.local'
];

console.log('\n📄 Checking critical files:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 3. Check for "use client" in canvas components
console.log('\n⚛️ Checking client components:');
const canvasDir = 'app/builder/components/canvas';
if (fs.existsSync(canvasDir)) {
  fs.readdirSync(canvasDir)
    .filter(f => f.endsWith('.tsx'))
    .forEach(file => {
      const content = fs.readFileSync(path.join(canvasDir, file), 'utf8');
      const hasUseClient = content.includes('"use client"') || content.includes("'use client'");
      console.log(`${hasUseClient ? '✅' : '⚠️'} ${file} ${hasUseClient ? '(client)' : '(server/missing)'}`);
    });
}

console.log('\n🚀 Quick fixes:');
console.log('1. Run: npm install');
console.log('2. Create .env.local if missing');
console.log('3. Check browser console for specific errors');
console.log('4. Ensure all canvas components have "use client" at the top');
