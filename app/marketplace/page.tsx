'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '../builder/components/canvas/state/project-store';
import { Search, Heart, Download, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  likes: number;
  downloads: number;
  createdAt: string;
  author: { name: string; image?: string };
}

export default function MarketplacePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const createProjectFromTemplate = useProjectStore((state) => state.createProjectFromTemplate);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [liking, setLiking] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, search, page]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (search) params.append('search', search);
      params.append('page', page.toString());
      const res = await fetch(`/api/templates?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTemplates(data.templates);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (templateId: string) => {
    if (!session) {
      router.push('/login?callbackUrl=/marketplace');
      return;
    }
    setLiking(prev => ({ ...prev, [templateId]: true }));
    try {
      const res = await fetch(`/api/templates/${templateId}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to like');
      setTemplates(prev =>
        prev.map(t => (t.id === templateId ? { ...t, likes: t.likes + 1 } : t))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLiking(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const handleDownload = async (templateId: string) => {
    const res = await fetch(`/api/templates/${templateId}/download`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      alert(`Template downloaded. Contains ${Object.keys(data.files).length} files.`);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      const res = await fetch(`/api/templates/${template.id}`);
      const full = await res.json();
      await createProjectFromTemplate({
        id: full.id,
        name: full.name,
        files: full.files,
        description: full.description,
        category: full.category,
      } as any);
      router.push('/builder');
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const categories = ['all', 'website', 'mobile', 'desktop', 'game', 'iot'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Template Marketplace</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Link
              href="/marketplace/submit"
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Submit Template
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-12">Loading templates...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">{error}</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No templates found. Be the first to submit one!</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowModal(true);
                  }}
                >
                  {template.thumbnail ? (
                    <img src={template.thumbnail} alt={template.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-500">
                      No preview
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{template.description}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-700 rounded capitalize">
                        {template.category}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(template.id);
                          }}
                          disabled={liking[template.id]}
                          className="flex items-center gap-1 hover:text-red-400 transition"
                        >
                          <Heart size={16} className={liking[template.id] ? 'animate-pulse' : ''} />
                          <span>{template.likes}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(template.id);
                          }}
                          className="flex items-center gap-1 hover:text-blue-400 transition"
                        >
                          <Download size={16} />
                          <span>{template.downloads}</span>
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">by {template.author?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded ${page === p ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {selectedTemplate.thumbnail ? (
                    <img src={selectedTemplate.thumbnail} alt={selectedTemplate.name} className="w-full rounded-lg" />
                  ) : (
                    <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                      No preview
                    </div>
                  )}
                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => handleLike(selectedTemplate.id)}
                      className="flex items-center gap-1 text-gray-300 hover:text-red-400"
                    >
                      <Heart size={18} className={liking[selectedTemplate.id] ? 'animate-pulse' : ''} />
                      <span>{selectedTemplate.likes} likes</span>
                    </button>
                    <button
                      onClick={() => handleDownload(selectedTemplate.id)}
                      className="flex items-center gap-1 text-gray-300 hover:text-blue-400"
                    >
                      <Download size={18} />
                      <span>{selectedTemplate.downloads} downloads</span>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 mb-4">{selectedTemplate.description}</p>
                  <p className="text-sm text-gray-400">Author: {selectedTemplate.author?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">
                    Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400">Category: {selectedTemplate.category}</p>
                  <div className="mt-6">
                    <button
                      onClick={() => handleUseTemplate(selectedTemplate)}
                      className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
