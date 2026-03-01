'use client';

import { apiFetch } from "@/lib/apiClient";
import { useState, useEffect } from 'react';
import UserManagement from './components/UserManagement';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalExports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiFetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </header>
      <main className="p-6">
        {loading ? (
          <p>Loading stats...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-sm text-gray-400">Total Users</div>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-sm text-gray-400">Total Projects</div>
              <div className="text-3xl font-bold">{stats.totalProjects}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-sm text-gray-400">Total Exports</div>
              <div className="text-3xl font-bold">{stats.totalExports}</div>
            </div>
          </div>
        )}
        <UserManagement />
      </main>
    </div>
  );
}
