export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { Users, FileCode, CreditCard, Zap, TrendingUp, Activity, Download, Globe } from 'lucide-react';

const initialStats = [
  { label: 'Total Users', value: '1,234', icon: Users, change: '+12%', color: 'text-blue-600' },
  { label: 'Projects Created', value: '5,678', icon: FileCode, change: '+23%', color: 'text-green-600' },
  { label: 'Revenue', value: '$4,567', icon: CreditCard, change: '+34%', color: 'text-purple-600' },
  { label: 'AI Generations', value: '12,345', icon: Zap, change: '+45%', color: 'text-orange-600' },
];

const topComponents = [
  { name: 'Login Form', uses: 987, growth: 12 },
  { name: 'Product Card', uses: 854, growth: 8 },
  { name: 'Dashboard Layout', uses: 723, growth: 15 },
  { name: 'Contact Form', uses: 654, growth: 5 },
  { name: 'Pricing Table', uses: 543, growth: 20 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(initialStats);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-2">
            Monitor your platform performance and user activity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                {stat.label}
              </span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow border lg:col-span-2">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            <h2 className="text-xl font-bold">User Growth</h2>
          </div>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
            <div className="text-center">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                User growth chart will appear here
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Connect Google Analytics for real data
              </p>
            </div>
          </div>
        </div>

        {/* Top Components */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-bold mb-4">Top Generated Components</h2>
          <div className="space-y-4">
            {topComponents.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{component.name}</p>
                    <p className="text-sm text-gray-500">{component.uses.toLocaleString()} uses</p>
                  </div>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{component.growth}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { user: 'John Doe', action: 'created a new project', time: '2 minutes ago' },
              { user: 'Sarah Smith', action: 'exported to React Native', time: '15 minutes ago' },
              { user: 'Mike Johnson', action: 'upgraded to Pro plan', time: '1 hour ago' },
              { user: 'Emma Wilson', action: 'shared a template', time: '2 hours ago' },
              { user: 'Alex Chen', action: 'generated 5 components', time: '3 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-6 w-6 text-blue-600">ℹ️</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Analytics Setup Instructions</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-2">
              <p>1. Get FREE Google Analytics ID from <a href="https://analytics.google.com" className="underline" target="_blank">analytics.google.com</a></p>
              <p>2. Replace 'G-XXXXXXXXXX' in <code>GoogleAnalytics.tsx</code> with your ID</p>
              <p>3. For real-time data, check Google Analytics dashboard</p>
              <p>4. This dashboard shows mock data until connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
