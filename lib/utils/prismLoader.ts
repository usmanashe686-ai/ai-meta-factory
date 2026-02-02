/**
 * Dynamically load Prism.js languages to reduce bundle size
 */

const loadedLanguages = new Set<string>();

export async function loadPrismLanguage(language: string): Promise<void> {
  if (typeof window === 'undefined' || loadedLanguages.has(language)) {
    return;
  }

  try {
    switch (language) {
      case 'typescript':
        await import('prismjs/components/prism-typescript');
        break;
      case 'javascript':
        await import('prismjs/components/prism-javascript');
        break;
      case 'tsx':
        await import('prismjs/components/prism-tsx');
        break;
      case 'jsx':
        await import('prismjs/components/prism-jsx');
        break;
      case 'json':
        await import('prismjs/components/prism-json');
        break;
      case 'css':
        await import('prismjs/components/prism-css');
        break;
      case 'scss':
        await import('prismjs/components/prism-scss');
        break;
      case 'python':
        await import('prismjs/components/prism-python');
        break;
      case 'java':
        await import('prismjs/components/prism-java');
        break;
      case 'yaml':
        await import('prismjs/components/prism-yaml');
        break;
      case 'markdown':
        await import('prismjs/components/prism-markdown');
        break;
      case 'bash':
        await import('prismjs/components/prism-bash');
        break;
      case 'sql':
        await import('prismjs/components/prism-sql');
        break;
      case 'graphql':
        await import('prismjs/components/prism-graphql');
        break;
      default:
        return;
    }
    loadedLanguages.add(language);
  } catch (error) {
    console.warn(`Failed to load Prism language: ${language}`, error);
  }
}

export function getLanguageFromFile(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'ts': return 'typescript';
    case 'tsx': return 'tsx';
    case 'js': return 'javascript';
    case 'jsx': return 'jsx';
    case 'json': return 'json';
    case 'css': return 'css';
    case 'scss':
    case 'sass': return 'scss';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'yaml':
    case 'yml': return 'yaml';
    case 'md': return 'markdown';
    case 'html':
    case 'htm': return 'html';
    case 'sh':
    case 'bash': return 'bash';
    case 'sql': return 'sql';
    case 'graphql':
    case 'gql': return 'graphql';
    case 'dockerfile': return 'dockerfile';
    default: return 'plaintext';
  }
}
