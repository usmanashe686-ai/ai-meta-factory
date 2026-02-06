"use client";

import { loader } from '@monaco-editor/react';

// Configure Monaco Editor for Next.js
export function configureMonaco() {
  if (typeof window !== 'undefined') {
    loader.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
      }
    });
  }
}

// Load Monaco only on client
export function useMonaco() {
  if (typeof window === 'undefined') {
    return { isClient: false };
  }
  
  return { isClient: true };
}
