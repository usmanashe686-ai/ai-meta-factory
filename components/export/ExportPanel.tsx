'use client'

import React, { useState } from 'react'
import { 
  Download, Code, FileCode, Smartphone, 
  Monitor, Globe, Zap, Package,
  Check, Copy, ExternalLink, 
  Play, Terminal, Server, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { exportEngine } from '@/lib/export/export-engine'

interface ExportPanelProps {
  components: any[]
  projectName: string
  onExportComplete?: () => void
}

interface FrameworkOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

interface DeploymentOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'available' | 'soon' | 'beta'
}

export default function ExportPanel({ components, projectName, onExportComplete }: ExportPanelProps) {
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [exportOptions, setExportOptions] = useState({
    includeDependencies: true,
    includeStyles: true,
    formatCode: true,
    generateTests: false,
    exportType: 'zip' as 'zip' | 'files' | 'clipboard',
  })
  const [selectedDeployment, setSelectedDeployment] = useState('vercel')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const frameworkOptions: FrameworkOption[] = [
    {
      id: 'react',
      name: 'React',
      description: 'Create React App with JSX',
      icon: <FileCode className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      description: 'Production-ready React framework',
      icon: <Server className="w-5 h-5" />,
      color: 'bg-gray-100 text-gray-600',
    },
    {
      id: 'vue',
      name: 'Vue.js',
      description: 'Progressive JavaScript framework',
      icon: <Code className="w-5 h-5" />,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'svelte',
      name: 'Svelte',
      description: 'Cybernetically enhanced web apps',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'html',
      name: 'HTML/CSS',
      description: 'Pure static website',
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-red-100 text-red-600',
    },
    {
      id: 'react-native',
      name: 'React Native',
      description: 'Mobile apps for iOS & Android',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  const deploymentOptions: DeploymentOption[] = [
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'One-click deployment',
      icon: <ExternalLink className="w-4 h-4" />,
      status: 'available',
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'Auto-deploy from Git',
      icon: <Globe className="w-4 h-4" />,
      status: 'available',
    },
    {
      id: 'github',
      name: 'GitHub Pages',
      description: 'Free static hosting',
      icon: <Terminal className="w-4 h-4" />,
      status: 'available',
    },
    {
      id: 'firebase',
      name: 'Firebase',
      description: 'Google Cloud hosting',
      icon: <Server className="w-4 h-4" />,
      status: 'soon',
    },
    {
      id: 'apk',
      name: 'APK',
      description: 'Android app package',
      icon: <Smartphone className="w-4 h-4" />,
      status: 'beta',
    },
  ]

  const handleExport = async () => {
    if (components.length === 0) {
      alert('No components to export!')
      return
    }

    setIsExporting(true)
    setExportProgress(10)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      await exportEngine.exportProject(
        components.map(comp => ({
          ...comp,
          styles: comp.styles || {},
        })),
        projectName,
        {
          framework: selectedFramework as any,
          ...exportOptions,
        }
      )

      clearInterval(progressInterval)
      setExportProgress(100)

      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        onExportComplete?.()
      }, 500)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed: ' + (error as Error).message)
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleCopyToClipboard = async () => {
    const code = components.map(comp => 
      `// ${comp.name} (${comp.type})\n` +
      JSON.stringify(comp, null, 2)
    ).join('\n\n')

    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeploy = (platform: string) => {
    alert(`Deploying to ${platform}... This feature is coming soon!`)
  }

  const getFrameworkStats = () => {
    const stats = {
      components: components.length,
      linesOfCode: components.length * 50,
      files: components.length + 5,
      size: `${(components.length * 2).toFixed(1)} KB`,
    }
    return stats
  }

  const stats = getFrameworkStats()

  return (
    <div className="space-y-6">
      {/* Framework Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Export Framework</CardTitle>
          <CardDescription>
            Choose your target framework for code generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {frameworkOptions.map((framework) => (
              <button
                key={framework.id}
                onClick={() => setSelectedFramework(framework.id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedFramework === framework.id
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${framework.color}`}>
                    {framework.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{framework.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {framework.description}
                    </p>
                  </div>
                </div>
                {selectedFramework === framework.id && (
                  <div className="mt-2 text-xs text-primary">
                    <Check className="w-3 h-3 inline mr-1" />
                    Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Customize your export settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Include Dependencies</Label>
                <p className="text-sm text-muted-foreground">
                  Add package.json with required packages
                </p>
              </div>
              <Switch
                checked={exportOptions.includeDependencies}
                onCheckedChange={(checked) =>
                  setExportOptions({ ...exportOptions, includeDependencies: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Include Styles</Label>
                <p className="text-sm text-muted-foreground">
                  Generate CSS files with component styles
                </p>
              </div>
              <Switch
                checked={exportOptions.includeStyles}
                onCheckedChange={(checked) =>
                  setExportOptions({ ...exportOptions, includeStyles: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Format Code</Label>
                <p className="text-sm text-muted-foreground">
                  Use Prettier to format generated code
                </p>
              </div>
              <Switch
                checked={exportOptions.formatCode}
                onCheckedChange={(checked) =>
                  setExportOptions({ ...exportOptions, formatCode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Generate Tests</Label>
                <p className="text-sm text-muted-foreground">
                  Create basic test files for components
                </p>
              </div>
              <Switch
                checked={exportOptions.generateTests}
                onCheckedChange={(checked) =>
                  setExportOptions({ ...exportOptions, generateTests: checked })
                }
              />
            </div>

            <div>
              <Label className="font-medium mb-2 block">Export Format</Label>
              <RadioGroup
                value={exportOptions.exportType}
                onValueChange={(value: 'zip' | 'files' | 'clipboard') =>
                  setExportOptions({ ...exportOptions, exportType: value })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zip" id="zip" />
                  <Label htmlFor="zip">ZIP Archive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="files" id="files" />
                  <Label htmlFor="files">Individual Files</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clipboard" id="clipboard" />
                  <Label htmlFor="clipboard">Copy to Clipboard</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment</CardTitle>
          <CardDescription>Deploy your project with one click</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {deploymentOptions.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleDeploy(platform.id)}
                disabled={platform.status !== 'available'}
                className={`p-3 border rounded-lg text-center transition-all ${
                  platform.status === 'available'
                    ? 'hover:border-primary hover:bg-primary/5 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {platform.icon}
                  <span className="font-medium text-sm">{platform.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {platform.description}
                  </span>
                  {platform.status !== 'available' && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      platform.status === 'beta'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {platform.status}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Summary</CardTitle>
          <CardDescription>
            {projectName} • {selectedFramework.toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.components}</div>
                <div className="text-sm text-muted-foreground">Components</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.linesOfCode}</div>
                <div className="text-sm text-muted-foreground">Lines of Code</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.files}</div>
                <div className="text-sm text-muted-foreground">Files</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.size}</div>
                <div className="text-sm text-muted-foreground">Estimated Size</div>
              </div>
            </div>

            {/* Progress Bar */}
            {isExporting && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Exporting project...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleExport}
                disabled={isExporting || components.length === 0}
                className="flex-1 min-w-[200px]"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin mr-2">⟳</div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Export Project
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                disabled={components.length === 0}
                size="lg"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => alert('Preview coming soon!')}
                disabled={components.length === 0}
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Preview
              </Button>
            </div>

            {/* Quick Deploy Buttons */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Quick Deploy</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeploy('vercel')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Deploy to Vercel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeploy('netlify')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Deploy to Netlify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportEngine.generateAPK(components, projectName)}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Generate APK
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Framework Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold mb-2">Pro Tip</h4>
              <p className="text-sm text-muted-foreground">
                For production apps, we recommend <strong>Next.js</strong> for web and 
                <strong> React Native</strong> for mobile. These frameworks include best 
                practices and optimization out of the box.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                All exports include proper folder structure, package.json, and 
                deployment configuration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
