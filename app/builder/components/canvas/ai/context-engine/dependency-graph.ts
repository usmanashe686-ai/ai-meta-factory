export const extractImports = (content: string): string[] => {
  // Regex to catch standard ES6 and CommonJS imports
  const importRegex = /(?:import|from|require)\s+['"]([^'"]+)['"]/g;
  const matches: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    // Extract the clean path (e.g., './utils' or '@/lib/api')
    matches.push(match[1]);
  }
  return matches;
};

export const isRelatedByImport = (filePath: string, activeImports: string[]): boolean => {
  const fileName = filePath.split('/').pop()?.split('.')[0] || '';
  return activeImports.some(imp => imp.includes(fileName));
};
