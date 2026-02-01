"use client";

import { TECH_STACKS, DATABASES, GIT_PROVIDERS, validateStackDatabaseCompatibility } from '@/lib/registry';

interface EnhancedStackSelectorProps {
  selectedStack: string;
  selectedDatabase: string;
  selectedGitProvider: string;
  onStackChange: (stack: string) => void;
  onDatabaseChange: (database: string) => void;
  onGitProviderChange: (provider: string) => void;
}

export default function EnhancedStackSelector({
  selectedStack,
  selectedDatabase,
  selectedGitProvider,
  onStackChange,
  onDatabaseChange,
  onGitProviderChange
}: EnhancedStackSelectorProps) {

  const isCompatible = validateStackDatabaseCompatibility(selectedStack, selectedDatabase);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Tech Stack */}
        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>⚙️</span>
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(TECH_STACKS).map((stack: any) => (
              <button
                key={stack.id}
                onClick={() => onStackChange(stack.id)}
                className={`px-4 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  selectedStack === stack.id
                    ? `bg-gradient-to-r ${stack.color} text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{stack.icon}</span>
                <span>{stack.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Database Selector */}
        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>🗄️</span>
            Database
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(DATABASES).map((db: any) => (
              <button
                key={db.id}
                onClick={() => onDatabaseChange(db.id)}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  selectedDatabase === db.id
                    ? `bg-gradient-to-r ${db.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{db.icon}</span>
                <span>{db.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Git Provider */}
        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>🔗</span>
            Git Provider
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(GIT_PROVIDERS).map((provider: any) => (
              <button
                key={provider.id}
                onClick={() => onGitProviderChange(provider.id)}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  selectedGitProvider === provider.id
                    ? `bg-gradient-to-r ${provider.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{provider.icon}</span>
                <span>{provider.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compatibility Warning */}
      {!isCompatible && selectedDatabase !== 'none' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="font-bold text-yellow-800 mb-1">⚠️ Compatibility Warning</div>
          <div className="text-sm text-yellow-700">
            {TECH_STACKS[selectedStack as keyof typeof TECH_STACKS]?.label} and {DATABASES[selectedDatabase as keyof typeof DATABASES]?.label} may not be fully compatible. Consider choosing a different database or stack.
          </div>
        </div>
      )}
    </div>
  );
}
