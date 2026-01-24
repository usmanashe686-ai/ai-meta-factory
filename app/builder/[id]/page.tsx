"use client";

import { useParams } from 'next/navigation';

export default function BuilderProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Project: {projectId}</h1>
      <p className="text-gray-600 mb-6">
        This would show a saved builder project.
      </p>
      <a 
        href="/builder"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Back to Builder
      </a>
    </div>
  );
}
