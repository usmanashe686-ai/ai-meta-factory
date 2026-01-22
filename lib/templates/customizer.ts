import { Template, TemplateComponent } from './template.types'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

export interface CustomizationRule {
  property: string
  allowedValues: any[]
  type: 'color' | 'text' | 'number' | 'boolean' | 'select'
  label: string
  description?: string
}

export interface StylePreset {
  id: string
  name: string
  colors: Record<string, string>
  typography: Record<string, string>
  spacing: Record<string, string>
}

export interface UserCustomization {
  id: string
  templateId: string
  userId: string
  customizations: Record<string, any>
  name: string
  previewImage?: string
  createdAt: Date
  updatedAt: Date
  usageCount: number
}

export class TemplateCustomizer {
  private stylePresets: StylePreset[] = [
    {
      id: 'modern-dark',
      name: 'Modern Dark',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6',
        background: '#1F2937',
        surface: '#374151',
        text: '#F9FAFB',
        textSecondary: '#D1D5DB',
        border: '#4B5563'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingWeight: '700',
        bodyWeight: '400',
        fontSizeBase: '16px',
        lineHeight: '1.5'
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem'
      }
    },
    {
      id: 'light-minimal',
      name: 'Light Minimal',
      colors: {
        primary: '#2563EB',
        secondary: '#059669',
        accent: '#7C3AED',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingWeight: '600',
        bodyWeight: '400',
        fontSizeBase: '16px',
        lineHeight: '1.6'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.75rem',
        md: '1.25rem',
        lg: '2rem',
        xl: '3rem'
      }
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      colors: {
        primary: '#EC4899',
        secondary: '#8B5CF6',
        accent: '#F59E0B',
        background: '#FEF3C7',
        surface: '#FDE68A',
        text: '#1F2937',
        textSecondary: '#6B7280',
        border: '#FBBF24'
      },
      typography: {
        fontFamily: 'Poppins, sans-serif',
        headingWeight: '700',
        bodyWeight: '400',
        fontSizeBase: '16px',
        lineHeight: '1.5'
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '2rem',
        lg: '3rem',
        xl: '4rem'
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      colors: {
        primary: '#1E40AF',
        secondary: '#0F766E',
        accent: '#7C3AED',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#0F172A',
        textSecondary: '#475569',
        border: '#CBD5E1'
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
        headingWeight: '500',
        bodyWeight: '400',
        fontSizeBase: '14px',
        lineHeight: '1.6'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      }
    }
  ]

  async customizeTemplate(
    template: Template,
    customizations: Record<string, any>
  ): Promise<Template> {
    const customized = JSON.parse(JSON.stringify(template)) as Template
    
    // Apply color customizations
    if (customizations.colors) {
      customized.components = this.applyColors(
        customized.components,
        customizations.colors
      )
      
      // Update template styles
      if (!customized.styles) customized.styles = {}
      customized.styles.colors = {
        ...customized.styles?.colors,
        ...customizations.colors
      }
    }
    
    // Apply typography customizations
    if (customizations.typography) {
      customized.components = this.applyTypography(
        customized.components,
        customizations.typography
      )
      
      if (!customized.styles) customized.styles = {}
      customized.styles.typography = {
        ...customized.styles?.typography,
        ...customizations.typography
      }
    }
    
    // Apply layout customizations
    if (customizations.layout) {
      customized.components = this.applyLayout(
        customized.components,
        customizations.layout
      )
    }
    
    // Apply content customizations
    if (customizations.content) {
      customized.components = this.applyContent(
        customized.components,
        customizations.content
      )
    }
    
    // Apply spacing customizations
    if (customizations.spacing) {
      customized.components = this.applySpacing(
        customized.components,
        customizations.spacing
      )
      
      if (!customized.styles) customized.styles = {}
      customized.styles.spacing = {
        ...customized.styles?.spacing,
        ...customizations.spacing
      }
    }
    
    customized.updatedAt = new Date()
    
    return customized
  }

  getCustomizationRules(template: Template): CustomizationRule[] {
    const rules: CustomizationRule[] = []
    
    // Extract color properties
    const colorProps = this.extractProperties(template.components, 'color')
    colorProps.forEach(prop => {
      rules.push({
        property: `colors.${prop}`,
        allowedValues: this.generateColorPalette(),
        type: 'color',
        label: `${this.capitalize(prop.replace('color', '').replace('Color', ''))} Color`,
        description: `Change the ${prop} color`
      })
    })
    
    // Extract text properties
    const textProps = this.extractProperties(template.components, 'text')
    textProps.forEach(prop => {
      rules.push({
        property: `content.${prop}`,
        allowedValues: [],
        type: 'text',
        label: `${this.capitalize(prop)} Text`,
        description: `Edit the ${prop} text`
      })
    })
    
    // Extract numeric properties
    const numericProps = this.extractProperties(template.components, 'size')
    numericProps.forEach(prop => {
      rules.push({
        property: `layout.${prop}`,
        allowedValues: Array.from({ length: 11 }, (_, i) => i * 10),
        type: 'number',
        label: `${this.capitalize(prop)} Size`,
        description: `Adjust ${prop} size`
      })
    })
    
    return rules
  }

  async applyPreset(template: Template, presetId: string): Promise<Template> {
    const preset = this.stylePresets.find(p => p.id === presetId)
    if (!preset) return template
    
    return this.customizeTemplate(template, {
      colors: preset.colors,
      typography: preset.typography,
      spacing: preset.spacing
    })
  }

  async saveCustomization(
    userId: string,
    templateId: string,
    customizations: Record<string, any>,
    name: string
  ): Promise<string> {
    const customRef = doc(collection(db, 'user_customizations'))
    
    const customization: UserCustomization = {
      id: customRef.id,
      templateId,
      userId,
      customizations,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    }
    
    await setDoc(customRef, customization)
    return customRef.id
  }

  async getUserCustomizations(userId: string, templateId?: string): Promise<UserCustomization[]> {
    let q = query(
      collection(db, 'user_customizations'),
      where('userId', '==', userId)
    )
    
    if (templateId) {
      q = query(q, where('templateId', '==', templateId))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data() as UserCustomization)
  }

  private applyColors(
    components: TemplateComponent[],
    colors: Record<string, string>
  ): TemplateComponent[] {
    return components.map(comp => {
      const updated = { ...comp }
      
      // Update component props with new colors
      if (updated.props) {
        Object.keys(colors).forEach(colorKey => {
          // Check for color properties in props
          const colorProps = Object.keys(updated.props).filter(key => 
            key.toLowerCase().includes('color') || 
            key.toLowerCase().includes('background') ||
            key.toLowerCase().includes('border')
          )
          
          colorProps.forEach(prop => {
            const propValue = updated.props[prop]
            if (typeof propValue === 'string' && propValue.startsWith('var(--')) {
              // Handle CSS custom properties
              const cssVar = propValue.match(/var\(--([^)]+)\)/)?.[1]
              if (cssVar && colors[cssVar]) {
                updated.props[prop] = colors[cssVar]
              }
            } else if (typeof propValue === 'string' && propValue in colors) {
              updated.props[prop] = colors[propValue]
            }
          })
        })
      }
      
      // Update styles
      if (updated.props?.style) {
        const style = updated.props.style
        Object.keys(colors).forEach(colorKey => {
          if (style[colorKey]) {
            style[colorKey] = colors[colorKey]
          }
          
          // Check for color in CSS properties
          Object.keys(style).forEach(prop => {
            if (typeof style[prop] === 'string' && style[prop].includes(colorKey)) {
              style[prop] = style[prop].replace(
                new RegExp(`var\\(--${colorKey}\\)|${colorKey}`, 'g'),
                colors[colorKey]
              )
            }
          })
        })
        updated.props.style = style
      }
      
      // Recursively update children
      if (updated.children && updated.children.length > 0) {
        updated.children = this.applyColors(updated.children, colors)
      }
      
      return updated
    })
  }

  private applyTypography(
    components: TemplateComponent[],
    typography: Record<string, string>
  ): TemplateComponent[] {
    return components.map(comp => {
      const updated = { ...comp }
      
      if (updated.props?.style) {
        const style = updated.props.style
        
        if (typography.fontFamily) {
          style.fontFamily = typography.fontFamily
        }
        if (typography.fontSize) {
          style.fontSize = typography.fontSize
        }
        if (typography.fontWeight) {
          style.fontWeight = typography.fontWeight
        }
        if (typography.lineHeight) {
          style.lineHeight = typography.lineHeight
        }
        
        updated.props.style = style
      }
      
      if (updated.children && updated.children.length > 0) {
        updated.children = this.applyTypography(updated.children, typography)
      }
      
      return updated
    })
  }

  private applyLayout(
    components: TemplateComponent[],
    layout: Record<string, any>
  ): TemplateComponent[] {
    return components.map(comp => {
      const updated = { ...comp }
      
      if (updated.props?.style) {
        const style = updated.props.style
        
        Object.keys(layout).forEach(key => {
          if (['width', 'height', 'margin', 'padding', 'gap', 'display', 'flexDirection', 'justifyContent', 'alignItems'].includes(key)) {
            style[key] = layout[key]
          }
        })
        
        updated.props.style = style
      }
      
      if (updated.children && updated.children.length > 0) {
        updated.children = this.applyLayout(updated.children, layout)
      }
      
      return updated
    })
  }

  private applyContent(
    components: TemplateComponent[],
    content: Record<string, string>
  ): TemplateComponent[] {
    return components.map(comp => {
      const updated = { ...comp }
      
      // Update text content
      if (updated.props?.children && typeof updated.props.children === 'string') {
        const text = updated.props.children
        Object.keys(content).forEach(key => {
          if (text.toLowerCase().includes(key.toLowerCase())) {
            updated.props.children = content[key]
          }
        })
      }
      
      // Update label, placeholder, title, etc.
      Object.keys(content).forEach(key => {
        if (updated.props && updated.props[key] && typeof updated.props[key] === 'string') {
          updated.props[key] = content[key]
        }
      })
      
      if (updated.children && updated.children.length > 0) {
        updated.children = this.applyContent(updated.children, content)
      }
      
      return updated
    })
  }

  private applySpacing(
    components: TemplateComponent[],
    spacing: Record<string, string>
  ): TemplateComponent[] {
    return components.map(comp => {
      const updated = { ...comp }
      
      if (updated.props?.style) {
        const style = updated.props.style
        
        Object.keys(spacing).forEach(key => {
          if (style.margin === `var(--spacing-${key})`) {
            style.margin = spacing[key]
          }
          if (style.padding === `var(--spacing-${key})`) {
            style.padding = spacing[key]
          }
          if (style.gap === `var(--spacing-${key})`) {
            style.gap = spacing[key]
          }
        })
        
        updated.props.style = style
      }
      
      if (updated.children && updated.children.length > 0) {
        updated.children = this.applySpacing(updated.children, spacing)
      }
      
      return updated
    })
  }

  private extractProperties(
    components: TemplateComponent[],
    type: string
  ): string[] {
    const properties: string[] = []
    
    const traverse = (comps: TemplateComponent[]) => {
      comps.forEach(comp => {
        if (comp.props) {
          Object.keys(comp.props).forEach(prop => {
            if (prop.toLowerCase().includes(type)) {
              if (!properties.includes(prop)) {
                properties.push(prop)
              }
            }
          })
          
          if (comp.props.style) {
            Object.keys(comp.props.style).forEach(styleProp => {
              if (styleProp.toLowerCase().includes(type)) {
                const propName = styleProp.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
                if (!properties.includes(propName)) {
                  properties.push(propName)
                }
              }
            })
          }
        }
        
        if (comp.children && comp.children.length > 0) {
          traverse(comp.children)
        }
      })
    }
    
    traverse(components)
    return Array.from(new Set(properties))
  }

  private generateColorPalette(): string[] {
    return [
      '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B',
      '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#FFFFFF', '#000000', '#1F2937', '#6B7280', '#9CA3AF'
    ]
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1')
  }

  getStylePresets(): StylePreset[] {
    return this.stylePresets
  }
}

// Helper function for Firestore
import { collection, query, where, getDocs, setDoc } from 'firebase/firestore'
