'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Smartphone, Download, Cloud, Terminal, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface MobileExportPanelProps {
  project: any
  components: any[]
}

export default function MobileExportPanel({ project, components }: MobileExportPanelProps) {
  const [exporting, setExporting] = useState(false)
  const [buildMethod, setBuildMethod] = useState<'eas' | 'local' | 'instructions'>('eas')
  const [buildResult, setBuildResult] = useState<any>(null)

  const handleExport = async () => {
    if (!project || components.length === 0) {
      toast.error('No project or components to export')
      return
    }

    setExporting(true)
    
    try {
      const response = await fetch('/api/export/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          components,
          buildMethod
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setBuildResult(result)
        toast.success('Mobile export started successfully!')
        
        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank')
        }
      } else {
        toast.error(`Export failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed. Check console for details.')
    } finally {
      setExporting(false)
    }
  }

  const buildMethods = [
    {
      id: 'eas',
      title: 'Expo Cloud Build',
      description: 'Build APK in the cloud (recommended)',
      icon: Cloud,
      features: ['No setup required', 'Professional APK', '30 minute build time']
    },
    {
      id: 'local',
      title: 'Local Build',
      description: 'Build on your device (Termux)',
      icon: Terminal,
      features: ['Offline capable', 'Learn Android build process', 'Manual setup required']
    },
    {
      id: 'instructions',
      title: 'Instructions Only',
      description: 'Get build instructions',
      icon: Smartphone,
      features: ['Export project files', 'Step-by-step guide', 'Flexible deployment']
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
          Mobile App Export
        </h3>
        <p className="text-gray-600 text-sm">
          Convert your web project to a native Android app
        </p>
      </div>

      {/* Build Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buildMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all ${
              buildMethod === method.id 
                ? 'border-blue-500 ring-2 ring-blue-100' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => setBuildMethod(method.id as any)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <method.icon className="w-6 h-6 text-gray-600" />
                {buildMethod === method.id && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <CardTitle className="text-base">{method.title}</CardTitle>
              <CardDescription>{method.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1 text-sm">
                {method.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Project Name</span>
            <span className="font-medium">{project?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Components</span>
            <span className="font-medium">{components.length} components</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Target Platform</span>
            <span className="font-medium">Android APK</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Build Method</span>
            <span className="font-medium capitalize">{buildMethod}</span>
          </div>
        </CardContent>
      </Card>

      {/* Build Result */}
      {buildResult && (
        <Card className={buildResult.success ? 'border-green-200' : 'border-red-200'}>
          <CardHeader>
            <div className="flex items-center">
              {buildResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <CardTitle className="text-base">
                {buildResult.success ? 'Export Successful' : 'Export Failed'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {buildResult.success ? (
              <div className="space-y-2">
                {buildResult.downloadUrl && (
                  <p>✅ Download ready: <a href={buildResult.downloadUrl} className="text-blue-600 underline" target="_blank">Click to download</a></p>
                )}
                {buildResult.buildId && (
                  <p>📦 Build ID: <code className="bg-gray-100 px-2 py-1 rounded">{buildResult.buildId}</code></p>
                )}
                <p className="text-sm text-gray-600">Check your downloads folder for the exported project.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-600">{buildResult.error}</p>
                <p className="text-sm text-gray-600">Check the console for detailed error logs.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={exporting}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        size="lg"
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Exporting Mobile App...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export as Android APK
          </>
        )}
      </Button>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Mobile Export Notes:</p>
        <ul className="space-y-1">
          <li>• First-time cloud builds may take 20-30 minutes</li>
          <li>• APK files can be installed directly on Android devices</li>
          <li>• For Google Play Store submission, additional steps required</li>
          <li>• iOS builds require Apple Developer account ($99/year)</li>
        </ul>
      </div>
    </div>
  )
}
