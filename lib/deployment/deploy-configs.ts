export interface DeploymentConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  url: string;
  apiDocs: string;
  envVars: string[];
  setupSteps: string[];
  supportedStacks: string[];
}

export const DEPLOYMENT_PROVIDERS: DeploymentConfig[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    description: 'Instant deployments for Next.js and React apps',
    url: 'https://vercel.com',
    apiDocs: 'https://vercel.com/docs/rest-api',
    envVars: ['VERCEL_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_ORG_ID'],
    setupSteps: [
      'Create Vercel account',
      'Generate access token from Vercel Dashboard',
      'Connect GitHub repository',
      'Configure environment variables',
      'Deploy with one click'
    ],
    supportedStacks: ['nextjs', 'react', 'node']
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: '⧉',
    description: 'All-in-one platform for modern web projects',
    url: 'https://netlify.com',
    apiDocs: 'https://docs.netlify.com/api/get-started/',
    envVars: ['NETLIFY_TOKEN', 'NETLIFY_SITE_ID'],
    setupSteps: [
      'Create Netlify account',
      'Generate access token from User Settings',
      'Connect Git repository',
      'Set build settings',
      'Add environment variables'
    ],
    supportedStacks: ['nextjs', 'react', 'node']
  },
  {
    id: 'railway',
    name: 'Railway',
    icon: '🚂',
    description: 'Deploy anything with just a push',
    url: 'https://railway.app',
    apiDocs: 'https://docs.railway.app/develop/api',
    envVars: ['RAILWAY_TOKEN', 'RAILWAY_PROJECT_ID'],
    setupSteps: [
      'Create Railway account',
      'Generate API token from Settings',
      'Create new project',
      'Connect GitHub repository',
      'Configure environment variables'
    ],
    supportedStacks: ['nextjs', 'react', 'node', 'python', 'flutter']
  },
  {
    id: 'render',
    name: 'Render',
    icon: '🚀',
    description: 'Cloud platform for all your apps and websites',
    url: 'https://render.com',
    apiDocs: 'https://render.com/docs/api',
    envVars: ['RENDER_API_KEY'],
    setupSteps: [
      'Create Render account',
      'Generate API key from Dashboard',
      'Create new service',
      'Connect Git repository',
      'Configure environment and build settings'
    ],
    supportedStacks: ['nextjs', 'react', 'node', 'python']
  },
  {
    id: 'firebase',
    name: 'Firebase Hosting',
    icon: '🔥',
    description: 'Hosting for web apps with global CDN',
    url: 'https://firebase.google.com',
    apiDocs: 'https://firebase.google.com/docs/hosting',
    envVars: ['FIREBASE_TOKEN', 'FIREBASE_PROJECT_ID'],
    setupSteps: [
      'Create Firebase project',
      'Install Firebase CLI',
      'Initialize project',
      'Configure hosting',
      'Deploy with Firebase CLI'
    ],
    supportedStacks: ['react', 'flutter']
  },
  {
    id: 'aws',
    name: 'AWS Amplify',
    icon: '☁️',
    description: 'AWS service for full-stack applications',
    url: 'https://aws.amazon.com/amplify',
    apiDocs: 'https://docs.aws.amazon.com/amplify',
    envVars: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
    setupSteps: [
      'Create AWS account',
      'Configure AWS CLI',
      'Initialize Amplify project',
      'Connect Git repository',
      'Set up CI/CD pipeline'
    ],
    supportedStacks: ['nextjs', 'react', 'node', 'flutter']
  },
  {
    id: 'gcp',
    name: 'Google Cloud Run',
    icon: 'G',
    description: 'Managed compute platform for containers',
    url: 'https://cloud.google.com/run',
    apiDocs: 'https://cloud.google.com/run/docs',
    envVars: ['GOOGLE_APPLICATION_CREDENTIALS', 'GCP_PROJECT_ID'],
    setupSteps: [
      'Create Google Cloud account',
      'Enable Cloud Run API',
      'Build Docker container',
      'Deploy to Cloud Run',
      'Configure domain and SSL'
    ],
    supportedStacks: ['nextjs', 'node', 'python', 'flutter']
  }
];

export function getDeploymentInstructions(providerId: string, stack: string): string {
  const provider = DEPLOYMENT_PROVIDERS.find(p => p.id === providerId);
  if (!provider) return 'Deployment provider not found.';
  
  const isSupported = provider.supportedStacks.includes(stack);
  
  return `
# Deploying to ${provider.name} ${provider.icon}

## 📋 Prerequisites
${provider.setupSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## 🔧 Environment Variables Required
${provider.envVars.map(env => `- \`${env}\``).join('\n')}

## 🚀 Deployment Steps
1. Push your code to GitHub
2. Connect ${provider.name} to your repository
3. Configure build settings:
   ${stack === 'nextjs' ? '- Build Command: `npm run build`\n   - Output Directory: `.next`' : 
     stack === 'react' ? '- Build Command: `npm run build`\n   - Output Directory: `dist`' :
     stack === 'flutter' ? '- Build Command: `flutter build web`\n   - Output Directory: `build/web`' :
     '- Configure appropriate build command'}
4. Add environment variables from your .env file
5. Deploy!

## ⚠️ Compatibility
${isSupported ? '✅ Fully supported' : '⚠️ Limited support - may require additional configuration'}

## 📚 Documentation
${provider.apiDocs}
`;
}
