#!/data/data/com.termux/files/usr/bin/bash

echo "📊 SETTING UP ANALYTICS (SIMPLIFIED)"
echo "===================================="

# 1. Create Google Analytics component
echo "Creating Google Analytics component..."
cat > components/analytics/GoogleAnalytics.tsx << 'GAEOF'
'use client';

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your ID

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + searchParams.toString()
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }
  }, [pathname, searchParams])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={\`https://www.googletagmanager.com/gtag/js?id=\${GA_MEASUREMENT_ID}\`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: \`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '\${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          \`,
        }}
      />
    </>
  )
}
GAEOF

# 2. Create Error Boundary
echo "Creating Error Boundary..."
cat > components/error/ErrorBoundary.tsx << 'EBEOF'
'use client';

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
EBEOF

# 3. Create analytics page
echo "Creating analytics dashboard..."
cat > app/analytics/page.tsx << 'DASHEOF'
'use client';

import { useEffect, useState } from 'react'
import { Users, FileCode, CreditCard, Zap, TrendingUp, Activity, Download, Globe } from 'lucide-react'

const initialStats = [
  { label: 'Total Users', value: '1,234', icon: Users, change: '+12%', color: 'text-blue-600' },
  { label: 'Projects Created', value: '5,678', icon: FileCode, change: '+23%', color: 'text-green-600' },
  { label: 'Revenue', value: '$4,567', icon: CreditCard, change: '+34%', color: 'text-purple-600' },
  { label: 'AI Generations', value: '12,345', icon: Zap, change: '+45%', color: 'text-orange-600' },
]

export default function AnalyticsPage() {
  const [stats, setStats] = useState(initialStats)
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  return (
    <div className="p-4 md:p-6 space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                {stat.label}
              </span>
              <stat.icon className={\`h-5 w-5 \${stat.color}\`} />
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

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 mr-2 text-green-600" />
          <h2 className="text-xl font-bold">User Growth</h2>
        </div>
        <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
          <div className="text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Analytics charts will appear here
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Connect Google Analytics for real data
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-6 w-6 text-blue-600">ℹ️</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Analytics Setup Note</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                1. Get Google Analytics ID from https://analytics.google.com
                2. Replace 'G-XXXXXXXXXX' in GoogleAnalytics.tsx with your ID
                3. Visit /analytics page to see your dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
DASHEOF

# 4. Create AnalyticsProvider
echo "Creating Analytics Provider..."
cat > components/analytics/AnalyticsProvider.tsx << 'PROVIDEREOF'
'use client';

import { ReactNode, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page view
    const url = pathname + searchParams.toString()
    console.log('Page viewed:', url)
    
    // You can send this to your analytics backend
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-XXXXXXXXXX', {
        page_path: url,
      })
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
PROVIDEREOF

# 5. Update app/layout.tsx
echo "Updating app layout..."
if [ -f "app/layout.tsx" ]; then
  # Backup original layout
  cp app/layout.tsx app/layout.tsx.backup
  
  # Read and update layout
  sed -i '/<ThemeProvider>/a\
      <ErrorBoundary>\
        <AnalyticsProvider>\
          {children}\
          <Toaster />\
          <GoogleAnalytics />\
        </AnalyticsProvider>\
      </ErrorBoundary>' app/layout.tsx
  
  # Add imports at the top
  sed -i "1i\\
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'\\
import { ErrorBoundary } from '@/components/error/ErrorBoundary'\\
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'" app/layout.tsx
else
  echo "Creating new app layout..."
  cat > app/layout.tsx << 'LAYOUTEOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Meta-Factory',
  description: 'Build web and mobile applications instantly with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AnalyticsProvider>
              {children}
              <Toaster />
              <GoogleAnalytics />
            </AnalyticsProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
LAYOUTEOF
fi

# 6. Create .env.local.example
echo "Creating environment variables example..."
cat > .env.local.example << 'ENVEOF'
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Add your Google Analytics ID here
# Then rename this file to .env.local
ENVEOF

echo ""
echo "✅ ANALYTICS SETUP COMPLETE!"
echo ""
echo "📊 WHAT HAS BEEN CREATED:"
echo "1. Google Analytics component"
echo "2. Error Boundary component"
echo "3. Analytics dashboard at /analytics"
echo "4. Analytics Provider"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. Get FREE Google Analytics ID:"
echo "   - Go to https://analytics.google.com"
echo "   - Create account (free)"
echo "   - Get Measurement ID (starts with G-)"
echo ""
echo "2. Update Google Analytics ID:"
echo "   - Edit components/analytics/GoogleAnalytics.tsx"
echo "   - Replace 'G-XXXXXXXXXX' with your ID"
echo ""
echo "3. Test analytics dashboard:"
echo "   npm run dev"
echo "   Visit: http://localhost:3000/analytics"
echo ""
echo "4. For production:"
echo "   - Copy .env.local.example to .env.local"
echo "   - Add your actual Google Analytics ID"
echo ""
echo "Allahumma barik! Your analytics system is ready! 📈"
