import { API_BASE_URL } from "@/lib/apiConfig";
import { create } from 'zustand';
import { useSessionStore } from './session-store';

export interface LocalAIState {
  availableModels: any[];
  currentModel: any | null;
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, provider?: string, options?: any, onToken?: (token: string) => void) => Promise<string>;
  // ... other existing signatures
}

export const useLocalAIStore = create<LocalAIState>((set, get) => ({
  availableModels: [],
  currentModel: null,
  isLoading: false,
  error: null,

  generate: async (prompt, provider = 'auto', options, onToken) => {
    const { currentModel } = get();
    const modelId = currentModel?.id || 'tinyllama-1.1b';
    
    // 1. TIMEOUT & ABORT CONTROL
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeout || 90000);
    
    set({ isLoading: true, error: null });

    const endpoint = onToken 
      ? `${API_BASE_URL}/ai/generate-stream` 
      : `${API_BASE_URL}/ai/generate`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt,
          model: modelId,
          provider,
          stream: !!onToken,
          max_tokens: options?.max_tokens || 2000,
          temperature: options?.temperature ?? 0.2,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      if (onToken && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let isDone = false;

        while (!isDone) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ""; // Keep partial line

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine.startsWith('data: ')) continue;
            
            const rawData = cleanLine.replace('data: ', '');
            
            // 2. CLEAN TERMINATION
            if (rawData === '[DONE]') {
              isDone = true;
              reader.cancel();
              break;
            }

            try {
              const parsed = JSON.parse(rawData);
              const token = parsed.token || parsed.content || parsed.text || "";
              fullContent += token;
              onToken(token);
            } catch (e) {
              console.warn("SSE Parse Error:", { line: cleanLine, error: e });
            }
          }
        }

        // 3. FINAL BUFFER FLUSH (Critical for trailing code)
        if (buffer.startsWith('data: ')) {
          const rawData = buffer.replace('data: ', '');
          if (rawData !== '[DONE]') {
            try {
              const parsed = JSON.parse(rawData);
              const token = parsed.token || parsed.content || parsed.text || "";
              fullContent += token;
              onToken(token);
            } catch {}
          }
        }

        return fullContent;
      }

      const data = await response.json();
      return data.result || data.text || '';

    } catch (err: any) {
      // 4. SMART FALLBACK
      if (err.name === 'AbortError') {
        set({ error: "Request timed out. Try a smaller task." });
      } else if (onToken) {
        console.error("Streaming failed, attempting non-stream fallback...");
        return await get().generate(prompt, provider, { ...options, timeout: 30000 });
      } else {
        set({ error: err.message });
      }
      return "";
    } finally {
      clearTimeout(timeout);
      set({ isLoading: false });
    }
  },
  // ... rest of implementation
}));
