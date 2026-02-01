export const GIT_PROVIDERS = {
  github: {
    id: 'github',
    label: 'GitHub',
    icon: '🐙',
    color: 'from-gray-800 to-gray-900',
    auth: 'oauth',
    scopes: ['repo', 'read:user'],
    setupGuide: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps',
  },
  gitlab: {
    id: 'gitlab',
    label: 'GitLab',
    icon: '🦊',
    color: 'from-orange-600 to-red-500',
    auth: 'oauth',
    scopes: ['api', 'read_user'],
    setupGuide: 'https://docs.gitlab.com/ee/api/oauth2.html',
  },
  bitbucket: {
    id: 'bitbucket',
    label: 'Bitbucket',
    icon: '🐋',
    color: 'from-blue-600 to-blue-800',
    auth: 'oauth',
    scopes: ['repository:write', 'account:read'],
    setupGuide: 'https://developer.atlassian.com/cloud/bitbucket/oauth-2/',
  },
};

export type GitProviderType = keyof typeof GIT_PROVIDERS;

export function getGitProviderPrompt(providerId: GitProviderType): string {
  const provider = GIT_PROVIDERS[providerId];
  if (!provider) return '';
  
  return `
GIT CONFIGURATION:
- Provider: ${provider.label}
- Authentication: ${provider.auth.toUpperCase()}
- Required Scopes: ${provider.scopes.join(', ')}

GIT RULES:
• Always use .gitignore for node_modules and environment files
• Initialize git repository if not present
• Use meaningful commit messages
• Structure commits logically
• Follow provider-specific best practices
`;
}
