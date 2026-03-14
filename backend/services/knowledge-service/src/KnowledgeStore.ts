import { ChromaClient, Collection } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';

export interface KnowledgeDocument {
  id?: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export class KnowledgeStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private collectionName: string;

  constructor(collectionName: string = 'project-knowledge') {
    this.collectionName = collectionName;
    // ChromaDB client defaults to http://ai-meta-factory.onrender.com (the default server port)
    this.client = new ChromaClient();
  }

  /**
   * Initialize the collection (create if not exists)
   */
  async initialize(): Promise<void> {
    try {
      // List existing collections
      const collections = await this.client.listCollections();
      const exists = collections.some(c => c.name === this.collectionName);
      if (exists) {
        this.collection = await this.client.getCollection({ name: this.collectionName });
      } else {
        this.collection = await this.client.createCollection({ name: this.collectionName });
      }
      console.log(`Knowledge store initialized with collection: ${this.collectionName}`);
    } catch (error) {
      console.error('Failed to initialize ChromaDB collection:', error);
      throw error;
    }
  }

  /**
   * Add a document to the knowledge store
   */
  async addDocument(doc: KnowledgeDocument): Promise<string> {
    if (!this.collection) await this.initialize();
    if (!this.collection) throw new Error('Collection not initialized');

    const id = doc.id || uuidv4();
    const metadata = doc.metadata || {};
    // ChromaDB requires metadata to be flat and values must be strings, numbers, or booleans
    const flatMetadata: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        flatMetadata[key] = value;
      }
    }

    await this.collection.add({
      ids: [id],
      documents: [doc.content],
      metadatas: [flatMetadata],
      // embeddings can be provided if you have precomputed embeddings, otherwise Chroma will compute using its default embedding function
    });
    return id;
  }

  /**
   * Search for documents similar to a query
   */
  async search(query: string, nResults: number = 5): Promise<Array<{ content: string; metadata?: Record<string, any>; distance?: number }>> {
    if (!this.collection) await this.initialize();
    if (!this.collection) throw new Error('Collection not initialized');

    const results = await this.collection.query({
      queryTexts: [query],
      nResults,
    });

    // Format results
    const formatted: Array<{ content: string; metadata?: Record<string, any>; distance?: number }> = [];
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        formatted.push({
          content: results.documents[0][i],
          metadata: results.metadatas?.[0]?.[i] || {},
          distance: results.distances?.[0]?.[i],
        });
      }
    }
    return formatted;
  }

  /**
   * Delete a document by ID
   */
  async deleteDocument(id: string): Promise<void> {
    if (!this.collection) await this.initialize();
    if (!this.collection) throw new Error('Collection not initialized');
    await this.collection.delete({ ids: [id] });
  }

  /**
   * List all documents in the store (may be heavy)
   */
  async listAll(): Promise<Array<{ id: string; content: string; metadata?: Record<string, any> }>> {
    if (!this.collection) await this.initialize();
    if (!this.collection) throw new Error('Collection not initialized');
    // Use collection.get() to retrieve all documents
    try {
      const all = await this.collection.get();
      const items: Array<{ id: string; content: string; metadata?: Record<string, any> }> = [];
      if (all.ids) {
        for (let i = 0; i < all.ids.length; i++) {
          items.push({
            id: all.ids[i],
            content: all.documents?.[i] || '',
            metadata: all.metadatas?.[i] || {},
          });
        }
      }
      return items;
    } catch (e) {
      console.error('Failed to get all documents:', e);
      return [];
    }
  }

  /**
   * Delete the entire collection
   */
  async deleteCollection(): Promise<void> {
    if (this.collection) {
      await this.client.deleteCollection({ name: this.collectionName });
      this.collection = null;
    }
  }
}
