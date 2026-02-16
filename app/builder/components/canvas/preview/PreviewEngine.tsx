"use client";

import { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { usePlatformStore } from '../state/platform-store';

export function PreviewEngine() {
  const { platform, stack } = usePlatformStore();
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'building' | 'running' | 'error' | 'success'>('idle');

  const statusColors: Record<string, string> = {
    idle: 'bg-gray-500',
    building: 'bg-yellow-500',
    running: 'bg-green-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  const buildPreview = async () => {
    setIsBuilding(true);
    setStatus('building');

    try {
      // Simulate build process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus('running');
      setPreviewUrl(`#preview-${Date.now()}`);

      // Simulate successful build
      setTimeout(() => {
        setStatus('success');
      }, 1000);
    } catch (error) {
      console.error('Preview build error:', error);
      setStatus('error');
    } finally {
      setIsBuilding(false);
    }
  };

  useEffect(() => {
    buildPreview();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'building':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'running':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4" />;
    }
  };

  const getDisplayName = () => {
    // Use stack if available, otherwise platform
    if (stack && stack !== 'none') {
      return stack.charAt(0).toUpperCase() + stack.slice(1);
    }
    return platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Web';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-gray-500'} animate-pulse`}></div>
          <span className="text-sm font-medium">Live Preview</span>
          <span className="text-xs px-2 py-0.5 bg-gray-800 rounded">
            {getDisplayName()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
          )}
          <button
            onClick={buildPreview}
            disabled={isBuilding}
            className="p-1.5 hover:bg-gray-800 rounded disabled:opacity-50"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${isBuilding ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-900">
        {isBuilding ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-gray-400">Building preview...</p>
            <p className="text-xs text-gray-600 mt-2">
              {getDisplayName()}
            </p>
          </div>
        ) : status === 'error' ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Preview Failed</h3>
            <p className="text-gray-400 text-center">
              Failed to build preview. Check your code for errors.
            </p>
            <button
              onClick={buildPreview}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
            >
              Try Again
            </button>
          </div>
        ) : previewUrl ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {getStatusIcon()}
                <span>Preview running on localhost:3000</span>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {getDisplayName()} Preview
                </h2>
                <p className="text-gray-600 mb-6">
                  Live preview will appear here. Edit files to see changes.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">✓</div>
                    <div className="text-sm text-gray-600">Preview Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-gray-400 mb-4">Preview will appear here</p>
              <button
                onClick={buildPreview}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
