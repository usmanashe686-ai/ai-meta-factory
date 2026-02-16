import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../state/project-store';
import { TemplatePreview } from './TemplatePreview';
import { landingPageTemplate } from './website/LandingPageTemplate';
import { socialAppTemplate } from './mobile/SocialAppTemplate';
import { textEditorTemplate } from './desktop/TextEditorTemplate';
import { platformerTemplate } from './game/PlatformerTemplate';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'website' | 'mobile' | 'desktop' | 'game' | 'iot';
  thumbnail?: string;
  files: Record<string, string>;
  stack?: string[];
}

const templates: Template[] = [
  landingPageTemplate,
  socialAppTemplate,
  textEditorTemplate,
  platformerTemplate,
];

export const TemplateLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templates);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const { createProjectFromTemplate } = useProjectStore();

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(t => t.category === selectedCategory));
    }
  }, [selectedCategory]);

  const handleTemplateClick = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleUseTemplate = (template: Template) => {
    createProjectFromTemplate(template);
    setPreviewTemplate(null);
  };

  const categories = ['all', 'website', 'mobile', 'desktop', 'game', 'iot'];

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Template Library</h2>
      <div className="flex space-x-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition cursor-pointer"
            onClick={() => handleTemplateClick(template)}
          >
            {template.thumbnail ? (
              <img src={template.thumbnail} alt={template.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gray-700 flex items-center justify-center text-gray-500">
                No preview
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{template.name}</h3>
              <p className="text-sm text-gray-400">{template.description}</p>
              {template.stack && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.stack.map(tech => (
                    <span key={tech} className="px-2 py-1 bg-gray-700 rounded text-xs">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <TemplatePreview
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={handleUseTemplate}
      />
    </div>
  );
};
