export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Analytics features are being implemented. This page will show detailed metrics,
          user growth charts, and platform performance data.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <div className="text-2xl font-bold">1,234</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="border p-4 rounded">
            <div className="text-2xl font-bold">5,678</div>
            <div className="text-sm text-gray-500">Projects Created</div>
          </div>
        </div>
      </div>
    </div>
  );
}
