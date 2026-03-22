interface ContextOptions {
  activeFile: { path: string; content: string };
  allFiles: Array<{ path: string; content: string }>;
  recentFilePaths?: string[];
}

export const buildAIContext = (options: ContextOptions): string => {
  const { activeFile, allFiles, recentFilePaths = [] } = options;

  // 1. File Tree Summary (helps AI understand project structure)
  const fileTree = allFiles.map(f => `- ${f.path}`).join('\n');

  // 2. Focused Context (Active File + Recent Files)
  const relatedFiles = allFiles
    .filter(f => recentFilePaths.includes(f.path) && f.path !== activeFile.path)
    .map(f => `File: ${f.path}\nContent:\n${f.content}\n---`)
    .join('\n\n');

  return `
PROJECT STRUCTURE:
${fileTree}

ACTIVE FILE (${activeFile.path}):
${activeFile.content}

RELATED CONTEXT:
${relatedFiles}

INSTRUCTION:
You are an expert developer. Return ONLY a valid Unified Diff. 
Do not include explanations outside the diff format.
  `.trim();
};
