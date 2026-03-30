export interface AIModel {
  localPath?: string;
  id: string;
  name: string;
  size: string;
  url: string;
  description: string;
  minRam: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'tinyllama-1.1b',
    name: 'Ultra Light (Basic AI)',
    size: '280MB',
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q2_K.gguf',
    description: 'Minimal battery drain. Good for simple code explanations.',
    minRam: '2GB'
  },
  {
    id: 'phi-2-orange',
    name: 'Smart AI (Medium)',
    size: '1.6GB',
    url: 'https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf',
    description: 'Better logic and coding skills. Recommended for most tasks.',
    minRam: '4GB'
  },
  {
    id: 'mistral-7b-v0.2',
    name: 'Pro AI (Heavy)',
    size: '4.1GB',
    url: 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf',
    description: 'Best for complex architecture and deep debugging.',
    minRam: '8GB'
  }
];
