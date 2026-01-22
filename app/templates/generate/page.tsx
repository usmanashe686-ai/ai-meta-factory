'use client'

import { useState } from 'react'
import { Wand2, Upload, Palette, Layers, Zap, Sparkles, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const categories = [
  { id: 'dashboard', name: 'Dashboard', icon: Layers, color: 'bg-blue-500' },
  { id: 'ecommerce', name: 'E-commerce', icon: Zap, color: 'bg-green-500' },
  { id: 'portfolio', name: 'Portfolio', icon: Palette, color: 'bg-purple-500' },
  { id: 'saas', name: 'SaaS Application', icon: Sparkles, color: 'bg-pink-500' },
  { id: 'blog', name: 'Blog', icon: Wand2, color: 'bg-orange-500' },
  { id: 'landing', name: 'Landing Page', icon: Layers, color: 'bg-indigo-500' },
]

const styles = [
  { id: 'modern', name: 'Modern', desc: 'Clean, minimalist with gradients' },
  { id: 'minimal', name: 'Minimal', desc: 'Simple, lots of white space' },
  { id: 'corporate', name: 'Corporate', desc: 'Professional, formal design' },
  { id: 'creative', name: 'Creative', desc: 'Bold, experimental layout' },
  { id: 'dark', name: 'Dark Mode', desc: 'Dark theme with neon accents' },
  { id: 'glass', name: 'Glassmorphism', desc: 'Frosted glass effects' },
]

const complexities = [
  { id: 'simple', name: 'Simple', desc: '1-3 pages, basic components' },
  { id: 'moderate', name: 'Moderate', desc: 'Multiple sections, interactions' },
  { id: 'complex', name: 'Complex', desc: 'Advanced features, animations' },
]

const popularFeatures = [
  'Dark Mode', 'Responsive Design', 'Animations', 'User Authentication',
  'API Integration', 'Dashboard Charts', 'E-commerce Cart', 'Blog System',
  'Contact Form', 'Search Functionality', 'Multi-language', 'PWA Support'
]

export default function GenerateTemplatePage() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [templateSpec, setTemplateSpec] = useState({
    category: 'dashboard',
    description: '',
    complexity: 'moderate',
    style: 'modern',
    features: [] as string[],
    imageUrl: '',
    imageFile: null as File | null,
  })

  const handleGenerate = async () => {
    if (!templateSpec.description.trim() && mode === 'text') {
      toast.error('Please describe your template')
      return
    }

    if (mode === 'image' && !templateSpec.imageUrl && !templateSpec.imageFile) {
      toast.error('Please upload or provide an image URL')
      return
    }

    setGenerating(true)
    try {
      let imageUrl = templateSpec.imageUrl
      
      // If file uploaded, convert to data URL
      if (templateSpec.imageFile) {
        const reader = new FileReader()
        imageUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(templateSpec.imageFile!)
        })
      }

      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateSpec,
          imageUrl: imageUrl || undefined
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Template generated successfully!')
        router.push(`/templates/${data.data.templateId}?preview=true`)
      } else {
        toast.error(data.error || 'Generation failed')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate template')
    } finally {
      setGenerating(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image must be less than 10MB')
        return
      }
      setTemplateSpec(prev => ({ 
        ...prev, 
        imageFile: file,
        imageUrl: ''
      }))
    }
  }

  const toggleFeature = (feature: string) => {
    setTemplateSpec(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <Wand2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Template Generator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Describe what you need, and our AI will create a custom template in seconds
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border p-1 bg-gray-100">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'text'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMode('text')}
            >
              <Wand2 className="inline w-4 h-4 mr-2" />
              Text Description
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'image'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMode('image')}
            >
              <ImageIcon className="inline w-4 h-4 mr-2" />
              From Image
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative max-w-4xl mx-auto">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                step >= stepNum 
                  ? 'border-purple-600 bg-purple-100 text-purple-600' 
                  : 'border-gray-300 bg-white text-gray-400'
              }`}>
                {stepNum}
              </div>
              <div className="mt-2 text-sm font-medium">
                {stepNum === 1 && 'Setup'}
                {stepNum === 2 && 'Details'}
                {stepNum === 3 && 'Style'}
                {stepNum === 4 && 'Generate'}
              </div>
            </div>
          ))}
          <div className="absolute top-6 left-12 right-12 h-2 bg-gray-200 -z-10"></div>
          <div 
            className="absolute top-6 left-12 h-2 bg-gradient-to-r from-purple-600 to-pink-600 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Choose Template Type</CardTitle>
              <p className="text-gray-600">Select the category that best fits your project</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center transition-all hover:scale-[1.02] ${
                        templateSpec.category === cat.id
                          ? `${cat.color} border-transparent text-white shadow-lg`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setTemplateSpec(prev => ({ ...prev, category: cat.id }))}
                    >
                      <div className={`p-3 rounded-full ${templateSpec.category === cat.id ? 'bg-white/20' : 'bg-gray-100'} mb-4`}>
                        <Icon className={`w-8 h-8 ${templateSpec.category === cat.id ? 'text-white' : 'text-gray-700'}`} />
                      </div>
                      <span className="font-semibold">{cat.name}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-8 flex justify-between">
                <div></div>
                <Button 
                  onClick={() => setStep(2)} 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Next: Describe Template
                  <Wand2 className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Description or Image Upload */}
        {step === 2 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">
                {mode === 'text' ? 'Describe Your Template' : 'Upload Design Image'}
              </CardTitle>
              <p className="text-gray-600">
                {mode === 'text' 
                  ? 'Be as detailed as possible for better results'
                  : 'Upload a screenshot or design mockup for AI to analyze'}
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {mode === 'text' ? (
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Template Description *
                  </label>
                  <Textarea
                    placeholder="Describe what you want in detail. For example: 'A dashboard for tracking website analytics with charts, metrics cards, user activity feed, dark mode toggle, and notification system. It should have a modern design with purple color scheme.'"
                    className="min-h-[150px] text-lg p-4 border-2 rounded-xl"
                    value={templateSpec.description}
                    onChange={(e) => setTemplateSpec(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Tip: Include colors, layout preferences, and specific features you want
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Upload Design Image
                    </label>
                    <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 transition-colors bg-gray-50">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="template-image"
                      />
                      <label htmlFor="template-image" className="cursor-pointer">
                        <Button variant="outline" size="lg" className="px-8">
                          Choose Image File
                        </Button>
                      </label>
                      <p className="text-sm text-gray-500 mt-4">
                        Upload PNG, JPG or WebP (max 10MB)
                      </p>
                      {templateSpec.imageFile && (
                        <div className="mt-6">
                          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            ✓ {templateSpec.imageFile.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">OR</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Image URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com/design-screenshot.png"
                      className="text-lg p-4 border-2 rounded-xl"
                      value={templateSpec.imageUrl}
                      onChange={(e) => setTemplateSpec(prev => ({ 
                        ...prev, 
                        imageUrl: e.target.value,
                        imageFile: null
                      }))}
                    />
                  </div>
                </div>
              )}

              {/* Features Section (for text mode) */}
              {mode === 'text' && (
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Key Features
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {popularFeatures.map((feature) => (
                      <button
                        key={feature}
                        className={`px-4 py-2 rounded-full border transition-all ${
                          templateSpec.features.includes(feature)
                            ? 'bg-purple-100 text-purple-700 border-purple-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => toggleFeature(feature)}
                      >
                        {feature}
                        {templateSpec.features.includes(feature) && ' ✓'}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Selected: {templateSpec.features.length} features
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  size="lg"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={mode === 'text' ? !templateSpec.description.trim() : false}
                >
                  Next: Style & Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Style & Complexity */}
        {step === 3 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Style & Complexity</CardTitle>
              <p className="text-gray-600">Fine-tune the design style and complexity level</p>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Design Style */}
              <div>
                <h3 className="text-xl font-semibold mb-6">Design Style</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      className={`p-6 rounded-xl border-2 flex flex-col items-center transition-all hover:scale-[1.02] text-left ${
                        templateSpec.style === style.id
                          ? 'border-purple-600 bg-purple-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setTemplateSpec(prev => ({ ...prev, style: style.id }))}
                    >
                      <div className="w-full mb-4">
                        <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mb-2"></div>
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                      </div>
                      <div className="w-full">
                        <div className="font-semibold text-gray-900">{style.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{style.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity Level */}
              <div>
                <h3 className="text-xl font-semibold mb-6">Complexity Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {complexities.map((complex) => (
                    <label
                      key={complex.id}
                      className={`block p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                        templateSpec.complexity === complex.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="complexity"
                          value={complex.id}
                          checked={templateSpec.complexity === complex.id}
                          onChange={(e) => setTemplateSpec(prev => ({ 
                            ...prev, 
                            complexity: e.target.value as any 
                          }))}
                          className="mt-1 mr-4 w-5 h-5 text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-lg text-gray-900">{complex.name}</div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              complex.id === 'simple' ? 'bg-green-100 text-green-800' :
                              complex.id === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {complex.id === 'simple' ? 'Easy' :
                               complex.id === 'moderate' ? 'Medium' : 'Advanced'}
                            </div>
                          </div>
                          <div className="text-gray-600 mt-2">{complex.desc}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  size="lg"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={() => setStep(4)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Next: Review & Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Generate */}
        {step === 4 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Review & Generate</CardTitle>
              <p className="text-gray-600">Review your selections and generate the template</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900">Template Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Type</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {categories.find(c => c.id === templateSpec.category)?.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Style</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {styles.find(s => s.id === templateSpec.style)?.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Complexity</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {complexities.find(c => c.id === templateSpec.complexity)?.name}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Mode</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {mode === 'text' ? 'Text Description' : 'Image Analysis'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Features</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {templateSpec.features.length} selected
                        </div>
                        {templateSpec.features.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {templateSpec.features.slice(0, 3).map(feature => (
                              <span key={feature} className="px-2 py-1 bg-white rounded text-xs">
                                {feature}
                              </span>
                            ))}
                            {templateSpec.features.length > 3 && (
                              <span className="px-2 py-1 bg-white rounded text-xs">
                                +{templateSpec.features.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {mode === 'text' && templateSpec.description && (
                    <div className="mt-8">
                      <div className="text-sm text-gray-600 font-medium mb-2">Description</div>
                      <div className="bg-white rounded-xl p-4 border">
                        <p className="text-gray-800">{templateSpec.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generation Status */}
                <div className="text-center">
                  {generating ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="w-24 h-24 mx-auto">
                          <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                          <div className="absolute inset-4 border-4 border-purple-500 rounded-full animate-spin"></div>
                          <Wand2 className="absolute inset-0 m-auto w-12 h-12 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-2">Generating Your Template</h4>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Our AI is creating a custom {templateSpec.category} template with {templateSpec.style} style...
                        </p>
                      </div>
                      <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Wand2 className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-2">Ready to Generate</h4>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Click generate to create your custom template. This usually takes 10-30 seconds.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(3)}
                    size="lg"
                    disabled={generating}
                  >
                    ← Back
                  </Button>
                  <div className="space-x-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setStep(1)
                        setTemplateSpec({
                          category: 'dashboard',
                          description: '',
                          complexity: 'moderate',
                          style: 'modern',
                          features: [],
                          imageUrl: '',
                          imageFile: null,
                        })
                      }}
                      disabled={generating}
                    >
                      Start Over
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={generating || (mode === 'text' && !templateSpec.description.trim())}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 mr-2" />
                          Generate Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
