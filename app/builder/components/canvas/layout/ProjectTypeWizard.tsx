'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Platform, PlatformSelector } from './PlatformSelector';
import { useProjectStore } from '../../state/project-store';

type WizardStep = 'platform' | 'template' | 'details' | 'review';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Mock templates – replace with actual API call later
const TEMPLATES_BY_PLATFORM: Record<Platform, Template[]> = {
  website: [
    { id: 'landing', name: 'Landing Page', description: 'Convert visitors to customers', icon: '📄' },
    { id: 'blog', name: 'Blog', description: 'Share articles and updates', icon: '✍️' },
    { id: 'portfolio', name: 'Portfolio', description: 'Showcase your work', icon: '🎨' },
  ],
  webapp: [
    { id: 'dashboard', name: 'Admin Dashboard', description: 'Analytics and management', icon: '📊' },
    { id: 'saas', name: 'SaaS Starter', description: 'Subscription-based app', icon: '💳' },
    { id: 'crm', name: 'CRM', description: 'Customer relationship management', icon: '👥' },
  ],
  mobile: [
    { id: 'social', name: 'Social App', description: 'Connect with friends', icon: '💬' },
    { id: 'fitness', name: 'Fitness Tracker', description: 'Track workouts and health', icon: '🏃' },
    { id: 'ecommerce', name: 'E‑commerce', description: 'Mobile storefront', icon: '🛍️' },
  ],
  desktop: [
    { id: 'editor', name: 'Text Editor', description: 'Code or document editor', icon: '📝' },
    { id: 'media', name: 'Media Player', description: 'Audio/video player', icon: '🎵' },
    { id: 'utility', name: 'Utility Tool', description: 'System utility', icon: '🔧' },
  ],
  api: [
    { id: 'rest', name: 'REST API', description: 'Standard REST endpoints', icon: '🔗' },
    { id: 'graphql', name: 'GraphQL API', description: 'Flexible queries', icon: '⚡' },
    { id: 'websocket', name: 'WebSocket Server', description: 'Real‑time communication', icon: '🔄' },
  ],
  bot: [
    { id: 'discord', name: 'Discord Bot', description: 'Moderation, games', icon: '🎮' },
    { id: 'slack', name: 'Slack Bot', description: 'Workflow automation', icon: '💼' },
    { id: 'telegram', name: 'Telegram Bot', description: 'Notification bot', icon: '📱' },
  ],
  game: [
    { id: '2d', name: '2D Platformer', description: 'Classic side‑scroller', icon: '👾' },
    { id: 'puzzle', name: 'Puzzle Game', description: 'Match‑3, brain teasers', icon: '🧩' },
    { id: 'endless', name: 'Endless Runner', description: 'Infinite runner', icon: '🏃' },
  ],
  iot: [
    { id: 'smart-home', name: 'Smart Home Hub', description: 'Control lights, thermostats', icon: '🏠' },
    { id: 'sensor', name: 'Sensor Monitor', description: 'Read temperature, humidity', icon: '🌡️' },
    { id: 'automation', name: 'Automation Script', description: 'Trigger actions', icon: '⚙️' },
  ],
};

export function ProjectTypeWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const { createProject } = useProjectStore();

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setCurrentStep('template');
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentStep('details');
  };

  const handleCreateProject = async () => {
    if (!selectedPlatform || !selectedTemplate || !projectName.trim()) return;

    const newProject = {
      name: projectName,
      description: projectDescription,
      platform: selectedPlatform,
      template: selectedTemplate.id,
      files: {
        'README.md': `# ${projectName}\n\n${projectDescription}\n\nBuilt with AI Meta Factory.`,
        'index.tsx': '// Start coding here...',
      },
    };

    await createProject(newProject);
    router.push('/builder');
  };

  const goBack = () => {
    if (currentStep === 'template') setCurrentStep('platform');
    if (currentStep === 'details') setCurrentStep('template');
    if (currentStep === 'review') setCurrentStep('details');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['platform', 'template', 'details', 'review'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : index < ['platform', 'template', 'details', 'review'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={`
                    w-16 h-1 mx-2 rounded
                    ${
                      index < ['platform', 'template', 'details', 'review'].indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Platform</span>
          <span>Template</span>
          <span>Details</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 'platform' && (
          <div>
            <PlatformSelector onSelect={handlePlatformSelect} />
          </div>
        )}

        {currentStep === 'template' && selectedPlatform && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Choose a template
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMPLATES_BY_PLATFORM[selectedPlatform]?.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-left transition"
                >
                  <span className="text-3xl mb-2 block">{template.icon}</span>
                  <h3 className="font-bold text-gray-800 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'details' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Project details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome App"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="What does your app do?"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Review your project
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl space-y-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Platform</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {selectedPlatform}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Template</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedTemplate?.name}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Project name</span>
                <p className="font-medium text-gray-900 dark:text-white">{projectName}</p>
              </div>
              {projectDescription && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                  <p className="text-gray-700 dark:text-gray-300">{projectDescription}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {currentStep !== 'platform' && (
          <button
            onClick={goBack}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← Back
          </button>
        )}
        {currentStep === 'details' && (
          <button
            onClick={() => setCurrentStep('review')}
            disabled={!projectName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            Review →
          </button>
        )}
        {currentStep === 'review' && (
          <button
            onClick={handleCreateProject}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ml-auto"
          >
            Create Project 🚀
          </button>
        )}
      </div>
    </div>
  );
}
