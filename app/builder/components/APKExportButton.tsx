"use client";

import { useState } from 'react';

interface APKExportButtonProps {
  projectName: string;
  platform: string;
  onExportAPK: () => Promise<void>;
}

export default function APKExportButton({ projectName, platform, onExportAPK }: APKExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMobilePlatform = ['flutter', 'react-native', 'expo'].includes(platform);

  const handleExportAPK = async () => {
    if (!isMobilePlatform) {
      setError('APK export is only available for mobile platforms (Flutter, React Native, Expo)');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      await onExportAPK();
      alert(`✅ APK for "${projectName}" is being generated and will be included in the download!`);
    } catch (err: any) {
      setError(`Failed to export APK: ${err.message}`);
      console.error('APK export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isMobilePlatform) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ APK export is only available for mobile platforms. 
          Current platform: <strong>{platform}</strong>
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          Switch to Flutter, React Native, or Expo to enable APK export.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleExportAPK}
        disabled={isExporting}
        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Generating APK...</span>
          </>
        ) : (
          <>
            <span>📱</span>
            <span>Export APK ({platform.toUpperCase()})</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg">
        <p className="font-semibold mb-1">📋 APK Export Info:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Platform: <strong>{platform}</strong></li>
          <li>Build Type: Debug (unsigned)</li>
          <li>File: {projectName}.apk</li>
          <li>Included in project ZIP</li>
          <li>For production, sign with your keystore</li>
        </ul>
      </div>
    </div>
  );
}
