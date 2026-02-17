'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';

interface Build {
  id: string;
  projectId: string;
  type: 'apk' | 'zip' | 'github' | 'vercel';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  artifactUrl?: string;
  error?: string;
}

export const BuildStatus: React.FC = () => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch recent builds (poll every 5 seconds)
  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const res = await fetch('/api/builds/recent');
        if (!res.ok) throw new Error('Failed to fetch builds');
        const data = await res.json();
        setBuilds(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
    const interval = setInterval(fetchBuilds, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: Build['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded relative"
        title="Build Status"
      >
        {builds.some(b => b.status === 'processing') && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        )}
        <Loader2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Build Status</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="text-red-400 text-center p-4">{error}</div>
            ) : builds.length === 0 ? (
              <div className="text-gray-400 text-center p-4">No recent builds</div>
            ) : (
              builds.map((build) => (
                <div key={build.id} className="border-b border-gray-700 last:border-0 py-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(build.status)}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{build.type}</span>
                        <span className="text-xs text-gray-400">{formatTime(build.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          build.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          build.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          build.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {build.status}
                        </span>
                        {build.artifactUrl && (
                          <a
                            href={build.artifactUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline"
                          >
                            Download
                          </a>
                        )}
                      </div>
                      {build.error && (
                        <div className="text-xs text-red-400 mt-1">{build.error}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
