"use client";
import { apiFetch } from "@/lib/apiClient";
'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import apiClient from '@/lib/apiClient';

interface DailyStats {
  date: string;
  exports: number;
  projects: number;
}

interface ExportTypeStats {
  type: string;
  count: number;
}

interface RevenueStats {
  month: string;
  revenue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [exportTypeData, setExportTypeData] = useState<ExportTypeStats[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiFetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setDailyData(data.daily || []);
        setExportTypeData(data.exportTypes || []);
        setRevenueData(data.revenue || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center p-8">Loading analytics...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData.length ? dailyData : sampleDailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="exports" stroke="#8884d8" name="Exports" />
              <Line type="monotone" dataKey="projects" stroke="#82ca9d" name="Projects" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Export Type Distribution */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Export Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={exportTypeData.length ? exportTypeData : sampleExportTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ payload }) => payload.type}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(exportTypeData.length ? exportTypeData : sampleExportTypeData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Chart (Placeholder) */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Monthly Revenue (Placeholder)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData.length ? revenueData : sampleRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Sample data in case API returns empty
const sampleDailyData = [
  { date: '2025-02-15', exports: 4, projects: 5 },
  { date: '2025-02-16', exports: 7, projects: 8 },
  { date: '2025-02-17', exports: 5, projects: 6 },
  { date: '2025-02-18', exports: 9, projects: 10 },
  { date: '2025-02-19', exports: 6, projects: 7 },
  { date: '2025-02-20', exports: 8, projects: 9 },
  { date: '2025-02-21', exports: 10, projects: 11 },
];

const sampleExportTypeData = [
  { type: 'zip', count: 45 },
  { type: 'apk', count: 20 },
  { type: 'github', count: 15 },
  { type: 'vercel', count: 10 },
];

const sampleRevenueData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 5500 },
];
