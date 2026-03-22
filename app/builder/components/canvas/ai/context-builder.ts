import { estimateTokens } from './context-engine/tokenizer';
import { scoreFiles } from './context-engine/relevance';

const MAX_TOKENS = 3500; // Adjusted for local LLM comfort

export const buildAIContext = (options: { activeFile: any, allFiles: any[] }): string => {
  const { activeFile, allFiles } = options;
  const scored = scoreFiles(activeFile.path, allFiles);
  
  let currentTokens = 0;
  let contextParts: string[] = [];

  // Add Project Map (High level overview)
  const map = `PROJECT STRUCTURE:\n${allFiles.map(f => f.path).join('\n')}\n\n`;
  contextParts.push(map);
  currentTokens += estimateTokens(map);

  for (const file of scored) {
    const fileHeader = `--- FILE: ${file.path} ---\n`;
    const content = file.content;
    const fileTokens = estimateTokens(fileHeader + content);

    // If it's the active file, we MUST include it (or at least the first 2k tokens)
    if (file.path === activeFile.path) {
      contextParts.push(fileHeader + content);
      currentTokens += fileTokens;
      continue;
    }

    // For other files, only include them if we have budget
    if (currentTokens + fileTokens < MAX_TOKENS) {
      contextParts.push(fileHeader + content);
      currentTokens += fileTokens;
    } else {
      // 💡 Future upgrade: Skeletonize the file instead of skipping
      console.log(`Skipping ${file.path} - Token budget exceeded.`);
    }
  }

  return contextParts.join('\n');
};
