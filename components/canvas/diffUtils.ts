export type DiffLine = {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  lineNumber?: number;
};

export type FileDiff = {
  fileName: string;
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
};

export function diffText(
  before: string = '',
  after: string = ''
): DiffLine[] {
  if (before === after) {
    return after.split('\n').map((line, i) => ({
      type: 'unchanged',
      value: line,
      lineNumber: i + 1
    }));
  }

  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const result: DiffLine[] = [];
  
  let i = 0, j = 0;
  
  while (i < beforeLines.length || j < afterLines.length) {
    if (i < beforeLines.length && j < afterLines.length && beforeLines[i] === afterLines[j]) {
      result.push({
        type: 'unchanged',
        value: beforeLines[i],
        lineNumber: i + 1
      });
      i++;
      j++;
    } else if (j < afterLines.length && (i >= beforeLines.length || beforeLines[i] !== afterLines[j])) {
      result.push({
        type: 'added',
        value: afterLines[j],
        lineNumber: j + 1
      });
      j++;
    } else if (i < beforeLines.length && (j >= afterLines.length || beforeLines[i] !== afterLines[j])) {
      result.push({
        type: 'removed',
        value: beforeLines[i],
        lineNumber: i + 1
      });
      i++;
    }
  }
  
  return result;
}

export function diffFiles(
  before: Record<string, string>,
  after: Record<string, string>
): FileDiff[] {
  const allFiles = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {})
  ]);

  const diffs: FileDiff[] = [];

  allFiles.forEach(fileName => {
    const beforeContent = before[fileName] || '';
    const afterContent = after[fileName] || '';
    const lines = diffText(beforeContent, afterContent);
    
    const addedCount = lines.filter(l => l.type === 'added').length;
    const removedCount = lines.filter(l => l.type === 'removed').length;
    
    if (addedCount > 0 || removedCount > 0) {
      diffs.push({
        fileName,
        lines,
        addedCount,
        removedCount
      });
    }
  });

  return diffs;
}
