'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '../builder/components/canvas/state/project-store';
import { Search, Filter, Heart, Download, X, Eye } from 'lucide-react';

interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar?: string;
  thumbnail?: string;
  category: 'website' | 'mobile' | 'desktop' | 'game' | 'iot';
  likes: number;
  downloads: number;
  createdAt: string;
  files: Record<string, string>;
}

export default function MarketplacePage() {
  const router = useRouter();
  const createProjectFromTemplate = useProjectStore((state) => state.createProjectFromTemplate);
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [filtered, setFiltered] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock data – replace with API call
  useEffect(() => {
    const mockTemplates: MarketplaceTemplate[] = [
      {
        id: '1',
        name: 'Minimal Blog',
        description: 'A clean, responsive blog template built with Next.js and Tailwind.',
        author: 'Jane Doe',
        category: 'website',
        likes: 42,
        downloads: 128,
        createdAt: new Date().toISOString(),
        files: {
          'index.tsx': 'export default function Home() { return <div>Hello</div> }',
        },
      },
      {
        id: '2',
        name: 'Fitness Tracker',
        description: 'Mobile app template for tracking workouts and health metrics.',
        author: 'John Smith',
        category: 'mobile',
        likes: 28,
        downloads: 75,
        createdAt: new Date().toISOString(),
        files: {},
      },
      {
        id: '3',
        name: 'Task Manager',
        description: 'A simple but powerful task management desktop app.',
        author: 'Alice Johnson',
        category: 'desktop',
        likes: 35,
        downloads: 92,
        createdAt: new Date().toISOString(),
        files: {},
      },
      {
        id: '4',
        name: 'Platformer Starter',
        description: 'Basic platformer game with Phaser 3.',
        author: 'Bob Brown',
        category: 'game',
        likes: 53,
        downloads: 210,
        createdAt: new Date().toISOString(),
        files: {},
      },
      {
        id: '5',
        name: 'Smart Home Dashboard',
        description: 'IoT dashboard to control lights and sensors.',
        author: 'Carol White',
        category: 'iot',
        likes: 19,
        downloads: 41,
        createdAt: new Date().toISOString(),
        files: {},
      },
    ];
    setTemplates(mockTemplates);
    setFiltered(mockTemplates);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = templates;
    if (search) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    setFiltered(filtered);
  }, [search, selectedCategory, templates]);

  const handleUseTemplate = async (template: MarketplaceTemplate) => {
    try {
      // Convert marketplace template to the expected format (need to map files)
      // For now, assume it's compatible
      const projectId = await createProjectFromTemplate(template);
      router.push('/builder');
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const categories = ['all', 'website', 'mobile', 'desktop', 'game', 'iot'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
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
            <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
              Submit Template
            </button>
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-12">Loading templates...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No templates found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((template) => (
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
                      <div className="flex items-center gap-1">
                        <Heart size={16} />
                        <span>{template.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download size={16} />
                        <span>{template.downloads}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">by {template.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Preview modal */}
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
                    <div className="flex items-center gap-1 text-gray-300">
                      <Heart size={18} className="text-red-400" />
                      <span>{selectedTemplate.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Download size={18} className="text-blue-400" />
                      <span>{selectedTemplate.downloads} downloads</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 mb-4">{selectedTemplate.description}</p>
                  <p className="text-sm text-gray-400">Author: {selectedTemplate.author}</p>
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
