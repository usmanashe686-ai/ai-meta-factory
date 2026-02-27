import { create } from 'zustand';
import localforage from 'localforage';

export interface ProjectDoc {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

interface DocsState {
  docs: ProjectDoc[];
  selectedDocId: string | null;
  loadDocs: () => Promise<void>;
  addDoc: (title: string, content: string, tags?: string[]) => Promise<void>;
  updateDoc: (id: string, updates: Partial<ProjectDoc>) => Promise<void>;
  deleteDoc: (id: string) => Promise<void>;
  setSelectedDocId: (id: string | null) => void;
}

const docsStorage = localforage.createInstance({
  name: 'ai-meta-factory',
  storeName: 'project-docs',
});

export const useDocsStore = create<DocsState>((set, get) => ({
  docs: [],
  selectedDocId: null,

  loadDocs: async () => {
    const keys = await docsStorage.keys();
    const docs: ProjectDoc[] = [];
    for (const key of keys) {
      const doc = await docsStorage.getItem<ProjectDoc>(key);
      if (doc) docs.push(doc);
    }
    docs.sort((a, b) => b.updatedAt - a.updatedAt);
    set({ docs });
  },

  addDoc: async (title, content, tags = []) => {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const doc: ProjectDoc = { id, title, content, createdAt: now, updatedAt: now, tags };
    await docsStorage.setItem(id, doc);
    const { docs } = get();
    set({ docs: [doc, ...docs] });
  },

  updateDoc: async (id, updates) => {
    const { docs } = get();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return;
    const updated = { ...docs[index], ...updates, updatedAt: Date.now() };
    await docsStorage.setItem(id, updated);
    const newDocs = [...docs];
    newDocs[index] = updated;
    set({ docs: newDocs.sort((a, b) => b.updatedAt - a.updatedAt) });
  },

  deleteDoc: async (id) => {
    await docsStorage.removeItem(id);
    const { docs, selectedDocId } = get();
    set({ docs: docs.filter(d => d.id !== id), selectedDocId: selectedDocId === id ? null : selectedDocId });
  },

  setSelectedDocId: (id) => set({ selectedDocId: id }),
}));
