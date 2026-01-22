'use client'

import { useState, useEffect, useCallback } from 'react'
import { Palette, Type, Layout, Save, Undo, Redo, Eye, Download, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { Template } from '@/lib/templates/template.types'
import { TemplateCustomizer, StylePreset } from '@/lib/templates/customizer'

interface LiveCustomizerProps {
  template: Template
  onCustomize: (customized: Template) => void
  userId?: string
}

export default function LiveCustomizer({ template, onCustomize, userId }: LiveCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'content'>('colors')
  const [customizations, setCustomizations] = useState<any>({})
  const [history, setHistory] = useState<Template[]>([{ ...template }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [presetName, setPresetName] = useState('')
  
  const customizer = new TemplateCustomizer()
  const presets = customizer.getStylePresets()

  // Initialize customizations from template
  useEffect(() => {
    const initialCustomizations = {
      colors: template.styles?.colors || {},
      typography: template.styles?.typography || {},
      spacing: template.styles?.spacing || {},
      layout: {},
      content: {}
    }
    setCustomizations(initialCustomizations)
  }, [template])

  const applyCustomizations = useCallback(async (newCustomizations: any) => {
    try {
      const customized = await customizer.customizeTemplate(template, newCustomizations)
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(customized)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      
      // Notify parent
      onCustomize(customized)
    } catch (error) {
      console.error('Error applying customizations:', error)
      toast.error('Failed to apply customizations')
    }
  }, [template, history, historyIndex, onCustomize, customizer])

  const handleColorChange = (colorKey: string, value: string) => {
    const newCustomizations = {
      ...customizations,
      colors: {
        ...customizations.colors,
        [colorKey]: value
      }
    }
    setCustomizations(newCustomizations)
    applyCustomizations(newCustomizations)
  }

  const handleTypographyChange = (key: string, value: string) => {
    const newCustomizations = {
      ...customizations,
      typography: {
        ...customizations.typography,
        [key]: value
      }
    }
    setCustomizations(newCustomizations)
    applyCustomizations(newCustomizations)
  }

  const handleSpacingChange = (spacingType: string, value: number) => {
    const newCustomizations = {
      ...customizations,
      spacing: {
        ...customizations.spacing,
        [spacingType]: `${value / 10}rem`
      }
    }
    setCustomizations(newCustomizations)
    applyCustomizations(newCustomizations)
  }

  const handleLayoutChange = (key: string, value: string | number) => {
    const newCustomizations = {
      ...customizations,
      layout: {
        ...customizations.layout,
        [key]: value
      }
    }
    setCustomizations(newCustomizations)
    applyCustomizations(newCustomizations)
  }

  const handleContentChange = (key: string, value: string) => {
    const newCustomizations = {
      ...customizations,
      content: {
        ...customizations.content,
        [key]: value
      }
    }
    setCustomizations(newCustomizations)
    applyCustomizations(newCustomizations)
  }

  const applyPreset = async (preset: StylePreset) => {
    const newCustomizations = {
      colors: preset.colors,
      typography: preset.typography,
      spacing: preset.spacing
    }
    setCustomizations(newCustomizations)
    
    try {
      const customized = await customizer.applyPreset(template, preset.id)
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(customized)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      
      onCustomize(customized)
      toast.success(`Applied ${preset.name} preset`)
    } catch (error) {
      toast.error('Failed to apply preset')
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onCustomize(history[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onCustomize(history[newIndex])
    }
  }

  const saveCustomization = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a name for your customization')
      return
    }

    if (!userId) {
      toast.error('Please sign in to save customizations')
      return
    }

    setSaving(true)
    try {
      const customizationId = await customizer.saveCustomization(
        userId,
        template.id,
        customizations,
        presetName
      )
      
      toast.success('Customization saved!')
      setPresetName('')
    } catch (error) {
      console.error('Error saving customization:', error)
      toast.error('Failed to save customization')
    } finally {
      setSaving(false)
    }
  }

  const exportCustomization = () => {
    const data = {
      templateId: template.id,
      customizations,
      name: presetName || `Custom ${template.name}`,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-customization.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Customization exported!')
  }

  const copyCSS = () => {
    const cssVars = Object.entries(customizations.colors || {})
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n')
    
    const css = `:root {\n${cssVars}\n}`
    
    navigator.clipboard.writeText(css)
    toast.success('CSS copied to clipboard!')
  }

  const templateColors = template.styles?.colors || {}
  const colorKeys = Object.keys(templateColors)

  return (
    <div className="w-full max-w-md bg-white border-l h-full flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Template Customizer</h3>
            <p className="text-sm text-gray-600">Live edit your template</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Type</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <TabsContent value="colors" className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 text-sm">Style Presets</h4>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  className="p-3 border rounded-lg hover:border-purple-500 transition-colors group"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="flex space-x-1 mb-2">
                    {Object.values(preset.colors).slice(0, 4).map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-medium group-hover:text-purple-600">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-sm">Custom Colors</h4>
            <div className="space-y-4">
              {colorKeys.map((key) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`color-${key}`} className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded border mr-2 shadow-sm"
                        style={{ 
                          backgroundColor: customizations.colors?.[key] || templateColors[key] 
                        }}
                      />
                      <span className="text-xs font-mono">
                        {customizations.colors?.[key] || templateColors[key]}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id={`color-${key}`}
                      value={customizations.colors?.[key] || templateColors[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-10 h-10 cursor-pointer rounded border"
                    />
                    <Input
                      type="text"
                      value={customizations.colors?.[key] || templateColors[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      placeholder="#000000"
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 text-sm">Font Family</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Inter', value: 'Inter, sans-serif' },
                { name: 'Roboto', value: 'Roboto, sans-serif' },
                { name: 'Poppins', value: 'Poppins, sans-serif' },
                { name: 'Montserrat', value: 'Montserrat, sans-serif' },
                { name: 'Open Sans', value: 'Open Sans, sans-serif' },
                { name: 'Lato', value: 'Lato, sans-serif' },
              ].map((font) => (
                <button
                  key={font.name}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    customizations.typography?.fontFamily === font.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleTypographyChange('fontFamily', font.value)}
                  style={{ fontFamily: font.value }}
                >
                  <div className="font-medium">{font.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-sm">Typography Scale</h4>
            <div className="space-y-4">
              {[
                { label: 'Base Size', key: 'fontSizeBase', min: 12, max: 24, step: 1, unit: 'px' },
                { label: 'Heading Scale', key: 'headingScale', min: 1.2, max: 2, step: 0.1, unit: 'x' },
                { label: 'Line Height', key: 'lineHeight', min: 1, max: 2, step: 0.1, unit: '' },
              ].map((item) => (
                <div key={item.key}>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm">{item.label}</Label>
                    <span className="text-sm text-gray-600">
                      {customizations.typography?.[item.key] || 
                       template.styles?.typography?.[item.key] || 
                       (item.key === 'fontSizeBase' ? '16px' : 
                        item.key === 'headingScale' ? '1.5x' : '1.5')}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[
                      parseFloat(
                        customizations.typography?.[item.key] || 
                        template.styles?.typography?.[item.key] || 
                        (item.key === 'fontSizeBase' ? '16' : 
                         item.key === 'headingScale' ? '1.5' : '1.5')
                      )
                    ]}
                    max={item.max}
                    min={item.min}
                    step={item.step}
                    onValueChange={(value) => {
                      handleTypographyChange(item.key, `${value[0]}${item.unit}`)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 text-sm">Spacing</h4>
            <div className="space-y-4">
              {[
                { label: 'Small', key: 'sm', min: 2, max: 20, defaultValue: 8 },
                { label: 'Medium', key: 'md', min: 4, max: 40, defaultValue: 16 },
                { label: 'Large', key: 'lg', min: 8, max: 60, defaultValue: 32 },
                { label: 'Extra Large', key: 'xl', min: 12, max: 80, defaultValue: 48 },
              ].map((item) => (
                <div key={item.key}>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm">{item.label} Spacing</Label>
                    <span className="text-sm text-gray-600">
                      {customizations.spacing?.[item.key] || 
                       template.styles?.spacing?.[item.key] || 
                       `${item.defaultValue / 10}rem`}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[
                      parseFloat(
                        (customizations.spacing?.[item.key] || 
                         template.styles?.spacing?.[item.key] || 
                         `${item.defaultValue / 10}rem`
                        ).replace('rem', '')
                      ) * 10
                    ]}
                    max={item.max}
                    min={item.min}
                    step={2}
                    onValueChange={(value) => {
                      handleSpacingChange(item.key, value[0])
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-sm">Container</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Max Width</Label>
                <Slider
                  defaultValue={[1200]}
                  max={1920}
                  min={320}
                  step={8}
                  onValueChange={(value) => {
                    handleLayoutChange('maxWidth', `${value[0]}px`)
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Mobile (320px)</span>
                  <span>Desktop (1200px)</span>
                  <span>Wide (1920px)</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 text-sm">Template Content</h4>
            <div className="space-y-4">
              {[
                { label: 'Template Title', key: 'title', defaultValue: template.name },
                { label: 'Description', key: 'description', defaultValue: template.description },
                { label: 'Header Text', key: 'headerText', defaultValue: 'Welcome' },
                { label: 'Button Text', key: 'buttonText', defaultValue: 'Learn More' },
              ].map((item) => (
                <div key={item.key}>
                  <Label htmlFor={`content-${item.key}`} className="text-sm mb-2 block">
                    {item.label}
                  </Label>
                  <Input
                    id={`content-${item.key}`}
                    placeholder={item.defaultValue}
                    value={customizations.content?.[item.key] || ''}
                    onChange={(e) => handleContentChange(item.key, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-4 bg-gray-50">
        <div>
          <Label htmlFor="preset-name" className="text-sm mb-2 block">
            Save as Preset
          </Label>
          <div className="flex gap-2">
            <Input
              id="preset-name"
              placeholder="My Custom Design"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button
              onClick={saveCustomization}
              disabled={saving || !presetName.trim() || !userId}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={copyCSS}
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy CSS
          </Button>
          <Button
            variant="outline"
            onClick={exportCustomization}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full text-gray-600 hover:text-red-600 hover:bg-red-50"
          onClick={() => {
            setCustomizations({})
            setHistory([{ ...template }])
            setHistoryIndex(0)
            onCustomize(template)
            toast.success('Reset to original')
          }}
        >
          Reset to Original
        </Button>
      </div>
    </div>
  )
}
