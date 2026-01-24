export interface CanvasComponent {
  id: string;
  type: 'container' | 'text' | 'button' | 'input' | 'card' | 'navbar' | 'custom';
  content: string;
  position: { x: number; y: number };
  styles: Record<string, string>;
  code?: string;
  aiGenerated?: boolean;
}

export interface AIResponse {
  code: string;
  componentType: string;
  styles: Record<string, string>;
  explanation: string;
}

export interface Project {
  id: string;
  name: string;
  components: CanvasComponent[];
  createdAt: Date;
  updatedAt: Date;
}

export type OutputType = 'react' | 'full-app' | 'apk';
