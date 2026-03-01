import { useState, useCallback } from 'react';
import { apiFetch } from "@/lib/apiClient";

interface UseLocalAIReturn {
  generate: (prompt: string, context?: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  result: string | null;
  source: string | null;
}

export function useLocalAI(): UseLocalAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, context?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/ai/real-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });
      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      setResult(data.suggestion);
      setSource(data.source);
      return data.suggestion;
    } catch (err: any) {
      setError(err.message);
      return '';
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generate, isLoading, error, result, source };
}
