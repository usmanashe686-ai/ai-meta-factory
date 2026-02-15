import React, { useState } from 'react';

export const ShareButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = () => {
    // Mock share link
    navigator.clipboard?.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
        title="Share project"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        Share
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 text-white">
            <h2 className="text-xl font-bold mb-4">Share Project</h2>
            <p className="text-gray-300 mb-4">Get a shareable link or invite collaborators.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Copy Link
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
