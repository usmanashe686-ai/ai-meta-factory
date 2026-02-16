import React from 'react';
import { usePlatformStore } from '../state/platform-store';

// Define stack options for each platform
const stacks: Record<string, string[]> = {
  web: ['React', 'Vue', 'Svelte', 'Vanilla JS'],
  mobile: ['React Native', 'Flutter', 'Ionic'],
  desktop: ['Electron', 'Tauri', 'NW.js'],
  game: ['Phaser', 'Unity', 'Godot'],
  api: ['Node.js', 'Python', 'Go', 'Rust'],
  iot: ['Arduino', 'Raspberry Pi', 'ESP32'],
};

export const StackSelector: React.FC = () => {
  const { platform, stack, setStack } = usePlatformStore();

  return (
    <select
      value={stack}
      onChange={(e) => setStack(e.target.value)}
      className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
      title="Select technology stack"
    >
      {stacks[platform]?.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
};
