// This is a server component that renders a simple analytics page
// We can add more features later once deployment is successful

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Platform Analytics</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          This analytics dashboard is currently being set up. Check back soon for detailed metrics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800">Total Users</h3>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-blue-600">+12% from last month</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-green-800">Projects Created</h3>
            <p className="text-2xl font-bold">5,678</p>
            <p className="text-sm text-green-600">+23% from last month</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-800">Revenue</h3>
            <p className="text-2xl font-bold">$4,567</p>
            <p className="text-sm text-purple-600">+34% from last month</p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Full analytics with charts and real-time data will be available soon.
            This is a placeholder to ensure your deployment succeeds.
          </p>
        </div>
      </div>
    </div>
  );
}
