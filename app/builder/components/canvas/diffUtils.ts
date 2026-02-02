/**
 * Git-style diff utilities for comparing file contents
 * PURE FUNCTIONS ONLY - No side effects, no React dependencies
 */

export type DiffLine = {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber?: number
}

export type FileDiff = {
  fileName: string
  lines: DiffLine[]
  hasChanges: boolean
  added: number
  removed: number
}

/**
 * Compare two strings line by line (Myers diff algorithm simplified)
 * Returns array of DiffLine objects marking each line's change type
 */
export function computeLineDiff(
  oldContent: string,
  newContent: string
): DiffLine[] {
  if (oldContent === newContent) {
    return oldContent.split('\n').map(line => ({
      type: 'unchanged' as const,
      content: line
    }))
  }

  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const result: DiffLine[] = []

  let i = 0, j = 0
  const maxI = oldLines.length
  const maxJ = newLines.length

  while (i < maxI || j < maxJ) {
    if (i < maxI && j < maxJ && oldLines[i] === newLines[j]) {
      // Lines are identical
      result.push({
        type: 'unchanged',
        content: oldLines[i]
      })
      i++
      j++
    } else if (j < maxJ && (i >= maxI || oldLines[i] !== newLines[j])) {
      // Added line
      result.push({
        type: 'added',
        content: newLines[j]
      })
      j++
    } else if (i < maxI && (j >= maxJ || oldLines[i] !== newLines[j])) {
      // Removed line
      result.push({
        type: 'removed',
        content: oldLines[i]
      })
      i++
    }
  }

  return result
}

/**
 * Compare two file sets and generate diffs for each file
 */
export function computeFileDiffs(
  baseFiles: Record<string, string>,
  currentFiles: Record<string, string>
): FileDiff[] {
  const allFileNames = new Set([
    ...Object.keys(baseFiles),
    ...Object.keys(currentFiles)
  ])

  return Array.from(allFileNames).map(fileName => {
    const oldContent = baseFiles[fileName] || ''
    const newContent = currentFiles[fileName] || ''
    const lines = computeLineDiff(oldContent, newContent)
    
    const added = lines.filter(l => l.type === 'added').length
    const removed = lines.filter(l => l.type === 'removed').length
    
    return {
      fileName,
      lines,
      hasChanges: added > 0 || removed > 0,
      added,
      removed
    }
  }).filter(diff => diff.hasChanges) // Only show files with changes
}

/**
 * Get summary statistics for all file diffs
 */
export function getDiffSummary(diffs: FileDiff[]): {
  totalAdded: number
  totalRemoved: number
  filesChanged: number
} {
  return {
    totalAdded: diffs.reduce((sum, diff) => sum + diff.added, 0),
    totalRemoved: diffs.reduce((sum, diff) => sum + diff.removed, 0),
    filesChanged: diffs.length
  }
}
