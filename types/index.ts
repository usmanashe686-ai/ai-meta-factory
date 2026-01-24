export interface Component {
  id: string;
  type: string;
  content: string;
  position: { x: number; y: number };
  styles: Record<string, string>;
}

export interface Project {
  id: string;
  name: string;
  components: Component[];
  createdAt: Date;
  updatedAt: Date;
}
