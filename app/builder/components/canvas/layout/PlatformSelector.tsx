'use client';

import { usePlatformStore } from '../state/platform-store';

export type Platform =
  | 'website'
  | 'webapp'
  | 'mobile'
  | 'desktop'
  | 'api'
  | 'bot'
  | 'game'
  | 'iot';

export interface PlatformOption {
  id: Platform;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    id: 'website',
    name: 'Website',
    icon: '🌐',
    description: 'Landing pages, blogs, portfolios',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'webapp',
    name: 'Web App',
    icon: '💻',
    description: 'Dashboards, SaaS, admin panels',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    icon: '📱',
    description: 'Android, iOS, cross-platform',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'desktop',
    name: 'Desktop App',
    icon: '🖥️',
    description: 'Windows, Mac, Linux apps',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'api',
    name: 'API/Backend',
    icon: '🔌',
    description: 'REST APIs, GraphQL, microservices',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'bot',
    name: 'Chatbot',
    icon: '🤖',
    description: 'Discord, Slack, Telegram bots',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'game',
    name: 'Game',
    icon: '🎮',
    description: '2D, 3D, mobile, web games',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'iot',
    name: 'IoT/Smart Device',
    icon: '⚡',
    description: 'Arduino, Raspberry Pi, sensors',
    color: 'from-gray-700 to-gray-900',
  },
];

interface PlatformSelectorProps {
  onSelect?: (platform: Platform) => void;
  selectedPlatform?: Platform | null;
}

export function PlatformSelector({
  onSelect,
  selectedPlatform = null
}: PlatformSelectorProps) {
  const { selectedPlatform: storePlatform, setSelectedPlatform } = usePlatformStore();

  const handleSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    onSelect?.(platform);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Choose your platform
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLATFORM_OPTIONS.map((platform) => {
          const isSelected = selectedPlatform === platform.id || storePlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => handleSelect(platform.id)}
              className={`
                p-5 rounded-xl text-left transition-all duration-300
                bg-gradient-to-br ${platform.color} text-white
                hover:scale-105 hover:shadow-xl
                ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-gray-900' : 'opacity-90'}
                flex flex-col items-start
              `}
            >
              <span className="text-4xl mb-3">{platform.icon}</span>
              <h3 className="font-bold text-lg mb-1">{platform.name}</h3>
              <p className="text-xs opacity-90 line-clamp-2">{platform.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
