'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '../state/project-store';
import { debounce } from 'lodash'; // You may need to install lodash: npm install lodash @types/lodash

/**
 * Custom hook that auto-saves the active file after a delay when content changes.
 * @param delay - Debounce delay in milliseconds (default: 2000)
 */
export function useAutosave(delay: number = 2000) {
  const { activeFileId, files, saveCurrentFile, updateFileContent } = useProjectStore();
  const lastContentRef = useRef<string>('');
  const isSavingRef = useRef(false);

  // Find active file content
  const activeFile = activeFileId
    ? (() => {
        const findFile = (nodes: any[], id: string): any => {
          for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
              const found = findFile(node.children, id);
              if (found) return found;
            }
          }
          return null;
        };
        return findFile(files, activeFileId);
      })()
    : null;

  const currentContent = activeFile?.content || '';

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      try {
        await saveCurrentFile();
      } catch (error) {
        console.error('Autosave failed:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, delay),
    [saveCurrentFile, delay]
  );

  // Trigger save when content changes
  useEffect(() => {
    if (!activeFileId) return;

    // Avoid saving if content hasn't actually changed (e.g., initial load)
    if (currentContent === lastContentRef.current) return;

    lastContentRef.current = currentContent;
    debouncedSave();

    // Cleanup debounce on unmount or when dependencies change
    return () => {
      debouncedSave.cancel();
    };
  }, [currentContent, activeFileId, debouncedSave]);

  // Optional: immediate save on component unmount for the last changes
  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);
}
