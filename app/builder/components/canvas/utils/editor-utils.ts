/**
 * Utility functions for the code editor.
 */

// Map file extensions to Monaco language IDs
const extensionToLanguage: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  md: 'markdown',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  dart: 'dart',
  sql: 'sql',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
};

/**
 * Determine Monaco language ID from a filename.
 */
export function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return extensionToLanguage[ext] || 'plaintext';
}

/**
 * Get a human-readable language name from extension (optional).
 */
export function getLanguageName(fileName: string): string {
  const lang = getLanguageFromFileName(fileName);
  const names: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    markdown: 'Markdown',
    python: 'Python',
    ruby: 'Ruby',
    go: 'Go',
    rust: 'Rust',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    php: 'PHP',
    swift: 'Swift',
    kotlin: 'Kotlin',
    dart: 'Dart',
    sql: 'SQL',
    xml: 'XML',
    yaml: 'YAML',
    toml: 'TOML',
    shell: 'Shell',
    plaintext: 'Plain Text',
  };
  return names[lang] || fileName.split('.').pop()?.toUpperCase() || 'Text';
}

/**
 * Simple formatting function (placeholder). In production, you'd integrate Prettier.
 */
export async function formatCode(code: string, language: string): Promise<string> {
  // If you want real formatting, you can integrate prettier here.
  // For now, just trim and return.
  return code.trim();

  /* Example with prettier (needs to be installed):
  const prettier = await import('prettier/standalone');
  const parser = await import('prettier/parser-babel'); // for JS/TS
  return prettier.format(code, { parser: 'babel', plugins: [parser] });
  */
}

/**
 * Check if a file is a text file that can be edited.
 */
export function isEditableFile(fileName: string): boolean {
  const nonEditableExts = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'woff', 'woff2', 'ttf', 'eot', 'pdf'];
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return !nonEditableExts.includes(ext);
}

/**
 * Generate a unique file ID (path-based or UUID). For simplicity, we use path.
 */
export function generateFileId(path: string): string {
  return path.replace(/\//g, '_'); // simple path-based ID, might need escaping
}
