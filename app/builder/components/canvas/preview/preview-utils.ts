// Utility functions for preview engine
export function isPreviewableFile(path: string): boolean {
  const ignore = ['.env', '.gitignore', 'package-lock.json', 'yarn.lock', 'node_modules/', '.next/', 'dist/', 'build/'];
  return !ignore.some(p => path.includes(p));
}

export function getFileLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string,string> = {js:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',css:'css',scss:'scss',json:'json',md:'markdown',html:'html'};
  return map[ext] || 'javascript';
}
