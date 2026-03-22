export interface DiffChange {
  type: 'add' | 'remove' | 'context';
  content: string;
}

export interface DiffHunk {
  id: string;
  header: string;
  content: string; // Raw unified diff format for applyPatch
  changes: DiffChange[];
}

export const parseDiffIntoHunks = (diffContent: string): DiffHunk[] => {
  const hunks: DiffHunk[] = [];
  const lines = diffContent.split('\n');
  let currentHunk: DiffHunk | null = null;

  for (const line of lines) {
    // Detect Hunk Header (e.g., @@ -1,4 +1,5 @@)
    if (line.startsWith('@@')) {
      if (currentHunk) hunks.push(currentHunk);
      
      currentHunk = {
        id: Math.random().toString(36).substring(7),
        header: line,
        content: line + '\n',
        changes: []
      };
      continue;
    }

    if (currentHunk) {
      currentHunk.content += line + '\n';
      
      if (line.startsWith('+')) {
        currentHunk.changes.push({ type: 'add', content: line.slice(1) });
      } else if (line.startsWith('-')) {
        currentHunk.changes.push({ type: 'remove', content: line.slice(1) });
      } else {
        currentHunk.changes.push({ type: 'context', content: line.slice(1) });
      }
    }
  }

  if (currentHunk) hunks.push(currentHunk);
  return hunks;
};
