import { extractImports, isRelatedByImport } from './dependency-graph';

export interface ScoredFile {
  path: string;
  content: string;
  score: number;
}

export const scoreFiles = (activeFile: {path: string, content: string}, allFiles: any[]): ScoredFile[] => {
  const activeImports = extractImports(activeFile.content);
  
  return allFiles.map(file => {
    let score = 0;
    const content = file.content ?? '';
    
    // 1. Direct Match (Highest)
    if (file.path === activeFile.path) score += 100;
    
    // 2. Logical Dependency (High - The "Import" Boost)
    if (isRelatedByImport(file.path, activeImports)) score += 40;
    
    // 3. Geographic Proximity (Medium)
    const activeDir = activeFile.path.split('/').slice(0, -1).join('/');
    const fileDir = file.path.split('/').slice(0, -1).join('/');
    if (activeDir === fileDir && file.path !== activeFile.path) score += 20;

    return { path: file.path, content, score };
  }).sort((a, b) => b.score - a.score);
};
