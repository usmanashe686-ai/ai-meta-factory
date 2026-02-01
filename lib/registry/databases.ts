export interface DatabaseConfig {
  id: string;
  label: string;
  type: string;
  icon: string;
  color: string;
  sdk: string;
  env: string[];
  supportedStacks: string[];
  setupGuide: string; // Add this line
}

export const DATABASES: Record<string, DatabaseConfig> = {
  supabase: {
    id: 'supabase',
    label: 'Supabase',
    type: 'postgres',
    icon: '🗄️',
    color: 'from-green-500 to-emerald-600',
    sdk: '@supabase/supabase-js',
    env: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
    supportedStacks: ['nextjs', 'react', 'node'],
    setupGuide: 'https://supabase.com/docs/guides/getting-started', // Add this line
  },
  firebase: {
    id: 'firebase',
    label: 'Firebase',
    type: 'firestore',
    icon: '🔥',
    color: 'from-orange-500 to-yellow-500',
    sdk: 'firebase',
    env: ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID'],
    supportedStacks: ['nextjs', 'react', 'flutter', 'node'],
    setupGuide: 'https://firebase.google.com/docs/firestore/quickstart', // Add this line
  },
  mongodb: {
    id: 'mongodb',
    label: 'MongoDB',
    type: 'nosql',
    icon: '🍃',
    color: 'from-green-600 to-green-400',
    sdk: 'mongodb',
    env: ['MONGODB_URI'],
    supportedStacks: ['nextjs', 'react', 'node', 'python'],
    setupGuide: 'https://www.mongodb.com/docs/atlas/getting-started/', // Add this line
  },
  planetscale: {
    id: 'planetscale',
    label: 'PlanetScale',
    type: 'mysql',
    icon: '🪐',
    color: 'from-purple-500 to-pink-500',
    sdk: 'mysql2',
    env: ['DATABASE_URL'],
    supportedStacks: ['nextjs', 'react', 'node', 'python'],
    setupGuide: 'https://planetscale.com/docs/tutorials/planetscale-quick-start-guide', // Add this line
  },
  none: {
    id: 'none',
    label: 'None',
    type: 'local',
    icon: '💾',
    color: 'from-gray-400 to-gray-600',
    sdk: '',
    env: [],
    supportedStacks: ['nextjs', 'react', 'flutter', 'node', 'python'],
    setupGuide: '', // Add this line (empty string)
  },
};

export type DatabaseType = keyof typeof DATABASES;

export function getDatabasePrompt(dbId: DatabaseType, stack: string): string {
  const db = DATABASES[dbId];
  if (!db) return '';
  
  return `
DATABASE CONFIGURATION:
- Database: ${db.label}
- Type: ${db.type.toUpperCase()}
- SDK: ${db.sdk || 'None'}
- Environment Variables: ${db.env.join(', ')}

DATABASE RULES:
${db.id === 'none' ? '• Use mock data for development' : '• Use environment variables for all credentials'}
${db.sdk ? `• Use ${db.sdk} for all database operations` : '• Implement proper data storage patterns'}
• Include proper error handling
• Add TypeScript types for database models
`;
}
