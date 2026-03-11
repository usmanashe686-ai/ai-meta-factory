"use client";
import { apiFetch } from "@/lib/apiClient";
import apiClient from '@/lib/apiClient';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Upload, X, Check, Loader2 } from 'lucide-react';

export default function SubmitTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'website',
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [projectZip, setProjectZip] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/marketplace/submit');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProjectZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setProjectZip(file);
      setError('');
    } else {
      setError('Please select a valid ZIP file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectZip) {
      setError('Project ZIP file is required');
      return;
    }

    setUploading(true);
    setError('');

    const body = new FormData();
    body.append('name', formData.name);
    body.append('description', formData.description);
    body.append('category', formData.category);
    if (thumbnail) body.append('thumbnail', thumbnail);
    body.append('file', projectZip);

    try {
      const res = await apiFetch('/api/templates', {
        method: 'POST',
        body,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setTimeout(() => router.push('/marketplace'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Template Submitted!</h1>
          <p className="text-gray-400">Your template has been uploaded successfully. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Submit a Template</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Template Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Minimal Blog"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your template..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="website">Website</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="game">Game</option>
              <option value="iot">IoT</option>
            </select>
          </div>

          {/* Thumbnail (optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail (optional)</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2"
              >
                <Upload size={16} />
                Choose Image
              </button>
              {thumbnail && <span className="text-sm text-gray-400">{thumbnail.name}</span>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
            {thumbnailPreview && (
              <div className="mt-4 relative w-40 h-40 border border-gray-600 rounded overflow-hidden">
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnail(null);
                    setThumbnailPreview(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-gray-800 rounded-full hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Project ZIP */}
          <div>
            <label className="block text-sm font-medium mb-2">Project ZIP *</label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer flex items-center gap-2">
                <Upload size={16} />
                Select ZIP
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleProjectZipChange}
                  className="hidden"
                  required
                />
              </label>
              {projectZip && <span className="text-sm text-gray-400">{projectZip.name}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The ZIP should contain all your project files. It will be extracted and stored as a template.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Submit Template'
            )}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By submitting, you agree that your template will be publicly available under the MIT license.
        </p>
      </div>
    </div>
  );
}
