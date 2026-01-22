'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DailyUsage {
  date: string
  views: number
  uses: number
  downloads: number
}

interface UsageChartProps {
  data: DailyUsage[]
  height?: number
}

export default function UsageChart({ data, height = 300 }: UsageChartProps) {
  const [activeMetric, setActiveMetric] = useState<'views' | 'uses' | 'downloads'>('views')
  
  const chartData = data.map(item => ({
    ...item,
    shortDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))
  
  const getBarColor = (metric: string) => {
    switch (metric) {
      case 'views': return '#3B82F6' // blue
      case 'uses': return '#10B981' // green
      case 'downloads': return '#8B5CF6' // purple
      default: return '#6B7280' // gray
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Daily Activity</h3>
        <div className="flex space-x-2">
          {(['views', 'uses', 'downloads'] as const).map((metric) => (
            <button
              key={metric}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeMetric === metric
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveMetric(metric)}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="shortDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [value.toLocaleString(), 'Count']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey={activeMetric} 
              fill={getBarColor(activeMetric)}
              radius={[4, 4, 0, 0]}
              name={activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">Views</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600">Uses</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-sm text-gray-600">Downloads</span>
        </div>
      </div>
    </div>
  )
}
