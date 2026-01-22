'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Tablet, Monitor, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Template, TemplateComponent } from '@/lib/templates/template.types'

interface TemplatePreviewProps {
  template: Template
  scale?: number
}

type DeviceView = 'mobile' | 'tablet' | 'desktop'

export default function TemplatePreview({ template, scale = 1 }: TemplatePreviewProps) {
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop')
  const [isRotated, setIsRotated] = useState(false)
  
  const deviceDimensions = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 }
  }
  
  const renderComponent = (component: TemplateComponent, depth = 0) => {
    const style: React.CSSProperties = {
      ...component.props?.style,
      position: 'relative',
      margin: '0',
      padding: '0',
      boxSizing: 'border-box'
    }
    
    // Apply template styles
    if (template.styles?.colors) {
      Object.entries(template.styles.colors).forEach(([key, value]) => {
        if (style[key as any]) {
          style[key as any] = value
        }
      })
    }
    
    const className = component.props?.className || ''
    
    switch (component.type) {
      case 'Container':
        return (
          <div
            key={component.id}
            className={className}
            style={style}
          >
            {component.children?.map(child => renderComponent(child, depth + 1))}
          </div>
        )
      
      case 'Button':
        return (
          <button
            key={component.id}
            className={`${className} px-4 py-2 rounded-lg transition-colors`}
            style={style}
          >
            {component.props?.children || 'Button'}
          </button>
        )
      
      case 'Card':
        return (
          <div
            key={component.id}
            className={`${className} border rounded-lg shadow-sm p-4`}
            style={style}
          >
            {component.children?.map(child => renderComponent(child, depth + 1))}
          </div>
        )
      
      case 'Text':
        return (
          <div
            key={component.id}
            className={className}
            style={style}
          >
            {component.props?.children || 'Text Content'}
          </div>
        )
      
      case 'Input':
        return (
          <input
            key={component.id}
            type="text"
            className={`${className} border rounded px-3 py-2`}
            style={style}
            placeholder={component.props?.placeholder || 'Enter text...'}
          />
        )
      
      case 'Image':
        return (
          <div
            key={component.id}
            className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}
            style={{ ...style, aspectRatio: '16/9' }}
          >
            <div className="text-center text-gray-400">
              <div>Image Placeholder</div>
              <div className="text-xs">({component.props?.alt || 'Image'})</div>
            </div>
          </div>
        )
      
      case 'Grid':
        return (
          <div
            key={component.id}
            className={`${className} grid gap-4`}
            style={{
              ...style,
              gridTemplateColumns: component.props?.columns ? 
                `repeat(${component.props.columns}, 1fr)` : 
                'repeat(auto-fit, minmax(200px, 1fr))'
            }}
          >
            {component.children?.map(child => renderComponent(child, depth + 1))}
          </div>
        )
      
      case 'Flex':
        return (
          <div
            key={component.id}
            className={`${className} flex`}
            style={style}
          >
            {component.children?.map(child => renderComponent(child, depth + 1))}
          </div>
        )
      
      default:
        return (
          <div
            key={component.id}
            className={className}
            style={style}
          >
            {component.children?.map(child => renderComponent(child, depth + 1))}
          </div>
        )
    }
  }
  
  const dimensions = deviceDimensions[deviceView]
  const scaledWidth = dimensions.width * scale
  const scaledHeight = dimensions.height * scale
  
  return (
    <div className="w-full">
      {/* Device Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={deviceView === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('mobile')}
            className="flex items-center"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </Button>
          <Button
            variant={deviceView === 'tablet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('tablet')}
            className="flex items-center"
          >
            <Tablet className="w-4 h-4 mr-2" />
            Tablet
          </Button>
          <Button
            variant={deviceView === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('desktop')}
            className="flex items-center"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">
            {dimensions.width} × {dimensions.height}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRotated(!isRotated)}
            className="flex items-center"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate
          </Button>
        </div>
      </div>
      
      {/* Preview Frame */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden border-8 border-gray-800 mx-auto">
        {/* Device Frame */}
        <div
          className="relative bg-white overflow-auto"
          style={{
            width: isRotated && deviceView !== 'desktop' ? scaledHeight : scaledWidth,
            height: isRotated && deviceView !== 'desktop' ? scaledWidth : scaledHeight,
            transform: isRotated && deviceView !== 'desktop' ? 'rotate(90deg)' : 'none',
            transformOrigin: 'center center',
            margin: isRotated && deviceView !== 'desktop' ? 
              `${(scaledHeight - scaledWidth) / 2}px 0` : '0'
          }}
        >
          {/* Device Notch (for mobile/tablet) */}
          {deviceView !== 'desktop' && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-800 rounded-b-2xl z-10"></div>
          )}
          
          {/* Template Content */}
          <div 
            className="w-full h-full p-4 md:p-6 lg:p-8"
            style={{
              transform: isRotated && deviceView !== 'desktop' ? 'rotate(-90deg)' : 'none',
              transformOrigin: 'center center',
              width: isRotated && deviceView !== 'desktop' ? '100vh' : '100%',
              height: isRotated && deviceView !== 'desktop' ? '100vw' : '100%'
            }}
          >
            <div 
              className="w-full h-full"
              style={{
                fontFamily: template.styles?.typography?.fontFamily || 'Inter, sans-serif',
                fontSize: template.styles?.typography?.fontSizeBase || '16px',
                lineHeight: template.styles?.typography?.lineHeight || '1.5',
                color: template.styles?.colors?.text || '#111827',
                backgroundColor: template.styles?.colors?.background || '#FFFFFF'
              }}
            >
              {template.components.map(component => renderComponent(component))}
            </div>
          </div>
          
          {/* Device Status Bar (for mobile/tablet) */}
          {deviceView !== 'desktop' && (
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex items-center justify-between px-4 z-10">
              <div className="text-white text-xs font-medium">
                9:41
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-1 bg-white rounded-full"></div>
                <div className="w-4 h-1 bg-white rounded-full"></div>
                <div className="w-4 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Scale Info */}
      <div className="text-center mt-4 text-sm text-gray-600">
        Preview scale: {scale}x • Click and drag to interact
      </div>
    </div>
  )
}
