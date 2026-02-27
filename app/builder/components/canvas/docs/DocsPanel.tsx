'use client';

import React, { useEffect, useState } from 'react';
import { useDocsStore } from '../state/docs-store';
import { FileText, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface DocsPanelProps {
  onClose?: () => void;
}

export const DocsPanel: React.FC<DocsPanelProps> = ({ onClose }) => {
  const { docs, selectedDocId, loadDocs, addDoc, updateDoc, deleteDoc, setSelectedDocId } = useDocsStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    loadDocs();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    await addDoc(title, content, tags);
    setIsCreating(false);
    setTitle('');
    setContent('');
    setTagsInput('');
  };

  const handleUpdate = async (id: string) => {
    await updateDoc(id, { title, content, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) });
    setEditingId(null);
    setTitle('');
    setContent('');
    setTagsInput('');
  };

  const startEdit = (doc: typeof docs[0]) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setTagsInput(doc.tags.join(', '));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Project Docs</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-gray-700 rounded"
            title="New document"
          >
            <Plus size={16} />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded" title="Close">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-2 p-2 bg-gray-700 rounded text-sm"
          />
          <textarea
            placeholder="Content (supports markdown)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full mb-2 p-2 bg-gray-700 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full mb-2 p-2 bg-gray-700 rounded text-sm"
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-3 py-1 bg-green-600 rounded text-sm flex items-center gap-1">
              <Check size={14} /> Save
            </button>
            <button onClick={() => setIsCreating(false)} className="px-3 py-1 bg-gray-600 rounded text-sm flex items-center gap-1">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {docs.map(doc => (
          <div key={doc.id} className="bg-gray-800 p-2 rounded">
            {editingId === doc.id ? (
              <div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mb-2 p-2 bg-gray-700 rounded text-sm"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full mb-2 p-2 bg-gray-700 rounded text-sm"
                />
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full mb-2 p-2 bg-gray-700 rounded text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(doc.id)} className="px-2 py-1 bg-green-600 rounded text-xs">Save</button>
                  <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-600 rounded text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedDocId(doc.id)}>
                    <h4 className="font-medium text-sm">{doc.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{doc.content}</p>
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doc.tags.map(tag => (
                          <span key={tag} className="px-1 py-0.5 bg-gray-700 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(doc)} className="p-1 hover:bg-gray-700 rounded">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => deleteDoc(doc.id)} className="p-1 hover:bg-red-600 rounded">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
