import { DATABASES, type DatabaseType } from './databases';
import { STACKS, type StackType } from './stacks';
import { GIT_PROVIDERS, type GitProviderType } from './gitProviders';

// Re-export everything
export { DATABASES, type DatabaseType };
export { STACKS, type StackType };
export { GIT_PROVIDERS, type GitProviderType };

// Export as TECH_STACKS for compatibility
export const TECH_STACKS = STACKS;

// Validation function
export function validateStackDatabaseCompatibility(stack: string, database: string): boolean {
  const stackConfig = STACKS[stack as keyof typeof STACKS];
  const dbConfig = DATABASES[database as keyof typeof DATABASES];

  if (!stackConfig || !dbConfig) return false;

  // Basic compatibility rules
  if (database === 'none') return true;
  if (stack === 'flutter' && database !== 'firebase' && database !== 'supabase') return false;
  if (stack === 'python' && database === 'firebase') return false;
  
  return true;
}
