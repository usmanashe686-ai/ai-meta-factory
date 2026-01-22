export interface TemplateAuthor {
  id: string
  name: string
  avatar: string
  verified: boolean
  templateCount: number
  rating: number
}

export interface TemplateComponent {
  id: string
  type: string
  props: Record<string, any>
  children?: TemplateComponent[]
  position?: { x: number; y: number }
  parentId?: string
}

export interface Template {
  id: string
  name: string
  description: string
  previewImage: string
  components: TemplateComponent[]
  category: 'dashboard' | 'ecommerce' | 'portfolio' | 'saas' | 'mobile' | 'landing' | 'admin'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  author: TemplateAuthor
  rating: number
  reviewCount: number
  usageCount: number
  customizationCount?: number
  price: 'free' | number
  license: 'MIT' | 'commercial' | 'personal' | 'premium'
  createdAt: Date
  updatedAt: Date
  dependencies: string[]
  estimatedBuildTime: string
  styles?: {
    colors: Record<string, string>
    typography: Record<string, string>
    spacing: Record<string, string>
  }
  metadata?: {
    responsive: boolean
    darkMode: boolean
    animations: boolean
    accessibility: boolean
  }
}

export interface TemplateReview {
  id: string
  templateId: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  pros: string[]
  cons: string[]
  helpfulCount: number
  createdAt: Date
}

export interface UserTemplateDownload {
  id: string
  userId: string
  templateId: string
  downloadedAt: Date
  usedInProjects: string[]
  customization?: Record<string, any>
}

export interface TemplateStats {
  views: number
  downloads: number
  favorites: number
  conversionRate: number
  averageRating: number
}
export interface TemplateMetadata {
  responsive: boolean;
  darkMode: boolean;
  animations: boolean;
  accessibility: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
