export const STACKS = {
  nextjs: {
    id: 'nextjs',
    label: 'Next.js',
    icon: '⚡',
    color: 'from-black to-gray-800',
    dependencies: ['next', 'react', 'react-dom'],
    devDependencies: ['@types/node', '@types/react', '@types/react-dom', 'typescript', 'tailwindcss'],
    structure: [
      'app/',
      'app/layout.tsx',
      'app/page.tsx',
      'components/',
      'lib/',
      'public/',
      '.env.example',
      'package.json',
      'tailwind.config.ts',
      'tsconfig.json'
    ],
    buildCommand: 'npm run build',
    startCommand: 'npm run dev',
    supportedDatabases: ['supabase', 'firebase', 'mongodb', 'planetscale', 'none'],
    supportedGitProviders: ['github', 'gitlab', 'bitbucket']
  },
  react: {
    id: 'react',
    label: 'React',
    icon: '⚛️',
    color: 'from-blue-500 to-blue-700',
    dependencies: ['react', 'react-dom'],
    devDependencies: ['@types/react', '@types/react-dom', 'typescript', 'vite'],
    structure: [
      'src/',
      'src/main.tsx',
      'src/App.tsx',
      'src/components/',
      'public/',
      'package.json',
      'tsconfig.json',
      'vite.config.ts'
    ],
    buildCommand: 'npm run build',
    startCommand: 'npm run dev',
    supportedDatabases: ['supabase', 'firebase', 'mongodb', 'planetscale', 'none'],
    supportedGitProviders: ['github', 'gitlab', 'bitbucket']
  },
  flutter: {
    id: 'flutter',
    label: 'Flutter',
    icon: '📱',
    color: 'from-blue-400 to-sky-500',
    dependencies: [],
    devDependencies: [],
    structure: [
      'lib/',
      'lib/main.dart',
      'lib/screens/',
      'lib/widgets/',
      'pubspec.yaml',
      'android/',
      'ios/',
      'assets/'
    ],
    buildCommand: 'flutter build',
    startCommand: 'flutter run',
    supportedDatabases: ['firebase', 'supabase', 'none'],
    supportedGitProviders: ['github', 'gitlab', 'bitbucket']
  },
  node: {
    id: 'node',
    label: 'Node.js',
    icon: '🟢',
    color: 'from-green-600 to-green-800',
    dependencies: ['express', 'cors', 'dotenv'],
    devDependencies: ['@types/node', '@types/express', 'typescript', 'nodemon'],
    structure: [
      'src/',
      'src/index.ts',
      'src/routes/',
      'src/controllers/',
      'src/models/',
      '.env.example',
      'package.json',
      'tsconfig.json'
    ],
    buildCommand: 'npm run build',
    startCommand: 'npm run start',
    supportedDatabases: ['supabase', 'mongodb', 'planetscale', 'firebase'],
    supportedGitProviders: ['github', 'gitlab', 'bitbucket']
  },
  python: {
    id: 'python',
    label: 'Python',
    icon: '🐍',
    color: 'from-yellow-500 to-blue-500',
    dependencies: ['fastapi', 'uvicorn', 'pydantic'],
    devDependencies: [],
    structure: [
      'main.py',
      'requirements.txt',
      'models/',
      'routes/',
      '.env.example'
    ],
    buildCommand: 'python -m uvicorn main:app --reload',
    startCommand: 'python -m uvicorn main:app',
    supportedDatabases: ['mongodb', 'planetscale', 'supabase'],
    supportedGitProviders: ['github', 'gitlab', 'bitbucket']
  },
};

export type StackType = keyof typeof STACKS;

export function getStackPrompt(stackId: StackType): string {
  const stack = STACKS[stackId];
  if (!stack) return '';
  
  return `
TECH STACK CONFIGURATION:
- Framework: ${stack.label}
- Language: ${stack.id === 'python' ? 'Python' : 'TypeScript'}
- Package Manager: ${stack.id === 'python' ? 'pip' : 'npm'}
- Build Command: ${stack.buildCommand}
- Start Command: ${stack.startCommand}
- Dependencies: ${stack.dependencies.join(', ')}
- Dev Dependencies: ${stack.devDependencies.join(', ') || 'None'}

STACK RULES:
• Use proper TypeScript types
• Follow best practices for ${stack.label}
• Include error handling
• Make responsive design
`;
}
