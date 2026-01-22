'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color: string
  format?: 'number' | 'currency' | 'percentage'
}

export default function MetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  color,
  format = 'number'
}: MetricsCardProps) {
  
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return `$${Number(val).toFixed(2)}`
    }
    if (format === 'percentage') {
      return `${val}%`
    }
    return val.toLocaleString()
  }
  
  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-600'
    return change > 0 ? 'text-green-600' : 'text-red-600'
  }
  
  const getChangeIcon = (change?: number) => {
    if (!change) return null
    return change > 0 ? '↗' : '↘'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              {change !== undefined && (
                <div className={`text-sm font-medium ${getChangeColor(change)}`}>
                  {getChangeIcon(change)} {Math.abs(change)}%
                </div>
              )}
            </div>
            {change !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                {change > 0 ? 'Increase' : 'Decrease'} from last period
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
